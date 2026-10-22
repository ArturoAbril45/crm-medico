<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model {
    protected $fillable = ['nombre', 'descripcion', 'administrador_nombre', 'administrador_email'];

    public function medicos() { return $this->belongsToMany(Medico::class, 'departamento_medico'); }
}
