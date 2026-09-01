<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flujo extends Model {
    protected $fillable = ['nombre', 'descripcion', 'activo', 'total_ejecuciones', 'total_conversiones'];
    protected $casts = ['activo' => 'boolean'];

    public function bloques() { return $this->hasMany(Bloque::class); }
    public function campanas() { return $this->hasMany(Campana::class); }
    public function automatizaciones() { return $this->hasMany(Automatizacion::class); }
}
