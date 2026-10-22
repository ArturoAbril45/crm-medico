<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlantillaInforme extends Model {
    protected $table = 'plantillas_informe';
    protected $fillable = ['nombre', 'tipo_estudio', 'contenido', 'activo'];
    protected $casts = ['activo' => 'boolean'];
}
