<?php

namespace Database\Seeders;

use App\Models\AlumniProfile;
use App\Models\ConsentRecord;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;

/**
 * Riwayat persetujuan privasi untuk alumni yang mendaftar sendiri dan sudah memilih
 * privasi, dengan tiga jenis catatan seperti saat mereka menyimpan pengaturan privasi.
 * Hanya berjalan di local/testing.
 */
class AlumniConsentSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }

        AlumniProfile::query()
            ->whereNotNull('user_id')
            ->whereNotNull('map_mode')
            ->whereNotNull('directory_visible')
            ->orderBy('id')
            ->each(function (AlumniProfile $profile): void {
                $recordedAt = CarbonImmutable::parse($profile->verified_at ?? $profile->created_at ?? now())->subDays(2)->startOfMinute();
                $consents = [
                    'privacy_policy' => true,
                    'map_display' => $profile->map_mode?->value !== 'hidden',
                    'directory_display' => (bool) $profile->directory_visible,
                ];
                foreach ($consents as $type => $granted) {
                    ConsentRecord::unguarded(fn () => ConsentRecord::updateOrCreate(
                        ['user_id' => $profile->user_id, 'profile_id' => $profile->id, 'type' => $type, 'version' => config('alumni.privacy_version')],
                        ['granted' => $granted, 'recorded_at' => $recordedAt],
                    ));
                }
            });
    }
}
