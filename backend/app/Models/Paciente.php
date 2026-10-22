<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model {
    use HasFactory, PerteneceACompania;

    protected $fillable = [
        'nombre', 'segundo_nombre', 'apellido', 'telefono', 'whatsapp', 'whatsapp_jid', 'telefono_fijo', 'email',
        'fecha_nacimiento', 'genero', 'tipo_documento', 'numero_documento', 'pais_emisor_documento',
        'ciudad', 'pais', 'direccion_linea1', 'direccion_linea2', 'provincia', 'codigo_postal', 'notas',
        'tipo_sangre', 'factor_rh', 'altura_cm', 'peso_kg',
        'emergencia_nombre', 'emergencia_telefono', 'emergencia_relacion',
        'tipo_cobertura', 'consentimiento_red',
        'estado', 'fuente', 'total_gastado', 'etiquetas',
    ];

    protected $casts = [
        'fecha_nacimiento' => 'date',
        'total_gastado' => 'decimal:2',
        'peso_kg' => 'decimal:2',
        'consentimiento_red' => 'boolean',
        'etiquetas' => 'array',
    ];

    public function citas() { return $this->hasMany(Cita::class); }
    public function conversaciones() { return $this->hasMany(Conversacion::class); }
    public function pagos() { return $this->hasMany(Pago::class); }
    public function archivos() { return $this->hasMany(PacienteArchivo::class); }
    public function psiquiatriaRegistros() { return $this->hasMany(PsiquiatriaRegistro::class); }
    public function psicologiaRegistros() { return $this->hasMany(PsicologiaRegistro::class); }
    public function notasPaciente() { return $this->hasMany(NotaPaciente::class)->latest(); }

    public function getNombreCompletoAttribute() {
        return $this->nombre . ' ' . $this->apellido;
    }
}
