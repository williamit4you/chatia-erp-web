"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import apiClient from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Activity, Bot, Info } from "lucide-react";
import { toast } from "sonner";
import ChatBox from "./ChatBox";
import ChatInput from "./ChatInput";
import ChatRightRail from "./ChatRightRail";
import { getDisplayContextUsage } from "@/lib/contextUtils";
import { chatService, ChatRightRail as ChatRightRailData, Message } from "@/services/chat.service";

interface ChatContainerProps {
    sessionId?: string;
    initialMessages?: Message[];
    initialPrompt?: string;
}

const starterSuggestions = [
    "Quanto temos a receber esta semana?",
    "Quais clientes estao inadimplentes?",
    "Como esta o fluxo de caixa projetado?",
    "Produtos com estoque critico",
    "Quais clientes concentram mais valor em aberto?",
];

const defaultRightRail: ChatRightRailData = {
    suggestions: starterSuggestions.map((label) => ({ label, action: "chat:ask" })),
    insights: [],
    favoriteQuestions: [],
};

function WelcomePanel({ onSuggestion }: { onSuggestion: (text: string) => void }) {
    return (
        <div>
            <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.16),_transparent_28%),linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_28px_90px_-55px_rgba(15,23,42,0.45)] sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-violet-100 text-violet-700 ring-1 ring-violet-200">
                            <Bot className="h-8 w-8" />
                        </div>
                        <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                            Sua IA pronta para analisar e ajudar na melhor decisao.
                        </h2>
                        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
                            Pergunte sobre qualquer area do seu negocio. A interface ja fica pronta para mostrar resumo,
                            indicadores, listas e proximas acoes assim que a resposta vier estruturada.
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {["Financeiro", "Comercial", "Estoque", "Fiscal", "RH", "Producao"].map((item) => (
                                <span key={item} className="rounded-full bg-white px-3 py-2 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-indigo-600">IA em tempo real</div>
                            <div className="mt-2 text-sm font-semibold text-slate-800">Analise contextual do ERP</div>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">Insights</div>
                            <div className="mt-2 text-sm font-semibold text-slate-800">Preparada para destacar riscos e oportunidades</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4">
                            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Proxima etapa</div>
                            <div className="mt-2 text-sm font-semibold text-slate-800">Acompanhar acoes rapidas e exportacoes</div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default function ChatContainer({ sessionId, initialMessages, initialPrompt }: ChatContainerProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(
        initialMessages || [
            {
                id: "system-1",
                role: "system",
                content: "Ola! Sou seu assistente de IA conectado ao ERP. Como posso ajudar voce hoje?",
            },
        ]
    );
    const [isLoading, setIsLoading] = useState(false);
    const [contextUsage, setContextUsage] = useState(0);
    const [hasWarnedHalfway, setHasWarnedHalfway] = useState(false);
    const [rightRail, setRightRail] = useState<ChatRightRailData>(defaultRightRail);
    const hasStartedRef = useRef(false);
    const getRightRailStorageKey = (targetSessionId?: string) => `chat-right-rail:${targetSessionId || "new"}`;

    const userRole = (session?.user as any)?.role;
    const isAdmin = userRole === "TENANT_ADMIN" || userRole === "SUPER_ADMIN" || userRole === "ADMIN";
    const showWelcomePanel = !sessionId && messages.length <= 1;
    const showConversationCard =
        !!sessionId || isLoading || messages.some((message) => message.role === "user" || message.role === "model");

    const composerSuggestions = useMemo(() => {
        const latestModelMessage = [...messages].reverse().find((message) => message.role === "model");
        if (latestModelMessage?.rightRail?.suggestions?.length) {
            return latestModelMessage.rightRail.suggestions.map((item) => item.label);
        }
        return latestModelMessage?.suggestions?.length ? latestModelMessage.suggestions : starterSuggestions;
    }, [messages]);

    useEffect(() => {
        const latestModelMessage = [...messages].reverse().find((message) => message.role === "model" && message.rightRail);
        if (latestModelMessage?.rightRail) {
            setRightRail(latestModelMessage.rightRail);
        } else if (messages.filter((message) => message.role === "model").length === 0) {
            setRightRail((prev) => ({
                ...defaultRightRail,
                favoriteQuestions: prev.favoriteQuestions,
            }));
        }
    }, [messages]);

    useEffect(() => {
        try {
            const stored = sessionStorage.getItem(getRightRailStorageKey(sessionId));
            if (!stored) return;
            const parsed = JSON.parse(stored) as ChatRightRailData;
            setRightRail((prev) => ({
                ...prev,
                ...parsed,
                favoriteQuestions: parsed.favoriteQuestions?.length ? parsed.favoriteQuestions : prev.favoriteQuestions,
            }));
        } catch (error) {
            console.error("Erro ao restaurar lateral direita da sessao", error);
        }
    }, [sessionId]);

    useEffect(() => {
        const loadFavoriteQuestions = async () => {
            try {
                const response = await apiClient.get("/api/Favorites");
                const favoriteQuestions = (response.data || []).slice(0, 3).map((favorite: any) => ({
                    label: favorite.questionText,
                    action: "favorite:run",
                }));

                setRightRail((prev) => ({
                    ...prev,
                    favoriteQuestions,
                }));
            } catch (error) {
                console.error("Erro ao carregar favoritos da lateral", error);
            }
        };

        loadFavoriteQuestions();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            const totalChars = messages.reduce((accumulator, message) => accumulator + (message.content?.length || 0), 0);
            const actualUsage = Math.min(100, Math.round((totalChars / 240000) * 100));
            setContextUsage(getDisplayContextUsage(actualUsage));
        }
    }, [messages.length]);

    useEffect(() => {
        if (initialPrompt && !hasStartedRef.current) {
            const timer = setTimeout(() => {
                hasStartedRef.current = true;
                handleSendMessage(initialPrompt);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [initialPrompt]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

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
                exportId: data.exportId || undefined,
                exportTotal: data.exportTotalLinhas || undefined,
                exportValor: data.exportValorTotal || undefined,
                metricsTotal: data.metricsTotalLinhas || undefined,
                metricsValor: data.metricsValorTotal || undefined,
                responseType: data.responseType || undefined,
                sections: data.sections || undefined,
                suggestions: data.suggestions || undefined,
                rightRail: data.rightRail || undefined,
            };

            setMessages((prev) => [...prev, aiMessage]);
            if (data.rightRail) {
                setRightRail(data.rightRail);
                try {
                    sessionStorage.setItem(
                        getRightRailStorageKey(sessionId || data.sessionId),
                        JSON.stringify(data.rightRail)
                    );
                } catch (error) {
                    console.error("Erro ao persistir lateral direita", error);
                }
            }

            if (data.contextUsageScore !== undefined) {
                const displayContext = getDisplayContextUsage(data.contextUsageScore);
                setContextUsage(displayContext);

                if (displayContext >= 50 && !hasWarnedHalfway && displayContext < 100) {
                    toast.info("Voce chegou na metade do contexto desta conversa.", {
                        icon: <Info size={16} />,
                        duration: 5000,
                    });
                    setHasWarnedHalfway(true);
                }

                if (displayContext >= 100) {
                    toast.error("Limite de memoria atingido para manter a qualidade desta conversa. Redirecionando para um novo chat...", {
                        duration: 4000,
                    });
                    setTimeout(() => {
                        router.push("/chat/new");
                        router.refresh();
                    }, 2000);
                    return;
                }
            }

            if (!sessionId && data.sessionId) {
                setTimeout(() => {
                    router.push(`/chat/${data.sessionId}`);
                    router.refresh();
                }, 300);
            }
        } catch (error: any) {
            console.error(error);
            const backendMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.Message;
            const errorMessage = backendMessage || "Erro ao comunicar com a IA. Verifique as configuracoes de token nas configuracoes da empresa.";

            setMessages((prev) => [
                ...prev,
                { id: Date.now().toString(), role: "system", content: errorMessage },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFavorite = async (text: string) => {
        try {
            const response = await apiClient.post("/api/Favorites", { questionText: text });
            setRightRail((prev) => ({
                ...prev,
                favoriteQuestions: [
                    { label: response.data.questionText, action: "favorite:run" },
                    ...prev.favoriteQuestions.filter((item) => item.label !== response.data.questionText),
                ].slice(0, 3),
            }));
            toast.success("Adicionado aos favoritos!");
        } catch (error: any) {
            console.error("Erro ao favoritar", error);
            const message = error?.response?.data?.message;
            if (error?.response?.status === 409 && message) {
                toast.message(message);
                return;
            }
            toast.error(message || "Erro ao salvar favorito.");
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,#f8fafc,#ffffff)] md:border-x md:border-slate-200">
            <div className="flex-1 overflow-hidden p-3 sm:px-5 sm:pb-5 sm:pt-3">
                <div className="mx-auto grid h-full w-full max-w-7xl gap-3 xl:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="flex min-w-0 min-h-0 flex-col gap-3">
                        {showWelcomePanel && <WelcomePanel onSuggestion={handleSendMessage} />}

                        <div className="flex min-h-0 flex-1 flex-col rounded-[32px] border border-slate-200 bg-white/85 shadow-[0_24px_80px_-60px_rgba(15,23,42,0.4)] backdrop-blur">
                            {showConversationCard && (
                                <>
                                    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6">
                                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                                            <Activity className="h-4 w-4 text-emerald-600" />
                                            Conversa inteligente
                                        </div>
                                        <div className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
                                            {messages.filter((message) => message.role === "model").length} respostas geradas
                                        </div>
                                    </div>

                                    <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
                                        <ChatBox messages={messages} isLoading={isLoading} onFavorite={handleFavorite} isAdmin={isAdmin} />
                                    </div>
                                </>
                            )}

                            {!showConversationCard && <div className="flex-1" />}

                            <div className="relative z-10 shrink-0 border-t border-slate-100 bg-white/90 p-4 backdrop-blur sm:px-5">
                                <div className="mb-3 px-1">
                                    <div className="group relative z-20 mb-1 flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight text-slate-400">
                                            <span>Contexto da IA</span>
                                            <Info size={12} className="text-slate-300" />
                                            <div className="invisible absolute bottom-full left-0 z-30 mb-2 rounded-lg bg-slate-900 px-3 py-2 text-[10px] whitespace-nowrap text-white opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                                                Ao atingir 100% sera iniciada uma nova conversa automaticamente
                                                <div className="absolute left-4 top-full border-4 border-transparent border-t-slate-900"></div>
                                            </div>
                                        </div>
                                        <span
                                            className={`text-[10px] font-black ${
                                                contextUsage > 80 ? "text-rose-500" : contextUsage > 50 ? "text-amber-500" : "text-emerald-500"
                                            }`}
                                        >
                                            {contextUsage}%
                                        </span>
                                    </div>
                                    <div className="h-1.5 w-full overflow-hidden rounded-full border border-slate-200/50 bg-slate-100">
                                        <div
                                            className={`h-full transition-all duration-700 ease-out ${
                                                contextUsage > 80 ? "bg-rose-500" : contextUsage > 50 ? "bg-amber-500" : "bg-emerald-500"
                                            }`}
                                            style={{ width: `${contextUsage}%` }}
                                        />
                                    </div>
                                </div>

                                <ChatInput
                                    onSend={handleSendMessage}
                                    disabled={isLoading}
                                    suggestions={[]}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="min-h-0 overflow-y-auto pr-1">
                        <ChatRightRail rightRail={rightRail} onAsk={handleSendMessage} />
                    </div>
                </div>
            </div>
        </div>
    );
}
