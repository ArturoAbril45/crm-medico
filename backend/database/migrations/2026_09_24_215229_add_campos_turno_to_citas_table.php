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
            $table->foreignId('medico_id')->nullable()->after('doctor')->constrained('medicos')->nullOnDelete();
            $table->enum('tipo_consulta', ['presencial', 'telemedicina', 'alta', 'emergencia', 'cirugia'])->default('presencial')->after('estado');
            $table->enum('cobertura_tipo', ['particular', 'obra_social'])->default('particular')->after('tipo_consulta');
            $table->string('cobertura_nombre')->nullable()->after('cobertura_tipo');
            $table->string('ubicacion')->nullable()->after('cobertura_nombre');
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
            $table->dropColumn(['tipo_consulta', 'cobertura_tipo', 'cobertura_nombre', 'ubicacion', 'motivo']);
        });
    }
};
