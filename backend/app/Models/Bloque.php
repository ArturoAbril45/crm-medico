<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bloque extends Model {
    protected $fillable = ['flujo_id', 'client_id', 'tipo', 'pos_x', 'pos_y', 'config', 'siguiente_bloque_id'];
    protected $casts = ['config' => 'array'];

    public function flujo() { return $this->belongsTo(Flujo::class); }
    public function conexionesSalida() { return $this->hasMany(BloqueConexion::class, 'bloque_origen_id'); }
    public function conexionesEntrada() { return $this->hasMany(BloqueConexion::class, 'bloque_destino_id'); }
}
