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
        Schema::table('users', function (Blueprint $table) {
            $table->string('usuario')->nullable()->unique()->after('name');
            $table->string('rol')->default('administrador')->after('usuario');
            $table->foreignId('medico_id')->nullable()->after('rol')->constrained('medicos')->nullOnDelete();
            $table->json('permisos')->nullable()->after('medico_id');
            $table->boolean('activo')->default(true)->after('permisos');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('medico_id');
            $table->dropColumn(['usuario', 'rol', 'permisos', 'activo']);
        });
    }
};
