"use client";

import { ReactNode, useMemo, useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Bot, User, X, Send, Loader2, ArrowLeft, Info, MessageSquare, Sparkles, Calendar, Database, ChevronDown, ChevronUp, RefreshCw, PlusCircle, History, Trash2, BookOpenText, Maximize2, Minimize2, Download, ListTree } from "lucide-react";
import financeAnalyticsService from "@/services/finance-analytics.service";
import { getChartHint } from "@/lib/chartHints";
import { toast } from "sonner";
import { getDisplayContextUsage } from "@/lib/contextUtils";
import MarkdownLite from "@/components/chat/MarkdownLite";
import MiaAvatar from "@/components/chat/MiaAvatar";
import ChartDetailsModal from "@/components/finance/ChartDetailsModal";
import { getChartDetail } from "@/lib/chartDetails";
import { adminService } from "@/services/admin.service";
import { downloadCsv } from "@/lib/csvExport";

type ChartRenderFilters = {
    entityValue: string | null;
};

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sqlQueries?: string;
}

interface ChatSessionInfo {
    id: string;
    title: string;
    createdAt: string;
}

interface ChartAnalysisViewProps {
    id: string;
    title: string;
    description: string;
    chartComponent: ReactNode;
    data: any;
    onClose: () => void;
    initialStartDate?: string;
    initialEndDate?: string;
    onDateChange?: (startDate: string, endDate: string) => Promise<void>;
    renderChart?: (filters: ChartRenderFilters) => ReactNode;
}

const getEntityFilterLabel = (chartId: string) => {
    if (["liq_empresa"].includes(chartId)) return "Empresa";
    if (["dist_rec_cliente", "pm_rec_cli", "tm_rec_cli", "docs_cli"].includes(chartId)) return "Cliente";
    if (["dist_pag_fornecedor", "pm_pag_for", "tm_pag_for", "docs_for"].includes(chartId)) return "Fornecedor";
    return null;
};

const CHARTS_WITH_DRILLDOWN_MVP = new Set<string>([
    "dist_pag_fornecedor",
    "dist_rec_cliente",
    "dist_tipo_pag",
    "dist_cond_pag",
    "aging",
    "dist_faixa_prazo",
    "geo_pagar",
    "geo_receber",
]);

