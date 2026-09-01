<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mensaje extends Model {
    protected $fillable = ['conversacion_id', 'tipo', 'contenido', 'tipo_contenido', 'archivo_url', 'leido'];
    protected $casts = ['leido' => 'boolean'];

    public function conversacion() { return $this->belongsTo(Conversacion::class); }
}
