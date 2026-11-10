<?php

namespace App\Http\Requests;

use App\Models\Article;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ArticleStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        $article = $this->route('article');
        if (! $article instanceof Article || ! $this->user()?->can('update', $article)) {
            return false;
        }

        return $this->input('status') !== 'published' || $this->user()->can('publish', $article);
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return ['status' => ['required', Rule::in(['draft', 'published', 'archived'])]];
    }
}
