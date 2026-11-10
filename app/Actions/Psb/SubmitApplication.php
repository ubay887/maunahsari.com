<?php

namespace App\Actions\Psb;

use App\ApplicantSource;
use App\ApplicantStatus;
use App\DocumentType;
use App\Models\Applicant;
use App\Models\User;
use App\Pondok;
use App\UserRole;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Throwable;

class SubmitApplication
{
    public const BIODATA = ['program_id', 'residence_type', 'nik', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code', 'full_name', 'nickname', 'gender', 'birth_place', 'birth_date', 'address', 'last_education', 'hafalan_juz', 'can_read_binnadhor', 'can_write_pegon', 'guardian_name', 'guardian_relation', 'guardian_phone', 'agreed_to_rules'];

    public const SANTRI_FIELDS = ['nik', 'province_code', 'city_code', 'district_code', 'village_code', 'rt', 'rw', 'postal_code', 'full_name', 'nickname', 'gender', 'pondok', 'residence_type', 'program_id', 'birth_place', 'birth_date', 'address', 'guardian_name', 'guardian_phone'];

    public function __construct(private QuotaLock $lock, private RegistrationNumber $numbers) {}

    /**
     * @param  array<string, mixed>  $data
     * @param  array<string, UploadedFile>  $documents
     * @param  array{email: string, password: string}|null  $account  Kredensial portal; null untuk pendaftar tanpa akun (mis. diinput admin).
     */
    public function handle(array $data, array $documents, ApplicantSource $source, ?User $actor = null, ?array $account = null): Applicant
    {
        $stored = [];
        try {
            return DB::transaction(function () use ($data, $documents, $source, $actor, $account, &$stored): Applicant {
                $period = $this->lock->period((int) $data['registration_period_id']);
                $pondok = Pondok::fromGender((string) $data['gender']);
                $this->lock->available($period->id, (int) $data['program_id'], $pondok);
                $user = $account === null ? null : $this->createAccount($account, (string) $data['full_name']);
                $applicant = Applicant::create([...Arr::only($data, self::BIODATA), 'user_id' => $user?->id, 'registration_period_id' => $period->id, 'pondok' => $pondok, 'source' => $source, 'status' => ApplicantStatus::Registered, 'agreed_at' => now(), 'registration_number' => $this->numbers->next($period, $pondok)]);
                foreach ($documents as $type => $file) {
                    $documentType = DocumentType::from($type);
                    $path = $file->store('psb/'.$applicant->id, 'local');
                    if ($path === false) {
                        throw ValidationException::withMessages(['documents.'.$type => 'Berkas gagal disimpan. Silakan coba lagi.']);
                    }
                    $stored[] = $path;
                    $applicant->documents()->create(['type' => $documentType, 'path' => $path, 'original_name' => $file->getClientOriginalName(), 'size' => $file->getSize(), 'mime' => $file->getMimeType(), 'is_verified' => false]);
                }
                $applicant->statusHistories()->create(['to_status' => ApplicantStatus::Registered, 'changed_by' => $actor?->id]);

                return $applicant;
            });
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($stored);
            throw $exception;
        }
    }

    /** @param array{email: string, password: string} $account */
    private function createAccount(array $account, string $name): User
    {
        $user = new User(['name' => $name, 'email' => $account['email'], 'password' => $account['password']]);
        $user->role = UserRole::Applicant;
        try {
            $user->save();
        } catch (UniqueConstraintViolationException) {
            throw ValidationException::withMessages(['email' => 'Email ini sudah terdaftar.']);
        }

        return $user;
    }
}
