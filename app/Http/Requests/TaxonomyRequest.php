<?php

namespace App\Http\Requests;

use App\Models\Article;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class TaxonomyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageTaxonomies', Article::class) ?? false;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:80'],
            'slug' => ['required', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique($this->route('taxonomy') === 'categories' ? 'categories' : 'tags')->ignore($this->route('id'))],
            'parent_id' => ['nullable', 'integer', Rule::exists('categories', 'id')->whereNull('parent_id'), Rule::notIn([$this->route('id')])],
        ];
    }

    /** @return array<callable(Validator): void> */
    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($this->route('taxonomy') === 'categories' && $this->filled('parent_id') && Category::whereKey($this->route('id'))->whereHas('children')->exists()) {
                $validator->errors()->add('parent_id', 'Kategori dengan anak tidak dapat dijadikan subkategori.');
            }
        }];
    }
}
