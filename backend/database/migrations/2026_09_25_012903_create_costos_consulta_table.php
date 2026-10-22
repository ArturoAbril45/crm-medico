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
        Schema::create('costos_consulta', function (Blueprint $table) {
            $table->id();
            $table->string('categoria');
            $table->string('denominacion');
            $table->decimal('valor', 12, 2)->default(0);
            $table->decimal('diferencia', 12, 2)->default(0);
            $table->string('observaciones')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('costos_consulta');
    }
};
