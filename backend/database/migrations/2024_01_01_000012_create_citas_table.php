<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('citas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->foreignId('procedimiento_id')->nullable()->constrained('procedimientos')->onDelete('set null');
            $table->string('doctor')->nullable();
            $table->dateTime('fecha_hora');
            $table->integer('duracion_min')->default(60);
            $table->enum('estado', ['pendiente', 'confirmada', 'realizada', 'cancelada', 'no_asistio'])->default('pendiente');
            $table->text('notas')->nullable();
            $table->decimal('monto', 10, 2)->default(0);
            $table->boolean('recordatorio_enviado')->default(false);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('citas'); }
};
