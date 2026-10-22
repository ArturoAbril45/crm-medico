<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('bloques', function (Blueprint $table) {
            $table->string('client_id', 36)->nullable()->after('flujo_id');
            $table->index(['flujo_id', 'client_id']);
        });

        Schema::create('bloque_edges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flujo_id')->constrained('flujos')->onDelete('cascade');
            $table->string('from_client_id', 36);
            $table->string('to_client_id', 36);
            $table->string('from_handle', 50)->nullable();
            $table->string('label', 100)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('bloque_edges');
        Schema::table('bloques', function (Blueprint $table) {
            $table->dropColumn('client_id');
        });
    }
};
