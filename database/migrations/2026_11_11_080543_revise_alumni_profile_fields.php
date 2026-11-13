<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table): void {
            $table->string('nickname', 60)->nullable()->after('full_name');
            $table->unsignedSmallInteger('entry_year')->nullable()->change();
            $table->dropColumn('activity_status');
        });
    }

    public function down(): void
    {
        Schema::table('alumni_profiles', function (Blueprint $table): void {
            $table->string('activity_status')->default('lainnya')->after('regency_id');
            $table->dropColumn('nickname');
        });
    }
};
