<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConfiguracionAfip extends Model {
    protected $table = 'configuracion_afip';
    protected $fillable = ['cuit', 'razon_social', 'punto_venta', 'condicion_iva', 'ambiente', 'activo'];
    protected $casts = ['activo' => 'boolean'];
}
