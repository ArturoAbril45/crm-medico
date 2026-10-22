<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PedidoMkt extends Model {
    protected $table = 'pedidos_mkt';
    protected $fillable = ['codigo', 'total', 'estado', 'fecha'];
    protected $casts = ['fecha' => 'date', 'total' => 'decimal:2'];

    public function items() { return $this->hasMany(PedidoItem::class, 'pedido_id'); }
}
