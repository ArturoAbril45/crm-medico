<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Model;

class Flujo extends Model {
    use PerteneceACompania;

    protected $fillable = ['nombre', 'descripcion', 'activo', 'total_ejecuciones', 'total_conversiones', 'carpeta_id'];
    protected $casts = ['activo' => 'boolean'];

    public function bloques() { return $this->hasMany(Bloque::class); }
    public function edges() { return $this->hasMany(BloqueEdge::class); }
    public function campanas() { return $this->hasMany(Campana::class); }
    public function automatizaciones() { return $this->hasMany(Automatizacion::class); }
    public function carpeta() { return $this->belongsTo(CarpetaFlujo::class, 'carpeta_id'); }
}
