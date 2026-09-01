<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('conversaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->string('canal')->default('whatsapp');
            $table->enum('estado', ['abierta', 'cerrada', 'pendiente'])->default('abierta');
            $table->string('ultimo_mensaje')->nullable();
            $table->dateTime('ultimo_mensaje_at')->nullable();
            $table->integer('mensajes_no_leidos')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('conversaciones'); }
};
