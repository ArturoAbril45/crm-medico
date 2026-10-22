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
        Schema::create('productos_marketplace', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proveedor_id')->constrained('proveedores_mkt')->cascadeOnDelete();
            $table->string('nombre', 150);
            $table->string('categoria', 100)->nullable();
            $table->enum('unidad_medida', ['unidad', 'tablet', 'caja', 'frasco', 'paquete'])->default('unidad');
            $table->enum('tipo', ['fisico', 'digital'])->default('fisico');
            $table->decimal('precio', 10, 2)->default(0);
            $table->string('moneda', 5)->default('BOB');
            $table->integer('stock')->nullable();
            $table->text('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('productos_marketplace');
    }
};
