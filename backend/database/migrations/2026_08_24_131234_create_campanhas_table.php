<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('campanhas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('descripcion')->nullable();
            $table->integer('participantes')->default(0);
            $table->integer('ejecuciones')->default(0);
            $table->decimal('ctr', 5, 2)->default(0);
            $table->enum('estado', ['activa', 'pausada', 'archivada'])->default('activa');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('campanhas');
    }
};
