<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HorarioMedico extends Model {
    protected $fillable = [
        'medico_id', 'rango_aplicacion', 'dias_semana', 'valido_desde', 'valido_hasta',
        'hora_inicio', 'hora_fin', 'tipo_consulta', 'duracion_turno',
        'requiere_coseguro', 'monto_coseguro',
    ];

    protected $casts = [
        'dias_semana' => 'array',
        'valido_desde' => 'date',
        'valido_hasta' => 'date',
        'requiere_coseguro' => 'boolean',
        'monto_coseguro' => 'decimal:2',
    ];

    public function medico() { return $this->belongsTo(Medico::class); }
}
