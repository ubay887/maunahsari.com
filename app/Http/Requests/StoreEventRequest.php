<?php

namespace App\Http\Requests;

use App\EventStatus;
use App\EventType;
use App\Models\Event;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        $event = $this->route('event');

        return $this->user()?->can($event instanceof Event ? 'update' : 'create', $event instanceof Event ? $event : Event::class) ?? false;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['category_ids' => $this->input('category_ids', []), 'timezone' => $this->input('timezone', 'Asia/Jakarta')]);
        if ($this->input('slug') === '') {
            $this->merge(['slug' => null]);
        }
        $number = $this->input('contact_whatsapp');
        if (is_string($number) && preg_match('/^\+?[0-9 ()-]+$/', $number)) {
            $number = preg_replace('/[ ()-]/', '', $number);
            if (is_string($number)) {
                $number = ltrim($number, '+');
                $this->merge(['contact_whatsapp' => str_starts_with($number, '0') ? '62'.substr($number, 1) : $number]);
            }
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $event = $this->route('event');

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/', Rule::unique('events')->ignore($event instanceof Event ? $event->id : null)],
            'summary' => ['nullable', 'string', 'max:2000'],
            'description' => ['required', 'string', 'max:500000'],
            'start_at' => ['required', 'date_format:Y-m-d\TH:i'],
            'end_at' => ['required', 'date_format:Y-m-d\TH:i', 'after:start_at'],
            'timezone' => ['required', 'timezone:all'],
            'type' => ['required', Rule::enum(EventType::class)],
            'location_name' => ['nullable', 'required_if:type,offline,hybrid', 'string', 'max:255'],
            'address' => ['nullable', 'required_if:type,offline,hybrid', 'string', 'max:5000'],
            'map_url' => ['nullable', 'url:http,https', 'max:2048'],
            'meeting_url' => ['nullable', 'required_if:type,online,hybrid', 'url:http,https', 'max:2048'],
            'registration_url' => ['nullable', 'url:http,https', 'max:2048'],
            'contact_whatsapp' => ['nullable', 'string', 'regex:/^628[1-9][0-9]{6,10}$/'],
            'status' => ['required', Rule::enum(EventStatus::class)],
            'banner' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'remove_banner' => ['sometimes', 'boolean'],
            'category_ids' => ['present', 'array'],
            'category_ids.*' => ['integer', 'distinct', 'exists:categories,id'],
            'meta_title' => ['nullable', 'string', 'max:70'],
            'meta_description' => ['nullable', 'string', 'max:160'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'end_at.after' => 'Waktu selesai harus setelah waktu mulai.',
            'meeting_url.required_if' => 'Tautan meeting wajib untuk event daring atau hybrid.',
            'location_name.required_if' => 'Nama lokasi wajib untuk event luring atau hybrid.',
            'address.required_if' => 'Alamat wajib untuk event luring atau hybrid.',
            'contact_whatsapp.regex' => 'Gunakan nomor seluler Indonesia, misalnya 081234567890 atau +6281234567890.',
        ];
    }
}
