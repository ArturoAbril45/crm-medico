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
        Schema::create('presentaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('convenio_id')->constrained('convenios')->cascadeOnDelete();
            $table->string('periodo', 7);
            $table->date('presentado_en')->nullable();
            $table->decimal('liquidacion', 12, 2)->default(0);
            $table->enum('status', ['borrador', 'presentada', 'liquidada'])->default('borrador');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('presentaciones');
    }
};
