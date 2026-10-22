<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicacionAcademy extends Model {
    protected $table = 'publicaciones_academy';
    protected $fillable = [
        'titulo', 'slug', 'resumen', 'contenido', 'tipo', 'modulo',
        'minutos_lectura', 'autor_nombre', 'estado', 'votos_util', 'votos_no_util',
    ];
}
