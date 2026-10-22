<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model {
    protected $table = 'metodos_pago';
    protected $fillable = ['nombre', 'tipo', 'cuenta_referencia', 'comision_porcentaje', 'activo', 'orden'];
    protected $casts = ['activo' => 'boolean', 'comision_porcentaje' => 'decimal:2'];
}
