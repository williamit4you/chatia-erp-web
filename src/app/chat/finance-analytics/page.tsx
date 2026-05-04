"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import financeAnalyticsService, {
    AdvancedDashboard,
    AiAnalysisData,
    FinanceSummary,
    MonthlyFlow,
} from "@/services/finance-analytics.service";

import AdvancedKpiCards from "@/components/finance/AdvancedKpiCards";
import AgingChart from "@/components/finance/AgingChart";
import AiAnalysisPanel from "@/components/finance/AiAnalysisPanel";
import BrazilUfMapChart from "@/components/finance/BrazilUfMapChart";
import CashProjectionChart from "@/components/finance/CashProjectionChart";
import ChartAnalysisView from "@/components/finance/ChartAnalysisView";
import ChartPatternLegend from "@/components/finance/ChartPatternLegend";
import DailyBalanceChart from "@/components/finance/DailyBalanceChart";
import DashboardSection from "@/components/finance/DashboardSection";
import DashboardWidget from "@/components/finance/DashboardWidget";
import DistributionBarChart from "@/components/finance/DistributionBarChart";
import DistributionPieChart from "@/components/finance/DistributionPieChart";
import EfficiencyKpiCards from "@/components/finance/EfficiencyKpiCards";
import FinanceSummaryCards from "@/components/finance/FinanceSummaryCards";
import MonthlyEvolutionChart from "@/components/finance/MonthlyEvolutionChart";
import MonthlyFlowChart from "@/components/finance/MonthlyFlowChart";
import SectionChartGrid from "@/components/finance/SectionChartGrid";
import TopAccountsList from "@/components/finance/TopAccountsList";
import { dashboardThemes, DashboardThemeKey } from "@/components/finance/dashboardThemes";

import { AlertCircle, Calendar } from "lucide-react";

interface WidgetConfig {
    id: string;
    name: string;
}

type FilterMode = "all" | "payable" | "receivable";

type DashboardGroup = {
    number: number;
    title: string;
    description: string;
    theme: DashboardThemeKey;
    variant: "cards" | "charts" | "wide" | "compact" | "analysis";
    widgetIds: string[];
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: "kpis", name: "KPIs Basicos e Detalhados" },
    { id: "summary", name: "Cards de Resumo" },
    { id: "flow", name: "Fluxo Mensal Consolidado" },
    { id: "projection", name: "Previsao 30 Dias" },
    { id: "aging", name: "Aging (Atraso)" },
    { id: "ai", name: "Analise Inteligente" },
    { id: "performance", name: "Performance Pagto" },
    { id: "dist_pag_fornecedor", name: "Pagar: Por Fornecedor" },
    { id: "geo_pagar", name: "Pagar: Por UF" },
    { id: "dist_tipo_pag", name: "Pagar: Tipo Pagamento" },
    { id: "dist_cond_pag", name: "Pagar: Condicao Pagto" },
    { id: "evolucao_pag", name: "Pagar: Evolucao" },
    { id: "curva_pag", name: "Pagar: Curva Venc." },
    { id: "top_pag", name: "Pagar: Top 10" },
    { id: "faixa_pag", name: "Pagar: Faixa Valor" },
    { id: "dist_rec_cliente", name: "Receber: Por Cliente" },
    { id: "geo_receber", name: "Receber: Por UF" },
    { id: "evolucao_rec", name: "Receber: Evolucao" },
    { id: "curva_rec", name: "Receber: Curva Venc." },
    { id: "top_rec", name: "Receber: Top 10" },
    { id: "faixa_rec", name: "Receber: Faixa Valor" },
    { id: "efficiency_kpis", name: "Gestao: KPIs Eficiencia" },
    { id: "vol_dia_mes", name: "Gestao: Vol. por Dia" },
    { id: "vol_dia_semana", name: "Gestao: Vol. por Dia da Semana" },
    { id: "liq_empresa", name: "Gestao: Liq. por Empresa" },
    { id: "fluxo_diario_proj", name: "Gestao: Fluxo Diario Proj." },
    { id: "vol_cpf_cnpj", name: "Gestao: Vol. por CPF/CNPJ" },
    { id: "saldo_acumulado", name: "Gestao: Saldo Acumulado" },
    { id: "dist_faixa_prazo", name: "Gestao: Faixas de Prazo" },
    { id: "pm_rec_cli", name: "F3: PM Rec. por Cliente" },
    { id: "pm_pag_for", name: "F3: PM Pag. por Fornecedor" },
    { id: "tm_rec_cli", name: "F3: Ticket Medio/Cliente" },
    { id: "tm_pag_for", name: "F3: Ticket Medio/Fornecedor" },
    { id: "docs_cli", name: "F3: Docs por Cliente" },
    { id: "docs_for", name: "F3: Docs por Fornecedor" },
];

