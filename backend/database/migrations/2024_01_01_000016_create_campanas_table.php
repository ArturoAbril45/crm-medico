<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('campanas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->foreignId('flujo_id')->nullable()->constrained('flujos')->onDelete('set null');
            $table->enum('estado', ['borrador', 'activa', 'pausada', 'finalizada'])->default('borrador');
            $table->dateTime('fecha_inicio')->nullable();
            $table->dateTime('fecha_fin')->nullable();
            $table->integer('total_enviados')->default(0);
            $table->integer('total_entregados')->default(0);
            $table->integer('total_leidos')->default(0);
            $table->integer('total_clicados')->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('campanas'); }
};
