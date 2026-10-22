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
        Schema::create('departamento_medico', function (Blueprint $table) {
            $table->id();
            $table->foreignId('departamento_id')->constrained()->cascadeOnDelete();
            $table->foreignId('medico_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['departamento_id', 'medico_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departamento_medico');
    }
};
