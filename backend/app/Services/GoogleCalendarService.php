<?php
namespace App\Services;

use App\Models\Cita;
use App\Models\Medico;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

/**
 * Conecta el Google Calendar personal de cada medico (OAuth por medico,
 * no una cuenta compartida) y crea el evento real cuando se agenda una cita.
 * Si el medico no vinculo su cuenta, o Google falla por cualquier motivo,
 * la cita igual se crea en el sistema — esto nunca corta ese flujo.
 */
class GoogleCalendarService {
    private ?string $clientId;
    private ?string $clientSecret;
    private ?string $redirectUri;

    public function __construct() {
        $this->clientId = env('GOOGLE_CLIENT_ID');
        $this->clientSecret = env('GOOGLE_CLIENT_SECRET');
        $this->redirectUri = env('GOOGLE_REDIRECT_URI');
    }

    public function urlAutorizacion(string $state): string {
        $params = [
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'response_type' => 'code',
            'scope' => 'https://www.googleapis.com/auth/calendar.events',
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
        ];
        return 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
    }

    public function intercambiarCodigo(string $code): ?array {
        $res = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'redirect_uri' => $this->redirectUri,
            'grant_type' => 'authorization_code',
        ]);
        return $res->successful() ? $res->json() : null;
    }

    private function refrescarToken(Medico $medico): ?string {
        if (!$medico->google_refresh_token) return null;
        $res = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'refresh_token' => $medico->google_refresh_token,
            'client_id' => $this->clientId,
            'client_secret' => $this->clientSecret,
            'grant_type' => 'refresh_token',
        ]);
        if (!$res->successful()) {
            \Log::warning('GoogleCalendar: fallo al refrescar token', ['medico_id' => $medico->id, 'body' => $res->body()]);
            return null;
        }
        $data = $res->json();
        $medico->update([
            'google_access_token' => $data['access_token'] ?? null,
            'google_token_expira' => now()->addSeconds(($data['expires_in'] ?? 3600) - 60),
        ]);
        return $data['access_token'] ?? null;
    }

    private function tokenValido(Medico $medico): ?string {
        if (!$medico->google_refresh_token) return null;
        if ($medico->google_access_token && $medico->google_token_expira && now()->lt($medico->google_token_expira)) {
            return $medico->google_access_token;
        }
        return $this->refrescarToken($medico);
    }

    public function conectado(Medico $medico): bool {
        return !empty($medico->google_refresh_token);
    }

    public function desconectar(Medico $medico): void {
        $medico->update(['google_refresh_token' => null, 'google_access_token' => null, 'google_token_expira' => null]);
    }

    public function eliminarEvento(Medico $medico, string $eventId): bool {
        $token = $this->tokenValido($medico);
        if (!$token) return false;
        try {
            $res = Http::withToken($token)->delete("https://www.googleapis.com/calendar/v3/calendars/primary/events/{$eventId}");
            return $res->successful() || $res->status() === 410; // 410 = ya estaba borrado
        } catch (\Throwable $e) {
            return false;
        }
    }

    public function crearEvento(Medico $medico, Cita $cita): bool {
        $token = $this->tokenValido($medico);
        if (!$token) return false;

        $cita->loadMissing('paciente');
        $paciente = $cita->paciente;
        // fecha_hora se guarda como hora local (Ecuador), pero el timezone de la
        // app es UTC (config('app.timezone')) — sin forzar 'America/Guayaquil' acá,
        // Carbon la interpreta como UTC y el evento le queda a Google 5 horas corrido.
        $inicio = Carbon::parse($cita->fecha_hora, 'America/Guayaquil');
        $fin = $inicio->copy()->addMinutes($cita->duracion_min ?: 30);
        $nombrePaciente = trim(($paciente->nombre ?? '') . ' ' . ($paciente->apellido ?? ''));

        // Si el paciente tiene correo cargado, se lo invita al evento (le llega la
        // invitacion de Google Calendar a su propio correo, ademas de quedar en el
        // calendario del medico).
        $attendees = [];
        if (!empty($paciente->email)) {
            $attendees[] = ['email' => $paciente->email, 'displayName' => $nombrePaciente ?: null];
        }

        try {
            $res = Http::withToken($token)->post('https://www.googleapis.com/calendar/v3/calendars/primary/events?sendUpdates=all', [
                'summary' => trim(($cita->motivo ?: ($cita->tipo_consulta ?? 'Consulta')) . ' — ' . $nombrePaciente),
                'description' => trim(
                    "Paciente: {$nombrePaciente}\n" .
                    'Teléfono: ' . ($paciente->whatsapp ?? $paciente->telefono ?? '-') . "\n" .
                    'Motivo: ' . ($cita->motivo ?: '-')
                ),
                'start' => ['dateTime' => $inicio->toRfc3339String(), 'timeZone' => 'America/Guayaquil'],
                'end' => ['dateTime' => $fin->toRfc3339String(), 'timeZone' => 'America/Guayaquil'],
                'attendees' => $attendees,
                'reminders' => ['useDefault' => true],
            ]);
            if ($res->successful()) {
                $cita->update(['google_event_id' => $res->json('id')]);
                return true;
            }
            \Log::warning('GoogleCalendar: fallo al crear evento', ['medico_id' => $medico->id, 'cita_id' => $cita->id, 'body' => $res->body()]);
            return false;
        } catch (\Throwable $e) {
            \Log::warning('GoogleCalendar: excepcion al crear evento', ['medico_id' => $medico->id, 'cita_id' => $cita->id, 'error' => $e->getMessage()]);
            return false;
        }
    }
}
