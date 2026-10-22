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
        Schema::create('configuracion_ia_bot', function (Blueprint $table) {
            $table->id();
            $table->enum('proveedor', ['openai', 'anthropic'])->default('openai');
            $table->string('modelo', 100)->default('gpt-4o-mini');
            $table->text('api_key')->nullable();
            $table->text('prompt_sistema')->nullable();
            $table->decimal('temperatura_default', 3, 1)->default(1.0);
            $table->boolean('activo')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('configuracion_ia_bot');
    }
};
