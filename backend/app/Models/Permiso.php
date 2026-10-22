<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Permiso extends Model {
    protected $fillable = ['clave', 'nombre', 'categoria'];
    public $timestamps = true;

    public function roles() { return $this->belongsToMany(Role::class, 'rol_permiso', 'permiso_id', 'rol_id'); }
}
