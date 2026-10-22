<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Empleado extends Model {
    protected $fillable = [
        'nombre', 'apellido', 'documento_identidad', 'cargo', 'departamento',
        'fecha_ingreso', 'fecha_egreso', 'salario', 'tipo_contrato',
        'telefono', 'email', 'estado',
    ];
    protected $casts = [
        'fecha_ingreso' => 'date',
        'fecha_egreso' => 'date',
        'salario' => 'decimal:2',
    ];

    public function licencias() { return $this->hasMany(LicenciaEmpleado::class); }
    public function siniestrosArt() { return $this->hasMany(SiniestroArt::class); }
}
