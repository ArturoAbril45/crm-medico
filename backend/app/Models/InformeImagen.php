<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InformeImagen extends Model {
    protected $table = 'informes_imagen';
    protected $fillable = ['paciente_id', 'medico_id', 'tipo_estudio', 'estado', 'contenido', 'fecha'];
    protected $casts = ['fecha' => 'date'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function medico() { return $this->belongsTo(Medico::class); }
}
