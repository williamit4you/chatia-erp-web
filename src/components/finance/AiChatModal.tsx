"use client";

import { useState } from "react";
import { AiAnalysisData } from "@/services/finance-analytics.service";
import { Bot, User, X, Send, Loader2 } from "lucide-react";

interface AiChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    contextData: AiAnalysisData | null;
}

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

export default function AiChatModal({ isOpen, onClose, contextData }: AiChatModalProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([{
        id: "1",
        role: "assistant",
        content: "Olá! Recebi os dados atuais do seu dashboard financeiro. O que você gostaria de analisar ou entender melhor sobre eles?"
    }]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    if (!isOpen) return null;

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulando delay de resposta da IA (já que não temos um endpoint específico de rag financeiro implementado no backend)
        setTimeout(() => {
            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `Analisando sua pergunta sobre os dados atuais... Percebo que temos R$ ${contextData?.totalReceberAberto?.toLocaleString('pt-BR')} a receber e R$ ${contextData?.totalPagarAberto?.toLocaleString('pt-BR')} a pagar. Baseado nisso, a projeção é que você consiga cobrir as despesas, dependendo do vencimento dos maiores devedores.`
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-indigo-50/50">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">IA Financeira</h2>
                            <p className="text-xs text-neutral-500">Analisando os filtros ativos do dashboard</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-neutral-100 text-neutral-600' : 'bg-indigo-100 text-indigo-600'
                                }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                            </div>
                            <div className={`p-4 rounded-2xl ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                                    : 'bg-neutral-100 text-neutral-800 rounded-tl-sm'
                                }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex gap-4 max-w-[85%]">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
                                <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                            <div className="px-4 py-3 bg-neutral-100 text-neutral-500 rounded-2xl rounded-tl-sm flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-neutral-100 bg-white">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Faça uma pergunta sobre o fluxo de caixa..."
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-6 pr-14 py-3 text-sm focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 transition-all text-neutral-900"
                            disabled={isTyping}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="absolute right-2 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors"
                        >
                            <Send className="w-4 h-4 ml-0.5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
