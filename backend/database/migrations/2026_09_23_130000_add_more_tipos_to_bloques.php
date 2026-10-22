<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void {
        DB::statement("ALTER TABLE bloques MODIFY COLUMN tipo ENUM(
            'inicio', 'contenido', 'menu', 'condicion', 'accion',
            'conexion_flujo', 'randomizer', 'retraso_inteligente', 'integracion', 'asistente_gpt'
        ) DEFAULT 'contenido'");
    }
    public function down(): void {
        DB::statement("ALTER TABLE bloques MODIFY COLUMN tipo ENUM(
            'inicio', 'contenido', 'menu', 'condicion', 'accion'
        ) DEFAULT 'contenido'");
    }
};
