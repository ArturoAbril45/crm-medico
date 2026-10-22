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
        Schema::create('licencias_empleado', function (Blueprint $table) {
            $table->id();
            $table->foreignId('empleado_id')->constrained('empleados')->cascadeOnDelete();
            $table->enum('tipo', ['vacaciones', 'enfermedad', 'personal', 'maternidad_paternidad', 'otro'])->default('vacaciones');
            $table->date('fecha_inicio');
            $table->date('fecha_fin');
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada'])->default('pendiente');
            $table->text('motivo')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('licencias_empleado');
    }
};
