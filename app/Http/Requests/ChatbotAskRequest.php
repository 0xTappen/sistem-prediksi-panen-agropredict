<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ChatbotAskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:1500'],
            'conversation_id' => ['nullable', 'integer', 'exists:chat_conversations,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'message.required' => 'Pesan wajib diisi.',
            'message.max' => 'Pesan maksimal 1500 karakter.',
            'conversation_id.exists' => 'Percakapan tidak ditemukan.',
        ];
    }
}
