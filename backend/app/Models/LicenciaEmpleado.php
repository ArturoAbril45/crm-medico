<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LicenciaEmpleado extends Model {
    protected $table = 'licencias_empleado';
    protected $fillable = ['empleado_id', 'tipo', 'fecha_inicio', 'fecha_fin', 'estado', 'motivo'];
    protected $casts = ['fecha_inicio' => 'date', 'fecha_fin' => 'date'];

    public function empleado() { return $this->belongsTo(Empleado::class); }
}
