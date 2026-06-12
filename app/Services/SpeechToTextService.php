<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class SpeechToTextService
{
    /**
     * Transcribe an audio file using Groq Whisper API.
     */
    public function transcribe(UploadedFile $audio): string
    {
        $apiKey = (string) config('services.groq.api_key');
        $baseUrl = rtrim((string) config('services.groq.base_url'), '/');

        if ($apiKey === '') {
            throw new RuntimeException('GROQ_API_KEY belum diatur di file .env.');
        }

        $response = Http::timeout(30)
            ->withOptions([\CURLOPT_IPRESOLVE => \CURL_IPRESOLVE_V4])
            ->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
            ])
            ->attach(
                'file',
                file_get_contents($audio->getRealPath()),
                $audio->getClientOriginalName() ?: 'audio.webm',
            )
            ->post($baseUrl.'/audio/transcriptions', [
                'model' => 'whisper-large-v3-turbo',
                'language' => 'id',
                'response_format' => 'json',
            ]);

        if ($response->failed()) {
            $errorMsg = trim((string) data_get($response->json(), 'error.message', ''));
            throw new RuntimeException(
                $errorMsg !== ''
                    ? 'Gagal transkripsi audio: '.$errorMsg
                    : 'Gagal transkripsi audio. Status: '.$response->status(),
            );
        }

        $text = trim((string) data_get($response->json(), 'text', ''));

        if ($text === '') {
            throw new RuntimeException('Tidak ada teks yang terdeteksi dari audio. Coba bicara lebih jelas.');
        }

        return $text;
    }
}
