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
        Schema::create('informes_imagen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medico_id')->nullable()->constrained()->nullOnDelete();
            $table->string('tipo_estudio');
            $table->enum('estado', ['pendiente', 'borrador', 'preliminar', 'firmado'])->default('pendiente');
            $table->text('contenido')->nullable();
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('informes_imagen');
    }
};
