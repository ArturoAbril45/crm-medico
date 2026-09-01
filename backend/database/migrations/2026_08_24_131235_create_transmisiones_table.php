<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transmisiones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('mensaje');
            $table->date('fecha_envio')->nullable();
            $table->time('hora_envio')->nullable();
            $table->integer('destinatarios')->default(0);
            $table->integer('enviados')->default(0);
            $table->integer('entregados')->default(0);
            $table->integer('leidos')->default(0);
            $table->enum('estado', ['borrador', 'agendada', 'enviando', 'completada', 'cancelada'])->default('borrador');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('transmisiones');
    }
};
