<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Model;

class Conversacion extends Model {
    use PerteneceACompania;

    protected $table = 'conversaciones';
    protected $fillable = [
        'paciente_id', 'canal', 'estado', 'ultimo_mensaje',
        'ultimo_mensaje_at', 'mensajes_no_leidos',
        'flujo_activo_id', 'nodo_actual_client_id', 'esperando_respuesta', 'contexto',
        'automatizacion_activa', 'agente_id',
    ];

    protected $casts = [
        'ultimo_mensaje_at' => 'datetime',
        'esperando_respuesta' => 'boolean',
        'contexto' => 'array',
        'automatizacion_activa' => 'boolean',
    ];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function mensajes() { return $this->hasMany(Mensaje::class); }
    public function flujoActivo() { return $this->belongsTo(Flujo::class, 'flujo_activo_id'); }
    public function agente() { return $this->belongsTo(User::class, 'agente_id'); }
}
