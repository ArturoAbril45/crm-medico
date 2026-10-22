<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Model;

class Automatizacion extends Model {
    use PerteneceACompania;

    protected $table = 'automatizaciones';
    protected $fillable = ['nombre', 'flujo_id', 'tipo', 'palabra_clave', 'condicion', 'ejecuciones', 'activo'];
    protected $casts = ['activo' => 'boolean'];

    public function flujo() { return $this->belongsTo(Flujo::class); }
}
