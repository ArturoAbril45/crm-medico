<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PacienteArchivo extends Model {
    protected $fillable = ['paciente_id', 'nombre_original', 'ruta', 'tipo_mime', 'tamano_bytes'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
}
