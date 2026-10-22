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
            $table->foreignId('rol_id')->nullable()->after('id')->constrained('roles')->nullOnDelete();
            $table->string('api_token', 80)->nullable()->unique()->after('remember_token');
            $table->boolean('activo')->default(true)->after('api_token');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rol_id');
            $table->dropColumn(['api_token', 'activo']);
        });
    }
};
