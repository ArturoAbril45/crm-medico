<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Paciente extends Model {
    use HasFactory;

    protected $fillable = [
        'nombre', 'apellido', 'telefono', 'whatsapp', 'email',
        'fecha_nacimiento', 'genero', 'ciudad', 'pais', 'notas',
        'estado', 'fuente', 'total_gastado',
    ];

    protected $casts = ['fecha_nacimiento' => 'date', 'total_gastado' => 'decimal:2'];

    public function citas() { return $this->hasMany(Cita::class); }
    public function conversaciones() { return $this->hasMany(Conversacion::class); }
    public function pagos() { return $this->hasMany(Pago::class); }

    public function getNombreCompletoAttribute() {
        return $this->nombre . ' ' . $this->apellido;
    }
}
