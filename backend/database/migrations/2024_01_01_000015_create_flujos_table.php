<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('flujos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->integer('total_ejecuciones')->default(0);
            $table->integer('total_conversiones')->default(0);
            $table->timestamps();
        });

        Schema::create('bloques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flujo_id')->constrained('flujos')->onDelete('cascade');
            $table->enum('tipo', ['inicio', 'contenido', 'menu', 'condicion', 'accion'])->default('contenido');
            $table->decimal('pos_x', 10, 2)->default(0);
            $table->decimal('pos_y', 10, 2)->default(0);
            $table->json('config')->nullable(); // messages, options, etc
            $table->unsignedBigInteger('siguiente_bloque_id')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('bloques');
        Schema::dropIfExists('flujos');
    }
};
