<?php

namespace App\Services;

use App\Http\Requests\Alumni\AdminProfileRequest;
use App\ImportStatus;
use App\Jobs\ProcessAlumniImport;
use App\Models\AlumniImportBatch;
use App\Models\AlumniProfile;
use App\Models\AuditLog;
use App\Models\Province;
use App\Models\Regency;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AlumniImport
{
    public const HEADERS = ['full_name', 'gender', 'entry_year', 'leave_year', 'pondok', 'alumni_status', 'angkatan', 'province_code', 'regency_code', 'activity_status', 'profession', 'organization', 'field', 'phone_whatsapp'];

    public function __construct(private AlumniSpreadsheet $spreadsheet) {}

    /** @return array<string, mixed> */
    public function preview(UploadedFile $file, User $admin): array
    {
        $rows = $this->spreadsheet->read($file);
        $headers = array_map(fn (string $value): string => trim(ltrim($value, "\xEF\xBB\xBF")), array_shift($rows) ?? []);
        if (count($headers) !== count(array_unique($headers)) || array_diff(['full_name', 'gender', 'entry_year', 'pondok', 'alumni_status', 'angkatan', 'province_code', 'regency_code', 'activity_status'], $headers) !== [] || array_diff($headers, self::HEADERS) !== []) {
            throw ValidationException::withMessages(['file' => 'Header tidak sesuai template.']);
        }
        $preview = [];
        $seen = [];
        foreach ($rows as $index => $row) {
            $row = array_pad($row, count($headers), '');
            if (count($row) !== count($headers)) {
                $preview[] = ['row' => $index + 2, 'data' => [], 'errors' => ['Jumlah kolom tidak sesuai.']];

                continue;
            }
            $raw = array_combine($headers, array_map('trim', $row));
            $data = [];
            foreach (AlumniPrivacy::EDITABLE as $key) {
                if (isset($raw[$key])) {
                    $data[$key] = $raw[$key] === '' ? null : $raw[$key];
                }
            }
            $data['province_id'] = Province::where('code', $raw['province_code'] ?? '')->value('id');
            $data['regency_id'] = Regency::where('code', $raw['regency_code'] ?? '')->where('province_id', $data['province_id'])->value('id');
            $validation = Validator::make($data, AdminProfileRequest::create('/', 'POST', $data)->rules());
            $errors = $validation->errors()->all();
            $key = mb_strtolower((string) ($data['full_name'] ?? '')).'|'.($data['angkatan'] ?? '').'|'.($data['regency_id'] ?? '');
            if (isset($seen[$key]) || $this->duplicate($data)) {
                $errors[] = 'Duplikat nama, angkatan, dan wilayah.';
            }
            $seen[$key] = true;
            $preview[] = ['row' => $index + 2, 'data' => $errors === [] ? $validation->validated() : [], 'errors' => $errors];
        }
        $token = Str::random(64);
        $payload = ['file_name' => basename($file->getClientOriginalName()), 'rows' => $preview];
        Cache::put('alumni-import:'.$admin->id.':'.$token, $payload, now()->addMinutes(30));

        return ['token' => $token, ...$payload];
    }

    /**
     * Consumes the single-use preview and queues its rows for creation.
     */
    public function confirm(User $admin, string $token): AlumniImportBatch
    {
        return Cache::lock('alumni-import-lock:'.$admin->id.':'.$token, 30)->block(5, function () use ($admin, $token): AlumniImportBatch {
            $payload = Cache::pull('alumni-import:'.$admin->id.':'.$token);
            if (! is_array($payload)) {
                throw ValidationException::withMessages(['token' => 'Pratinjau kedaluwarsa atau sudah diimpor. Unggah kembali.']);
            }
            $batch = AlumniImportBatch::create(['file_name' => $payload['file_name'], 'status' => ImportStatus::Queued, 'total' => count($payload['rows']), 'created_count' => 0, 'failed_count' => 0, 'errors' => [], 'payload' => $payload['rows'], 'imported_by' => $admin->id]);
            ProcessAlumniImport::dispatch($batch->id);

            return $batch;
        });
    }

    /**
     * Creates the queued rows in one transaction; an exception leaves no profile behind.
     * Model events are muted so the map cache is invalidated once instead of once per row.
     */
    public function process(AlumniImportBatch $batch): void
    {
        if ($batch->status !== ImportStatus::Queued) {
            return;
        }
        $batch->update(['status' => ImportStatus::Processing]);
        $rows = $batch->payload ?? [];

        DB::transaction(function () use ($batch, $rows): void {
            $created = 0;
            $errors = [];
            AlumniProfile::withoutEvents(function () use ($rows, &$created, &$errors): void {
                foreach ($rows as $row) {
                    if ($row['errors'] !== [] || $this->duplicate($row['data'])) {
                        $errors[] = ['row' => $row['row'], 'errors' => $row['errors'] ?: ['Duplikat ditemukan saat konfirmasi.']];

                        continue;
                    }
                    AlumniProfile::create([...$row['data'], 'source' => 'import', 'verification_status' => 'pending', 'map_mode' => null, 'directory_visible' => null, 'field_visibility' => []]);
                    $created++;
                }
            });
            $batch->update(['status' => ImportStatus::Completed, 'created_count' => $created, 'failed_count' => count($errors), 'errors' => $errors, 'payload' => null]);
            AuditLog::create(['actor_id' => $batch->imported_by, 'action' => 'alumni.imported', 'subject_type' => 'alumni_import_batch', 'subject_id' => $batch->id, 'meta' => ['created' => $created, 'failed' => count($errors)]]);
        });
        AlumniMapCache::invalidate();
    }

    /** @param array<string, mixed> $data */
    private function duplicate(array $data): bool
    {
        return AlumniProfile::withTrashed()->whereRaw('LOWER(full_name) = ?', [mb_strtolower((string) ($data['full_name'] ?? ''))])->where('angkatan', $data['angkatan'] ?? '')->where('regency_id', $data['regency_id'] ?? null)->exists();
    }
}
