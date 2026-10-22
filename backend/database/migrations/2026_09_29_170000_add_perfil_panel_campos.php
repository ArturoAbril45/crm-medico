<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Soporte para el panel "Perfil" del contacto en la Bandeja de entrada
 * (atendente asignado, pausar automatizacion, etiquetas, notas con autor).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->boolean('automatizacion_activa')->default(true)->after('esperando_respuesta');
            $table->foreignId('agente_id')->nullable()->after('automatizacion_activa')->constrained('users')->nullOnDelete();
        });

        Schema::table('pacientes', function (Blueprint $table) {
            $table->json('etiquetas')->nullable()->after('notas');
        });

        Schema::create('notas_paciente', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('texto');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notas_paciente');
        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropColumn('etiquetas');
        });
        Schema::table('conversaciones', function (Blueprint $table) {
            $table->dropConstrainedForeignId('agente_id');
            $table->dropColumn('automatizacion_activa');
        });
    }
};
