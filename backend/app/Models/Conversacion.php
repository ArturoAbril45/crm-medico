<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Conversacion extends Model {
    protected $table = 'conversaciones';
    protected $fillable = [
        'paciente_id', 'canal', 'estado', 'ultimo_mensaje',
        'ultimo_mensaje_at', 'mensajes_no_leidos',
    ];

    protected $casts = ['ultimo_mensaje_at' => 'datetime'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function mensajes() { return $this->hasMany(Mensaje::class); }
}
