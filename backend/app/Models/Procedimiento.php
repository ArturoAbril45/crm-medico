<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Procedimiento extends Model {
    protected $fillable = [
        'nombre', 'descripcion', 'categoria',
        'precio_consulta', 'precio_procedimiento', 'tipo_precio', 'precio_base', 'porcentaje_descuento',
        'duracion_min', 'activo',
    ];

    public function citas() { return $this->hasMany(Cita::class); }
}
