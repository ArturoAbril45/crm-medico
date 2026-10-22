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
        Schema::create('cotizaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->constrained('proveedores_mkt')->cascadeOnDelete();
            $table->enum('estado', ['pendiente', 'respondida', 'aceptada', 'rechazada'])->default('pendiente');
            $table->text('mensaje')->nullable();
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cotizaciones');
    }
};
