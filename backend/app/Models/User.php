<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'rol_id', 'activo', 'api_token', 'compania_id', 'es_super_admin'])]
#[Hidden(['password', 'remember_token', 'api_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'activo' => 'boolean',
            'es_super_admin' => 'boolean',
        ];
    }

    public function rol() { return $this->belongsTo(Role::class, 'rol_id'); }
    public function compania() { return $this->belongsTo(Compania::class); }

    public function tienePermiso(string $clave): bool {
        if (!$this->rol) return false;
        return $this->rol->permisos()->where('clave', $clave)->exists();
    }
}
