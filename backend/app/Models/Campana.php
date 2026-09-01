<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campana extends Model {
    protected $fillable = [
        'nombre', 'descripcion', 'flujo_id', 'estado',
        'fecha_inicio', 'fecha_fin', 'total_enviados', 'total_entregados',
        'total_leidos', 'total_clicados',
    ];

    protected $casts = ['fecha_inicio' => 'datetime', 'fecha_fin' => 'datetime'];

    public function flujo() { return $this->belongsTo(Flujo::class); }
}
