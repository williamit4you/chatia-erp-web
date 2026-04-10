"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api-client";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { chatService, Message } from "@/services/chat.service";
import { toast } from "sonner";
import { Info } from "lucide-react";
import { getDisplayContextUsage } from "@/lib/contextUtils";

interface ChatContainerProps {
    sessionId?: string;
    initialMessages?: Message[];
    initialPrompt?: string;
}

export default function ChatContainer({ sessionId, initialMessages, initialPrompt }: ChatContainerProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(
        initialMessages || [
            {
                id: "system-1",
                role: "system",
                content: "Olá! Sou seu assistente de IA conectado ao ERP. Como posso ajudar você hoje?",
            }
        ]
    );
    const [isLoading, setIsLoading] = useState(false);
    const [contextUsage, setContextUsage] = useState(0);
    const hasStartedRef = useRef(false);

    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === 'TENANT_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';

    // Estimate initial context usage
    useEffect(() => {
        if (messages.length > 0) {
            const totalChars = messages.reduce((acc, m) => acc + (m.content?.length || 0), 0);
            const actualUsage = Math.min(100, Math.round((totalChars / 240000) * 100));
            setContextUsage(getDisplayContextUsage(actualUsage));
        }
    }, [messages.length]);

    useEffect(() => {
        if (initialPrompt && !hasStartedRef.current) {
            hasStartedRef.current = true;
            // Delay to allow component to fully load
            const timer = setTimeout(() => {
                handleSendMessage(initialPrompt);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [initialPrompt]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMessage: Message = { id: Date.now().toString(), role: "user", content: text };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const data = await chatService.sendMessage(text, messages, sessionId);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "model",
                content: data.reply,
                sqlQueries: data.sqlQueries || undefined,
            };

            setMessages((prev) => [...prev, aiMessage]);
            
            if (data.contextUsageScore !== undefined) {
                const displayContext = getDisplayContextUsage(data.contextUsageScore);
                setContextUsage(displayContext);

                if (displayContext >= 100) {
                    toast.error("Limite de memória atingido para manter a qualidade desta conversa. Redirecionando para um novo chat...", { duration: 4000 });
                    setTimeout(() => {
                        router.push('/chat');
                        router.refresh();
                    }, 2000);
                    return; // Interrompe para evitar o redirecionamento abaixo
                }
            }

            if (!sessionId && data.sessionId) {
                router.push(`/chat/${data.sessionId}`);
                router.refresh();
            }

        } catch (error) {
            console.error(error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "system", content: "Erro ao comunicar com a IA. Verifique as configurações de token nas configurações da empresa." }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFavorite = async (text: string) => {
        try {
            await apiClient.post('/api/Favorites', { questionText: text });
            toast.success("Adicionado aos favoritos!");
        } catch (error) {
            console.error("Erro ao favoritar", error);
            toast.error("Erro ao salvar favorito.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white md:border-x border-neutral-200">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <ChatBox messages={messages} isLoading={isLoading} onFavorite={handleFavorite} isAdmin={isAdmin} />
            </div>
            
            <div className="p-4 bg-white border-t border-neutral-100">
                {/* Context Progress Bar */}
                <div className="max-w-4xl mx-auto mb-3 px-1">
                    <div className="flex items-center justify-between mb-1 group relative">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-neutral-400">
                            <span>Contexto da IA</span>
                            <Info size={12} className="text-neutral-300" />
                            
                            {/* Pro Tooltip */}
                            <div className="absolute bottom-full left-0 mb-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 bg-neutral-900 text-white text-[10px] py-2 px-3 rounded-lg shadow-xl whitespace-nowrap z-50">
                                Ao atingir 100% a IA tende a alucinar
                                <div className="absolute top-full left-4 border-4 border-transparent border-t-neutral-900"></div>
                            </div>
                        </div>
                        <span className={`text-[10px] font-black ${
                            contextUsage > 80 ? "text-red-500" : contextUsage > 50 ? "text-amber-500" : "text-emerald-500"
                        }`}>
                            {contextUsage}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/30">
                        <div 
                            className={`h-full transition-all duration-700 ease-out ${
                                contextUsage > 80 ? "bg-red-500" : contextUsage > 50 ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                            style={{ width: `${contextUsage}%` }}
                        />
                    </div>
                </div>

                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
}
