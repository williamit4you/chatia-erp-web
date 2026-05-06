"use client";

import { useState } from "react";
import { AiAnalysisData } from "@/services/finance-analytics.service";
import { Bot, Sparkles, MessageSquare } from "lucide-react";
import AiChatModal from "./AiChatModal";

interface AiAnalysisPanelProps {
    data: AiAnalysisData | null;
    isLoading: boolean;
}

export default function AiAnalysisPanel({ data, isLoading }: AiAnalysisPanelProps) {
    const [isChatOpen, setIsChatOpen] = useState(false);
    if (isLoading) {
        return (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-200"></div>
                    <div className="h-6 w-1/3 bg-indigo-200 rounded"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-indigo-100 rounded w-full"></div>
                    <div className="h-4 bg-indigo-100 rounded w-full"></div>
                    <div className="h-4 bg-indigo-100 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    // A simple mock of AI structured analysis format
    // In a real scenario, this exact data would be sent to the LLM agent via another call,
    // or the backend would return the string of the LLM analysis directly.
    return (
        <>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 shadow-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm shrink-0">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-indigo-900">Análise Inteligente</h3>
                        <p className="text-xs text-indigo-700/70">Assistente especializado em finanças</p>
                    </div>
                </div>

                <div className="flex items-start gap-3 mt-6 p-4 bg-white/60 rounded-xl border border-indigo-100/50">
                    <Bot className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-indigo-900/80 leading-relaxed">
                        Os dados do seu painel foram sincronizados. Você pode me fazer qualquer pergunta sobre as receitas, despesas ou devedores que estão visíveis neste dashboard.
                    </p>
                </div>

                <button
                    onClick={() => setIsChatOpen(true)}
                    className="mt-6 w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                >
                    <MessageSquare className="w-4 h-4" />
                    Conversar com a IA
                </button>
            </div>

            <AiChatModal
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                contextData={data}
            />
        </>
    );
}
