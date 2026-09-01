<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cita extends Model {
    protected $fillable = [
        'paciente_id', 'procedimiento_id', 'doctor', 'fecha_hora',
        'duracion_min', 'estado', 'notas', 'monto', 'recordatorio_enviado',
    ];

    protected $casts = ['fecha_hora' => 'datetime', 'recordatorio_enviado' => 'boolean'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function procedimiento() { return $this->belongsTo(Procedimiento::class); }
    public function pagos() { return $this->hasMany(Pago::class); }
}
