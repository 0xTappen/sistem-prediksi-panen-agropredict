<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreInputLogRequest extends FormRequest
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
            'project_id' => ['required', 'exists:projects,id'],
            'nitrogen' => ['required', 'numeric'],
            'phosphorus' => ['required', 'numeric'],
            'potassium' => ['required', 'numeric'],
            'ph_tanah' => ['required', 'numeric', 'between:0,14'],
            'kelembapan_tanah' => ['required', 'numeric'],
            'jumlah_air' => ['required', 'numeric', 'min:0'],
            'suhu' => ['required', 'numeric'],
            'kelembapan_udara' => ['required', 'numeric'],
            'curah_hujan' => ['required', 'numeric', 'min:0'],
            'sumber_cuaca' => ['required', 'in:api,manual'],
            'catatan' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function attributes(): array
    {
        return [
            'project_id' => 'proyek',
            'nitrogen' => 'nitrogen (N)',
            'phosphorus' => 'phosphorus (P)',
            'potassium' => 'potassium (K)',
            'ph_tanah' => 'pH tanah',
            'kelembapan_tanah' => 'kelembapan tanah',
            'jumlah_air' => 'jumlah air',
            'suhu' => 'suhu',
            'kelembapan_udara' => 'kelembapan udara',
            'curah_hujan' => 'curah hujan',
            'sumber_cuaca' => 'sumber cuaca',
            'catatan' => 'catatan',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'numeric' => ':attribute harus berupa angka.',
            'between' => ':attribute harus di antara :min sampai :max.',
            'min' => ':attribute minimal :min.',
            'in' => ':attribute tidak valid.',
            'exists' => ':attribute tidak ditemukan.',
        ];
    }
}
