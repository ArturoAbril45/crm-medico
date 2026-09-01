<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Automatizacion extends Model {
    protected $table = 'automatizaciones';
    protected $fillable = ['nombre', 'flujo_id', 'tipo', 'palabra_clave', 'condicion', 'ejecuciones', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function flujo() { return $this->belongsTo(Flujo::class); }
}
