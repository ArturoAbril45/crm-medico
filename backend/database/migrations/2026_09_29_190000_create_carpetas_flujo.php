<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carpetas_flujo', function (Blueprint $table) {
            $table->id();
            $table->foreignId('compania_id')->nullable()->constrained('companias')->nullOnDelete();
            $table->string('nombre');
            $table->timestamps();
        });

        Schema::table('flujos', function (Blueprint $table) {
            $table->foreignId('carpeta_id')->nullable()->after('compania_id')->constrained('carpetas_flujo')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('flujos', function (Blueprint $table) {
            $table->dropConstrainedForeignId('carpeta_id');
        });
        Schema::dropIfExists('carpetas_flujo');
    }
};
