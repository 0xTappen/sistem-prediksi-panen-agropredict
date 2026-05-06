<?php

namespace App\Http\Controllers;

use App\Http\Requests\ChatbotAskRequest;
use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        $selectedConversationId = request()->integer('conversation');

        $conversations = ChatConversation::query()
            ->where('user_id', $user->id)
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->get(['id', 'title', 'last_message_at', 'created_at']);

        $activeConversation = null;
        $messages = [];

        if ($selectedConversationId > 0) {
            $activeConversation = $conversations->firstWhere('id', $selectedConversationId);
        }

        if ($activeConversation === null) {
            $activeConversation = $conversations->first();
        }

        if ($activeConversation !== null) {
            $messages = ChatMessage::query()
                ->where('conversation_id', $activeConversation->id)
                ->orderBy('id')
                ->get(['id', 'role', 'content', 'created_at']);
        }

        return Inertia::render('chatbot/index', [
            'conversations' => $conversations,
            'activeConversationId' => $activeConversation?->id,
            'messages' => $messages,
            'ai' => $this->chatbotService->getActiveProviderMeta(),
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
                'conversation' => [
                    'id' => $conversation->id,
                    'title' => $conversation->title,
                    'last_message_at' => $conversation->last_message_at?->toISOString(),
                    'created_at' => $conversation->created_at?->toISOString(),
                ],
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
            'conversation' => [
                'id' => $conversation->id,
                'title' => $conversation->title,
                'last_message_at' => $conversation->last_message_at,
                'created_at' => $conversation->created_at?->toISOString(),
            ],
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
}
