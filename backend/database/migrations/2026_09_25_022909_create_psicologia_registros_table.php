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
        Schema::create('psicologia_registros', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained()->cascadeOnDelete();
            $table->enum('tipo', ['sesion', 'escala', 'plan'])->default('sesion');
            $table->string('titulo', 150)->nullable();
            $table->text('contenido')->nullable();
            $table->string('escala_nombre', 100)->nullable();
            $table->integer('escala_puntaje')->nullable();
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('psicologia_registros');
    }
};