function SqlViewer({ sqlQueries }: { sqlQueries: string }) {
    const [isOpen, setIsOpen] = useState(false);

    let queries: string[] = [];
    try {
        queries = JSON.parse(sqlQueries);
    } catch {
        queries = [sqlQueries];
    }

    return (
        <div className="mt-3 border-t border-neutral-200/50 pt-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                <Database className="w-3.5 h-3.5" />
                {isOpen ? "Ocultar SQL" : "Ver SQL"}
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                <span className="text-neutral-400 font-normal">({queries.length} {queries.length === 1 ? "query" : "queries"})</span>
            </button>
            {isOpen && (
                <div className="mt-2 space-y-2 animate-in slide-in-from-top-2 duration-200">
                    {queries.map((q, i) => (
                        <pre key={i} className="text-[11px] bg-neutral-900 text-green-400 p-3 rounded-xl overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all">
                            {q}
                        </pre>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ChartAnalysisView({ id, title, description: propDescription, chartComponent, data, onClose, initialStartDate, initialEndDate, onDateChange, renderChart }: ChartAnalysisViewProps) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [hasAsked, setHasAsked] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // UI Mode state
    const [viewMode, setViewMode] = useState<"chat" | "history">("chat");
    const [sessionsList, setSessionsList] = useState<ChatSessionInfo[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);
    
    // Performance/Context state
    const [contextUsage, setContextUsage] = useState<number>(0);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [isChartDetailsEnabled, setIsChartDetailsEnabled] = useState(false);
    const [isChartDetailsOpen, setIsChartDetailsOpen] = useState(false);
    const [isChatWide, setIsChatWide] = useState(false);
    const [chatWidthPx, setChatWidthPx] = useState<number>(460);
    const [isResizingChat, setIsResizingChat] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);
    const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

    // Date filter state
    const [startDate, setStartDate] = useState<string>(initialStartDate || (() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().split('T')[0];
    }));
    const [endDate, setEndDate] = useState<string>(initialEndDate || new Date().toISOString().split('T')[0]);
    const [isReloading, setIsReloading] = useState(false);
    const [localData, setLocalData] = useState<any>(data);
    const [entityValue, setEntityValue] = useState<string | null>(null);

    useEffect(() => {
        setLocalData(data);
    }, [data]);

    useEffect(() => {
        setEntityValue(null);
    }, [id]);

    // Admin detection
    const userRole = (session?.user as any)?.role;
    const userId = (session?.user as any)?.id;
    const isAdmin = userRole === 'TENANT_ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'ADMIN';
    const canManageChartDetails = userRole === "TENANT_ADMIN";

    const hint = getChartHint(id);
    const description = hint.description || propDescription;

    const entityFilterLabel = getEntityFilterLabel(id);
    const entityOptions = useMemo(() => {
        if (!entityFilterLabel) return [];
        if (!Array.isArray(data)) return [];
        const labels = data
            .map((item: any) => (typeof item?.label === "string" ? item.label.trim() : ""))
            .filter((label: string) => Boolean(label));
        return Array.from(new Set(labels)).sort((a, b) => a.localeCompare(b, "pt-BR"));
    }, [data, entityFilterLabel]);

    const chartDetailsEntry = {
        id,
        title,
        groupTitle: "Análise do gráfico",
        description,
        detail: getChartDetail(id, title, description),
    };

    const getExportRows = () => {
        const source = localData || data;
        if (!Array.isArray(source)) return null;

        const filtered =
            entityFilterLabel && entityValue
                ? source.filter((item: any) => (typeof item?.label === "string" ? item.label.trim() : "") === entityValue)
                : source;

        const rows = filtered
            .filter((row) => row && typeof row === "object" && !Array.isArray(row))
            .map((row) => row as Record<string, unknown>);

        return rows.length ? rows : null;
    };

    const handleExportCsv = () => {
        const rows = getExportRows();
        if (!rows) {
            toast.error("NÃ£o foi possÃ­vel exportar: este grÃ¡fico nÃ£o possui dados tabulares para CSV.");
            return;
        }

        const safe = (value: string) =>
            value
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-zA-Z0-9-_]+/g, "_")
                .replace(/_+/g, "_")
                .replace(/^_+|_+$/g, "")
                .toLowerCase();

        const suffix = entityValue ? `-${safe(entityValue)}` : "";
        const filename = `finance-${safe(id)}${suffix}-${startDate}_${endDate}.csv`;
        downloadCsv(rows, { filename, separator: ";" });
    };

    const loadMessages = async (sessionId: string) => {
        setIsTyping(true);
        try {
            const { default: apiClient } = await import("@/lib/api-client");
            const res = await apiClient.get(`/api/chat/messages/${sessionId}`);
            
            if (res.data && res.data.length > 0) {
                const loadedMessages: ChatMessage[] = res.data.map((m: any) => ({
                    id: m.id,
                    role: m.role === 'user' ? 'user' as const : 'assistant' as const,
                    content: m.content,
                    sqlQueries: m.sqlQueries || undefined
                }));
                setMessages(loadedMessages);
                setHasAsked(true);
                setCurrentSessionId(sessionId);
                setViewMode("chat");
                
                // Estimate context usage for loaded history
                const totalChars = res.data.reduce((acc: number, m: any) => acc + (m.content?.length || 0), 0);
                const actualUsage = Math.min(100, Math.round((totalChars / 240000) * 100));
                setContextUsage(getDisplayContextUsage(actualUsage));
            }
        } catch (error) {
            console.error("Erro ao carregar mensagens:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const loadSessions = async () => {
        if (!userId) return;
        setIsLoadingSessions(true);
        try {
            const data = await financeAnalyticsService.getSessions();
            // Filter only sessions related to this chart
            const chartSessions = data
                .filter((s: any) => s.id.startsWith(`chart-${id}-${userId}`))
                .map((s: any) => ({
                    id: s.id,
                    title: s.title,
                    createdAt: s.createdAt
                }));
            setSessionsList(chartSessions);
        } catch (error) {
            console.error("Erro ao carregar sessões:", error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const deleteSession = async (sessionId: string) => {
        if (!confirm("Deseja realmente excluir esta conversa?")) return;
        
        try {
            await financeAnalyticsService.deleteSession(sessionId);
            setSessionsList(prev => prev.filter(s => s.id !== sessionId));
            if (currentSessionId === sessionId) {
                startNewConversation();
            }
        } catch (error) {
            console.error("Erro ao excluir sessão:", error);
        }
    };

    const startNewConversation = () => {
        setMessages([{
            id: "initial",
            role: "assistant",
            content: `Olá! Estou analisando os dados de **${title}**. \n\n${description}\n\nO que você gostaria de entender especificamente sobre estes números?`
        }]);
        setHasAsked(false);
        setCurrentSessionId(null);
        setContextUsage(0);
        setViewMode("chat");
    };

    useEffect(() => {
        // Initial load: search for any existing session or start fresh
        const init = async () => {
            if (!userId) {
                setMessages([{
                    id: "initial",
                    role: "assistant",
                    content: `Olá! Estou analisando os dados de **${title}**. \n\n${description}\n\nO que você gostaria de entender especificamente sobre estes números?`
                }]);
                return;
            }
            // By default, just show the greeting on mount unless we have a specific reason to load the "last" one.
            // But let's check if there's history.
            loadSessions();
            startNewConversation();
        };
        init();
    }, [id, title, description, userId]);

    useEffect(() => {
        if (!canManageChartDetails) {
            setIsChartDetailsEnabled(false);
            return;
        }

        const sessionValue = Boolean((session?.user as any)?.showChartDetails);
        setIsChartDetailsEnabled(sessionValue);

        adminService
            .getSettings()
            .then((settings) => {
                setIsChartDetailsEnabled(Boolean(settings?.showChartDetails));
            })
            .catch((error) => {
                console.error("Erro ao carregar flag de detalhes do gráfico:", error);
            });
    }, [canManageChartDetails, session]);

    useEffect(() => {
        if (scrollRef.current && viewMode === "chat") {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping, viewMode]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1024px)");
        const apply = () => setIsDesktop(mq.matches);
        apply();
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const saved = window.localStorage.getItem(`finance_chart_chat_width_${id}`);
        const parsed = saved ? Number(saved) : NaN;
        if (Number.isFinite(parsed) && parsed >= 360 && parsed <= 960) {
            setChatWidthPx(parsed);
        } else {
            setChatWidthPx(460);
        }
    }, [id]);

    useEffect(() => {
        if (typeof window === "undefined") return;
        window.localStorage.setItem(`finance_chart_chat_width_${id}`, String(chatWidthPx));
    }, [chatWidthPx, id]);

    useEffect(() => {
        if (!isResizingChat) return;

        const onMove = (event: PointerEvent) => {
            const start = resizeStartRef.current;
            if (!start) return;
            // Dragging left increases width; dragging right decreases width.
            const delta = start.startX - event.clientX;
            const next = Math.min(960, Math.max(360, Math.round(start.startWidth + delta)));
            setChatWidthPx(next);
        };

        const onUp = () => {
            setIsResizingChat(false);
            resizeStartRef.current = null;
        };

        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp, { once: true });

        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
    }, [isResizingChat]);

    const handleDateFilter = async () => {
        setIsReloading(true);
        try {
            if (onDateChange) {
                await onDateChange(startDate, endDate);
            } else {
                const advancedData = await financeAnalyticsService.getAdvancedAnalytics(startDate, endDate);
                setLocalData(advancedData);
            }
        } catch (error) {
            console.error("Erro ao recarregar dados:", error);
        } finally {
            setIsReloading(false);
        }
    };

    const handleSend = async (e?: React.FormEvent, customInput?: string) => {
        if (e) e.preventDefault();
        
        const messageToSend = customInput || input;
        if (!messageToSend.trim() || isTyping) return;

        setHasAsked(true);
        const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: messageToSend };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const history = [...messages, userMsg]
                .filter(m => m.id !== "initial")
                .map(m => ({ role: m.role, content: m.content }));

            const response = await financeAnalyticsService.analyzeChart({
                message: messageToSend,
                history,
                chartId: id,
                chartTitle: title,
                chartDescription: description,
                chartData: localData || data,
                startDate,
                endDate,
                sessionId: currentSessionId || undefined
            });

            const aiMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response.reply,
                sqlQueries: response.sqlQueries || undefined
            };
            setMessages(prev => [...prev, aiMsg]);
            
            if (!currentSessionId) {
                setCurrentSessionId(response.sessionId);
                loadSessions(); // Refresh list after first message creates session
            }

            if (response.contextUsageScore !== undefined) {
                const displayContext = getDisplayContextUsage(response.contextUsageScore);
                setContextUsage(displayContext);

                if (displayContext >= 100) {
                    toast.error("O limite de memória desta conversa foi atingido. Uma nova análise será iniciada para manter a qualidade.", { duration: 4000 });
                    setTimeout(() => {
                        startNewConversation();
                    }, 2500);
                }
            }
        } catch (error: any) {
            console.error("Erro na análise da IA:", error);
            const backendMessage = error.response?.data?.message || error.response?.data?.error || error.response?.data?.Message;
            const errorMessage = backendMessage || "Desculpe, tive um problema ao analisar estes dados agora. Verifique sua conexão ou tente novamente mais tarde.";
            
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: errorMessage
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
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                                <Bot className="w-3 h-3" />
                                Análise Assistida por IA
                            </div>
                            
                            {/* NEW ACTIONS */}
                            <div className="flex items-center gap-2 ml-2">
                                <button 
                                    onClick={startNewConversation}
                                    className="flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 font-black uppercase px-2 py-1 rounded-md hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100"
                                >
                                    <PlusCircle className="w-3 h-3" />
                                    Nova Conversa
                                </button>
                                <button 
                                    onClick={() => {
                                        if (viewMode === "history") setViewMode("chat");
                                        else { loadSessions(); setViewMode("history"); }
                                    }}
                                    className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md transition-all border ${
                                        viewMode === "history" 
                                        ? "bg-indigo-600 text-white border-indigo-700 shadow-md" 
                                        : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-200"
                                    }`}
                                >
                                    <History className="w-3 h-3" />
                                    {viewMode === "history" ? "Voltar ao Chat" : "Histórico"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 bg-neutral-50 p-1.5 rounded-xl border border-neutral-200">
                        <Calendar className="w-4 h-4 text-neutral-400 ml-2" />
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs font-bold outline-none w-28 text-neutral-700 bg-transparent" />
                        <span className="text-neutral-300">/</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs font-bold outline-none w-28 text-neutral-700 bg-transparent" />

                        {entityFilterLabel && renderChart && entityOptions.length > 0 && (
                            <>
                                <span className="hidden sm:inline text-neutral-300 mx-1">|</span>
                                <div className="flex items-center gap-2 pl-1 pr-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">{entityFilterLabel}</span>
                                    <select
                                        value={entityValue || ""}
                                        onChange={(e) => setEntityValue(e.target.value ? e.target.value : null)}
                                        className="h-8 max-w-[220px] rounded-lg border border-neutral-200 bg-white px-2 text-xs font-bold text-neutral-700 outline-none"
                                    >
                                        <option value="">Todas</option>
                                        {entityOptions.map((label) => (
                                            <option key={label} value={label}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <button 
                            onClick={handleDateFilter} 
                            disabled={isReloading}
                            className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {isReloading ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                            Filtrar
                        </button>
                        {canManageChartDetails && isChartDetailsEnabled && (
                            <button
                                type="button"
                                onClick={() => setIsChartDetailsOpen(true)}
                                className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-blue-200 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
                            >
                                <BookOpenText className="w-3.5 h-3.5" />
                                Detalhes do gráfico
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleExportCsv}
                            className="bg-white text-neutral-800 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-neutral-200 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                            title="Exportar dados do grÃ¡fico em CSV"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Exportar CSV
                        </button>
                        {CHARTS_WITH_DRILLDOWN_MVP.has(id) && (
                            <button
                                type="button"
                                onClick={() =>
                                    toast.message("Drill-down em desenvolvimento", {
                                        description: "O modal de detalhamento serÃ¡ habilitado apÃ³s a API de drill-down ficar pronta.",
                                    })
                                }
                                className="bg-white text-neutral-800 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-neutral-200 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                                title="Detalhar (drill-down)"
                            >
                                <ListTree className="w-3.5 h-3.5" />
                                Drill-down
                            </button>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 bg-neutral-900 text-white rounded-xl hover:bg-black transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {canManageChartDetails && isChartDetailsEnabled && (
                <ChartDetailsModal
                    isOpen={isChartDetailsOpen}
                    title={title}
                    entries={[chartDetailsEntry]}
                    onClose={() => setIsChartDetailsOpen(false)}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50/30">
                {/* Chart Area */}
                <div className="flex-1 p-4 sm:p-6 flex flex-col lg:border-r lg:border-neutral-200 min-w-0">
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-sm flex-1 flex flex-col overflow-hidden relative min-h-0">
                        {isReloading && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                                <div className="flex items-center gap-3 text-indigo-600 bg-white px-6 py-3 rounded-2xl shadow-xl border border-indigo-100">
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span className="text-sm font-black uppercase tracking-widest">Recarregando dados...</span>
                                </div>
                            </div>
                        )}
                        
                        {/* Insight Header Section */}
                        <div className="px-6 py-5 bg-gradient-to-br from-indigo-50/80 to-white border-b border-neutral-100 shrink-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5" />
                                        Insight Estratégico
                                    </h3>
                                    <p className="text-sm text-neutral-700 leading-relaxed max-w-3xl">
                                        {description}
                                    </p>
                                </div>
                                <div className="hidden sm:flex shrink-0 w-10 h-10 bg-indigo-100 rounded-full items-center justify-center text-indigo-500">
                                    <Info className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Chart Render Section */}
                        <div className="flex-1 w-full p-4 lg:p-6 relative min-h-0">
                            {renderChart ? renderChart({ entityValue }) : chartComponent}
                        </div>
                    </div>
                </div>

                {/* AI Chat Area */}
                <div
                    className="w-full bg-white flex flex-col shrink-0 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] relative"
                    style={isDesktop ? { width: chatWidthPx } : undefined}
                >
                    {/* Resize handle (desktop only) */}
                    <div
                        className="hidden lg:flex absolute left-0 top-0 h-full w-3 items-center justify-center cursor-col-resize"
                        onPointerDown={(event) => {
                            const el = event.currentTarget as HTMLDivElement;
                            el.setPointerCapture(event.pointerId);
                            resizeStartRef.current = { startX: event.clientX, startWidth: chatWidthPx };
                            setIsResizingChat(true);
                        }}
                        title="Arraste para ajustar a largura"
                    >
                        <div className={`h-full w-px ${isResizingChat ? "bg-indigo-300" : "bg-neutral-200"} opacity-80`} />
                    </div>
                    <div className="px-6 py-4 border-b border-neutral-100 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {viewMode === "history" ? <History className="w-4 h-4 text-indigo-600" /> : <MessageSquare className="w-4 h-4 text-indigo-600" />}
                                <span className="text-xs font-black text-neutral-900 uppercase tracking-widest">
                                    {viewMode === "history" ? "Histórico de Análises" : "Conversa com Especialista"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsChatWide((v) => {
                                            const next = !v;
                                            setChatWidthPx(next ? 640 : 460);
                                            return next;
                                        });
                                    }}
                                    className="hidden lg:inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-600 hover:bg-neutral-50"
                                    title={isChatWide ? "Reduzir área do chat" : "Ampliar área do chat"}
                                >
                                    {isChatWide ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                                    {isChatWide ? "Reduzir" : "Ampliar"}
                                </button>
                                {isTyping && (
                                    <span className="text-[10px] font-black text-indigo-500 uppercase animate-pulse">Analisando...</span>
                                )}
                            </div>
                        </div>
                        
                        {/* Context Progress Meter */}
                        {viewMode === "chat" && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                                    <span className="text-neutral-400">Contexto da IA</span>
                                    <span className={contextUsage > 80 ? "text-red-500" : contextUsage > 50 ? "text-amber-500" : "text-emerald-500"}>
                                        {contextUsage}%
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full transition-all duration-500 ${
                                            contextUsage > 80 ? "bg-red-500" : contextUsage > 50 ? "bg-amber-500" : "bg-emerald-500"
                                        }`}
                                        style={{ width: `${contextUsage}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Chat Area Body - Toggle between Chat and History */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-100">
                        {viewMode === "history" ? (
                            <div className="space-y-3">
                                {isLoadingSessions ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-neutral-400">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span className="text-xs font-bold uppercase">Carregando histórico...</span>
                                    </div>
                                ) : sessionsList.length === 0 ? (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
                                            <History className="w-6 h-6" />
                                        </div>
                                        <p className="text-sm font-bold text-neutral-500">Nenhuma conversa anterior para este gráfico.</p>
                                    </div>
                                ) : (
                                    sessionsList.map((s) => (
                                        <div 
                                            key={s.id} 
                                            className="group relative flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200 hover:border-indigo-300 hover:bg-white transition-all cursor-pointer shadow-sm"
                                            onClick={() => loadMessages(s.id)}
                                        >
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <span className="text-sm font-black text-neutral-900 truncate pr-8">{s.title.replace('Análise: ', '')}</span>
                                                <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(s.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                                                className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <section className="rounded-[28px] border border-neutral-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                                            <MiaAvatar
                                                size={32}
                                                className="rounded-xl border-indigo-100 ring-1 ring-indigo-50"
                                                imageClassName="scale-[1.15]"
                                                alt="Avatar da MIA"
                                            />
                                            Sugestões para você
                                        </div>
                                        <div className="mt-2 space-y-1">
                                            {hint.suggestedQuestions.length === 0 ? (
                                                <div className="rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                                                    As sugestões aparecerão aqui depois da primeira resposta da IA.
                                                </div>
                                            ) : (
                                                hint.suggestedQuestions.slice(0, 5).map((question) => (
                                                    <button
                                                        key={question}
                                                        type="button"
                                                        onClick={() => handleSend(undefined, question)}
                                                        disabled={isTyping}
                                                        title={question}
                                                        className="w-full rounded-2xl border border-neutral-200 bg-white px-3.5 py-2 text-left text-neutral-700 transition hover:border-indigo-200 hover:bg-indigo-50/40 hover:text-neutral-900 disabled:opacity-60"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                                                <Sparkles className="h-3.5 w-3.5" />
                                                            </span>
                                                            <span className="min-w-0 flex-1 truncate text-[13px] leading-5 font-normal">{question}</span>
                                                            <span className="text-neutral-400 text-sm">›</span>
                                                        </div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </section>

                                    <section className="rounded-[28px] border border-neutral-200 bg-white p-3 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)]">
                                        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                                                <Sparkles className="h-3.5 w-3.5" />
                                            </span>
                                            Insights relacionados
                                        </div>
                                        <div className="mt-2 rounded-2xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                                            Os insights relacionados aparecerão junto com a resposta contextual da IA.
                                        </div>
                                    </section>
                                </div>

                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex gap-4 max-w-full ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                                            msg.role === 'user' ? 'bg-neutral-900 text-white' : 'bg-indigo-600 text-white'
                                        }`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                        </div>
                                        <div className={`p-4 rounded-2xl ${
                                            msg.role === 'user'
                                                ? 'bg-neutral-900 text-white rounded-tr-sm shadow-md'
                                                : 'bg-neutral-100 text-neutral-800 rounded-tl-sm font-medium border border-neutral-200/50 shadow-sm'
                                        }`}>
                                            {msg.role === "assistant" ? (
                                                <div className="text-sm leading-relaxed">
                                                    <MarkdownLite content={msg.content} />
                                                </div>
                                            ) : (
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            )}
                                            {isAdmin && msg.role === 'assistant' && msg.sqlQueries && (
                                                <SqlViewer sqlQueries={msg.sqlQueries} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        </div>
                                        <div className="px-5 py-3 bg-neutral-100 text-neutral-500 rounded-2xl rounded-tl-sm flex items-center gap-1.5 border border-neutral-200/50">
                                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Chat Input & Suggested Questions */}
                    {viewMode === "chat" && (
                        <div className="p-4 border-t border-neutral-100 bg-neutral-50 space-y-4">
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Deseja saber mais sobre estes dados?"
                                    className="w-full bg-white border border-neutral-200 rounded-2xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all font-bold placeholder:text-neutral-400"
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
                    )}
                </div>
            </div>
        </div>
    );
}
