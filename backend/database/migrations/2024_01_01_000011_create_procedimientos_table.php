<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('procedimientos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->string('categoria');
            $table->decimal('precio_consulta', 10, 2)->default(0);
            $table->decimal('precio_procedimiento', 10, 2)->default(0);
            $table->integer('duracion_min')->default(60);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('procedimientos'); }
};
