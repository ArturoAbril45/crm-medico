<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->constrained('pacientes')->onDelete('cascade');
            $table->foreignId('cita_id')->nullable()->constrained('citas')->onDelete('set null');
            $table->decimal('monto', 10, 2);
            $table->string('moneda')->default('BOB');
            $table->enum('metodo_pago', ['efectivo', 'tarjeta', 'transferencia', 'qr'])->default('efectivo');
            $table->enum('estado', ['pendiente', 'completado', 'cancelado', 'reembolsado'])->default('pendiente');
            $table->string('referencia')->nullable();
            $table->text('notas')->nullable();
            $table->date('fecha');
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('pagos'); }
};
