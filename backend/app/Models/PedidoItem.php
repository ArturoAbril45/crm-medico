<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PedidoItem extends Model {
    protected $table = 'pedido_items';
    protected $fillable = ['pedido_id', 'producto_id', 'proveedor_id', 'nombre_producto', 'cantidad', 'precio_unitario'];
    protected $casts = ['precio_unitario' => 'decimal:2'];

    public function pedido() { return $this->belongsTo(PedidoMkt::class, 'pedido_id'); }
    public function producto() { return $this->belongsTo(ProductoMarketplace::class, 'producto_id'); }
    public function proveedor() { return $this->belongsTo(ProveedorMkt::class, 'proveedor_id'); }
}
