<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Prestacion extends Model {
    protected $table = 'prestaciones';
    protected $fillable = ['codigo', 'descripcion', 'categoria', 'tipo', 'valor_base'];
    protected $casts = ['valor_base' => 'decimal:2'];

    public function practicas() { return $this->hasMany(PracticaFacturable::class); }
}
