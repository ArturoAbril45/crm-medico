<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pacientes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('apellido');
            $table->string('telefono')->unique();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->date('fecha_nacimiento')->nullable();
            $table->enum('genero', ['masculino', 'femenino', 'otro'])->nullable();
            $table->string('ciudad')->nullable();
            $table->string('pais')->default('Bolivia');
            $table->text('notas')->nullable();
            $table->enum('estado', ['activo', 'inactivo', 'potencial'])->default('potencial');
            $table->string('fuente')->nullable(); // whatsapp, referido, web, etc
            $table->decimal('total_gastado', 10, 2)->default(0);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('pacientes'); }
};
