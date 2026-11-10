<?php

namespace App\Http\Requests;

use App\Models\Program;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgramRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('viewAny', Program::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $program = $this->route('program');

        return ['name' => ['required', 'string', 'max:255'], 'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('programs')->ignore($program instanceof Program ? $program->id : null)], 'description' => ['required', 'string', 'max:10000'], 'requires_hafalan' => ['required', 'boolean'], 'sort_order' => ['required', 'integer', 'min:0', 'max:10000'], 'is_active' => ['required', 'boolean']];
    }
}
