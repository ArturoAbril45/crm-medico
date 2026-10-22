<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CarritoItem extends Model {
    protected $table = 'carrito_items';
    protected $fillable = ['producto_id', 'cantidad'];

    public function producto() { return $this->belongsTo(ProductoMarketplace::class, 'producto_id'); }
}
