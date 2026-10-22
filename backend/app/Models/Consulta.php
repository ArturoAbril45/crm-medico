<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consulta extends Model {
    protected $fillable = ['paciente_id', 'medico_id', 'cita_id', 'fecha', 'motivo', 'diagnostico', 'tratamiento', 'notas'];
    protected $casts = ['fecha' => 'datetime'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function medico() { return $this->belongsTo(Medico::class); }
    public function cita() { return $this->belongsTo(Cita::class); }
}
