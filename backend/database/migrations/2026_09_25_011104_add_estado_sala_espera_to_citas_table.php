<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE citas MODIFY estado ENUM('pendiente','confirmada','en_espera','en_progreso','realizada','cancelada','no_asistio') DEFAULT 'pendiente'");

        Schema::table('citas', function (Blueprint $table) {
            $table->timestamp('hora_checkin')->nullable()->after('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn('hora_checkin');
        });

        DB::statement("ALTER TABLE citas MODIFY estado ENUM('pendiente','confirmada','realizada','cancelada','no_asistio') DEFAULT 'pendiente'");
    }
};
