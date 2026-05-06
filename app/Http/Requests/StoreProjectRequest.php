<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nama_tanaman' => ['required', 'string', 'max:255'],
            'jenis_tanaman' => ['required', 'string', 'max:255'],
            'luas_lahan' => ['required', 'numeric', 'min:0.01'],
            'lokasi' => ['required', 'string', 'max:255'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nama_tanaman' => 'nama tanaman',
            'jenis_tanaman' => 'jenis tanaman',
            'luas_lahan' => 'luas lahan',
            'lokasi' => 'lokasi',
            'latitude' => 'latitude',
            'longitude' => 'longitude',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'min' => ':attribute minimal :min.',
            'between' => ':attribute harus di antara :min sampai :max.',
        ];
    }
}
