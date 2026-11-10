<?php

namespace App\Jobs;

use App\ImportStatus;
use App\Models\AlumniImportBatch;
use App\Services\AlumniImport;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Throwable;

/** Creates the profiles of a confirmed import preview outside the HTTP request. */
class ProcessAlumniImport implements ShouldQueue
{
    use Queueable;

    /** Must stay below the queue connection's retry_after so a slow run is never started twice. */
    public int $timeout = 80;

    public int $tries = 1;

    public function __construct(public int $batchId) {}

    public function handle(AlumniImport $import): void
    {
        $import->process(AlumniImportBatch::findOrFail($this->batchId));
    }

    public function failed(?Throwable $exception): void
    {
        AlumniImportBatch::whereKey($this->batchId)->update([
            'status' => ImportStatus::Failed->value,
            'payload' => null,
            'errors' => json_encode([['row' => 0, 'errors' => ['Impor gagal diproses. Tidak ada profil yang dibuat; unggah ulang berkas.']]]),
        ]);
    }
}
