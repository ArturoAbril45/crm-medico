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
        Schema::table('pacientes', function (Blueprint $table) {
            $table->string('numero_historia')->nullable()->unique()->after('id');
            $table->string('segundo_nombre')->nullable()->after('nombre');
            $table->string('tipo_documento')->default('DNI')->after('genero');
            $table->string('numero_documento')->nullable()->after('tipo_documento');
            $table->string('pais_documento')->nullable()->after('numero_documento');
            $table->string('telefono_fijo')->nullable()->after('telefono');
            $table->string('tipo_sangre')->nullable()->after('genero');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropColumn(['numero_historia', 'segundo_nombre', 'tipo_documento', 'numero_documento', 'pais_documento', 'telefono_fijo', 'tipo_sangre']);
        });
    }
};
