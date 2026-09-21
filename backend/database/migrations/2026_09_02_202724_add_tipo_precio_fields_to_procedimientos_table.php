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
        Schema::table('procedimientos', function (Blueprint $table) {
            $table->enum('tipo_precio', ['fijo', 'porcentaje'])->default('fijo')->after('precio_procedimiento');
            $table->decimal('precio_base', 10, 2)->nullable()->after('tipo_precio');
            $table->decimal('porcentaje_descuento', 5, 2)->nullable()->after('precio_base');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('procedimientos', function (Blueprint $table) {
            $table->dropColumn(['tipo_precio', 'precio_base', 'porcentaje_descuento']);
        });
    }
};
