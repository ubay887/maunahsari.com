<?php

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\GuardianRelation;
use App\LastEducation;
use App\Models\Program;
use App\ResidenceType;
use App\Services\PsbPhone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Laravolt\Indonesia\Models\City;
use Laravolt\Indonesia\Models\District;
use Laravolt\Indonesia\Models\Province;
use Laravolt\Indonesia\Models\Village;

class StoreApplicationRequest extends FormRequest
{
    use PasswordValidationRules, ProfileValidationRules;

    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->input('guardian_phone');
        if (is_string($phone)) {
            $this->merge(['guardian_phone' => PsbPhone::normalize($phone)]);
        }
        $email = $this->input('email');
        if (is_string($email)) {
            $this->merge(['email' => mb_strtolower(trim($email))]);
        }
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $requiresHafalan = Program::whereKey($this->integer('program_id'))->value('requires_hafalan');

        return [
            'registration_period_id' => ['required', 'integer', 'exists:registration_periods,id'],
            'program_id' => ['required', 'integer', 'exists:programs,id'],
            'residence_type' => ['required', Rule::enum(ResidenceType::class)],
            'full_name' => ['required', 'string', 'max:255'], 'nickname' => ['nullable', 'string', 'max:100'],
            'nik' => ['required', 'string', 'regex:/^[0-9]{16}$/D'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birth_place' => ['required', 'string', 'max:255'], 'birth_date' => ['required', 'date_format:Y-m-d', 'before:today'],
            'address' => ['required', 'string', 'max:5000'],
            'province_code' => ['bail', 'required', 'string', Rule::exists(Province::class, 'code')],
            'city_code' => ['bail', 'required', 'string', Rule::exists(City::class, 'code')->where('province_code', is_string($this->input('province_code')) ? $this->input('province_code') : '')],
            'district_code' => ['bail', 'required', 'string', Rule::exists(District::class, 'code')->where('city_code', is_string($this->input('city_code')) ? $this->input('city_code') : '')],
            'village_code' => ['bail', 'required', 'string', Rule::exists(Village::class, 'code')->where('district_code', is_string($this->input('district_code')) ? $this->input('district_code') : '')],
            'rt' => ['nullable', 'string', 'regex:/^[0-9]{1,3}$/D'],
            'rw' => ['nullable', 'string', 'regex:/^[0-9]{1,3}$/D'],
            'postal_code' => ['nullable', 'string', 'regex:/^[0-9]{5}$/D'],
            'last_education' => ['required', Rule::enum(LastEducation::class)],
            'hafalan_juz' => [$requiresHafalan ? 'required' : 'nullable', 'integer', $requiresHafalan ? 'min:1' : 'min:0', 'max:30'],
            'can_read_binnadhor' => ['required', 'boolean'], 'can_write_pegon' => ['required', 'boolean'],
            'guardian_name' => ['required', 'string', 'max:255'], 'guardian_relation' => ['required', Rule::enum(GuardianRelation::class)],
            'guardian_phone' => ['required', 'string', 'regex:/^628[1-9][0-9]{6,10}$/'],
            'agreed_to_rules' => ['required', 'accepted'],
            'documents' => ['required', 'array:ijazah,kartu_keluarga,pas_foto'],
            'documents.ijazah' => ['required', 'file', 'mimes:pdf', 'extensions:pdf', 'max:2048'],
            'documents.kartu_keluarga' => ['required', 'file', 'mimes:pdf', 'extensions:pdf', 'max:2048'],
            'documents.pas_foto' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'extensions:jpg,jpeg,png,webp', 'max:2048'],
            'website' => ['nullable', 'string', 'max:0'],
            'email' => $this->emailRules(),
            'password' => $this->passwordRules(),
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return ['nik.required' => 'NIK wajib diisi.', 'nik.regex' => 'NIK harus terdiri dari tepat 16 digit angka.', 'last_education.enum' => 'Pilih pendidikan terakhir dari daftar yang tersedia.', 'guardian_relation.enum' => 'Pilih hubungan wali dari daftar yang tersedia.', 'province_code.required' => 'Provinsi wajib dipilih.', 'province_code.exists' => 'Provinsi tidak valid.', 'city_code.required' => 'Kabupaten/kota wajib dipilih.', 'city_code.exists' => 'Kabupaten/kota harus berada di provinsi yang dipilih.', 'district_code.required' => 'Kecamatan wajib dipilih.', 'district_code.exists' => 'Kecamatan harus berada di kabupaten/kota yang dipilih.', 'village_code.required' => 'Desa/kelurahan wajib dipilih.', 'village_code.exists' => 'Desa/kelurahan harus berada di kecamatan yang dipilih.', 'rt.regex' => 'RT harus terdiri dari 1 sampai 3 digit angka.', 'rw.regex' => 'RW harus terdiri dari 1 sampai 3 digit angka.', 'postal_code.regex' => 'Kode pos harus terdiri dari 5 digit angka.', 'documents.*.max' => 'Ukuran berkas maksimal 2 MB.', 'documents.*.mimes' => 'Format berkas tidak sesuai.', 'documents.*.extensions' => 'Ekstensi berkas tidak sesuai.', 'documents.pas_foto.image' => 'Pas foto harus berupa gambar JPG, PNG, atau WebP.', 'guardian_phone.regex' => 'Gunakan nomor WhatsApp Indonesia yang valid.', 'agreed_to_rules.accepted' => 'Persetujuan taat aturan wajib dicentang.', 'hafalan_juz.required' => 'Jumlah hafalan wajib untuk program ini.', 'email.unique' => 'Email ini sudah terdaftar. Masuk dengan akun tersebut atau gunakan email lain.'];
    }
}
