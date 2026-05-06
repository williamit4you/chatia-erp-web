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
import ChartDetailsModal from "@/components/finance/ChartDetailsModal";
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
import { getChartDetail } from "@/lib/chartDetails";
import { adminService } from "@/services/admin.service";

import { AlertCircle, BookOpenText, Calendar } from "lucide-react";

interface WidgetConfig {
    id: string;
    name: string;
}

type DashboardScope = "all" | "payable" | "receivable";

type DashboardTabKey = "overview" | "view1" | "view2" | "view3" | "view4" | "view5" | "view6";

type DashboardGroup = {
    number: number;
    title: string;
    description: string;
    theme: DashboardThemeKey;
    variant: "cards" | "charts" | "wide" | "compact" | "analysis";
    widgetIds: string[];
};

type DashboardTab = {
    key: DashboardTabKey;
    label: string;
    groupNumbers: number[];
};

type ScopeOption = {
    key: DashboardScope;
    label: string;
};

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: "kpis", name: "KPIs Básicos e Detalhados" },
    { id: "summary", name: "Cards de Resumo" },
    { id: "flow", name: "Fluxo Mensal Consolidado" },
    { id: "projection", name: "Previsão 30 Dias" },
    { id: "aging", name: "Aging (Atraso)" },
    { id: "ai", name: "Análise Inteligente" },
    { id: "performance", name: "Performance Pagto" },
    { id: "dist_pag_fornecedor", name: "Pagar: Por Fornecedor" },
    { id: "geo_pagar", name: "Pagar: Por UF" },
    { id: "dist_tipo_pag", name: "Pagar: Tipo Pagamento" },
    { id: "dist_cond_pag", name: "Pagar: Condição Pagto" },
    { id: "evolucao_pag", name: "Pagar: Evolução" },
    { id: "curva_pag", name: "Pagar: Curva Venc." },
    { id: "top_pag", name: "Pagar: Top 10" },
    { id: "faixa_pag", name: "Pagar: Faixa Valor" },
    { id: "dist_rec_cliente", name: "Receber: Por Cliente" },
    { id: "geo_receber", name: "Receber: Por UF" },
    { id: "evolucao_rec", name: "Receber: Evolução" },
    { id: "curva_rec", name: "Receber: Curva Venc." },
    { id: "top_rec", name: "Receber: Top 10" },
    { id: "faixa_rec", name: "Receber: Faixa Valor" },
    { id: "efficiency_kpis", name: "Gestão: KPIs Eficiência" },
    { id: "vol_dia_mes", name: "Gestão: Vol. por Dia" },
    { id: "vol_dia_semana", name: "Gestão: Vol. por Dia da Semana" },
    { id: "liq_empresa", name: "Gestão: Líq. por Empresa" },
    { id: "fluxo_diario_proj", name: "Gestão: Fluxo Diário Proj." },
    { id: "vol_cpf_cnpj", name: "Gestão: Vol. por CPF/CNPJ" },
    { id: "saldo_acumulado", name: "Gestão: Saldo Acumulado" },
    { id: "dist_faixa_prazo", name: "Gestão: Faixas de Prazo" },
    { id: "pm_rec_cli", name: "F3: PM Rec. por Cliente" },
    { id: "pm_pag_for", name: "F3: PM Pag. por Fornecedor" },
    { id: "tm_rec_cli", name: "F3: Ticket Médio/Cliente" },
    { id: "tm_pag_for", name: "F3: Ticket Médio/Fornecedor" },
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
        title: "Visão Geral - Resumo Executivo",
        description: "Resumo financeiro, KPIs básicos, fluxo consolidado e projeções principais.",
        theme: "general",
        variant: "wide",
        widgetIds: ["summary", "kpis", "flow", "projection", "saldo_acumulado", "ai"],
    },
    {
        number: 2,
        title: "Contas a Pagar",
        description: "Despesas, vencimentos, fornecedores, faixas de valor e condições de pagamento.",
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
        title: "Fluxo de Caixa e Projeções",
        description: "Gestão do fluxo projetado, volume por dia, prazo, liquidez e documentos.",
        theme: "cashflow",
        variant: "compact",
        widgetIds: ["fluxo_diario_proj", "vol_dia_mes", "vol_dia_semana", "dist_faixa_prazo", "liq_empresa", "vol_cpf_cnpj"],
    },
    {
        number: 5,
        title: "Análise por Cliente / Fornecedor",
        description: "Prazo médio, ticket médio e documentos por cliente ou fornecedor.",
        theme: "analysis",
        variant: "charts",
        widgetIds: ["pm_rec_cli", "pm_pag_for", "tm_rec_cli", "tm_pag_for", "docs_cli", "docs_for"],
    },
    {
        number: 6,
        title: "Gestão - KPIs Eficiência Financeira",
        description: "Indicadores avançados de risco, eficiência, concentração e operação financeira.",
        theme: "efficiency",
        variant: "cards",
        widgetIds: ["efficiency_kpis"],
    },
];

