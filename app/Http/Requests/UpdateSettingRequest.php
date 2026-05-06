<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
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
            'theme' => ['required', 'in:light,dark,system'],
            'notification_enabled' => ['required', 'boolean'],
            'temperature_unit' => ['required', 'in:celsius'],
            'rainfall_unit' => ['required', 'in:mm'],
            'yield_unit' => ['required', 'in:ton'],
            'backup_enabled' => ['required', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'theme' => 'tema',
            'notification_enabled' => 'notifikasi',
            'temperature_unit' => 'satuan suhu',
            'rainfall_unit' => 'satuan curah hujan',
            'yield_unit' => 'satuan hasil',
            'backup_enabled' => 'backup data',
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute wajib diisi.',
            'in' => ':attribute tidak valid.',
            'boolean' => ':attribute tidak valid.',
        ];
    }
}
