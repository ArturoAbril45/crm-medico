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
        Schema::create('practicas_facturables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->cascadeOnDelete();
            $table->foreignId('medico_id')->nullable()->constrained('medicos')->nullOnDelete();
            $table->foreignId('convenio_id')->nullable()->constrained('convenios')->nullOnDelete();
            $table->foreignId('prestacion_id')->nullable()->constrained('prestaciones')->nullOnDelete();
            $table->foreignId('cita_id')->nullable()->constrained('citas')->nullOnDelete();
            $table->foreignId('presentacion_id')->nullable()->constrained('presentaciones')->nullOnDelete();
            $table->decimal('monto', 10, 2)->default(0);
            $table->enum('estado', ['sin_marcar', 'lista', 'presentada', 'debitada', 'cobrada', 'anulada'])->default('sin_marcar');
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practicas_facturables');
    }
};
