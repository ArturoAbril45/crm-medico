<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Role extends Model {
    protected $fillable = ['nombre', 'descripcion'];

    public function permisos() { return $this->belongsToMany(Permiso::class, 'rol_permiso', 'rol_id', 'permiso_id'); }
    public function usuarios() { return $this->hasMany(User::class, 'rol_id'); }
}
