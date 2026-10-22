<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->foreignId('flujo_activo_id')->nullable()->after('canal')->constrained('flujos')->nullOnDelete();
            $table->string('nodo_actual_client_id')->nullable()->after('flujo_activo_id');
            $table->boolean('esperando_respuesta')->default(false)->after('nodo_actual_client_id');
            $table->json('contexto')->nullable()->after('esperando_respuesta');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('flujo_activo_id');
            $table->dropColumn(['nodo_actual_client_id', 'esperando_respuesta', 'contexto']);
        });
    }
};
