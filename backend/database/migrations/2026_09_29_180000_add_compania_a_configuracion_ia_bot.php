<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cada compania cliente pasa a tener su propia configuracion de IA (proveedor,
 * api key, prompt) en vez de una sola global — asi cada cliente revendido carga
 * su propia key desde Herramientas > WhatsApp AI Bot, sin ver la de los demas.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('configuracion_ia_bot', function (Blueprint $table) {
            $table->foreignId('compania_id')->nullable()->after('id')->constrained('companias')->nullOnDelete();
        });

        $companiaId = DB::table('companias')->orderBy('id')->value('id');
        if ($companiaId) {
            DB::table('configuracion_ia_bot')->whereNull('compania_id')->update(['compania_id' => $companiaId]);
        }
    }

    public function down(): void
    {
        Schema::table('configuracion_ia_bot', function (Blueprint $table) {
            $table->dropConstrainedForeignId('compania_id');
        });
    }
};
