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
        Schema::create('pedido_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pedido_id')->constrained('pedidos_mkt')->cascadeOnDelete();
            $table->foreignId('producto_id')->nullable()->constrained('productos_marketplace')->nullOnDelete();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedores_mkt')->nullOnDelete();
            $table->string('nombre_producto', 150);
            $table->integer('cantidad')->default(1);
            $table->decimal('precio_unitario', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pedido_items');
    }
};
