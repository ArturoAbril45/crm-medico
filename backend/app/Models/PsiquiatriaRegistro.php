<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PsiquiatriaRegistro extends Model {
    protected $table = 'psiquiatria_registros';
    protected $fillable = ['paciente_id', 'tipo', 'titulo', 'contenido', 'escala_nombre', 'escala_puntaje', 'fecha'];
    protected $casts = ['fecha' => 'date'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
}
