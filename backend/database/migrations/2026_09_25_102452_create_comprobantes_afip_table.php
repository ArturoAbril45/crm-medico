<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('comprobantes_afip', function (Blueprint $table) {
            $table->id();
            $table->foreignId('paciente_id')->nullable()->constrained('pacientes')->nullOnDelete();
            $table->enum('tipo_comprobante', [
                'factura_a', 'factura_b', 'factura_c',
                'nota_credito_a', 'nota_credito_b', 'nota_credito_c',
                'nota_debito_a', 'nota_debito_b', 'nota_debito_c',
            ]);
            $table->integer('numero');
            $table->string('cae', 20)->nullable();
            $table->date('cae_vencimiento')->nullable();
            $table->decimal('monto', 10, 2)->default(0);
            $table->enum('estado', ['borrador', 'emitido', 'anulado'])->default('borrador');
            $table->date('fecha');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('comprobantes_afip');
    }
};
