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
        Schema::create('input_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->decimal('nitrogen', 8, 2);
            $table->decimal('phosphorus', 8, 2);
            $table->decimal('potassium', 8, 2);
            $table->decimal('ph_tanah', 4, 2);
            $table->decimal('kelembapan_tanah', 5, 2);
            $table->decimal('jumlah_air', 10, 2);
            $table->decimal('suhu', 5, 2);
            $table->decimal('kelembapan_udara', 5, 2);
            $table->decimal('curah_hujan', 8, 2);
            $table->enum('sumber_cuaca', ['api', 'manual']);
            $table->text('catatan')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'project_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('input_logs');
    }
};
