<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('user_settings', function (Blueprint $table) {
            $table->string('theme')->default('dark')->change();
        });

        DB::table('user_settings')
            ->where('theme', 'light')
            ->update(['theme' => 'dark']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('user_settings')
            ->where('theme', 'dark')
            ->update(['theme' => 'light']);

        Schema::table('user_settings', function (Blueprint $table) {
            $table->string('theme')->default('light')->change();
        });
    }
};
