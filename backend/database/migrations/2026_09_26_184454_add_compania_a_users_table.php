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
            $table->foreignId('compania_id')->nullable()->after('rol_id')->constrained('companias')->nullOnDelete();
            $table->boolean('es_super_admin')->default(false)->after('activo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('compania_id');
            $table->dropColumn('es_super_admin');
        });
    }
};
