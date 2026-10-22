<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('medicos', function (Blueprint $table) {
            $table->text('google_refresh_token')->nullable();
            $table->text('google_access_token')->nullable();
            $table->timestamp('google_token_expira')->nullable();
        });

        Schema::table('citas', function (Blueprint $table) {
            $table->string('google_event_id')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('medicos', function (Blueprint $table) {
            $table->dropColumn(['google_refresh_token', 'google_access_token', 'google_token_expira']);
        });
        Schema::table('citas', function (Blueprint $table) {
            $table->dropColumn('google_event_id');
        });
    }
};
