<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Medico extends Model {
    protected $fillable = [
        'nombre', 'apellido', 'especialidad', 'subespecialidad', 'numero_licencia', 'pais_licencia',
        'anos_experiencia', 'tarifa_consulta', 'moneda_tarifa', 'educacion', 'certificaciones', 'idiomas',
        'telefono', 'email', 'activo', 'honorario_porcentaje',
        'google_refresh_token', 'google_access_token', 'google_token_expira',
    ];

    protected $hidden = ['google_refresh_token', 'google_access_token'];
    protected $appends = ['google_calendar_conectado'];

    protected $casts = [
        'activo' => 'boolean',
        'tarifa_consulta' => 'decimal:2',
        'educacion' => 'array',
        'certificaciones' => 'array',
        'idiomas' => 'array',
        'honorario_porcentaje' => 'decimal:2',
        'google_token_expira' => 'datetime',
    ];

    public function getGoogleCalendarConectadoAttribute(): bool {
        return !empty($this->google_refresh_token);
    }

    public function citas() { return $this->hasMany(Cita::class); }
    public function departamentos() { return $this->belongsToMany(Departamento::class, 'departamento_medico'); }
    public function practicasFacturables() { return $this->hasMany(PracticaFacturable::class); }

    public function getNombreCompletoAttribute() {
        return trim("Dr(a). {$this->nombre} {$this->apellido}");
    }
}
