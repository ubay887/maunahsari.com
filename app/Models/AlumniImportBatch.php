<?php

namespace App\Models;

use App\ImportStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property ImportStatus $status
 * @property list<array{row: int, errors: list<string>}>|null $errors
 * @property list<array{row: int, data: array<string, mixed>, errors: list<string>}>|null $payload
 */
#[Fillable(['file_name', 'status', 'total', 'created_count', 'failed_count', 'errors', 'payload', 'imported_by'])]
class AlumniImportBatch extends Model
{
    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => ImportStatus::class, 'errors' => 'array', 'payload' => 'array'];
    }
}
