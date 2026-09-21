<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappMensaje extends Model
{
    protected $fillable = ['conversacion_id', 'texto', 'imagen', 'de', 'tipo', 'archivo_url', 'archivo_nombre'];

    public function conversacion() { return $this->belongsTo(WhatsappConversacion::class, 'conversacion_id'); }
}
