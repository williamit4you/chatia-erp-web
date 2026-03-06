"use client";

import { useState, useRef, useEffect } from "react";
import apiClient from "@/lib/api-client";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import { useRouter } from "next/navigation";
import { chatService, Message } from "@/services/chat.service";

interface ChatContainerProps {
    sessionId?: string;
    initialMessages?: Message[];
    initialPrompt?: string;
}

export default function ChatContainer({ sessionId, initialMessages, initialPrompt }: ChatContainerProps) {
    const router = useRouter();
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
    const hasStartedRef = useRef(false);

    useEffect(() => {
        if (initialPrompt && !hasStartedRef.current) {
            hasStartedRef.current = true;
            // Next tick to allow state init
            setTimeout(() => {
                handleSendMessage(initialPrompt);
            }, 0);
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
            };

            setMessages((prev) => [...prev, aiMessage]);

            // If we didn't have a sessionId but the server created one, redirect seamlessly!
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
            alert("Adicionado aos favoritos!");
        } catch (error) {
            console.error("Erro ao favoritar", error);
            alert("Erro ao salvar favorito.");
        }
    };

    return (
        <div className="flex flex-col h-full bg-white md:border-x border-neutral-200">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                <ChatBox messages={messages} isLoading={isLoading} onFavorite={handleFavorite} />
            </div>
            <div className="p-4 bg-white border-t border-neutral-100">
                <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
        </div>
    );
}
