<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticaFacturable extends Model {
    protected $table = 'practicas_facturables';
    protected $fillable = ['paciente_id', 'medico_id', 'convenio_id', 'prestacion_id', 'cita_id', 'presentacion_id', 'monto', 'estado', 'fecha'];
    protected $casts = ['fecha' => 'date', 'monto' => 'decimal:2'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
    public function medico() { return $this->belongsTo(Medico::class); }
    public function convenio() { return $this->belongsTo(Convenio::class); }
    public function prestacion() { return $this->belongsTo(Prestacion::class); }
    public function presentacion() { return $this->belongsTo(Presentacion::class); }
}
