<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsappConversacion extends Model
{
    protected $table = 'whatsapp_conversaciones';
    protected $fillable = ['telefono', 'nombre', 'paciente_id', 'estado', 'ultimo_mensaje', 'ultimo_mensaje_at', 'no_leidos'];
    protected $casts = ['ultimo_mensaje_at' => 'datetime'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function mensajes() { return $this->hasMany(WhatsappMensaje::class, 'conversacion_id')->orderBy('created_at'); }
}
