<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('modelos_mensajes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->enum('categoria', ['Marketing', 'Utilidad', 'Servicio'])->default('Marketing');
            $table->text('contenido');
            $table->enum('estado', ['pendiente', 'aprobado', 'rechazado'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('modelos_mensajes');
    }
};
