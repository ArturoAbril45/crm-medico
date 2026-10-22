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
        Schema::create('publicaciones_academy', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 200);
            $table->string('slug', 220)->unique();
            $table->string('resumen', 400)->nullable();
            $table->longText('contenido');
            $table->enum('tipo', ['oficial', 'comunidad'])->default('comunidad');
            $table->string('modulo', 100)->nullable();
            $table->unsignedSmallInteger('minutos_lectura')->default(3);
            $table->string('autor_nombre', 150)->nullable();
            $table->enum('estado', ['publicado', 'pendiente', 'rechazado'])->default('pendiente');
            $table->unsignedInteger('votos_util')->default(0);
            $table->unsignedInteger('votos_no_util')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('publicaciones_academy');
    }
};
