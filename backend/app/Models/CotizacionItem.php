<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CotizacionItem extends Model {
    protected $table = 'cotizacion_items';
    protected $fillable = ['cotizacion_id', 'producto_id', 'descripcion', 'cantidad'];

    public function cotizacion() { return $this->belongsTo(Cotizacion::class); }
    public function producto() { return $this->belongsTo(ProductoMarketplace::class, 'producto_id'); }
}
