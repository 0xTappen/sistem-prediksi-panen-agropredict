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
        Schema::create('prediction_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('project_id')->constrained('projects')->cascadeOnDelete();
            $table->foreignId('input_log_id')->constrained('input_logs')->cascadeOnDelete();
            $table->decimal('estimasi_panen_ton', 10, 2);
            $table->decimal('skor_kecocokan', 5, 2);
            $table->string('status');
            $table->string('faktor_dominan');
            $table->json('rekomendasi_json');
            $table->string('lokasi');
            $table->date('tanggal_prediksi');
            $table->timestamps();

            $table->index(['user_id', 'tanggal_prediksi']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prediction_histories');
    }
};
