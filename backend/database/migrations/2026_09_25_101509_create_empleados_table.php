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
        Schema::create('empleados', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('apellido', 100);
            $table->string('documento_identidad', 30)->nullable();
            $table->string('cargo', 100);
            $table->string('departamento', 100)->nullable();
            $table->date('fecha_ingreso');
            $table->date('fecha_egreso')->nullable();
            $table->decimal('salario', 10, 2)->nullable();
            $table->enum('tipo_contrato', ['planta_permanente', 'plazo_fijo', 'honorarios', 'pasante'])->default('planta_permanente');
            $table->string('telefono', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->enum('estado', ['activo', 'licencia', 'vacaciones', 'inactivo'])->default('activo');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('empleados');
    }
};
