"use client";

import { useEffect, useMemo, useState, useRef, type ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import { salesBudgetCatalog } from "@/lib/sales-budget-catalog";
import { getSalesBudgetChartDefinition } from "@/lib/salesBudgetChartDefinitions";
import { getSalesBudgetAutoHelpPrompt, getSalesBudgetChartObjective } from "@/lib/salesBudgetChartHelp";
import salesBudgetAnalyticsService, {
  type SalesBudgetChartDataset,
  type SalesBudgetChartQueryDetailsItem,
} from "@/services/sales-budget-analytics.service";
	import { 
	    ArrowLeft, Lock, Calendar, Bot, User, Send, Loader2, Info, Sparkles, 
	    Database, ChevronDown, ChevronUp, RefreshCw, PlusCircle, History, 
	    Trash2, Download, MessageSquareText 
	} from "lucide-react";
import { useSessionStorageDate } from "@/hooks/useSessionStorageDate";
import { toast } from "sonner";
import { getDisplayContextUsage } from "@/lib/contextUtils";
import MarkdownLite from "@/components/chat/MarkdownLite";
import MiaAvatar from "@/components/chat/MiaAvatar";
import ExportButtons from "@/components/chat/ExportButtons";
import { downloadCsv } from "@/lib/csvExport";

type DashboardAccessUser = {
  role?: string;
  hasBudgetDashboardAccess?: boolean;
};

const catalogIndex = salesBudgetCatalog.flatMap((category) =>
  category.highlights.map((chart) => ({
    ...chart,
    categoryName: category.name,
    categoryId: category.id,
    accentColor: chart.color ?? category.color,
  }))
);

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    sqlQueries?: string;
    exportId?: string;
    exportTotal?: number;
    exportValor?: number;
    metricsTotal?: number;
    metricsValor?: number;
}

interface ChatSessionInfo {
    id: string;
    title: string;
    createdAt: string;
}

