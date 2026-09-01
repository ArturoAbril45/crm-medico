<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pago extends Model {
    protected $fillable = [
        'paciente_id', 'cita_id', 'monto', 'moneda',
        'metodo_pago', 'estado', 'referencia', 'notas', 'fecha',
    ];

    protected $casts = ['monto' => 'decimal:2', 'fecha' => 'date'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function cita() { return $this->belongsTo(Cita::class); }
}
