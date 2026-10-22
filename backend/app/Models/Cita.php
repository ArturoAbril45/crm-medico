<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Model;

class Cita extends Model {
    use PerteneceACompania;

    protected $fillable = [
        'paciente_id', 'procedimiento_id', 'doctor', 'medico_id', 'fecha_hora',
        'duracion_min', 'estado', 'tipo_consulta', 'cobertura_tipo', 'cobertura_nombre',
        'ubicacion', 'motivo', 'notas', 'monto', 'recordatorio_enviado', 'google_event_id',
    ];

    protected $casts = ['fecha_hora' => 'datetime', 'recordatorio_enviado' => 'boolean'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function procedimiento() { return $this->belongsTo(Procedimiento::class); }
    public function medico() { return $this->belongsTo(Medico::class); }
    public function pagos() { return $this->hasMany(Pago::class); }
}
