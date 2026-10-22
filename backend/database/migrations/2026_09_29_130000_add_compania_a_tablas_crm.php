<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fase 2 (parcial) del multi-tenant: aisla por compania las tablas mas
 * visibles del CRM (pacientes, citas, conversaciones, flujos, automatizaciones).
 * Los datos existentes se asignan a la primera compania creada (Med-Advance),
 * para que la clinica que ya usa el sistema siga viendo exactamente lo mismo.
 */
return new class extends Migration
{
    private array $tablas = ['pacientes', 'citas', 'conversaciones', 'flujos', 'automatizaciones'];

    public function up(): void
    {
        foreach ($this->tablas as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->foreignId('compania_id')->nullable()->after('id')->constrained('companias')->nullOnDelete();
            });
        }

        $companiaId = DB::table('companias')->orderBy('id')->value('id');
        if ($companiaId) {
            foreach ($this->tablas as $tabla) {
                DB::table($tabla)->whereNull('compania_id')->update(['compania_id' => $companiaId]);
            }
        }
    }

    public function down(): void
    {
        foreach ($this->tablas as $tabla) {
            Schema::table($tabla, function (Blueprint $table) {
                $table->dropConstrainedForeignId('compania_id');
            });
        }
    }
};
