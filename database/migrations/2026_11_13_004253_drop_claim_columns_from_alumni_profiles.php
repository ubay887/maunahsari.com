<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table): void {
            $table->dropUnique(['claim_code_hash']);
            $table->dropColumn(['claim_code_hash', 'claimed_at']);
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table): void {
            $table->string('claim_code_hash')->nullable()->unique();
            $table->timestamp('claimed_at')->nullable();
        });
    }
};
