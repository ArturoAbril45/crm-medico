<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transmision extends Model {
    protected $table = 'transmisiones';
    protected $fillable = ['nombre', 'mensaje', 'fecha_envio', 'hora_envio', 'destinatarios', 'enviados', 'entregados', 'leidos', 'estado'];
}
