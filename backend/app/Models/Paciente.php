<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model {
    use HasFactory;

    protected $fillable = [
        'numero_historia', 'nombre', 'segundo_nombre', 'apellido', 'telefono', 'telefono_fijo', 'whatsapp', 'email',
        'fecha_nacimiento', 'genero', 'tipo_sangre', 'tipo_documento', 'numero_documento', 'pais_documento',
        'ciudad', 'pais', 'notas', 'estado', 'fuente', 'total_gastado',
    ];

    protected $casts = ['fecha_nacimiento' => 'date', 'total_gastado' => 'decimal:2'];

    protected static function booted() {
        static::creating(function (Paciente $paciente) {
            if (!$paciente->numero_historia) {
                $ultimo = static::max('id') + 1;
                $paciente->numero_historia = 'CSP-' . str_pad($ultimo, 6, '0', STR_PAD_LEFT);
            }
        });
    }

    public function citas() { return $this->hasMany(Cita::class); }
    public function conversaciones() { return $this->hasMany(Conversacion::class); }
    public function pagos() { return $this->hasMany(Pago::class); }
    public function consultas() { return $this->hasMany(Consulta::class); }

    public function getNombreCompletoAttribute() {
        return $this->nombre . ' ' . $this->apellido;
    }
}
