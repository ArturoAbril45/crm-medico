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
        Schema::create('whatsapp_conversaciones', function (Blueprint $table) {
            $table->id();
            $table->string('telefono')->unique();
            $table->string('nombre')->nullable();
            $table->foreignId('paciente_id')->nullable()->constrained('pacientes')->nullOnDelete();
            $table->string('estado')->default('activo');
            $table->text('ultimo_mensaje')->nullable();
            $table->dateTime('ultimo_mensaje_at')->nullable();
            $table->unsignedInteger('no_leidos')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_conversaciones');
    }
};
