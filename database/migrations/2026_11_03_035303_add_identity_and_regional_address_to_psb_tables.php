<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['applicants', 'santris'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                $table->string('nik', 16)->nullable();
                $table->char('province_code', 2)->nullable();
                $table->char('city_code', 4)->nullable();
                $table->char('district_code', 7)->nullable();
                $table->char('village_code', 10)->nullable();
                $table->string('rt', 3)->nullable();
                $table->string('rw', 3)->nullable();
                $table->string('postal_code', 5)->nullable();
                foreach (['province' => 'provinces', 'city' => 'cities', 'district' => 'districts', 'village' => 'villages'] as $region => $regionTable) {
                    $table->foreign($region.'_code')->references('code')->on('indonesia_'.$regionTable)->cascadeOnUpdate()->restrictOnDelete();
                }
            });
        }
        Schema::table('applicants', function (Blueprint $table): void {
            $table->string('last_school')->nullable()->change();
        });
        foreach (['TK/RA' => ['TK', 'RA'], 'SD/MI' => ['SD', 'MI'], 'SMP/MTs' => ['SMP', 'MTs', 'MTS'], 'SMA/MA/SMK' => ['SMA', 'MA', 'SMK'], 'D4/S1' => ['D4', 'S1']] as $education => $aliases) {
            DB::table('applicants')->whereIn('last_education', $aliases)->update(['last_education' => $education]);
        }
    }

    /** Legacy school values remain nullable for registrations created without a school field. */
    public function down(): void
    {
        foreach (['applicants', 'santris'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table): void {
                foreach (['province', 'city', 'district', 'village'] as $region) {
                    $table->dropForeign([$region.'_code']);
                }
                $table->dropColumn(['nik', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code']);
            });
        }
    }
};
