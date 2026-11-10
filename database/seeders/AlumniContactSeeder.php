<?php

namespace Database\Seeders;

use App\ContactRequestStatus;
use App\Models\AlumniProfile;
use App\Models\ContactRequest;
use App\Services\AlumniPrivacy;
use App\VerificationStatus;
use Database\Seeders\Concerns\DeterministicData;
use Illuminate\Database\Seeder;

/**
 * Permintaan kontak antar-alumni dengan semua status: menunggu, disetujui, ditolak, dan
 * kedaluwarsa. Pengirim adalah alumni terverifikasi yang boleh menjelajah; penerima adalah
 * alumni yang tampil di direktori. Hanya berjalan di local/testing.
 */
class AlumniContactSeeder extends Seeder
{
    use DeterministicData;

    private const TOTAL = 36;

    private const MESSAGES = [
        'Assalamu’alaikum, saya sealumni di pesantren. Boleh minta kontaknya untuk bertukar kabar dan silaturahmi?',
        'Assalamu’alaikum kak, saya sedang mencari informasi seputar dunia kerja di bidang Anda. Boleh minta kontak WhatsApp-nya?',
        'Salam alumni. Kami sedang menyiapkan temu alumni wilayah, mohon izin meminta kontak untuk koordinasi.',
        'Assalamu’alaikum, saya ingin berdiskusi soal peluang kerja sama usaha. Semoga berkenan membagikan kontaknya.',
        'Mohon izin meminta kontak WhatsApp untuk mengundang ke kegiatan sosial alumni bulan depan. Jazakumullah khairan.',
        'Assalamu’alaikum, saya adik angkatan dan ingin belajar tentang kuliah di kota yang sama. Boleh minta kontaknya?',
    ];

    public function run(AlumniPrivacy $privacy): void
    {
        if (! app()->environment(['local', 'testing'])) {
            return;
        }
        $senders = AlumniProfile::query()
            ->where('verification_status', VerificationStatus::Approved)
            ->whereNotNull('user_id')->whereNotNull('map_mode')->whereNotNull('directory_visible')
            ->orderBy('id')->get()->values();
        $targets = $privacy->discoverable()->whereNotNull('user_id')->orderBy('id')->get()->values();
        if ($senders->count() < 2 || $targets->count() < 2) {
            return;
        }

        $created = 0;
        for ($i = 1; $created < self::TOTAL && $i <= self::TOTAL * 4; $i++) {
            $requester = $this->pick('contact-from', $i, $senders->all());
            $target = $this->pick('contact-to', $i, $targets->all());
            if ($requester->id === $target->id) {
                continue;
            }
            $created++;
            $this->seedRequest($created, $requester, $target);
        }
    }

    private function seedRequest(int $number, AlumniProfile $requester, AlumniProfile $target): void
    {
        $status = $this->status($number);
        $sentAt = match ($status) {
            ContactRequestStatus::Pending => now()->subDays(1 + $this->roll('sent', $number, 20)),
            ContactRequestStatus::Expired => now()->subDays(35 + $this->roll('sent', $number, 40)),
            default => now()->subDays(3 + $this->roll('sent', $number, 80)),
        };
        $answered = in_array($status, [ContactRequestStatus::Approved, ContactRequestStatus::Declined], true);

        ContactRequest::unguarded(fn () => ContactRequest::updateOrCreate(
            ['requester_profile_id' => $requester->id, 'target_profile_id' => $target->id],
            [
                'message' => $this->pick('message', $number, self::MESSAGES),
                'status' => $status,
                'responded_at' => $answered ? $sentAt->copy()->addHours(2 + $this->roll('reply', $number, 70)) : ($status === ContactRequestStatus::Expired ? $sentAt->copy()->addDays(30) : null),
                'expires_at' => $sentAt->copy()->addDays(30),
                'created_at' => $sentAt->startOfMinute(),
                'updated_at' => $sentAt->startOfMinute(),
            ],
        ));
    }

    private function status(int $number): ContactRequestStatus
    {
        $roll = $this->roll('contact-status', $number, 100);

        return match (true) {
            $roll < 30 => ContactRequestStatus::Pending,
            $roll < 72 => ContactRequestStatus::Approved,
            $roll < 90 => ContactRequestStatus::Declined,
            default => ContactRequestStatus::Expired,
        };
    }
}
