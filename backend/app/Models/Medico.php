<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medico extends Model {
    protected $fillable = [
        'nombre', 'especialidad', 'email', 'telefono', 'departamento_id',
        'hora_inicio', 'hora_fin', 'dias_trabajo', 'activo',
    ];
    protected $casts = ['activo' => 'boolean'];

    public function departamento() { return $this->belongsTo(Departamento::class); }
}
