<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Compania extends Model {
    protected $table = 'companias';
    protected $fillable = ['nombre', 'slug', 'activo', 'plan', 'whatsapp_telefono'];
    protected $casts = ['activo' => 'boolean'];

    public function usuarios() { return $this->hasMany(User::class); }
}
