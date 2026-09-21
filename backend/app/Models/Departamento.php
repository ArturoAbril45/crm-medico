<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Departamento extends Model {
    protected $fillable = ['nombre', 'descripcion', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function medicos() { return $this->hasMany(Medico::class); }
}
