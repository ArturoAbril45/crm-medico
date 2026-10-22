<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cotizacion extends Model {
    protected $table = 'cotizaciones';
    protected $fillable = ['proveedor_id', 'estado', 'mensaje', 'fecha'];
    protected $casts = ['fecha' => 'date'];

    public function proveedor() { return $this->belongsTo(ProveedorMkt::class, 'proveedor_id'); }
    public function items() { return $this->hasMany(CotizacionItem::class); }
}
