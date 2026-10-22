<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RespuestaRapida extends Model {
    protected $table = 'respuestas_rapidas';
    protected $fillable = ['atajo', 'mensaje'];
}
