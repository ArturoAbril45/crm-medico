<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComprobanteAfip extends Model {
    protected $table = 'comprobantes_afip';
    protected $fillable = ['paciente_id', 'tipo_comprobante', 'numero', 'cae', 'cae_vencimiento', 'monto', 'estado', 'fecha'];
    protected $casts = ['fecha' => 'date', 'cae_vencimiento' => 'date', 'monto' => 'decimal:2'];

    public function paciente() { return $this->belongsTo(Paciente::class); }
}
