<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CostoConsulta extends Model {
    protected $table = 'costos_consulta';
    protected $fillable = ['categoria', 'denominacion', 'valor', 'diferencia', 'observaciones'];
    protected $casts = ['valor' => 'decimal:2', 'diferencia' => 'decimal:2'];
}
