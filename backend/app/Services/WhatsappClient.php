<?php
namespace App\Services;

use Illuminate\Support\Facades\Http;

/**
 * Habla con el microservicio Node/Baileys (whatsapp-service/), que mantiene
 * una sesion de WhatsApp independiente por compania (Map en memoria, una
 * carpeta auth_session/<companiaId>/ cada una). Todo metodo recibe la
 * compania a la que aplica y la manda en el header X-Compania-Id.
 */
class WhatsappClient {
    private string $baseUrl;
    private string $token;

    public function __construct() {
        $this->baseUrl = rtrim(env('WHATSAPP_SERVICE_URL', 'http://localhost:3300'), '/');
        $this->token = env('WHATSAPP_SERVICE_TOKEN', '');
    }

    private function http(int $companiaId) {
        return Http::withHeaders([
            'X-Service-Token' => $this->token,
            'X-Compania-Id' => (string) $companiaId,
        ])->timeout(15);
    }

    public function estado(int $companiaId): array {
        $res = $this->http($companiaId)->get("{$this->baseUrl}/status");
        return $res->successful() ? $res->json() : ['status' => 'desconectado', 'qrDataUrl' => null, 'telefono' => null];
    }

    /** Estado resumido de todas las companias con sesion activa en memoria, para el panel de super-admin. */
    public function estadoTodas(): array {
        $res = Http::withHeaders(['X-Service-Token' => $this->token])->timeout(15)->get("{$this->baseUrl}/status-all");
        return $res->successful() ? $res->json() : [];
    }

    public function qr(int $companiaId): ?string {
        $res = $this->http($companiaId)->get("{$this->baseUrl}/qr");
        return $res->successful() ? $res->json('qr') : null;
    }

    public function desconectar(int $companiaId): bool {
        return $this->http($companiaId)->post("{$this->baseUrl}/disconnect")->successful();
    }

    public function enviarMensaje(int $companiaId, string $telefono, string $mensaje): bool {
        $res = $this->http($companiaId)->post("{$this->baseUrl}/send", [
            'telefono' => $telefono,
            'mensaje' => $mensaje,
        ]);
        if (!$res->successful()) {
            \Log::warning('WhatsApp: fallo el envio', ['compania_id' => $companiaId, 'telefono' => $telefono, 'status' => $res->status(), 'body' => $res->body()]);
        }
        return $res->successful();
    }

    public function enviarMedia(int $companiaId, string $telefono, string $tipo, string $url, ?string $caption, ?string $mimetype): bool {
        $res = $this->http($companiaId)->post("{$this->baseUrl}/send-media", [
            'telefono' => $telefono,
            'tipo' => $tipo,
            'url' => $url,
            'caption' => $caption,
            'mimetype' => $mimetype,
        ]);
        if (!$res->successful()) {
            \Log::warning('WhatsApp: fallo el envio de media', ['compania_id' => $companiaId, 'telefono' => $telefono, 'tipo' => $tipo, 'status' => $res->status(), 'body' => $res->body()]);
        }
        return $res->successful();
    }

    /**
     * Menu con botones/lista tocable real de WhatsApp (mejor experiencia cuando el
     * cliente de WhatsApp del contacto lo soporta). El texto ya trae el listado
     * numerado completo igual que el mensaje de texto plano, asi que si WhatsApp
     * "aplana" el mensaje interactivo en algunos telefonos, el contacto igual ve
     * las opciones y puede responder escribiendo el numero como siempre.
     */
    public function enviarLista(int $companiaId, string $telefono, string $texto, string $boton, array $opciones): bool {
        $res = $this->http($companiaId)->post("{$this->baseUrl}/send-list", [
            'telefono' => $telefono,
            'texto' => $texto,
            'boton' => $boton,
            'opciones' => $opciones,
        ]);
        if (!$res->successful()) {
            \Log::warning('WhatsApp: fallo el envio de menu con lista', ['compania_id' => $companiaId, 'telefono' => $telefono, 'status' => $res->status(), 'body' => $res->body()]);
        }
        return $res->successful();
    }
}
