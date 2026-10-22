<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Convenio extends Model {
    protected $fillable = ['nombre', 'codigo', 'reglas_facturacion'];

    public function practicas() { return $this->hasMany(PracticaFacturable::class); }
    public function presentaciones() { return $this->hasMany(Presentacion::class); }
}
