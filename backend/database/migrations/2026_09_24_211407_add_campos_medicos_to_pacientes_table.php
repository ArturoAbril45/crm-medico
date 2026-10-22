<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('pacientes', function (Blueprint $table) {
            // Informacion personal
            $table->string('segundo_nombre')->nullable()->after('nombre');
            $table->enum('tipo_documento', ['dni', 'pasaporte', 'cedula', 'otro'])->default('dni')->after('genero');
            $table->string('numero_documento')->nullable()->after('tipo_documento');
            $table->string('pais_emisor_documento')->nullable()->after('numero_documento');

            // Contacto
            $table->string('telefono_fijo')->nullable()->after('whatsapp');

            // Direccion
            $table->string('direccion_linea1')->nullable()->after('ciudad');
            $table->string('direccion_linea2')->nullable()->after('direccion_linea1');
            $table->string('provincia')->nullable()->after('direccion_linea2');
            $table->string('codigo_postal')->nullable()->after('provincia');

            // Informacion medica
            $table->enum('tipo_sangre', ['A', 'B', 'AB', 'O'])->nullable()->after('notas');
            $table->enum('factor_rh', ['positivo', 'negativo', 'desconocido'])->nullable()->after('tipo_sangre');
            $table->unsignedSmallInteger('altura_cm')->nullable()->after('factor_rh');
            $table->decimal('peso_kg', 5, 2)->nullable()->after('altura_cm');

            // Contacto de emergencia
            $table->string('emergencia_nombre')->nullable()->after('peso_kg');
            $table->string('emergencia_telefono')->nullable()->after('emergencia_nombre');
            $table->enum('emergencia_relacion', ['esposo_a', 'padre_madre', 'hijo_a', 'hermano_a', 'otro_familiar', 'amigo_a', 'otro'])->nullable()->after('emergencia_telefono');

            // Cobertura
            $table->enum('tipo_cobertura', ['privado', 'obra_social', 'prepaga', 'particular'])->nullable()->after('emergencia_relacion');

            // Consentimiento red de salud
            $table->boolean('consentimiento_red')->default(false)->after('tipo_cobertura');
        });
    }

    public function down(): void {
        Schema::table('pacientes', function (Blueprint $table) {
            $table->dropColumn([
                'segundo_nombre', 'tipo_documento', 'numero_documento', 'pais_emisor_documento',
                'telefono_fijo', 'direccion_linea1', 'direccion_linea2', 'provincia', 'codigo_postal',
                'tipo_sangre', 'factor_rh', 'altura_cm', 'peso_kg',
                'emergencia_nombre', 'emergencia_telefono', 'emergencia_relacion',
                'tipo_cobertura', 'consentimiento_red',
            ]);
        });
    }
};