function SectionList({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-neutral-900">
        <span className="text-neutral-500">{icon}</span>
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-neutral-600">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

function ChartInsightOverview({
  chartId,
  title,
}: {
  chartId: string;
  title: string;
}) {
  const definition = getSalesBudgetChartDefinition(chartId);
  if (!definition) return null;

  return (
    <article className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
          {title}
        </span>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-2xl bg-blue-50/70 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              O que este gráfico mostra
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              {definition.help.objective}
            </p>
          </div>

          <SectionList
            icon={<Sparkles className="h-4 w-4" />}
            title="Como interpretar"
            items={definition.help.howToRead}
          />
        </div>

        <div className="space-y-3">
          <SectionList
            icon={<Database className="h-4 w-4" />}
            title="Como é calculado"
            items={definition.help.calculation}
          />

          <SectionList
            icon={<Info className="h-4 w-4" />}
            title="Cuidados na leitura"
            items={definition.help.cautions}
          />

          {definition.help.bestVisualization ? (
            <SectionList
              icon={<ChevronUp className="h-4 w-4" />}
              title="Melhor visualização"
              items={[
                definition.help.bestVisualization,
                ...(definition.help.alternativeViews ?? []),
              ]}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}

function ChartQueryDetailsPanel({
  isOpen,
  onToggle,
  isLoading,
  details,
}: {
  isOpen: boolean;
  onToggle: (nextOpen: boolean) => void;
  isLoading: boolean;
  details: SalesBudgetChartQueryDetailsItem | null;
}) {
  const rules = details?.rules ?? [];
  const sqlQueries = details?.sqlQueries ?? [];
  const hasAny = rules.length > 0 || sqlQueries.length > 0;

  if (!hasAny && !isLoading) {
    return (
      <details
        className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
        open={isOpen}
        onToggle={(event) => {
          onToggle((event.currentTarget as HTMLDetailsElement).open);
        }}
      >
        <summary className="cursor-pointer select-none text-sm font-black text-neutral-900">
          Consultas e regras
          <span className="ml-2 text-[11px] font-bold text-neutral-500">
            (sem dados)
          </span>
        </summary>
        <p className="mt-3 text-sm leading-6 text-neutral-600">
          Este gráfico ainda não retornou detalhes de SQL/regras. Se você for
          TENANT_ADMIN/SUPER_ADMIN, valide se o endpoint de query details está
          habilitado no backend.
        </p>
      </details>
    );
  }

  return (
    <details
      className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
      open={isOpen}
      onToggle={(event) => {
        onToggle((event.currentTarget as HTMLDetailsElement).open);
      }}
    >
      <summary className="cursor-pointer select-none text-sm font-black text-neutral-900">
        Consultas e regras
        {isLoading ? (
          <span className="ml-2 text-[11px] font-bold text-neutral-500">
            (carregando...)
          </span>
        ) : null}
      </summary>

      {rules.length > 0 ? (
        <div className="mt-3">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
            Regras aplicadas
          </p>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-neutral-700">
            {rules.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {sqlQueries.length > 0 ? (
        <div className="mt-4">
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
            SQL
          </p>
          <div className="mt-2 space-y-2">
            {sqlQueries.map((q, i) => (
              <pre
                key={`sql-${i}`}
                className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-neutral-900 p-3 font-mono text-[11px] leading-relaxed text-green-400"
              >
                {q}
              </pre>
            ))}
          </div>
        </div>
      ) : null}
    </details>
  );
}

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

export default function SalesBudgetAnalyticsDetailPage() {
  const params = useParams<{ chartId: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const user = (session?.user ?? null) as DashboardAccessUser | null;
  const userId = (session?.user as any)?.id;
  const chartId = String(params?.chartId ?? "");

  const [startDate, setStartDate] = useSessionStorageDate("salesBudgetStartDate", () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useSessionStorageDate("salesBudgetEndDate", () => new Date().toISOString().split("T")[0]);
  const [chart, setChart] = useState<SalesBudgetChartDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQueriesOpen, setIsQueriesOpen] = useState(false);
  const [queryDetails, setQueryDetails] = useState<SalesBudgetChartQueryDetailsItem | null>(null);
  const [isLoadingQueryDetails, setIsLoadingQueryDetails] = useState(false);
  const queryDetailsCacheRef = useRef<Map<string, SalesBudgetChartQueryDetailsItem | null>>(new Map());

  // Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"chat" | "history">("chat");
  const [sessionsList, setSessionsList] = useState<ChatSessionInfo[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [contextUsage, setContextUsage] = useState<number>(0);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Resize State
  const [chatWidthPx, setChatWidthPx] = useState<number>(460);
  const [isResizingChat, setIsResizingChat] = useState(false);
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const canSeeSalesBudget =
    user?.role === "TENANT_ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.hasBudgetDashboardAccess;

  const chartMeta = useMemo(
    () => catalogIndex.find((item) => item.id === chartId),
    [chartId]
  );
  const chartDefinition = useMemo(
    () => getSalesBudgetChartDefinition(chartId),
    [chartId]
  );
  
	  const title = chart?.title ?? chartMeta?.title ?? chartId;
	  const description = getSalesBudgetChartObjective({
        chartId,
        title,
        categoryName: chartMeta?.categoryName ?? null,
      });

    const shouldAutoHelp = searchParams?.get("help") === "1";
    const autoHelpTriggeredRef = useRef(false);
    const queryKey = useMemo(() => `${chartId}|${startDate}|${endDate}`, [chartId, endDate, startDate]);

	  const loadChart = async () => {
	    if (chartMeta?.availability && chartMeta.availability !== "available_now") {
	      setChart(null);
	      setError("Este gráfico ainda não está disponível.");
	      return;
	    }

	    setIsLoading(true);
	    try {
	      const response = await salesBudgetAnalyticsService.getChartsBatch({
	        chartIds: [chartId],
	        filters: { startDate, endDate },
	      });
	      const item = response.items?.[0] ?? null;
	      setChart(item);
	      setError(item ? null : "Não há dados para este gráfico no período selecionado.");
	    } catch {
	      setError("Não foi possível carregar este gráfico agora.");
	    } finally {
	      setIsLoading(false);
	    }
	  };

  useEffect(() => {
    if (!canSeeSalesBudget || !chartId) return;
    void loadChart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSeeSalesBudget, chartId, endDate, startDate]);

  useEffect(() => {
    if (!shouldAutoHelp) return;
    setIsQueriesOpen(true);
  }, [shouldAutoHelp]);

  useEffect(() => {
    if (!chartId) return;
    // We always try to load query details so every chart can show SQL/rules when available.

    const cached = queryDetailsCacheRef.current.get(queryKey);
    if (cached !== undefined) {
      setQueryDetails(cached);
      return;
    }

    setIsLoadingQueryDetails(true);
    salesBudgetAnalyticsService
      .getChartQueryDetails({ chartIds: [chartId], startDate, endDate })
      .then((res) => {
        const item =
          res.items?.find((it) => it?.chartId === chartId) ?? null;
        queryDetailsCacheRef.current.set(queryKey, item);
        setQueryDetails(item);
      })
      .catch(() => {
        queryDetailsCacheRef.current.set(queryKey, null);
        setQueryDetails(null);
      })
      .finally(() => {
        setIsLoadingQueryDetails(false);
      });
  }, [chartId, endDate, queryKey, startDate]);

  // Chat initialization
  useEffect(() => {
    const initChat = async () => {
        if (!userId) {
            setMessages([{
                id: "initial",
                role: "assistant",
                content: `Olá! Estou analisando os dados de **${title}**. 

${description}

O que você gostaria de entender especificamente sobre estes números?`
            }]);
            return;
        }
        loadSessions();
        startNewConversation();
    };
    initChat();
  }, [chartId, title, description, userId]);

  useEffect(() => {
    if (scrollRef.current && viewMode === "chat") {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, viewMode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(`sales_chart_chat_width_${chartId}`);
    const parsed = saved ? Number(saved) : NaN;
    if (Number.isFinite(parsed) && parsed >= 360 && parsed <= 960) {
        setChatWidthPx(parsed);
    } else {
        setChatWidthPx(460);
    }
  }, [chartId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(`sales_chart_chat_width_${chartId}`, String(chatWidthPx));
  }, [chatWidthPx, chartId]);

  useEffect(() => {
    if (!isResizingChat) return;

    const onMove = (event: PointerEvent) => {
        const start = resizeStartRef.current;
        if (!start) return;
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
        const data = await salesBudgetAnalyticsService.getSessions();
        const chartSessions = data
            .filter((s: any) => s.id.startsWith(`sales-chart-${chartId}-${userId}`))
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
        await salesBudgetAnalyticsService.deleteSession(sessionId);
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
        content: `Olá! Estou analisando os dados de **${title}**. 

${description}

O que você gostaria de entender especificamente sobre estes números?`
    }]);
    setHasAsked(false);
    setCurrentSessionId(null);
    setContextUsage(0);
    setViewMode("chat");
  };

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    
    const messageToSend = customInput || input;
    if (!messageToSend.trim() || isTyping || !chart) return;
    const helpPrompt = getSalesBudgetAutoHelpPrompt({ chartId, title });
    const shouldCacheHelp = Boolean(customInput) && Boolean(helpCacheKey) && messageToSend === helpPrompt;

    setHasAsked(true);
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
        const history = [...messages, userMsg]
            .filter(m => m.id !== "initial")
            .map(m => ({ role: m.role, content: m.content }));

        const response = await salesBudgetAnalyticsService.analyzeChart({
            message: messageToSend,
            history,
            chartId: `sales-${chartId}`,
            chartTitle: title,
            chartDescription: description,
            chartData: chart.data,
            startDate,
            endDate,
            sessionId: currentSessionId || undefined
        });

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response.reply,
            sqlQueries: response.sqlQueries || undefined,
            exportId: response.exportId || undefined,
            exportTotal: response.exportTotalLinhas || undefined,
            exportValor: response.exportValorTotal || undefined,
            metricsTotal: response.metricsTotalLinhas || undefined,
            metricsValor: response.metricsValorTotal || undefined,
        };
        setMessages(prev => [...prev, aiMsg]);

        if (shouldCacheHelp && typeof window !== "undefined" && helpCacheKey) {
            try {
                window.localStorage.setItem(helpCacheKey, aiMsg.content);
            } catch {
                // ignore
            }
        }
        
        if (!currentSessionId) {
            setCurrentSessionId(response.sessionId);
            loadSessions();
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

  const helpCacheKey = useMemo(() => {
    if (!chartId) return null;
    return `sales_budget_chart_help_${chartId}_${startDate}_${endDate}`;
  }, [chartId, endDate, startDate]);

  const runAutoHelp = async () => {
    if (!helpCacheKey) return;

    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(helpCacheKey);
      if (cached) {
        setMessages((prev) => [
          ...prev,
          { id: `help_${Date.now()}`, role: "assistant", content: cached },
        ]);
        setHasAsked(true);
        return;
      }
    }

    const prompt = getSalesBudgetAutoHelpPrompt({ chartId, title });
    await handleSend(undefined, prompt);
  };

  useEffect(() => {
    if (!shouldAutoHelp) return;
    if (autoHelpTriggeredRef.current) return;
    if (!chart) return;
    if (isTyping) return;

    autoHelpTriggeredRef.current = true;
    void runAutoHelp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chart, isTyping, shouldAutoHelp]);

  const handleExportCsv = () => {
    if (!chart || !chart.data) {
        toast.error("Não há dados para exportar.");
        return;
    }
    const safe = (value: string) =>
        value
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-zA-Z0-9-_]+/g, "_")
            .toLowerCase();

    const filename = `sales-${safe(chartId)}-${startDate}_${endDate}.csv`;
    const rows = chart.data.map(item => item as Record<string, unknown>);
    downloadCsv(rows, { filename, separator: ";" });
  };

  if (status === "loading") {
    return <div className="h-screen w-full bg-neutral-50" />;
  }

  if (!canSeeSalesBudget) {
    return (
      <div className="h-screen w-full overflow-y-auto bg-neutral-50 flex flex-col">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur shrink-0">
          <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <SidebarToggle />
            <ChatCompanyDropdown />
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
               Gráfico de Vendas
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
               O acesso a esta análise depende da permissão de dashboard de Orçamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-neutral-50 flex flex-col animate-in fade-in duration-300">
      <header className="min-h-[64px] bg-white border-b border-neutral-200 flex flex-col gap-3 px-6 py-3 shrink-0 lg:flex-row lg:items-center lg:justify-between z-10">
        <div className="flex items-center gap-4 min-w-0">
            <SidebarToggle />
            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>
            <button 
                onClick={() => router.push("/chat/sales-budget-analytics")}
                className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-500 transition-colors"
                title="Voltar para Vendas"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-lg font-black text-neutral-900 uppercase tracking-tight truncate max-w-sm" title={title}>{title}</h2>
                <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                        <Bot className="w-3 h-3" />
                        Análise Assistida por IA
                    </div>
                    
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

        <div className="flex items-start justify-end gap-3 flex-wrap lg:flex-nowrap">
            <ChatCompanyDropdown />
            <div className="flex flex-col gap-2 bg-neutral-50 p-2 rounded-xl border border-neutral-200">
                <div className="flex flex-wrap items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400 ml-2" />
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs font-bold outline-none w-28 text-neutral-700 bg-transparent" />
                    <span className="text-neutral-300">/</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs font-bold outline-none w-28 text-neutral-700 bg-transparent" />
                    
                    <button 
                        onClick={() => loadChart()} 
                        disabled={isLoading}
                        className="bg-neutral-900 text-white px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1.5"
                    >
                        {isLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : null}
                        Filtrar
                    </button>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={handleExportCsv}
                        className="bg-white text-neutral-800 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border border-neutral-200 hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
                        title="Exportar dados do gráfico em CSV"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Exportar CSV
                    </button>
                </div>
            </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-neutral-50/30">
        {/* Chart Area */}
        <div className="flex-1 p-4 sm:p-6 flex flex-col lg:border-r lg:border-neutral-200 min-w-0">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-neutral-200 shadow-sm flex-1 flex flex-col overflow-hidden relative min-h-0">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-indigo-600 bg-white px-6 py-3 rounded-2xl shadow-xl border border-indigo-100">
                            <RefreshCw className="w-5 h-5 animate-spin" />
                            <span className="text-sm font-black uppercase tracking-widest">Carregando dados...</span>
                        </div>
                    </div>
                )}
                
                <div className="flex-1 overflow-y-auto p-6">
                    {error ? (
                        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                            {error}
                        </div>
                    ) : (
                        <div className="mx-auto w-full max-w-[1100px] space-y-4">
                            {chartDefinition ? (
                              <ChartInsightOverview chartId={chartId} title={title} />
                            ) : (
                              <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                <div className="rounded-2xl bg-blue-50/70 p-4">
                                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                                    O que este gráfico mostra
                                  </p>
                                  <div className="mt-2 text-sm leading-6 text-neutral-700">
                                    <MarkdownLite content={description} />
                                  </div>
                                </div>
                              </div>
                            )}

                            <SalesBudgetChartRenderer
                              chart={chart}
                              isLoading={isLoading}
                              accentColor={chartMeta?.accentColor}
                            />

                            <ChartQueryDetailsPanel
                              isOpen={isQueriesOpen}
                              onToggle={(next) => setIsQueriesOpen(next)}
                              isLoading={isLoadingQueryDetails}
                              details={queryDetails}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Resizer */}
        <div 
            className="hidden lg:flex w-2 shrink-0 bg-transparent hover:bg-indigo-500/20 active:bg-indigo-500/40 cursor-col-resize items-center justify-center group transition-colors relative z-20"
            onPointerDown={(e) => {
                e.preventDefault();
                setIsResizingChat(true);
                resizeStartRef.current = {
                    startX: e.clientX,
                    startWidth: chatWidthPx,
                };
            }}
        >
            <div className="w-1 h-8 rounded-full bg-neutral-300 group-hover:bg-indigo-400 group-active:bg-indigo-600 transition-colors" />
        </div>

        {/* Chat Area */}
        <div 
            className="shrink-0 flex flex-col bg-white border-t lg:border-t-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] transition-[width]"
            style={{ width: `${chatWidthPx}px` }}
        >
            <div className="h-14 border-b border-neutral-100 flex items-center justify-between px-5 shrink-0 bg-gradient-to-r from-indigo-50/30 to-transparent">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-indigo-900 flex items-center gap-2">
                    <MessageSquareText className="w-4 h-4 text-indigo-500" />
                    Conversa com Especialista
                </h3>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end" title="Memória de Contexto Utilizada">
                        <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Contexto da IA</span>
                        <span className={`text-xs font-black ${contextUsage > 80 ? 'text-red-500' : contextUsage > 50 ? 'text-amber-500' : 'text-emerald-500'}`}>
                            {contextUsage}%
                        </span>
                    </div>
                </div>
            </div>

            {viewMode === "history" ? (
                <div className="flex-1 overflow-y-auto p-5 bg-neutral-50/50">
                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">Sessões Anteriores</h4>
                    {isLoadingSessions ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        </div>
                    ) : sessionsList.length === 0 ? (
                        <div className="text-center py-10">
                            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <History className="w-5 h-5 text-neutral-400" />
                            </div>
                            <p className="text-sm text-neutral-500">Nenhum histórico encontrado para este gráfico.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {sessionsList.map(session => (
                                <div key={session.id} className={`flex items-start justify-between gap-3 p-3 rounded-xl border transition-all ${currentSessionId === session.id ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-neutral-200 bg-white hover:border-indigo-300'}`}>
                                    <button 
                                        onClick={() => loadMessages(session.id)}
                                        className="flex-1 text-left"
                                    >
                                        <p className="text-sm font-medium text-neutral-800 line-clamp-2 leading-snug">{session.title}</p>
                                        <p className="text-[10px] text-neutral-400 mt-1 uppercase tracking-wider font-bold">
                                            {new Date(session.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </button>
                                    <button 
                                        onClick={() => deleteSession(session.id)}
                                        className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                                        title="Excluir conversa"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div 
                        className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6"
                        ref={scrollRef}
                    >
                        {!hasAsked && messages.length <= 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3">
                                    <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-900">Insights Relacionados</h4>
                                        <p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">
                                            Os insights relacionados aparecerão junto com a resposta contextual da IA.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map((message, i) => (
                            <div 
                                key={message.id} 
                                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}
                                style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                            >
                                {message.role === 'assistant' && (
                                    <div className="shrink-0 mt-0.5">
                                        <MiaAvatar size={32} />
                                    </div>
                                )}
                                <div className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                                    <div 
                                        className={`rounded-2xl px-4 py-3 ${
                                            message.role === 'user' 
                                                ? 'bg-neutral-900 text-white rounded-tr-sm' 
                                                : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-sm shadow-sm'
                                        }`}
                                    >
                                        {message.role === 'assistant' ? (
                                            <div className="prose prose-sm prose-neutral max-w-none">
                                                <MarkdownLite content={message.content} />
                                            </div>
                                        ) : (
                                            <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                        )}
                                        
                                        {message.sqlQueries && <SqlViewer sqlQueries={message.sqlQueries} />}
                                    </div>
                                    
                                    {message.role === 'assistant' && message.exportId && (
                                        <div className="mt-2 ml-1">
	                                            <ExportButtons 
	                                                exportId={message.exportId}
	                                                exportTotal={message.exportTotal}
	                                                compact
	                                            />
                                        </div>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 mt-0.5">
                                        <User className="w-4 h-4 text-neutral-500" />
                                    </div>
                                )}
                            </div>
                        ))}
                        
                        {isTyping && (
                            <div className="flex gap-3 animate-in fade-in">
                                <div className="shrink-0">
                                    <MiaAvatar size={32} />
                                </div>
                                <div className="bg-white border border-neutral-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex gap-1.5 items-center">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white border-t border-neutral-100 shrink-0">
                        <form 
                            onSubmit={handleSend}
                            className="relative flex items-end bg-neutral-50 rounded-2xl border border-neutral-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm"
                        >
	                            <textarea
	                                value={input}
	                                onChange={(e) => setInput(e.target.value)}
	                                placeholder="Deseja saber mais sobre estes dados?"
	                                disabled={!chart || !!error || isTyping || isLoading}
	                                className="w-full bg-transparent border-none focus:ring-0 resize-none py-3.5 px-4 text-[13px] text-neutral-800 placeholder-neutral-400 min-h-[52px] max-h-32"
	                                rows={1}
	                                onKeyDown={(e) => {
	                                    if (e.key === 'Enter' && !e.shiftKey) {
	                                        e.preventDefault();
	                                        handleSend();
	                                    }
	                                }}
	                            />
                            <div className="p-2 shrink-0">
	                                <button
	                                    type="submit"
	                                    disabled={!chart || !!error || !input.trim() || isTyping || isLoading}
	                                    className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-sm"
	                                >
	                                    <Send className="w-4 h-4" />
	                                </button>
                            </div>
                        </form>
                        <p className="text-center text-[10px] text-neutral-400 mt-2 font-medium">
                            IA Especialista em Análise de Vendas. Pode cometer erros.
                        </p>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
