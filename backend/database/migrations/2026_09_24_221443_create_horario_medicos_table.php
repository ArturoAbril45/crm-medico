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
        Schema::create('horario_medicos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('medico_id')->constrained()->cascadeOnDelete();
            $table->enum('rango_aplicacion', ['indefinido', 'recurrente', 'un_dia', 'una_semana', 'mes'])->default('recurrente');
            $table->json('dias_semana')->nullable(); // [0..6] domingo=0
            $table->date('valido_desde')->nullable();
            $table->date('valido_hasta')->nullable();
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->enum('tipo_consulta', ['hibrido', 'presencial', 'telemedicina'])->default('hibrido');
            $table->unsignedSmallInteger('duracion_turno')->nullable(); // null = usar duracion de la practica
            $table->boolean('requiere_coseguro')->default(false);
            $table->decimal('monto_coseguro', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('horario_medicos');
    }
};
