<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ChatbotService
{
    protected const SYSTEM_PROMPT = 'Kamu adalah asisten AI untuk aplikasi Sistem Prediksi Panen & Rekomendasi. Jawab dalam bahasa Indonesia, singkat dan to the point. Default: maksimal 2-3 kalimat pendek, idealnya <= 60 kata. Jangan bertele-tele. Beri langkah praktis dulu, detail hanya jika user meminta. Jangan gunakan Markdown seperti ###, **, ---, atau tabel. Gunakan teks biasa.';

    /**
     * @param  array<int, array{role:string, content:string}>  $history
     */
    public function ask(string $message, array $history = [], string $context = ''): string
    {
        $provider = $this->activeProvider();

        return match ($provider) {
            'groq' => $this->askWithGroq($message, $history, $context),
            'gemini' => $this->askWithGemini($message, $history, $context),
            default => throw new RuntimeException("Provider AI '$provider' tidak didukung."),
        };
    }

    /**
     * @return array{provider:string, model:string}
     */
    public function getActiveProviderMeta(): array
    {
        $provider = $this->activeProvider();
        $model = match ($provider) {
            'groq' => (string) config('services.groq.model'),
            'gemini' => (string) config('services.gemini.model'),
            default => '',
        };

        return [
            'provider' => $provider,
            'model' => $model,
        ];
    }

    /**
     * @param  array<int, array{role:string, content:string}>  $history
     */
    protected function askWithGroq(string $message, array $history, string $context): string
    {
        $apiKey = (string) config('services.groq.api_key');
        $model = (string) config('services.groq.model');
        $baseUrl = rtrim((string) config('services.groq.base_url'), '/');

        if ($apiKey === '') {
            throw new RuntimeException('GROQ_API_KEY belum diatur di file .env.');
        }

        if ($model === '' || $baseUrl === '') {
            throw new RuntimeException('Konfigurasi Groq belum lengkap.');
        }

        $messages = [
            ['role' => 'system', 'content' => $this->buildSystemPrompt($context)],
        ];

        foreach ($history as $item) {
            $role = $item['role'] === 'assistant' ? 'assistant' : 'user';
            $text = trim((string) ($item['content'] ?? ''));

            if ($text === '') {
                continue;
            }

            $messages[] = [
                'role' => $role,
                'content' => $text,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => trim($message),
        ];

        $response = Http::timeout(25)
            ->acceptJson()
            ->withHeaders([
                'Authorization' => 'Bearer '.$apiKey,
            ])
            ->post($baseUrl.'/chat/completions', [
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.5,
                'max_tokens' => 220,
            ]);

        if ($response->failed()) {
            $this->throwProviderError('Groq', $response->status(), trim((string) data_get($response->json(), 'error.message', '')), $model);
        }

        $text = trim((string) data_get($response->json(), 'choices.0.message.content', ''));

        if ($text === '') {
            throw new RuntimeException('AI tidak mengembalikan jawaban. Coba ulangi pertanyaan Anda.');
        }

        return $this->limitResponseLength($this->normalizePlainText($text));
    }

    /**
     * @param  array<int, array{role:string, content:string}>  $history
     */
    protected function askWithGemini(string $message, array $history, string $context): string
    {
        $apiKey = (string) config('services.gemini.api_key');
        $model = (string) config('services.gemini.model');
        $baseUrl = rtrim((string) config('services.gemini.base_url'), '/');

        if ($apiKey === '') {
            throw new RuntimeException('GEMINI_API_KEY belum diatur di file .env.');
        }

        if ($model === '' || $baseUrl === '') {
            throw new RuntimeException('Konfigurasi Gemini belum lengkap.');
        }

        $contents = [];

        foreach ($history as $item) {
            $role = $item['role'] === 'assistant' ? 'model' : 'user';
            $text = trim((string) ($item['content'] ?? ''));

            if ($text === '') {
                continue;
            }

            $contents[] = [
                'role' => $role,
                'parts' => [['text' => $text]],
            ];
        }

        $contents[] = [
            'role' => 'user',
            'parts' => [['text' => trim($message)]],
        ];

        $response = Http::timeout(25)
            ->acceptJson()
            ->withHeaders([
                'x-goog-api-key' => $apiKey,
            ])
            ->post(sprintf('%s/%s:generateContent', $baseUrl, $model), [
                'system_instruction' => [
                    'parts' => [[
                        'text' => $this->buildSystemPrompt($context),
                    ]],
                ],
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => 0.5,
                    'topK' => 32,
                    'topP' => 0.95,
                    'maxOutputTokens' => 260,
                    'responseMimeType' => 'text/plain',
                ],
            ]);

        if ($response->failed()) {
            $this->throwProviderError('Gemini', $response->status(), trim((string) data_get($response->json(), 'error.message', '')), $model);
        }

        $text = trim((string) data_get($response->json(), 'candidates.0.content.parts.0.text', ''));

        if ($text === '') {
            throw new RuntimeException('AI tidak mengembalikan jawaban. Coba ulangi pertanyaan Anda.');
        }

        return $this->limitResponseLength($this->normalizePlainText($text));
    }

    protected function throwProviderError(string $provider, int $status, string $apiMessage, string $model): void
    {
        Log::warning("$provider API request failed", [
            'status' => $status,
            'model' => $model,
            'message' => $apiMessage,
        ]);

        if ($status === 429) {
            throw new RuntimeException("Kuota/rate limit $provider sedang habis. Coba lagi sebentar atau upgrade billing $provider.");
        }

        if (in_array($status, [401, 403], true)) {
            throw new RuntimeException("API key $provider tidak valid atau tidak punya izin akses model ini.");
        }

        if ($status >= 500) {
            throw new RuntimeException("Server $provider sedang bermasalah. Coba lagi beberapa saat.");
        }

        throw new RuntimeException(
            $apiMessage !== ''
                ? "Gagal memproses jawaban AI ($provider): ".$apiMessage
                : "Gagal memproses jawaban AI. Periksa konfigurasi $provider Anda.",
        );
    }

    protected function normalizePlainText(string $text): string
    {
        $normalized = preg_replace('/^\s*#{1,6}\s*/m', '', $text) ?? $text;
        $normalized = str_replace(['---', '***', '`'], '', $normalized);
        $normalized = preg_replace('/\n{3,}/', "\n\n", $normalized) ?? $normalized;

        return trim($normalized);
    }

    protected function limitResponseLength(string $text): string
    {
        $maxChars = 360;

        if (mb_strlen($text) <= $maxChars) {
            return $text;
        }

        $slice = mb_substr($text, 0, $maxChars);
        $lastDot = mb_strrpos($slice, '.');
        $lastBreak = mb_strrpos($slice, "\n");
        $cut = max((int) $lastDot, (int) $lastBreak);

        if ($cut > 120) {
            return trim(mb_substr($slice, 0, $cut + 1));
        }

        return trim($slice).'...';
    }

    protected function buildSystemPrompt(string $context): string
    {
        $prompt = self::SYSTEM_PROMPT.' Jika user bertanya tentang proyek, lahan, prediksi, atau rekomendasi miliknya, prioritaskan konteks akun yang diberikan. Jika data konteks tidak cukup, katakan singkat bahwa jawaban bersifat umum.';

        if (trim($context) === '') {
            return $prompt;
        }

        return $prompt."\n\n".$context;
    }

    protected function activeProvider(): string
    {
        return mb_strtolower((string) config('services.ai.provider', 'groq'));
    }
}
