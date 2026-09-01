<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModeloMensaje extends Model {
    protected $table = 'modelos_mensajes';
    protected $fillable = ['nombre', 'categoria', 'contenido', 'estado'];
}
