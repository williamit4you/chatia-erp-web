"use client";

import { ReactNode, useState, useEffect } from "react";
import { Bot, User, X, Send, Loader2, ArrowLeft, Info, MessageSquare } from "lucide-react";
import financeAnalyticsService from "@/services/finance-analytics.service";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface ChartAnalysisViewProps {
    id: string;
    title: string;
    description: string;
    chartComponent: ReactNode;
    data: any;
    onClose: () => void;
}

export default function ChartAnalysisView({ id, title, description, chartComponent, data, onClose }: ChartAnalysisViewProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // Initial AI greeting and explanation
        setMessages([
            {
                id: "initial",
                role: "assistant",
                content: `Olá! Estou analisando os dados de **${title}**. \n\n${description}\n\nO que você gostaria de entender especificamente sobre estes números?`
            }
        ]);
    }, [id, title, description]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsTyping(true);

        try {
            const history = messages.map(m => ({ role: m.role, content: m.content }));
            const response = await financeAnalyticsService.analyzeChart({
                message: currentInput,
                history,
                chartId: id,
                chartTitle: title,
                chartDescription: description,
                chartData: data
            });

            const aiMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "assistant",
                content: response.reply
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error("Erro na análise da IA:", error);
            const errorMsg: ChatMessage = {
                id: Date.now().toString(),
                role: "assistant",
                content: "Desculpe, tive um problema ao analisar estes dados agora. Poderia tentar novamente?"
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] bg-neutral-50 flex flex-col overflow-hidden animate-in fade-in duration-300">
            {/* Header */}
            <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                        title="Voltar ao Dashboard"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-neutral-200"></div>
                    <div>
                        <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight">{title}</h2>
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                            <Bot className="w-3 h-3" />
                            Análise Assistida por IA
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-black transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </header>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Chart Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 lg:border-r lg:border-neutral-200 scrollbar-thin scrollbar-thumb-neutral-200">
                    <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm flex-1 flex flex-col min-h-[500px] overflow-hidden">
                        <div className="px-8 pt-8 flex items-center gap-2">
                            <Info className="w-5 h-5 text-indigo-500" />
                            <h3 className="text-sm font-black text-neutral-800 uppercase tracking-widest">Visualização Detalhada</h3>
                        </div>
                        <div className="flex-1 w-full p-4 lg:p-8">
                            {chartComponent}
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                        <h4 className="text-xs font-black text-indigo-900 mb-3 uppercase tracking-widest flex items-center gap-2">
                            <Info className="w-4 h-4" />
                            O que este gráfico expõe?
                        </h4>
                        <p className="text-sm text-indigo-900/70 leading-relaxed font-medium">
                            {description}
                        </p>
                    </div>
                </div>

                {/* AI Chat Area */}
                <div className="w-full lg:w-[450px] bg-white flex flex-col shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)]">
                    <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">Conversa com IA</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-100">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                                    msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-indigo-600 text-white'
                                }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>
                                <div className={`p-4 rounded-2xl ${
                                    msg.role === 'user'
                                        ? 'bg-neutral-900 text-white rounded-tr-sm'
                                        : 'bg-neutral-100 text-neutral-800 rounded-tl-sm font-medium'
                                }`}>
                                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                </div>
                                <div className="px-5 py-3 bg-neutral-100 text-neutral-500 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-neutral-100 bg-neutral-50">
                        <form onSubmit={handleSend} className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Deseja saber mais sobre estes dados?"
                                className="w-full bg-white border border-neutral-200 rounded-2xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all font-medium"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-2 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 transition-all shadow-md shadow-indigo-100"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
