<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PedidoMkt;

class PedidoMktController extends Controller {
    public function index() {
        return PedidoMkt::with('items')->orderByDesc('fecha')->get();
    }

    public function biblioteca() {
        return \App\Models\PedidoItem::with(['producto', 'pedido'])
            ->whereHas('producto', fn($q) => $q->where('tipo', 'digital'))
            ->whereHas('pedido', fn($q) => $q->whereIn('estado', ['confirmado', 'enviado', 'completado']))
            ->get();
    }
}
