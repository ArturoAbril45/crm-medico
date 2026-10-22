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
        Schema::create('proveedores_mkt', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->enum('categoria', ['laboratorio', 'farmacia', 'insumos', 'equipos', 'servicios', 'otro'])->default('otro');
            $table->string('provincia', 100)->nullable();
            $table->string('ciudad', 100)->nullable();
            $table->text('descripcion')->nullable();
            $table->boolean('es_propio')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedores_mkt');
    }
};