const DASHBOARD_TABS: DashboardTab[] = [
    { key: "overview", label: "Visão Geral", groupNumbers: [1, 2, 3, 4, 5, 6] },
    { key: "view1", label: "Resumo Executivo", groupNumbers: [1] },
    { key: "view2", label: "Contas a Pagar", groupNumbers: [2] },
    { key: "view3", label: "Contas a Receber", groupNumbers: [3] },
    { key: "view4", label: "Fluxo e Projeções", groupNumbers: [4] },
    { key: "view5", label: "Clientes e Fornecedores", groupNumbers: [5] },
    { key: "view6", label: "KPIs de Eficiência", groupNumbers: [6] },
];

const DASHBOARD_SCOPES: ScopeOption[] = [
    { key: "all", label: "Todos" },
    { key: "payable", label: "A Pagar" },
    { key: "receivable", label: "A Receber" },
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
    const [analysisStartDate, setAnalysisStartDate] = useState<string | null>(null);
    const [analysisEndDate, setAnalysisEndDate] = useState<string | null>(null);
    const [analysisIsLoading, setAnalysisIsLoading] = useState(false);
    const [analysisSummary, setAnalysisSummary] = useState<FinanceSummary | null>(null);
    const [analysisMonthlyFlow, setAnalysisMonthlyFlow] = useState<MonthlyFlow[] | null>(null);
    const [analysisAiAnalysis, setAnalysisAiAnalysis] = useState<AiAnalysisData | null>(null);
    const [analysisAdvanced, setAnalysisAdvanced] = useState<AdvancedDashboard | null>(null);
    const [chartDetailsModalState, setChartDetailsModalState] = useState<{
        title: string;
        entries: Array<{
            id: string;
            title: string;
            groupTitle: string;
            description?: string;
            detail: ReturnType<typeof getChartDetail>;
        }>;
    } | null>(null);
    const [isChartDetailsEnabled, setIsChartDetailsEnabled] = useState(false);
    const [activeScope, setActiveScope] = useState<DashboardScope>("all");
    const [activeTab, setActiveTab] = useState<DashboardTabKey>("overview");
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);

    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().split("T")[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split("T")[0]);

    const userId = session?.user?.id || "default";
    const userRole = (session?.user as any)?.role || "";
    const canManageChartDetails = userRole === "TENANT_ADMIN";

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

    const fetchAnalysisData = async (chartId: string, start?: string, end?: string) => {
        setAnalysisIsLoading(true);
        try {
            if (["summary"].includes(chartId)) {
                const s = await financeAnalyticsService.getSummary(start, end);
                setAnalysisSummary(s);
                setAnalysisMonthlyFlow(null);
                setAnalysisAiAnalysis(null);
                setAnalysisAdvanced(null);
                return;
            }

            if (["flow"].includes(chartId)) {
                const f = await financeAnalyticsService.getMonthlyFlow(start, end);
                setAnalysisMonthlyFlow(f);
                setAnalysisSummary(null);
                setAnalysisAiAnalysis(null);
                setAnalysisAdvanced(null);
                return;
            }

            if (["ai"].includes(chartId)) {
                const ai = await financeAnalyticsService.getAiAnalysisData(start, end);
                setAnalysisAiAnalysis(ai);
                setAnalysisSummary(null);
                setAnalysisMonthlyFlow(null);
                setAnalysisAdvanced(null);
                return;
            }

            // Default: charts derived from AdvancedDashboard
            const adv = await financeAnalyticsService.getAdvancedAnalytics(start, end);
            setAnalysisAdvanced(adv);
            setAnalysisSummary(null);
            setAnalysisMonthlyFlow(null);
            setAnalysisAiAnalysis(null);
        } catch (err) {
            console.error("Erro ao carregar dados do grÃ¡fico:", err);
        } finally {
            setAnalysisIsLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);

        if (!session) return;

        const user = session.user as any;
        const currentUserId = user.id || "default";
        const isAdmin = user.role === "TENANT_ADMIN" || user.role === "SUPER_ADMIN" || user.role === "ADMIN";
        const isTenantAdmin = user.role === "TENANT_ADMIN";
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
        setIsChartDetailsEnabled(Boolean(user.showChartDetails) && isTenantAdmin);

        const savedScope = localStorage.getItem(`finance_v5_dashboard_scope_${currentUserId}`);
        if (savedScope && DASHBOARD_SCOPES.some((scope) => scope.key === savedScope)) {
            setActiveScope(savedScope as DashboardScope);
        }

        const savedTab = localStorage.getItem(`finance_v5_dashboard_tab_${currentUserId}`);
        if (savedTab && DASHBOARD_TABS.some((tab) => tab.key === savedTab)) {
            setActiveTab(savedTab as DashboardTabKey);
        }

        fetchData(startDate, endDate);

        if (isTenantAdmin) {
            adminService
                .getSettings()
                .then((settings) => {
                    setIsChartDetailsEnabled(Boolean(settings?.showChartDetails));
                })
                .catch((error) => {
                    console.error("Erro ao carregar flag de detalhes dos gráficos:", error);
                });
        }
    }, [session]);

    const availableWidgetIds = useMemo(() => new Set(widgets.map((widget) => widget.id)), [widgets]);

    const isWidgetAllowedInScope = (id: string) => {
        const isPayableWidget = PAYABLE_WIDGETS.includes(id);
        const isReceivableWidget = RECEIVABLE_WIDGETS.includes(id);

        if (activeScope === "payable") return !isReceivableWidget;
        if (activeScope === "receivable") return !isPayableWidget;
        return true;
    };

    const isWidgetVisible = (id: string) => {
        if (!availableWidgetIds.has(id)) return false;
        return isWidgetAllowedInScope(id);
    };

    const applyDashboardScope = (scope: DashboardScope) => {
        setActiveScope(scope);
        localStorage.setItem(`finance_v5_dashboard_scope_${userId}`, scope);
    };

    const applyDashboardTab = (tab: DashboardTabKey) => {
        setActiveTab(tab);
        localStorage.setItem(`finance_v5_dashboard_tab_${userId}`, tab);
    };

    const visibleTabs = useMemo(() => {
        return DASHBOARD_TABS.filter((tab) =>
            tab.groupNumbers.some((groupNumber) => {
                const group = DASHBOARD_GROUPS.find((item) => item.number === groupNumber);
                return group ? group.widgetIds.some(isWidgetVisible) : false;
            })
        );
    }, [availableWidgetIds, widgets, activeScope]);

    useEffect(() => {
        if (!visibleTabs.some((tab) => tab.key === activeTab)) {
            setActiveTab("overview");
            localStorage.setItem(`finance_v5_dashboard_tab_${userId}`, "overview");
        }
    }, [activeTab, userId, visibleTabs]);

    const handleFilter = () => fetchData(startDate, endDate);
    const getWidgetData = (id: string) => {
        if (!advanced) {
            if (id === "summary") return summary;
            if (id === "flow") return monthlyFlow;
            if (id === "ai") return aiAnalysis;
            return null;
        }

        switch (id) {
            case "kpis":
            case "efficiency_kpis":
                return advanced.saudeFinanceira;
            case "summary":
                return summary;
            case "flow":
                return monthlyFlow;
            case "projection":
                return advanced.previsaoCaixa || [];
            case "aging":
                return advanced.aging || [];
            case "ai":
                return aiAnalysis;
            case "performance":
                return (
                    advanced.performanceRecebimento?.map((item) => ({ label: item.categoria, valor: item.valor, percentual: 0 })) || []
                );
            case "dist_pag_fornecedor":
                return advanced.distribuicaoPagarFornecedor || [];
            case "geo_pagar":
                return advanced.geograficoPagar || [];
            case "dist_tipo_pag":
                return advanced.distribuicaoTipoPagamento || [];
            case "dist_cond_pag":
                return advanced.distribuicaoCondicaoPagamento || [];
            case "evolucao_pag":
                return advanced.evolucaoMensalPagamento || [];
            case "curva_pag":
                return toBarData(advanced.curvaVencimentoPagar);
            case "top_pag":
                return advanced.topContasPagar || [];
            case "faixa_pag":
                return advanced.distribuicaoFaixaValorPagar || [];
            case "dist_rec_cliente":
                return advanced.distribuicaoReceberCliente || [];
            case "geo_receber":
                return advanced.geograficoReceber || [];
            case "evolucao_rec":
                return advanced.evolucaoMensalRecebimento || [];
            case "curva_rec":
                return toBarData(advanced.curvaVencimentoReceber);
            case "top_rec":
                return advanced.topContasReceber || [];
            case "faixa_rec":
                return advanced.distribuicaoFaixaValorReceber || [];
            case "vol_dia_mes":
                return advanced.volumePorDia || [];
            case "vol_dia_semana":
                return getWeekdayVolumeData();
            case "liq_empresa":
                return advanced.indiceLiquidezPorEmpresa || [];
            case "fluxo_diario_proj":
                return advanced.fluxoCaixaDiarioProjetado || [];
            case "vol_cpf_cnpj":
                return advanced.volumePorCpfCnpj || [];
            case "saldo_acumulado":
                return (
                    advanced.evolucaoSaldo?.map((item: any) => ({
                        ano: 2024,
                        mes: 1,
                        valor: item.saldoAcumulado,
                        mesAno: item.data.toString().split("T")[0],
                    })) || []
                );
            case "dist_faixa_prazo":
                return advanced.distribuicaoFaixaPrazoVencimento || [];
            case "pm_rec_cli":
                return advanced.prazoMedioRecebimentoPorCliente || [];
            case "pm_pag_for":
                return advanced.prazoMedioPagamentoPorFornecedor || [];
            case "tm_rec_cli":
                return advanced.ticketMedioPorCliente || [];
            case "tm_pag_for":
                return advanced.ticketMedioPorFornecedor || [];
            case "docs_cli":
                return advanced.documentosPorClienteAtivo || [];
            case "docs_for":
                return advanced.documentosPorFornecedorAtivo || [];
            default:
                return null;
        }
    };

    const getAnalysisWidgetData = (id: string) => {
        // If we have per-analysis state, use it; otherwise fall back to dashboard state.
        if (analysisSummary && id === "summary") return analysisSummary;
        if (analysisMonthlyFlow && id === "flow") return analysisMonthlyFlow;
        if (analysisAiAnalysis && id === "ai") return analysisAiAnalysis;

        const adv = analysisAdvanced || advanced;
        if (!adv) return getWidgetData(id);

        switch (id) {
            case "kpis":
            case "efficiency_kpis":
                return adv.saudeFinanceira;
            case "projection":
                return adv.previsaoCaixa || [];
            case "aging":
                return adv.aging || [];
            case "performance":
                return adv.performanceRecebimento || [];
            case "dist_pag_fornecedor":
                return adv.distribuicaoPagarFornecedor || [];
            case "geo_pagar":
                return adv.geograficoPagar || [];
            case "dist_tipo_pag":
                return adv.distribuicaoTipoPagamento || [];
            case "dist_cond_pag":
                return adv.distribuicaoCondicaoPagamento || [];
            case "evolucao_pag":
                return adv.evolucaoMensalPagamento || [];
            case "curva_pag":
                return adv.curvaVencimentoPagar || [];
            case "top_pag":
                return adv.topContasPagar || [];
            case "faixa_pag":
                return adv.distribuicaoFaixaValorPagar || [];
            case "dist_rec_cliente":
                return adv.distribuicaoReceberCliente || [];
            case "geo_receber":
                return adv.geograficoReceber || [];
            case "evolucao_rec":
                return adv.evolucaoMensalRecebimento || [];
            case "curva_rec":
                return adv.curvaVencimentoReceber || [];
            case "top_rec":
                return adv.topContasReceber || [];
            case "faixa_rec":
                return adv.distribuicaoFaixaValorReceber || [];
            case "vol_dia_mes":
                return adv.volumePorDia || [];
            case "liq_empresa":
                return adv.indiceLiquidezPorEmpresa || [];
            case "fluxo_diario_proj":
                return adv.fluxoCaixaDiarioProjetado || [];
            case "vol_cpf_cnpj":
                return adv.volumePorCpfCnpj || [];
            case "dist_faixa_prazo":
                return adv.distribuicaoFaixaPrazoVencimento || [];
            case "pm_rec_cli":
                return adv.prazoMedioRecebimentoPorCliente || [];
            case "pm_pag_for":
                return adv.prazoMedioPagamentoPorFornecedor || [];
            case "tm_rec_cli":
                return adv.ticketMedioPorCliente || [];
            case "tm_pag_for":
                return adv.ticketMedioPorFornecedor || [];
            case "docs_cli":
                return adv.documentosPorClienteAtivo || [];
            case "docs_for":
                return adv.documentosPorFornecedorAtivo || [];
            default:
                return getWidgetData(id);
        }
    };

    const getWidgetInfo = (id: string) => {
        const descriptions: Record<string, string> = {
            kpis: "Visão geral dos principais indicadores de saúde financeira, incluindo score, DSO e prazos médios.",
            summary: "Resumo consolidado dos valores totais a pagar, a receber e saldo projetado.",
            flow: "Comparativo mensal entre valores recebidos, pagos e previsoes de entradas.",
            projection: "Projecao detalhada de saldo e fluxo financeiro para os proximos 30 dias.",
            aging: "Análise de documentos vencidos distribuídos por faixas de atraso.",
            ai: "Insights gerados automaticamente pela IA baseados em tendencias dos dados.",
            performance: "Mede a pontualidade dos recebimentos historicos.",
            dist_pag_fornecedor: "Identifica quais fornecedores concentram a maior parte das despesas em aberto.",
            geo_pagar: "Distribuicao geografica das obrigacoes financeiras por estado.",
            dist_tipo_pag: "Análise dos métodos de pagamento mais utilizados.",
            dist_cond_pag: "Distribuicao das condicoes de parcelamento negociadas com fornecedores.",
            evolucao_pag: "Demonstra o volume de pagamentos realizados mes a mes.",
            curva_pag: "Visualizacao temporal do volume a pagar futuro.",
            top_pag: "Lista dos 10 maiores documentos individuais pendentes de pagamento.",
            faixa_pag: "Distribuicao dos titulos a pagar por faixas de valor.",
            dist_rec_cliente: "Identifica a concentracao de receita em clientes especificos.",
            geo_receber: "Distribuicao geografica das receitas por estado.",
            evolucao_rec: "Evolução mensal do volume total de recebimentos efetuados.",
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
            title: widgets.find((widget) => widget.id === id)?.name || "Análise de Gráfico",
            description: descriptions[id] || "Esta análise permite visualizar o comportamento dos dados financeiros.",
            data: getWidgetData(id),
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

    type WidgetEntityFilters = {
        entityValue?: string | null;
    };

    const filterByLabel = <T extends { label: string }>(items: T[] | undefined, entityValue?: string | null) => {
        const safeItems = items || [];
        if (!entityValue) return safeItems;
        return safeItems.filter((item) => item.label === entityValue);
    };

    const renderWidgetContent = (id: string, filters?: WidgetEntityFilters) => {
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
                        data={filterByLabel(advanced?.distribuicaoPagarFornecedor, filters?.entityValue)}
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
                        data={filterByLabel(advanced?.distribuicaoReceberCliente, filters?.entityValue)}
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
                        data={filterByLabel(advanced?.indiceLiquidezPorEmpresa, filters?.entityValue)}
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
                return <DistributionBarChart data={filterByLabel(advanced?.prazoMedioRecebimentoPorCliente, filters?.entityValue)} isLoading={isLoading} color={analysisTheme.primary} />;
            case "pm_pag_for":
                return <DistributionBarChart data={filterByLabel(advanced?.prazoMedioPagamentoPorFornecedor, filters?.entityValue)} isLoading={isLoading} color={analysisTheme.primary} />;
            case "tm_rec_cli":
                return <DistributionBarChart data={filterByLabel(advanced?.ticketMedioPorCliente, filters?.entityValue)} isLoading={isLoading} color={analysisTheme.primary} />;
            case "tm_pag_for":
                return <DistributionBarChart data={filterByLabel(advanced?.ticketMedioPorFornecedor, filters?.entityValue)} isLoading={isLoading} color={analysisTheme.primary} />;
            case "docs_cli":
                return <DistributionBarChart data={filterByLabel(advanced?.documentosPorClienteAtivo, filters?.entityValue)} isLoading={isLoading} color={analysisTheme.primary} />;
            case "docs_for":
                return <DistributionBarChart data={filterByLabel(advanced?.documentosPorFornecedorAtivo, filters?.entityValue)} isLoading={isLoading} color={analysisTheme.primary} />;
            default:
                return null;
        }
    };

    const renderWidget = (id: string, onlyContent = false, filters?: WidgetEntityFilters) => {
        const widget = widgets.find((item) => item.id === id);
        if (!widget) return null;

        const content = renderWidgetContent(id, filters);
        if (onlyContent) return <div className="flex h-full w-full flex-col min-h-[500px]">{content}</div>;

        return (
            <div key={id} className={widgetFrameClass(id)}>
                <DashboardWidget
                    id={id}
                    title={widget.name}
                    onAnalyze={(selectedId) => {
                        setAnalysisChartId(selectedId);
                        setAnalysisStartDate(startDate);
                        setAnalysisEndDate(endDate);
                        setAnalysisSummary(null);
                        setAnalysisMonthlyFlow(null);
                        setAnalysisAiAnalysis(null);
                        setAnalysisAdvanced(null);
                        fetchAnalysisData(selectedId, startDate, endDate);
                    }}
                    onDetails={
                        canManageChartDetails && isChartDetailsEnabled
                            ? (selectedId) => {
                                  const info = getWidgetInfo(selectedId);
                                  const group = DASHBOARD_GROUPS.find((item) => item.widgetIds.includes(selectedId));

                                  setChartDetailsModalState({
                                      title: info.title,
                                      entries: [
                                          {
                                              id: selectedId,
                                              title: info.title,
                                              groupTitle: group?.title || "Dashboard Financeiro",
                                              description: info.description,
                                              detail: getChartDetail(selectedId, info.title, info.description),
                                          },
                                      ],
                                  });
                              }
                            : undefined
                    }
                >
                    {content}
                </DashboardWidget>
            </div>
        );
    };

    const renderAnalysisWidgetContent = (id: string, filters?: WidgetEntityFilters) => {
        const payableTheme = dashboardThemes.payable;
        const receivableTheme = dashboardThemes.receivable;
        const cashflowTheme = dashboardThemes.cashflow;
        const analysisTheme = dashboardThemes.analysis;

        const adv = analysisAdvanced;
        const effectiveSummary = analysisSummary ?? summary;
        const effectiveFlow = analysisMonthlyFlow ?? monthlyFlow;
        const effectiveAi = analysisAiAnalysis ?? aiAnalysis;

        switch (id) {
            case "kpis":
                return <AdvancedKpiCards data={adv?.saudeFinanceira || null} isLoading={analysisIsLoading} />;
            case "summary":
                return <FinanceSummaryCards data={effectiveSummary} isLoading={analysisIsLoading} />;
            case "flow":
                return <MonthlyFlowChart data={effectiveFlow || []} isLoading={analysisIsLoading} />;
            case "projection":
                return <CashProjectionChart data={adv?.previsaoCaixa || []} isLoading={analysisIsLoading} />;
            case "aging":
                return <AgingChart data={adv?.aging || []} isLoading={analysisIsLoading} />;
            case "ai":
                return <AiAnalysisPanel data={effectiveAi} isLoading={analysisIsLoading} />;
            case "performance":
                return (
                    <DistributionPieChart
                        title=""
                        data={adv?.performanceRecebimento?.map((item) => ({ label: item.categoria, valor: item.valor, percentual: 0 })) || []}
                        isLoading={analysisIsLoading}
                        colors={receivableTheme.chartPalette}
                    />
                );
            case "dist_pag_fornecedor":
                return (
                    <DistributionBarChart
                        data={filterByLabel(adv?.distribuicaoPagarFornecedor, filters?.entityValue)}
                        isLoading={analysisIsLoading}
                        color={payableTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                    />
                );
            case "geo_pagar":
                return <BrazilUfMapChart data={adv?.geograficoPagar || []} isLoading={analysisIsLoading} color={payableTheme.primary} />;
            case "dist_tipo_pag":
                return <DistributionPieChart title="" data={adv?.distribuicaoTipoPagamento || []} isLoading={analysisIsLoading} colors={payableTheme.chartPalette} />;
            case "dist_cond_pag":
                return <DistributionPieChart title="" data={adv?.distribuicaoCondicaoPagamento || []} isLoading={analysisIsLoading} colors={payableTheme.chartPalette} maxItems={6} />;
            case "faixa_pag":
                return <DistributionBarChart data={adv?.distribuicaoFaixaValorPagar || []} isLoading={analysisIsLoading} color={payableTheme.primary} maxItems={6} />;
            case "evolucao_pag":
                return <MonthlyEvolutionChart title="" data={adv?.evolucaoMensalPagamento || []} isLoading={analysisIsLoading} color={payableTheme.primary} fillColor={payableTheme.primary} dataKey="valor" />;
            case "curva_pag":
                return <DistributionBarChart data={toBarData(adv?.curvaVencimentoPagar)} isLoading={analysisIsLoading} color={payableTheme.primary} maxItems={8} />;
            case "dist_rec_cliente":
                return (
                    <DistributionBarChart
                        data={filterByLabel(adv?.distribuicaoReceberCliente, filters?.entityValue)}
                        isLoading={analysisIsLoading}
                        color={receivableTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                    />
                );
            case "geo_receber":
                return <BrazilUfMapChart data={adv?.geograficoReceber || []} isLoading={analysisIsLoading} color={receivableTheme.primary} />;
            case "faixa_rec":
                return <DistributionBarChart data={adv?.distribuicaoFaixaValorReceber || []} isLoading={analysisIsLoading} color={receivableTheme.primary} maxItems={6} />;
            case "evolucao_rec":
                return <MonthlyEvolutionChart title="" data={adv?.evolucaoMensalRecebimento || []} isLoading={analysisIsLoading} color={receivableTheme.primary} fillColor={receivableTheme.primary} dataKey="valor" />;
            case "curva_rec":
                return <DistributionBarChart data={toBarData(adv?.curvaVencimentoReceber)} isLoading={analysisIsLoading} color={receivableTheme.primary} maxItems={8} />;
            case "efficiency_kpis":
                return <EfficiencyKpiCards data={adv?.saudeFinanceira || null} isLoading={analysisIsLoading} />;
            case "vol_dia_mes":
                return <DistributionPieChart title="" data={adv?.volumePorDia || []} isLoading={analysisIsLoading} colors={cashflowTheme.chartPalette} />;
            case "vol_dia_semana":
                return <DistributionBarChart data={getWeekdayVolumeData()} isLoading={analysisIsLoading} color={cashflowTheme.primary} maxItems={7} preserveOrder />;
            case "liq_empresa":
                return (
                    <DistributionBarChart
                        data={filterByLabel(adv?.indiceLiquidezPorEmpresa, filters?.entityValue)}
                        isLoading={analysisIsLoading}
                        color={cashflowTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                        showZeroLine
                    />
                );
            case "fluxo_diario_proj":
                return <DailyBalanceChart data={adv?.fluxoCaixaDiarioProjetado || []} isLoading={analysisIsLoading} color={cashflowTheme.primary} />;
            case "vol_cpf_cnpj":
                return (
                    <DistributionBarChart
                        data={adv?.volumePorCpfCnpj || []}
                        isLoading={analysisIsLoading}
                        color={cashflowTheme.primary}
                        layout="horizontal"
                        maxItems={8}
                    />
                );
            case "dist_faixa_prazo":
                return <DistributionBarChart data={adv?.distribuicaoFaixaPrazoVencimento || []} isLoading={analysisIsLoading} color={cashflowTheme.primary} maxItems={6} />;
            case "pm_rec_cli":
                return <DistributionBarChart data={filterByLabel(adv?.prazoMedioRecebimentoPorCliente, filters?.entityValue)} isLoading={analysisIsLoading} color={analysisTheme.primary} />;
            case "pm_pag_for":
                return <DistributionBarChart data={filterByLabel(adv?.prazoMedioPagamentoPorFornecedor, filters?.entityValue)} isLoading={analysisIsLoading} color={analysisTheme.primary} />;
            case "tm_rec_cli":
                return <DistributionBarChart data={filterByLabel(adv?.ticketMedioPorCliente, filters?.entityValue)} isLoading={analysisIsLoading} color={analysisTheme.primary} />;
            case "tm_pag_for":
                return <DistributionBarChart data={filterByLabel(adv?.ticketMedioPorFornecedor, filters?.entityValue)} isLoading={analysisIsLoading} color={analysisTheme.primary} />;
            case "docs_cli":
                return <DistributionBarChart data={filterByLabel(adv?.documentosPorClienteAtivo, filters?.entityValue)} isLoading={analysisIsLoading} color={analysisTheme.primary} />;
            case "docs_for":
                return <DistributionBarChart data={filterByLabel(adv?.documentosPorFornecedorAtivo, filters?.entityValue)} isLoading={analysisIsLoading} color={analysisTheme.primary} />;
            default:
                return renderWidgetContent(id, filters);
        }
    };

    const chartDetailsEntries = DASHBOARD_GROUPS.flatMap((group) => {
        const activeTabConfig = DASHBOARD_TABS.find((tab) => tab.key === activeTab);
        if (activeTabConfig && !activeTabConfig.groupNumbers.includes(group.number)) return [];

        return group.widgetIds.filter(isWidgetVisible).map((id) => {
            const info = getWidgetInfo(id);
            return {
                id,
                title: info.title,
                groupTitle: group.title,
                description: info.description,
                detail: getChartDetail(id, info.title, info.description),
            };
        });
    });

    const globalChartDetailsTitle =
        activeTab === "overview"
            ? "Detalhamento dos gráficos visíveis"
            : `Detalhamento da visão ${DASHBOARD_TABS.find((tab) => tab.key === activeTab)?.label || "selecionada"}`;

    if (!mounted) {
        return (
            <div className="flex-1 overflow-auto bg-neutral-50/70 scroll-smooth">
                <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
                    <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                            <div className="mb-2 h-8 w-72 rounded bg-neutral-200/70"></div>
                            <div className="h-4 w-[420px] max-w-full rounded bg-neutral-200/50"></div>
                        </div>
                        <div className="h-11 w-[520px] max-w-full rounded-xl border border-neutral-200 bg-white"></div>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="rounded-3xl border border-neutral-200 bg-white p-6">
                                <div className="mb-4 h-5 w-64 rounded bg-neutral-200/60"></div>
                                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="h-[360px] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                                            <div className="h-10 border-b border-neutral-50 px-4 py-2">
                                                <div className="h-4 w-40 rounded bg-neutral-200/60"></div>
                                            </div>
                                            <div className="p-4">
                                                <div className="h-[300px] w-full rounded-xl bg-neutral-50"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

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
                            Gráficos e KPIs organizados por visão, tema e módulo financeiro.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
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
                            {canManageChartDetails && isChartDetailsEnabled && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setChartDetailsModalState({
                                            title: globalChartDetailsTitle,
                                            entries: chartDetailsEntries,
                                        })
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase text-blue-700 transition-colors hover:bg-blue-100"
                                >
                                    <BookOpenText className="h-4 w-4" />
                                    Detalhes dos gráficos
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {!analysisChartId && (
                <>
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
                        {DASHBOARD_SCOPES.map((scope) => {
                            const isActive = activeScope === scope.key;
                            return (
                                <button
                                    key={scope.key}
                                    onClick={() => applyDashboardScope(scope.key)}
                                    className={`rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                                        isActive
                                            ? "bg-neutral-900 text-white"
                                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                    }`}
                                >
                                    {scope.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mb-6 overflow-x-auto rounded-2xl border border-neutral-200 bg-white px-2 py-1 shadow-sm">
                    <div className="flex min-w-max items-center gap-2">
                        {visibleTabs.map((tab) => {
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => applyDashboardTab(tab.key)}
                                    className={`relative rounded-xl px-4 py-3 text-sm font-black transition-all ${
                                        isActive
                                            ? "bg-blue-50 text-blue-700"
                                            : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                    }`}
                                >
                                    {tab.label}
                                    <span
                                        className={`absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-all ${
                                            isActive ? "bg-blue-600" : "bg-transparent"
                                        }`}
                                    />
                                </button>
                            );
                        })}
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
                        const activeTabConfig = DASHBOARD_TABS.find((tab) => tab.key === activeTab);
                        if (activeTabConfig && !activeTabConfig.groupNumbers.includes(group.number)) return null;

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

                </div>
                </>
                )}
            </div>

            {canManageChartDetails && isChartDetailsEnabled && (
                <ChartDetailsModal
                    isOpen={Boolean(chartDetailsModalState)}
                    title={chartDetailsModalState?.title || "Detalhes do gráfico"}
                    entries={chartDetailsModalState?.entries || []}
                    onClose={() => setChartDetailsModalState(null)}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}

            {analysisChartId && (
                <ChartAnalysisView
                    id={analysisChartId}
                    {...getWidgetInfo(analysisChartId)}
                    chartComponent={<div className="flex h-full w-full flex-col min-h-[500px]">{renderAnalysisWidgetContent(analysisChartId)}</div>}
                    renderChart={({ entityValue }) => (
                        <div className="flex h-full w-full flex-col min-h-[500px]">{renderAnalysisWidgetContent(analysisChartId, { entityValue })}</div>
                    )}
                    onClose={() => {
                        setAnalysisChartId(null);
                        setAnalysisStartDate(null);
                        setAnalysisEndDate(null);
                        setAnalysisSummary(null);
                        setAnalysisMonthlyFlow(null);
                        setAnalysisAiAnalysis(null);
                        setAnalysisAdvanced(null);
                    }}
                    initialStartDate={analysisStartDate || startDate}
                    initialEndDate={analysisEndDate || endDate}
                    onDateChange={async (start, end) => {
                        setAnalysisStartDate(start);
                        setAnalysisEndDate(end);
                        await fetchAnalysisData(analysisChartId, start, end);
                    }}
                />
            )}
        </div>
    );
}
