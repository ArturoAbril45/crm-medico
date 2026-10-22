<?php
namespace App\Models;

use App\Models\Concerns\PerteneceACompania;
use Illuminate\Database\Eloquent\Model;

class ConfiguracionIaBot extends Model {
    use PerteneceACompania;

    protected $table = 'configuracion_ia_bot';
    protected $fillable = ['proveedor', 'modelo', 'api_key', 'prompt_sistema', 'temperatura_default', 'activo'];
    protected $casts = ['activo' => 'boolean', 'temperatura_default' => 'decimal:1'];
    protected $hidden = ['api_key'];
}
