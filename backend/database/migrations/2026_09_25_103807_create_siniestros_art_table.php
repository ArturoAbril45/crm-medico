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
        Schema::create('siniestros_art', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleados')->cascadeOnDelete();
            $table->enum('tipo', ['accidente_trabajo', 'enfermedad_profesional', 'accidente_in_itinere']);
            $table->date('fecha_siniestro');
            $table->text('descripcion');
            $table->string('art_nombre', 150)->nullable();
            $table->string('numero_siniestro', 50)->nullable();
            $table->enum('estado', ['denunciado', 'en_tratamiento', 'alta_medica', 'rechazado'])->default('denunciado');
            $table->integer('dias_baja')->nullable();
            $table->date('fecha_alta')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siniestros_art');
    }
};
