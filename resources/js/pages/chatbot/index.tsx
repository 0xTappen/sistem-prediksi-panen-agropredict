import { Head, usePage } from '@inertiajs/react';
import {
    Bot,
    Clock3,
    PanelLeftClose,
    PanelLeftOpen,
    LoaderCircle,
    Plus,
    SendHorizontal,
    Trash2,
    UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/confirm-dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ChatRole = 'user' | 'assistant';

type Conversation = {
    id: number;
    title: string;
    last_message_at: string | null;
    created_at: string;
};

type ServerMessage = {
    id: number;
    role: ChatRole;
    content: string;
    created_at: string;
};

type ChatMessage = {
    id: string;
    role: ChatRole;
    content: string;
    createdAt: string;
};

type PageProps = {
    auth: { user?: { name?: string } };
    conversations: Conversation[];
    activeConversationId: number | null;
    messages: ServerMessage[];
    ai?: {
        provider?: string;
        model?: string;
    };
};

const starterPrompts = [
    'Bantu jelaskan arti skor kecocokan prediksi panen.',
    'Rekomendasi pupuk untuk nitrogen rendah apa?',
    'Apa yang harus dilakukan saat curah hujan terlalu tinggi?',
    'Cara membaca data pH tanah supaya akurat?',
];

function getCsrfToken(): string {
    const element = document.querySelector('meta[name="csrf-token"]');

    if (!(element instanceof HTMLMetaElement)) {
        return '';
    }

    return element.content;
}

function normalizeText(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/^\s*#{1,6}\s*/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function toClientMessage(message: ServerMessage): ChatMessage {
    return {
        id: String(message.id),
        role: message.role,
        content: normalizeText(message.content),
        createdAt: message.created_at,
    };
}

function defaultAssistantMessage(): ChatMessage {
    return {
        id: 'assistant-welcome',
        role: 'assistant',
        content:
            'Halo, saya asisten AI pertanian. Saya bisa membaca ringkasan proyek dan prediksi Anda untuk memberi saran yang lebih kontekstual.',
        createdAt: new Date().toISOString(),
    };
}

export default function ChatbotPage() {
    const page = usePage<PageProps>();
    const { conversations: initialConversations, activeConversationId: initialActiveConversationId } = page.props;

    const [conversations, setConversations] = useState<Conversation[]>(initialConversations ?? []);
    const [activeConversationId, setActiveConversationId] = useState<number | null>(initialActiveConversationId ?? null);
    const [messages, setMessages] = useState<ChatMessage[]>(
        (page.props.messages ?? []).length > 0
            ? (page.props.messages ?? []).map(toClientMessage)
            : [defaultAssistantMessage()],
    );
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingConversation, setIsCreatingConversation] = useState(false);
    const [isDeletingConversation, setIsDeletingConversation] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(true);
    const [isXlScreen, setIsXlScreen] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
    const [aiMeta, setAiMeta] = useState({
        provider: page.props.ai?.provider ?? 'ai',
        model: page.props.ai?.model ?? '',
    });
    const listRef = useRef<HTMLDivElement | null>(null);
    const sendingRef = useRef(false);

    const resetToNewConversation = () => {
        setActiveConversationId(null);
        setMessages([defaultAssistantMessage()]);
        window.history.replaceState(window.history.state, '', '/chatbot');
    };

    useEffect(() => {
        setConversations(initialConversations ?? []);
        setActiveConversationId(initialActiveConversationId ?? null);

        const incoming = page.props.messages ?? [];
        setMessages(incoming.length > 0 ? incoming.map(toClientMessage) : [defaultAssistantMessage()]);
    }, [initialConversations, initialActiveConversationId, page.props.messages]);

    useEffect(() => {
        setAiMeta({
            provider: page.props.ai?.provider ?? 'ai',
            model: page.props.ai?.model ?? '',
        });
    }, [page.props.ai?.model, page.props.ai?.provider]);

    useEffect(() => {
        if (!listRef.current) {
            return;
        }

        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages, isLoading]);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 1280px)');
        const onChange = (event: MediaQueryListEvent) => {
            setIsXlScreen(event.matches);
            setIsHistoryVisible(event.matches);
            if (!event.matches) {
                setIsHistoryCollapsed(true);
            }
        };

        setIsXlScreen(media.matches);
        setIsHistoryVisible(media.matches);
        media.addEventListener('change', onChange);

        return () => {
            media.removeEventListener('change', onChange);
        };
    }, []);

    const canSubmit = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

    const openConversation = async (conversationId: number) => {
        if (isLoading) {
            return;
        }

        try {
            const response = await fetch(`/chatbot/conversations/${conversationId}`, {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                },
            });

            const payload = (await response.json()) as {
                ok?: boolean;
                conversation?: Conversation;
                messages?: ServerMessage[];
                message?: string;
            };

            if (!response.ok || !payload.ok || !payload.conversation || !payload.messages) {
                throw new Error(payload.message ?? 'Gagal membuka riwayat percakapan.');
            }

            setActiveConversationId(payload.conversation.id);
            setMessages(payload.messages.length > 0 ? payload.messages.map(toClientMessage) : [defaultAssistantMessage()]);
            window.history.replaceState(window.history.state, '', '/chatbot');

            if (!isXlScreen) {
                setIsHistoryVisible(false);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal membuka riwayat percakapan.';
            toast.error(message);
        }
    };

    const sendMessage = async (rawText?: string) => {
        const messageText = (rawText ?? input).trim();

        if (messageText === '' || isLoading || sendingRef.current) {
            return;
        }

        sendingRef.current = true;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: normalizeText(messageText),
            createdAt: new Date().toISOString(),
        };

        const baseMessages = messages[0]?.id === 'assistant-welcome' && messages.length === 1 ? [] : messages;

        setMessages([...baseMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/chatbot/ask', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: JSON.stringify({
                    message: messageText,
                    conversation_id: activeConversationId,
                }),
            });

            const payload = (await response.json()) as {
                ok?: boolean;
                reply?: string;
                message?: string;
                conversation?: Conversation;
                ai?: {
                    provider?: string;
                    model?: string;
                };
            };

            if (!response.ok || !payload.ok || !payload.reply || !payload.conversation) {
                throw new Error(payload.message ?? 'Gagal memproses jawaban AI.');
            }

            const assistantMessage: ChatMessage = {
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: normalizeText(payload.reply),
                createdAt: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
            setActiveConversationId(payload.conversation.id);
            if (payload.ai?.provider) {
                setAiMeta({
                    provider: payload.ai.provider,
                    model: payload.ai.model ?? '',
                });
            }
            setConversations((prev) => {
                const filtered = prev.filter((item) => item.id !== payload.conversation?.id);
                return [payload.conversation as Conversation, ...filtered];
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat memanggil chatbot.';
            toast.error(message);
        } finally {
            setIsLoading(false);
            sendingRef.current = false;
        }
    };

    const createConversation = async () => {
        if (isCreatingConversation || isLoading) {
            return;
        }

        setIsCreatingConversation(true);

        try {
            const response = await fetch('/chatbot/conversations', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            const payload = (await response.json()) as {
                ok?: boolean;
                conversation?: Conversation;
                message?: string;
            };

            if (!response.ok || !payload.ok || !payload.conversation) {
                throw new Error(payload.message ?? 'Gagal membuat percakapan baru.');
            }

            setConversations((prev) => {
                const filtered = prev.filter((item) => item.id !== payload.conversation?.id);
                return [payload.conversation as Conversation, ...filtered];
            });
            setActiveConversationId(payload.conversation.id);
            setMessages([defaultAssistantMessage()]);
            setInput('');
            window.history.replaceState(window.history.state, '', '/chatbot');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal membuat percakapan baru.';
            toast.error(message);
        } finally {
            setIsCreatingConversation(false);
        }
    };

    const requestDeleteConversation = (conversationId: number) => {
        const target = conversations.find((item) => item.id === conversationId);

        if (!target) {
            return;
        }

        setConversationToDelete(target);
    };

    const confirmDeleteConversation = async () => {
        if (!conversationToDelete || isDeletingConversation) {
            return;
        }

        setIsDeletingConversation(true);

        try {
            const response = await fetch(`/chatbot/conversations/${conversationToDelete.id}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
            });

            const payload = (await response.json()) as {
                ok?: boolean;
                message?: string;
            };

            if (!response.ok || !payload.ok) {
                throw new Error(payload.message ?? 'Gagal menghapus percakapan.');
            }

            toast.success('Riwayat percakapan dihapus.');

            if (activeConversationId === conversationToDelete.id) {
                setConversations((prev) => prev.filter((item) => item.id !== conversationToDelete.id));
                resetToNewConversation();
                setConversationToDelete(null);
                return;
            }

            setConversations((prev) => prev.filter((item) => item.id !== conversationToDelete.id));
            setConversationToDelete(null);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Gagal menghapus percakapan.';
            toast.error(message);
        } finally {
            setIsDeletingConversation(false);
        }
    };

    const providerLabel = (aiMeta.provider || 'ai').toUpperCase();
    const modelLabel = aiMeta.model?.trim() ?? '';
    const showExpandedHistory = isXlScreen && !isHistoryCollapsed;

    return (
        <>
            <Head title="Chatbot AI" />

            <div className="h-[calc(100dvh-64px)] overflow-hidden md:h-[calc(100dvh-72px)]">
                <div className="relative flex h-full min-h-0 flex-row gap-2 overflow-hidden p-1.5 sm:p-2 md:gap-3 md:p-3">
                    {!isXlScreen && isHistoryVisible ? (
                        <button
                            type="button"
                            aria-label="Tutup panel riwayat"
                            className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[1px]"
                            onClick={() => setIsHistoryVisible(false)}
                        />
                    ) : null}
                    <Card
                        className={cn(
                            'min-h-0 shrink-0 rounded-2xl border-0 bg-muted/55 shadow-none transition-[width,opacity,transform] duration-300 xl:h-full xl:transition-[width,opacity]',
                            !isHistoryVisible
                                ? 'w-0 -translate-x-3 border-0 opacity-0 pointer-events-none shadow-none'
                                : isXlScreen
                                  ? showExpandedHistory
                                      ? 'xl:w-[270px] 2xl:w-[300px]'
                                      : 'w-[72px] sm:w-[76px] xl:w-[56px]'
                                  : 'absolute inset-y-2 left-2 z-30 w-[min(84vw,320px)]',
                        )}
                    >
                        {isXlScreen && !showExpandedHistory ? (
                            <div className="relative z-10 flex h-full min-h-0 flex-col items-center gap-2 p-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => isXlScreen && setIsHistoryCollapsed(false)}
                                    aria-label="Perbesar panel riwayat"
                                    className="h-9 w-9"
                                >
                                    <PanelLeftOpen className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    onClick={createConversation}
                                    disabled={isCreatingConversation || isLoading}
                                    aria-label="Buat chat baru"
                                    className="h-9 w-9"
                                >
                                    {isCreatingConversation ? (
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Plus className="h-4 w-4" />
                                    )}
                                </Button>

                                <div className="mt-1 flex w-full flex-1 flex-col items-center gap-2 overflow-y-auto pb-1">
                                    {conversations.map((conversation) => (
                                        <button
                                            key={conversation.id}
                                            type="button"
                                            title={conversation.title}
                                            onClick={() => void openConversation(conversation.id)}
                                            className={cn(
                                                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] transition-colors',
                                                activeConversationId === conversation.id
                                                    ? 'border-primary/40 bg-primary/15 text-primary'
                                                    : 'border-border/70 bg-muted/20 text-muted-foreground hover:bg-muted/40',
                                            )}
                                            aria-label={`Buka riwayat ${conversation.title}`}
                                        >
                                            {conversation.id}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                <CardHeader className="space-y-3">
                                    <div className="flex items-center justify-between gap-2">
                                        <CardTitle className="text-base">Riwayat Chat</CardTitle>
                                        <div className="flex items-center gap-1">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => {
                                                    if (isXlScreen) {
                                                        setIsHistoryCollapsed(true);
                                                    } else {
                                                        setIsHistoryVisible(false);
                                                    }
                                                }}
                                                aria-label="Kecilkan panel riwayat"
                                            >
                                                <PanelLeftClose className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" onClick={createConversation} disabled={isCreatingConversation || isLoading}>
                                                {isCreatingConversation ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Plus className="h-4 w-4" />
                                                )}
                                                Chat Baru
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">Lanjutkan chat sebelumnya kapan pun.</p>
                                </CardHeader>
                                <CardContent className="min-h-0 space-y-2 xl:h-[calc(100%-7.5rem)] xl:overflow-hidden">
                                    {conversations.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">
                                            Belum ada riwayat. Klik <span className="font-medium text-foreground">Chat Baru</span> untuk mulai.
                                        </div>
                                    ) : (
                                        <div className="space-y-2 pr-1 xl:h-full xl:overflow-y-auto">
                                            {conversations.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    className={cn(
                                                        'group min-w-0 overflow-hidden rounded-2xl border-0 p-3 transition-all duration-200',
                                                        activeConversationId === conversation.id
                                                            ? 'bg-primary/10'
                                                            : 'bg-transparent hover:bg-muted/25',
                                                    )}
                                                >
                                                    <button
                                                        type="button"
                                                        className="w-full min-w-0 text-left"
                                                        onClick={() => void openConversation(conversation.id)}
                                                    >
                                                        <p className="line-clamp-2 text-sm font-medium text-foreground">
                                                            {conversation.title}
                                                        </p>
                                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Clock3 className="h-3 w-3" />
                                                            {new Date(conversation.last_message_at ?? conversation.created_at).toLocaleString('id-ID')}
                                                        </p>
                                                    </button>

                                                    <div className="mt-2 flex justify-end">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 text-muted-foreground hover:text-destructive"
                                                            onClick={() => requestDeleteConversation(conversation.id)}
                                                            aria-label="Hapus riwayat percakapan"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </>
                        )}
                    </Card>

                    <Card className="min-h-0 min-w-0 flex-1 border-0 bg-card/65 shadow-none md:h-full md:overflow-hidden">
                        <CardContent className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden px-0 pb-0 pt-1 sm:gap-3 sm:px-1 sm:pb-1 sm:pt-2 md:gap-4 md:pt-3">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    aria-label={isHistoryVisible ? 'Sembunyikan riwayat chat' : 'Tampilkan riwayat chat'}
                                    onClick={() => {
                                        if (isXlScreen) {
                                            if (!isHistoryVisible) {
                                                setIsHistoryVisible(true);
                                                setIsHistoryCollapsed(false);
                                                return;
                                            }

                                            if (showExpandedHistory) {
                                                setIsHistoryCollapsed(true);
                                            } else {
                                                setIsHistoryVisible(false);
                                            }

                                            return;
                                        }

                                        setIsHistoryVisible((prev) => !prev);
                                    }}
                                    className="h-8 w-8"
                                >
                                    {isHistoryVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                                </Button>
                                <span className="rounded-full border border-border bg-muted/40 px-2 py-1">
                                    Powered by {providerLabel}
                                </span>
                                {modelLabel !== '' ? (
                                    <span className="rounded-full border border-border bg-muted/20 px-2 py-1">
                                        {modelLabel}
                                    </span>
                                ) : null}
                            </div>
                            <div
                                ref={listRef}
                                className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border-0 bg-transparent p-0 sm:p-1 md:p-2"
                            >
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={cn('flex w-full', message.role === 'user' ? 'justify-end' : 'justify-start')}
                                    >
                                        <div
                                            className={cn(
                                                'w-fit max-w-full rounded-2xl border px-3 py-2 break-words shadow-sm',
                                                message.role === 'user'
                                                    ? 'max-w-[92%] border-primary/20 bg-primary text-primary-foreground md:max-w-[76%]'
                                                    : 'max-w-[94%] border-border bg-card text-card-foreground md:max-w-[78%] lg:max-w-[72%]',
                                            )}
                                        >
                                            <div className="mb-1 flex items-center gap-2 text-xs opacity-90">
                                                {message.role === 'user' ? (
                                                    <>
                                                        <UserRound className="h-3.5 w-3.5" /> Anda
                                                    </>
                                                ) : (
                                                    <>
                                                        <Bot className="h-3.5 w-3.5" /> Asisten AI
                                                    </>
                                                )}
                                            </div>
                                            <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                                {message.content}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isLoading ? (
                                    <div className="flex w-full justify-start">
                                        <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                            Asisten sedang menyiapkan jawaban...
                                        </div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="shrink-0 space-y-2 rounded-2xl border-0 bg-transparent p-1 md:z-10">
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {starterPrompts.map((prompt) => (
                                        <Button
                                            key={prompt}
                                            type="button"
                                            variant="outline"
                                            className="h-auto shrink-0 rounded-full border-border/80 bg-muted/40 px-3 py-2 text-left text-xs whitespace-normal hover:bg-muted"
                                            onClick={() => void sendMessage(prompt)}
                                            disabled={isLoading}
                                        >
                                            {prompt}
                                        </Button>
                                    ))}
                                </div>
                                <div className="flex items-end gap-2">
                                    <Textarea
                                        value={input}
                                        onChange={(event) => setInput(event.target.value)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'Enter' && !event.shiftKey) {
                                                event.preventDefault();
                                                void sendMessage();
                                            }
                                        }}
                                        placeholder="Ketik pertanyaan... contoh: pH tanah saya 5.2, apa langkah perbaikannya?"
                                        className="min-h-[48px] max-h-[140px] flex-1 resize-none rounded-2xl border-border bg-card py-2.5"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={() => void sendMessage()}
                                        disabled={!canSubmit}
                                        className="h-11 min-w-[88px] shrink-0 rounded-2xl px-4"
                                    >
                                        {isLoading ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <SendHorizontal className="h-4 w-4" />
                                        )}
                                        Kirim
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ConfirmDialog
                open={conversationToDelete !== null}
                onOpenChange={(open) => {
                    if (!open && !isDeletingConversation) {
                        setConversationToDelete(null);
                    }
                }}
                title="Hapus Riwayat Chat?"
                description={
                    conversationToDelete
                        ? `Riwayat "${conversationToDelete.title}" akan dihapus permanen dan tidak bisa dikembalikan.`
                        : 'Riwayat ini akan dihapus permanen.'
                }
                confirmLabel={isDeletingConversation ? 'Menghapus...' : 'Hapus'}
                cancelLabel="Batal"
                destructive
                onConfirm={() => void confirmDeleteConversation()}
            />
        </>
    );
}

ChatbotPage.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Chatbot AI',
            href: '/chatbot',
        },
    ],
};
