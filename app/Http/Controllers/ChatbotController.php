<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatbotAskRequest;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ChatbotController extends Controller
{
    public function __construct(protected ChatbotService $chatbotService)
    {
    }

    public function index(): Response
    {
        $user = request()->user();

        $conversations = ChatConversation::query()
            ->where('user_id', $user->id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get(['id', 'title', 'last_message_at', 'created_at']);

        return Inertia::render('chatbot/index', [
            'conversations' => $conversations,
            'activeConversationId' => null,
            'messages' => [],
            'ai' => $this->chatbotService->getActiveProviderMeta(),
        ]);
    }

    public function showConversation(Request $request, ChatConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            abort(403);
        }

        $messages = ChatMessage::query()
            ->where('conversation_id', $conversation->id)
            ->orderBy('id')
            ->get(['id', 'role', 'content', 'created_at']);

        return response()->json([
            'ok' => true,
            'conversation' => $this->serializeConversation($conversation),
            'messages' => $messages->map(fn (ChatMessage $message): array => [
                'id' => $message->id,
                'role' => $message->role,
                'content' => $message->content,
                'created_at' => $message->created_at?->toISOString(),
            ])->all(),
        ]);
    }

    public function ask(ChatbotAskRequest $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validated();
        $conversation = null;

        if (! empty($validated['conversation_id'])) {
            $conversation = ChatConversation::query()
                ->where('user_id', $user->id)
                ->find($validated['conversation_id']);
        }

        if ($conversation === null) {
            $conversation = ChatConversation::query()->create([
                'user_id' => $user->id,
                'title' => 'Percakapan Baru',
            ]);
        }

        try {
            $history = ChatMessage::query()
                ->where('conversation_id', $conversation->id)
                ->orderBy('id')
                ->limit(18)
                ->get(['role', 'content'])
                ->map(fn (ChatMessage $item): array => [
                    'role' => $item->role,
                    'content' => $item->content,
                ])
                ->all();

            $reply = $this->chatbotService->ask(
                (string) $validated['message'],
                $history,
            );

            ChatMessage::query()->create([
                'conversation_id' => $conversation->id,
                'user_id' => $user->id,
                'role' => 'user',
                'content' => (string) $validated['message'],
            ]);

            ChatMessage::query()->create([
                'conversation_id' => $conversation->id,
                'user_id' => null,
                'role' => 'assistant',
                'content' => $reply,
            ]);

            if ($conversation->title === 'Percakapan Baru') {
                $conversation->title = $this->makeTitle((string) $validated['message']);
            }

            $conversation->last_message_at = now();
            $conversation->save();

            return response()->json([
                'ok' => true,
                'reply' => $reply,
                'ai' => $this->chatbotService->getActiveProviderMeta(),
                'conversation' => $this->serializeConversation($conversation),
            ]);
        } catch (\Throwable $exception) {
            return response()->json([
                'ok' => false,
                'message' => $exception->getMessage(),
            ], 422);
        }
    }

    public function createConversation(Request $request): JsonResponse
    {
        $conversation = ChatConversation::query()->create([
            'user_id' => $request->user()->id,
            'title' => 'Percakapan Baru',
        ]);

        return response()->json([
            'ok' => true,
            'conversation' => $this->serializeConversation($conversation),
        ]);
    }

    public function destroyConversation(Request $request, ChatConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            abort(403);
        }

        $conversation->delete();

        return response()->json([
            'ok' => true,
        ]);
    }

    protected function makeTitle(string $message): string
    {
        $clean = trim(preg_replace('/\s+/', ' ', $message) ?? $message);

        if ($clean === '') {
            return 'Percakapan Baru';
        }

        return mb_strimwidth($clean, 0, 56, '...');
    }

    /**
     * @return array{id:int,title:string,last_message_at:?string,created_at:?string}
     */
    protected function serializeConversation(ChatConversation $conversation): array
    {
        return [
            'id' => $conversation->id,
            'title' => $conversation->title,
            'last_message_at' => $this->toIsoString($conversation->last_message_at),
            'created_at' => $this->toIsoString($conversation->created_at),
        ];
    }

    protected function toIsoString(mixed $value): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value->toISOString();
        }

        return Carbon::parse($value)->toISOString();
    }
}
