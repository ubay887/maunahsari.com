<?php

namespace App\Http\Requests;

use App\ArticleStatus;
use App\Models\Article;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        $article = $this->route('article');
        $user = $this->user();
        if ($user === null || ! ($article instanceof Article ? $user->can('update', $article) : $user->can('create', Article::class))) {
            return false;
        }
        $status = $this->input('status');
        if (in_array($status, ['published', 'scheduled'], true)) {
            return $user->can('publish', $article instanceof Article ? $article : Article::class);
        }

        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'category_ids' => $this->input('category_ids', []),
            'tag_names' => $this->input('tag_names', []),
        ]);
        if ($this->input('slug') === '') {
            $this->merge(['slug' => null]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $article = $this->route('article');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('articles')->ignore($article instanceof Article ? $article->id : null)],
            'excerpt' => ['nullable', 'string', 'max:2000'],
            'content' => ['required', 'string', 'max:500000'],
            'status' => ['required', Rule::enum(ArticleStatus::class)],
            'published_at' => ['nullable', 'required_if:status,scheduled', 'date', Rule::when($this->input('status') === 'scheduled', ['after:now'])],
            'meta_title' => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:160'],
            'cover_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_cover' => ['sometimes', 'boolean'],
            'category_ids' => ['present', 'array'],
            'category_ids.*' => ['integer', 'distinct', 'exists:categories,id'],
            'tag_names' => ['present', 'array', 'max:30'],
            'tag_names.*' => ['required', 'string', 'max:80', 'distinct'],
        ];
    }
}
