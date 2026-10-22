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
        Schema::create('plantillas_informe', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('tipo_estudio', 150)->nullable();
            $table->text('contenido');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('plantillas_informe');
    }
};
