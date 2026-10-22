<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SiniestroArt extends Model {
    protected $table = 'siniestros_art';
    protected $fillable = [
        'empleado_id', 'tipo', 'fecha_siniestro', 'descripcion',
        'art_nombre', 'numero_siniestro', 'estado', 'dias_baja', 'fecha_alta',
    ];
    protected $casts = ['fecha_siniestro' => 'date', 'fecha_alta' => 'date'];

    public function empleado() { return $this->belongsTo(Empleado::class); }
}
