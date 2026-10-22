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
        Schema::table('medicos', function (Blueprint $table) {
            $table->string('subespecialidad')->nullable()->after('especialidad');
            $table->string('numero_licencia')->nullable()->after('subespecialidad');
            $table->string('pais_licencia')->nullable()->after('numero_licencia');
            $table->unsignedSmallInteger('anos_experiencia')->nullable()->after('pais_licencia');
            $table->decimal('tarifa_consulta', 10, 2)->nullable()->after('anos_experiencia');
            $table->string('moneda_tarifa', 5)->nullable()->after('tarifa_consulta');
            $table->json('educacion')->nullable()->after('moneda_tarifa');
            $table->json('certificaciones')->nullable()->after('educacion');
            $table->json('idiomas')->nullable()->after('certificaciones');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicos', function (Blueprint $table) {
            $table->dropColumn([
                'subespecialidad', 'numero_licencia', 'pais_licencia', 'anos_experiencia',
                'tarifa_consulta', 'moneda_tarifa', 'educacion', 'certificaciones', 'idiomas',
            ]);
        });
    }
};
