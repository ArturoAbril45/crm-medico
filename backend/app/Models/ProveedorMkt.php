<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProveedorMkt extends Model {
    protected $table = 'proveedores_mkt';
    protected $fillable = ['nombre', 'categoria', 'provincia', 'ciudad', 'descripcion', 'es_propio'];
    protected $casts = ['es_propio' => 'boolean'];

    public function productos() { return $this->hasMany(ProductoMarketplace::class, 'proveedor_id'); }
}
