<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('automatizaciones', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->foreignId('flujo_id')->nullable()->constrained('flujos')->onDelete('set null');
            $table->string('tipo')->default('palabra_clave'); // palabra_clave, evento, horario
            $table->string('palabra_clave')->nullable();
            $table->string('condicion')->default('contiene'); // contiene, es_igual, empieza_con
            $table->integer('ejecuciones')->default(0);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('automatizaciones'); }
};
