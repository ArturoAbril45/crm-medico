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
        Schema::create('medicos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('especialidad')->nullable();
            $table->string('email')->nullable();
            $table->string('telefono')->nullable();
            $table->foreignId('departamento_id')->nullable()->constrained('departamentos')->nullOnDelete();
            $table->string('hora_inicio')->default('08:00');
            $table->string('hora_fin')->default('17:00');
            $table->string('dias_trabajo')->default('1,2,3,4,5'); // 1=lunes ... 7=domingo
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicos');
    }
};
