<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Presentacion extends Model {
    protected $table = 'presentaciones';
    protected $fillable = ['convenio_id', 'periodo', 'presentado_en', 'liquidacion', 'status'];
    protected $casts = ['presentado_en' => 'date', 'liquidacion' => 'decimal:2'];

    public function convenio() { return $this->belongsTo(Convenio::class); }
    public function practicas() { return $this->hasMany(PracticaFacturable::class); }
}
