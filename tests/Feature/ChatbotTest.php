<?php

namespace Tests\Feature;

use App\Models\ChatConversation;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ChatbotTest extends TestCase
{
    use RefreshDatabase;

    public function test_chatbot_page_starts_with_a_new_chat_even_when_history_exists()
    {
        $user = User::factory()->create();
        $conversation = ChatConversation::query()->create([
            'user_id' => $user->id,
            'title' => 'Riwayat lama',
            'last_message_at' => now(),
        ]);

        ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'user',
            'content' => 'Pesan lama',
        ]);

        $this->actingAs($user)
            ->get("/chatbot?conversation={$conversation->id}")
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('chatbot/index')
                ->where('activeConversationId', null)
                ->where('messages', [])
                ->has('conversations', 1),
            );
    }

    public function test_user_can_open_owned_conversation_history_from_json_endpoint()
    {
        $user = User::factory()->create();
        $conversation = ChatConversation::query()->create([
            'user_id' => $user->id,
            'title' => 'Riwayat jagung',
            'last_message_at' => now(),
        ]);

        $message = ChatMessage::query()->create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'role' => 'assistant',
            'content' => 'Cek kadar nitrogen dulu.',
        ]);

        $this->actingAs($user)
            ->getJson(route('chatbot.conversations.show', $conversation))
            ->assertOk()
            ->assertJson([
                'ok' => true,
                'conversation' => [
                    'id' => $conversation->id,
                    'title' => 'Riwayat jagung',
                ],
                'messages' => [
                    [
                        'id' => $message->id,
                        'role' => 'assistant',
                        'content' => 'Cek kadar nitrogen dulu.',
                    ],
                ],
            ]);
    }
}
