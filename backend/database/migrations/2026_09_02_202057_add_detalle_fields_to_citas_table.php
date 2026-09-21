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
        Schema::table('citas', function (Blueprint $table) {
            $table->foreignId('medico_id')->nullable()->after('procedimiento_id')->constrained('medicos')->nullOnDelete();
            $table->enum('tipo_consulta', ['presencial', 'virtual', 'domicilio'])->default('presencial')->after('duracion_min');
            $table->string('ubicacion')->nullable()->after('tipo_consulta');
            $table->string('motivo')->nullable()->after('ubicacion');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->dropConstrainedForeignId('medico_id');
            $table->dropColumn(['tipo_consulta', 'ubicacion', 'motivo']);
        });
    }
};
