<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoMarketplace extends Model {
    protected $table = 'productos_marketplace';
    protected $fillable = ['proveedor_id', 'nombre', 'categoria', 'unidad_medida', 'tipo', 'precio', 'moneda', 'stock', 'descripcion', 'activo'];
    protected $casts = ['precio' => 'decimal:2', 'activo' => 'boolean'];

    public function proveedor() { return $this->belongsTo(ProveedorMkt::class, 'proveedor_id'); }
}
