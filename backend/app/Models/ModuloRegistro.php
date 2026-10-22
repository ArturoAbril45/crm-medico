<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModuloRegistro extends Model
{
    protected $fillable = ['modulo', 'titulo', 'descripcion', 'estado', 'fecha', 'datos'];
    protected $casts = ['datos' => 'array', 'fecha' => 'date'];
}
