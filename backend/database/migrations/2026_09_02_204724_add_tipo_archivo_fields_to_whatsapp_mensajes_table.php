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
        Schema::table('whatsapp_mensajes', function (Blueprint $table) {
            $table->enum('tipo', ['texto', 'imagen', 'audio', 'documento'])->default('texto')->after('de');
            $table->string('archivo_url')->nullable()->after('tipo');
            $table->string('archivo_nombre')->nullable()->after('archivo_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_mensajes', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'archivo_url', 'archivo_nombre']);
        });
    }
};