const PAYABLE_WIDGETS = [
    "dist_pag_fornecedor",
    "geo_pagar",
    "dist_tipo_pag",
    "dist_cond_pag",
    "evolucao_pag",
    "curva_pag",
    "top_pag",
    "faixa_pag",
    "pm_pag_for",
    "tm_pag_for",
    "docs_for",
];

const RECEIVABLE_WIDGETS = [
    "aging",
    "performance",
    "dist_rec_cliente",
    "geo_receber",
    "evolucao_rec",
    "curva_rec",
    "top_rec",
    "faixa_rec",
    "pm_rec_cli",
    "tm_rec_cli",
    "docs_cli",
];

const DASHBOARD_GROUPS: DashboardGroup[] = [
    {
        number: 1,
        title: "Visao Geral - Resumo Executivo",
        description: "Resumo financeiro, KPIs basicos, fluxo consolidado e projecoes principais.",
        theme: "general",
        variant: "wide",
        widgetIds: ["summary", "kpis", "flow", "projection", "saldo_acumulado", "ai"],
    },
    {
        number: 2,
        title: "Contas a Pagar",
        description: "Despesas, vencimentos, fornecedores, faixas de valor e condicoes de pagamento.",
        theme: "payable",
        variant: "analysis",
        widgetIds: [
            "evolucao_pag",
            "curva_pag",
            "dist_pag_fornecedor",
            "top_pag",
            "faixa_pag",
            "geo_pagar",
            "dist_tipo_pag",
            "dist_cond_pag",
        ],
    },
    {
        number: 3,
        title: "Contas a Receber",
        description: "Receitas, clientes, vencimentos, performance de recebimento e aging.",
        theme: "receivable",
        variant: "charts",
        widgetIds: [
            "evolucao_rec",
            "curva_rec",
            "dist_rec_cliente",
            "top_rec",
            "faixa_rec",
            "geo_receber",
            "performance",
            "aging",
        ],
    },
    {
        number: 4,
        title: "Fluxo de Caixa e Projecoes",
        description: "Gestao do fluxo projetado, volume por dia, prazo, liquidez e documentos.",
        theme: "cashflow",
        variant: "compact",
        widgetIds: ["fluxo_diario_proj", "vol_dia_mes", "vol_dia_semana", "dist_faixa_prazo", "liq_empresa", "vol_cpf_cnpj"],
    },
    {
        number: 5,
        title: "Analise por Cliente / Fornecedor",
        description: "Prazo medio, ticket medio e documentos por cliente ou fornecedor.",
        theme: "analysis",
        variant: "charts",
        widgetIds: ["pm_rec_cli", "pm_pag_for", "tm_rec_cli", "tm_pag_for", "docs_cli", "docs_for"],
    },
    {
        number: 6,
        title: "Gestao - KPIs Eficiencia Financeira",
        description: "Indicadores avancados de risco, eficiencia, concentracao e operacao financeira.",
        theme: "efficiency",
        variant: "cards",
        widgetIds: ["efficiency_kpis"],
    },
];

