<?php

namespace Database\Seeders;

use App\Models\Compania;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Migra la instalacion single-tenant existente al modelo multi-compania:
 * crea una compania para la clinica que ya esta usando el sistema y le
 * asigna todos los usuarios que todavia no tengan compania_id, sin tocar
 * ninguno de sus datos (pacientes, conversaciones, etc siguen igual, eso
 * es Fase 2). El usuario "admin" pasa a ser super-admin del panel de
 * companias.
 */
class CompaniaInicialSeeder extends Seeder
{
    public function run(): void
    {
        $compania = Compania::firstOrCreate(
            ['slug' => 'med-advance'],
            ['nombre' => 'Med-Advance', 'activo' => true]
        );

        User::whereNull('compania_id')->update(['compania_id' => $compania->id]);

        User::where('email', 'admin')->update(['es_super_admin' => true]);
    }
}
