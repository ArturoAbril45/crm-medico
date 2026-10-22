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
        Schema::create('prestaciones', function (Blueprint $table) {
            $table->id();
            $table->string('codigo', 50);
            $table->string('descripcion', 200);
            $table->string('categoria', 100)->nullable();
            $table->string('tipo', 100)->nullable();
            $table->decimal('valor_base', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestaciones');
    }
};