export default function FinanceAnalyticsDashboard() {
    const { data: session } = useSession();

    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [monthlyFlow, setMonthlyFlow] = useState<MonthlyFlow[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisData | null>(null);
    const [advanced, setAdvanced] = useState<AdvancedDashboard | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [analysisChartId, setAnalysisChartId] = useState<string | null>(null);
    const [filterMode, setFilterMode] = useState<FilterMode>("all");
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

    const userId = session?.user?.id || "default";

    const fetchData = async (start?: string, end?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, flowData, aiData, advancedData] = await Promise.all([
                financeAnalyticsService.getSummary(start, end),
                financeAnalyticsService.getMonthlyFlow(start, end),
                financeAnalyticsService.getAiAnalysisData(start, end),
                financeAnalyticsService.getAdvancedAnalytics(start, end),
            ]);
            setSummary(summaryData);
            setMonthlyFlow(flowData);
            setAiAnalysis(aiData);
            setAdvanced(advancedData);
        } catch (err: unknown) {
            console.error(err);
            setError("Erro ao carregar dados financeiros.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);

        if (!session) return;

        const user = session.user as any;
        const currentUserId = user.id || "default";
        const isAdmin = user.role === "TENANT_ADMIN" || user.role === "SUPER_ADMIN" || user.role === "ADMIN";
        const hasAnyAccess =
            isAdmin ||
            user.hasPayableDashboardAccess ||
            user.hasReceivableDashboardAccess ||
            user.hasBankingDashboardAccess;

        if (!hasAnyAccess) {
            window.location.href = "/chat";
            return;
        }

        const availableWidgets = DEFAULT_WIDGETS.filter((widget) => {
            if (isAdmin) return true;
            if (RECEIVABLE_WIDGETS.includes(widget.id) && !user.hasReceivableDashboardAccess) return false;
            if (PAYABLE_WIDGETS.includes(widget.id) && !user.hasPayableDashboardAccess) return false;
            return true;
        });

        setWidgets(availableWidgets);

        const savedFilterMode = localStorage.getItem(`finance_v5_filter_mode_${currentUserId}`);
        if (savedFilterMode === "all" || savedFilterMode === "payable" || savedFilterMode === "receivable") {
            setFilterMode(savedFilterMode);
        }

        fetchData(startDate, endDate);
    }, [session]);

    const availableWidgetIds = useMemo(() => new Set(widgets.map((widget) => widget.id)), [widgets]);

    const isWidgetVisible = (id: string) => {
        if (!availableWidgetIds.has(id)) return false;
        if (filterMode === "payable" && RECEIVABLE_WIDGETS.includes(id)) return false;
        if (filterMode === "receivable" && PAYABLE_WIDGETS.includes(id)) return false;
        return true;
    };

    const applyFilterMode = (mode: FilterMode) => {
        setFilterMode(mode);
        localStorage.setItem(`finance_v5_filter_mode_${userId}`, mode);
    };

    const handleFilter = () => fetchData(startDate, endDate);

    const getWidgetInfo = (id: string) => {
        const descriptions: Record<string, string> = {
            kpis: "Visao geral dos principais indicadores de saude financeira, incluindo score, DSO e prazos medios.",
            summary: "Resumo consolidado dos valores totais a pagar, a receber e saldo projetado.",
            flow: "Comparativo mensal entre valores recebidos, pagos e previsoes de entradas.",
            projection: "Projecao detalhada de saldo e fluxo financeiro para os proximos 30 dias.",
            aging: "Analise de documentos vencidos distribuidos por faixas de atraso.",
            ai: "Insights gerados automaticamente pela IA baseados em tendencias dos dados.",
            performance: "Mede a pontualidade dos recebimentos historicos.",
            dist_pag_fornecedor: "Identifica quais fornecedores concentram a maior parte das despesas em aberto.",
            geo_pagar: "Distribuicao geografica das obrigacoes financeiras por estado.",
            dist_tipo_pag: "Analise dos metodos de pagamento mais utilizados.",
            dist_cond_pag: "Distribuicao das condicoes de parcelamento negociadas com fornecedores.",
            evolucao_pag: "Demonstra o volume de pagamentos realizados mes a mes.",
            curva_pag: "Visualizacao temporal do volume a pagar futuro.",
            top_pag: "Lista dos 10 maiores documentos individuais pendentes de pagamento.",
            faixa_pag: "Distribuicao dos titulos a pagar por faixas de valor.",
            dist_rec_cliente: "Identifica a concentracao de receita em clientes especificos.",
            geo_receber: "Distribuicao geografica das receitas por estado.",
            evolucao_rec: "Evolucao mensal do volume total de recebimentos efetuados.",
            curva_rec: "Visualizacao temporal do volume a receber futuro.",
            top_rec: "Lista dos 10 maiores recebiveis individuais em aberto.",
            faixa_rec: "Distribuicao dos titulos a receber por faixas de valor.",
            efficiency_kpis: "Indicadores avancados de performance, risco e eficiencia operacional.",
            vol_dia_mes: "Volume total de movimentacao diaria para identificar picos de carga mensal.",
            liq_empresa: "Indice de liquidez segregado por unidade de negocio ou filial.",
            fluxo_diario_proj: "Projecao de saldo acumulado dia a dia nos proximos 30 dias.",
            vol_cpf_cnpj: "Volume transacionado por identificador de documento.",
            dist_faixa_prazo: "Agrupamento de documentos pelo tempo restante ate o vencimento.",
            pm_rec_cli: "Prazo medio que cada cliente leva para efetuar o pagamento.",
            pm_pag_for: "Prazo medio de pagamento para fornecedores especificos.",
            tm_rec_cli: "Valor medio por documento faturado para cada cliente.",
            tm_pag_for: "Valor medio das compras realizadas com cada fornecedor.",
            docs_cli: "Quantidade total de documentos ativos ou liquidados por cliente.",
            docs_for: "Quantidade total de documentos gerados por fornecedor.",
        };

        return {
            title: widgets.find((widget) => widget.id === id)?.name || "Analise de Grafico",
            description: descriptions[id] || "Esta analise permite visualizar o comportamento dos dados financeiros.",
            data: advanced ? (advanced as any)[id] || advanced.saudeFinanceira : null,
        };
    };

    const widgetFrameClass = (id: string) => {
        if (["summary", "kpis", "ai"].includes(id)) return "xl:col-span-2";
        if (id === "efficiency_kpis") return "";
        if (["flow", "projection", "saldo_acumulado"].includes(id)) return "min-h-[410px]";
        return "min-h-[390px]";
    };

    const toBarData = (items?: Array<{ label?: string; mesAno?: string; valor: number }>) =>
        items?.map((item) => ({ label: item.label || item.mesAno || "", valor: item.valor })) || [];

    const getWeekdayVolumeData = () => {
        const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
        const totals = new Array(7).fill(0) as number[];

        advanced?.volumePorDia?.forEach((item) => {
            const day = Number.parseInt(String(item.label).replace(/\D/g, ""), 10);
            if (!Number.isFinite(day) || day < 1) return;

            const referenceDate = new Date(2024, 0, day);
            totals[referenceDate.getDay()] += item.valor;
        });

        return [1, 2, 3, 4, 5, 6, 0].map((dayIndex) => ({
            label: labels[dayIndex],
            valor: totals[dayIndex],
        }));
    };

    const renderWidgetContent = (id: string) => {
        const payableTheme = dashboardThemes.payable;
        const receivableTheme = dashboardThemes.receivable;
        const cashflowTheme = dashboardThemes.cashflow;
        const analysisTheme = dashboardThemes.analysis;

        switch (id) {
            case "kpis":
                return <AdvancedKpiCards data={advanced?.saudeFinanceira || null} isLoading={isLoading} />;
            case "summary":
                return <FinanceSummaryCards data={summary} isLoading={isLoading} />;
            case "flow":
                return <MonthlyFlowChart data={monthlyFlow} isLoading={isLoading} />;
            case "projection":
                return <CashProjectionChart data={advanced?.previsaoCaixa || []} isLoading={isLoading} />;
            case "aging":
                return <AgingChart data={advanced?.aging || []} isLoading={isLoading} />;
            case "ai":
                return <AiAnalysisPanel data={aiAnalysis} isLoading={isLoading} />;
            case "performance":
                return (
                    <DistributionPieChart
                        title=""
                        data={advanced?.performanceRecebimento?.map((item) => ({ label: item.categoria, valor: item.valor, percentual: 0 })) || []}
                        isLoading={isLoading}
                        colors={receivableTheme.chartPalette}
                    />
                );
            case "dist_pag_fornecedor":
                return (
                    <DistributionBarChart
                        data={advanced?.distribuicaoPagarFornecedor || []}
                        isLoading={isLoading}
                        color={payableTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                    />
                );
            case "geo_pagar":
                return (
                    <BrazilUfMapChart data={advanced?.geograficoPagar || []} isLoading={isLoading} color={payableTheme.primary} />
                );
            case "dist_tipo_pag":
                return <DistributionPieChart title="" data={advanced?.distribuicaoTipoPagamento || []} isLoading={isLoading} colors={payableTheme.chartPalette} />;
            case "dist_cond_pag":
                return <DistributionPieChart title="" data={advanced?.distribuicaoCondicaoPagamento || []} isLoading={isLoading} colors={payableTheme.chartPalette} maxItems={6} />;
            case "faixa_pag":
                return <DistributionBarChart data={advanced?.distribuicaoFaixaValorPagar || []} isLoading={isLoading} color={payableTheme.primary} maxItems={6} />;
            case "evolucao_pag":
                return <MonthlyEvolutionChart title="" data={advanced?.evolucaoMensalPagamento || []} isLoading={isLoading} color={payableTheme.primary} fillColor={payableTheme.primary} dataKey="valor" />;
            case "curva_pag":
                return <DistributionBarChart data={toBarData(advanced?.curvaVencimentoPagar)} isLoading={isLoading} color={payableTheme.primary} maxItems={8} />;
            case "top_pag":
                return <DistributionPieChart title="" data={advanced?.distribuicaoPagarFornecedor || []} isLoading={isLoading} colors={payableTheme.chartPalette} maxItems={6} />;
            case "dist_rec_cliente":
                return (
                    <DistributionBarChart
                        data={advanced?.distribuicaoReceberCliente || []}
                        isLoading={isLoading}
                        color={receivableTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                    />
                );
            case "geo_receber":
                return (
                    <BrazilUfMapChart data={advanced?.geograficoReceber || []} isLoading={isLoading} color={receivableTheme.primary} />
                );
            case "faixa_rec":
                return <DistributionBarChart data={advanced?.distribuicaoFaixaValorReceber || []} isLoading={isLoading} color={receivableTheme.primary} maxItems={6} />;
            case "evolucao_rec":
                return <MonthlyEvolutionChart title="" data={advanced?.evolucaoMensalRecebimento || []} isLoading={isLoading} color={receivableTheme.primary} fillColor={receivableTheme.primary} dataKey="valor" />;
            case "curva_rec":
                return <DistributionBarChart data={toBarData(advanced?.curvaVencimentoReceber)} isLoading={isLoading} color={receivableTheme.primary} maxItems={8} />;
            case "top_rec":
                return <DistributionPieChart title="" data={advanced?.distribuicaoReceberCliente || []} isLoading={isLoading} colors={receivableTheme.chartPalette} maxItems={6} />;
            case "efficiency_kpis":
                return <EfficiencyKpiCards data={advanced?.saudeFinanceira || null} isLoading={isLoading} />;
            case "vol_dia_mes":
                return <DistributionPieChart title="" data={advanced?.volumePorDia || []} isLoading={isLoading} colors={cashflowTheme.chartPalette} />;
            case "vol_dia_semana":
                return <DistributionBarChart data={getWeekdayVolumeData()} isLoading={isLoading} color={cashflowTheme.primary} maxItems={7} preserveOrder />;
            case "liq_empresa":
                return (
                    <DistributionBarChart
                        data={advanced?.indiceLiquidezPorEmpresa || []}
                        isLoading={isLoading}
                        color={cashflowTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                        showZeroLine
                    />
                );
            case "fluxo_diario_proj":
                return <DailyBalanceChart data={advanced?.fluxoCaixaDiarioProjetado || []} isLoading={isLoading} color={cashflowTheme.primary} />;
            case "vol_cpf_cnpj":
                return (
                    <DistributionBarChart
                        data={advanced?.volumePorCpfCnpj || []}
                        isLoading={isLoading}
                        color={cashflowTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                    />
                );
            case "saldo_acumulado":
                return <DailyBalanceChart data={advanced?.evolucaoSaldo?.map((item: any) => ({ ano: 2024, mes: 1, valor: item.saldoAcumulado, mesAno: item.data.toString().split("T")[0] })) || []} isLoading={isLoading} color="#10b981" />;
            case "dist_faixa_prazo":
                return <DistributionBarChart data={advanced?.distribuicaoFaixaPrazoVencimento || []} isLoading={isLoading} color={cashflowTheme.primary} maxItems={6} />;
            case "pm_rec_cli":
                return <DistributionBarChart data={advanced?.prazoMedioRecebimentoPorCliente || []} isLoading={isLoading} color={analysisTheme.primary} />;
            case "pm_pag_for":
                return <DistributionBarChart data={advanced?.prazoMedioPagamentoPorFornecedor || []} isLoading={isLoading} color={analysisTheme.primary} />;
            case "tm_rec_cli":
                return <DistributionBarChart data={advanced?.ticketMedioPorCliente || []} isLoading={isLoading} color={analysisTheme.primary} />;
            case "tm_pag_for":
                return <DistributionBarChart data={advanced?.ticketMedioPorFornecedor || []} isLoading={isLoading} color={analysisTheme.primary} />;
            case "docs_cli":
                return <DistributionBarChart data={advanced?.documentosPorClienteAtivo || []} isLoading={isLoading} color={analysisTheme.primary} />;
            case "docs_for":
                return <DistributionBarChart data={advanced?.documentosPorFornecedorAtivo || []} isLoading={isLoading} color={analysisTheme.primary} />;
            default:
                return null;
        }
    };

    const renderWidget = (id: string, onlyContent = false) => {
        const widget = widgets.find((item) => item.id === id);
        if (!widget) return null;

        const content = renderWidgetContent(id);
        if (onlyContent) return <div className="flex min-h-[500px] w-full flex-col">{content}</div>;

        return (
            <div key={id} className={widgetFrameClass(id)}>
                <DashboardWidget id={id} title={widget.name} onAnalyze={setAnalysisChartId}>
                    {content}
                </DashboardWidget>
            </div>
        );
    };

    if (!mounted) return null;

    return (
        <div className="flex-1 overflow-auto bg-neutral-50/70 scroll-smooth">
            <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
                <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                    <div>
                        <div className="mb-1 flex items-center gap-2">
                            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                                Dashboard Financeiro
                            </h1>
                            <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_2px_10px_-3px_rgba(37,99,235,0.5)]">
                                GRUPOS
                            </span>
                        </div>
                        <p className="text-sm font-medium text-neutral-500">
                            Graficos e KPIs organizados por visao, tema e modulo financeiro.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 p-1 shadow-sm">
                            <button
                                onClick={() => applyFilterMode("all")}
                                className={`rounded-lg px-4 py-1.5 text-xs font-black transition-all ${filterMode === "all" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => applyFilterMode("payable")}
                                className={`rounded-lg px-4 py-1.5 text-xs font-black transition-all ${filterMode === "payable" ? "bg-orange-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                            >
                                Pagar
                            </button>
                            <button
                                onClick={() => applyFilterMode("receivable")}
                                className={`rounded-lg px-4 py-1.5 text-xs font-black transition-all ${filterMode === "receivable" ? "bg-green-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                            >
                                Receber
                            </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-sm">
                            <div className="flex items-center gap-2 px-3 sm:border-r sm:border-neutral-100">
                                <Calendar className="h-4 w-4 text-neutral-400" />
                                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-28 text-xs font-bold text-neutral-700 outline-none" />
                                <span className="text-neutral-300">/</span>
                                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="w-28 text-xs font-bold text-neutral-700 outline-none" />
                            </div>
                            <button onClick={handleFilter} className="rounded-lg bg-neutral-900 px-5 py-1.5 text-xs font-black uppercase text-white transition-colors hover:bg-black">
                                Atualizar
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 flex items-center gap-4 rounded-r-xl border-l-4 border-red-500 bg-red-50 p-4 text-red-700">
                        <AlertCircle className="h-6 w-6 shrink-0" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                <div className="space-y-6">
                    {DASHBOARD_GROUPS.map((group) => {
                        const visibleWidgetIds = group.widgetIds.filter(isWidgetVisible);
                        if (visibleWidgetIds.length === 0) return null;

                        return (
                            <DashboardSection
                                key={group.number}
                                number={group.number}
                                title={group.title}
                                description={group.description}
                                theme={group.theme}
                            >
                                <SectionChartGrid variant={group.variant}>
                                    {visibleWidgetIds.map((id) => renderWidget(id))}
                                </SectionChartGrid>
                            </DashboardSection>
                        );
                    })}

                    <ChartPatternLegend />
                </div>
            </div>

            {analysisChartId && (
                <ChartAnalysisView
                    id={analysisChartId}
                    {...getWidgetInfo(analysisChartId)}
                    chartComponent={renderWidget(analysisChartId, true)}
                    onClose={() => setAnalysisChartId(null)}
                    initialStartDate={startDate}
                    initialEndDate={endDate}
                    onDateChange={async (start, end) => {
                        setStartDate(start);
                        setEndDate(end);
                        await fetchData(start, end);
                    }}
                />
            )}
        </div>
    );
}
