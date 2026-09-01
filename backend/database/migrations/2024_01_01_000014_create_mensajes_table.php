<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('mensajes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversacion_id')->constrained('conversaciones')->onDelete('cascade');
            $table->enum('tipo', ['entrante', 'saliente', 'bot'])->default('entrante');
            $table->text('contenido');
            $table->string('tipo_contenido')->default('texto'); // texto, imagen, audio, documento
            $table->string('archivo_url')->nullable();
            $table->boolean('leido')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('mensajes'); }
};
