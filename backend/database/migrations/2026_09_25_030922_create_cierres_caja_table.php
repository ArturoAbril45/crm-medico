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
        Schema::create('cierres_caja', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->unique();
            $table->decimal('total_efectivo', 10, 2)->default(0);
            $table->decimal('total_tarjeta', 10, 2)->default(0);
            $table->decimal('total_transferencia', 10, 2)->default(0);
            $table->decimal('total_qr', 10, 2)->default(0);
            $table->decimal('egresos', 10, 2)->default(0);
            $table->text('observaciones')->nullable();
            $table->enum('estado', ['abierto', 'cerrado'])->default('abierto');
            $table->timestamp('cerrado_en')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cierres_caja');
    }
};
