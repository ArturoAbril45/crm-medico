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
        Schema::create('pedidos_mkt', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 20)->unique();
            $table->decimal('total', 10, 2)->default(0);
            $table->enum('estado', ['pendiente', 'confirmado', 'enviado', 'completado', 'cancelado'])->default('pendiente');
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedidos_mkt');
    }
};
