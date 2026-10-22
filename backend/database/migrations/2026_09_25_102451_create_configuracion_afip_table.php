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
        Schema::create('configuracion_afip', function (Blueprint $table) {
            $table->id();
            $table->string('cuit', 15)->nullable();
            $table->string('razon_social', 150)->nullable();
            $table->integer('punto_venta')->default(1);
            $table->enum('condicion_iva', ['responsable_inscripto', 'monotributo', 'exento', 'consumidor_final'])->default('monotributo');
            $table->enum('ambiente', ['testing', 'produccion'])->default('testing');
            $table->boolean('activo')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracion_afip');
    }
};
