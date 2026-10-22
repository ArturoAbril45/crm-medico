<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Model;

class CarpetaFlujo extends Model {
    use PerteneceACompania;

    protected $table = 'carpetas_flujo';
    protected $fillable = ['nombre'];

    public function flujos() { return $this->hasMany(Flujo::class, 'carpeta_id'); }
}
