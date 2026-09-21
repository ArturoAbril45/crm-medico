<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BloqueConexion extends Model {
    protected $table = 'bloque_conexiones';
    protected $fillable = ['bloque_origen_id', 'bloque_destino_id', 'valor', 'etiqueta'];

    public function origen() { return $this->belongsTo(Bloque::class, 'bloque_origen_id'); }
    public function destino() { return $this->belongsTo(Bloque::class, 'bloque_destino_id'); }
}
