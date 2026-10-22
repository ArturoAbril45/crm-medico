<?php

namespace Database\Seeders;

use App\Models\Permiso;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class RolesPermisosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $permisos = [
            ['clave' => 'clinica.ver', 'nombre' => 'Ver Clínica Médica', 'categoria' => 'Clínica Médica'],
            ['clave' => 'clinica.gestionar', 'nombre' => 'Gestionar Clínica Médica', 'categoria' => 'Clínica Médica'],
            ['clave' => 'finanzas.ver', 'nombre' => 'Ver Finanzas', 'categoria' => 'Finanzas'],
            ['clave' => 'finanzas.gestionar', 'nombre' => 'Gestionar Finanzas', 'categoria' => 'Finanzas'],
            ['clave' => 'marketplace.ver', 'nombre' => 'Ver Marketplace', 'categoria' => 'Marketplace'],
            ['clave' => 'marketplace.gestionar', 'nombre' => 'Gestionar Marketplace', 'categoria' => 'Marketplace'],
            ['clave' => 'herramientas.ver', 'nombre' => 'Ver Herramientas', 'categoria' => 'Herramientas'],
            ['clave' => 'herramientas.gestionar', 'nombre' => 'Gestionar Herramientas', 'categoria' => 'Herramientas'],
            ['clave' => 'configuracion.gestionar', 'nombre' => 'Gestionar Configuración', 'categoria' => 'Sistema'],
            ['clave' => 'usuarios.gestionar', 'nombre' => 'Gestionar Usuarios y Roles', 'categoria' => 'Sistema'],
        ];
        foreach ($permisos as $p) Permiso::firstOrCreate(['clave' => $p['clave']], $p);

        $admin = Role::firstOrCreate(['nombre' => 'Administrador'], ['descripcion' => 'Acceso total al sistema']);
        $admin->permisos()->sync(Permiso::pluck('id'));

        $medico = Role::firstOrCreate(['nombre' => 'Médico'], ['descripcion' => 'Acceso a la operación clínica diaria']);
        $medico->permisos()->sync(Permiso::whereIn('clave', ['clinica.ver', 'clinica.gestionar'])->pluck('id'));

        // Migracion de los usuarios que hoy existen hardcodeados en el frontend
        // (AuthContext.jsx), para que nadie pierda acceso al pasar al login real.
        $usuarios = [
            ['name' => 'admin', 'email' => 'admin', 'password' => 'clinica2024', 'rol' => $admin],
            ['name' => 'Dr. Ramón Rojas', 'email' => 'doctor', 'password' => 'doctor123', 'rol' => $medico],
            ['name' => 'Administrador', 'email' => 'medmedico23@sidkap.com', 'password' => 'sidkap2026', 'rol' => $admin],
        ];
        foreach ($usuarios as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                ['name' => $u['name'], 'password' => Hash::make($u['password']), 'rol_id' => $u['rol']->id, 'activo' => true],
            );
        }
    }
}
