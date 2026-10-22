<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CierreCaja extends Model {
    protected $table = 'cierres_caja';
    protected $fillable = ['fecha', 'total_efectivo', 'total_tarjeta', 'total_transferencia', 'total_qr', 'egresos', 'observaciones', 'estado', 'cerrado_en'];
    protected $casts = [
        'fecha' => 'date',
        'cerrado_en' => 'datetime',
        'total_efectivo' => 'decimal:2',
        'total_tarjeta' => 'decimal:2',
        'total_transferencia' => 'decimal:2',
        'total_qr' => 'decimal:2',
        'egresos' => 'decimal:2',
    ];

    public function getTotalIngresosAttribute() {
        return $this->total_efectivo + $this->total_tarjeta + $this->total_transferencia + $this->total_qr;
    }

    public function getSaldoAttribute() {
        return $this->total_ingresos - $this->egresos;
    }
}
