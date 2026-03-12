"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
    ResponsiveGridLayout,
    useContainerWidth,
    useResponsiveLayout,
    Layout,
    ResponsiveLayouts
} from "react-grid-layout";
import financeAnalyticsService, {
    AdvancedDashboard,
    AiAnalysisData,
    FinanceSummary,
    MonthlyFlow,
    TopDebtor
} from "@/services/finance-analytics.service";

// Components
import FinanceSummaryCards from "@/components/finance/FinanceSummaryCards";
import MonthlyFlowChart from "@/components/finance/MonthlyFlowChart";
import AiAnalysisPanel from "@/components/finance/AiAnalysisPanel";
import AgingChart from "@/components/finance/AgingChart";
import DistributionPieChart from "@/components/finance/DistributionPieChart";
import AdvancedKpiCards from "@/components/finance/AdvancedKpiCards";
import CashProjectionChart from "@/components/finance/CashProjectionChart";
import DashboardWidget from "@/components/finance/DashboardWidget";
import MonthlyEvolutionChart from "@/components/finance/MonthlyEvolutionChart";
import TopAccountsList from "@/components/finance/TopAccountsList";
import EfficiencyKpiCards from "@/components/finance/EfficiencyKpiCards";
import DailyBalanceChart from "@/components/finance/DailyBalanceChart";

import {
    AlertCircle,
    Calendar,
    Layout as LayoutIcon,
    RotateCcw,
    Lock,
    Unlock,
    Check,
    Plus
} from "lucide-react";

interface WidgetConfig {
    id: string;
    name: string;
    visible: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
    { id: 'kpis', name: 'KPIs Básicos e Detalhados', visible: true },
    { id: 'summary', name: 'Cards de Resumo', visible: true },
    { id: 'flow', name: 'Fluxo Mensal Consolidado', visible: true },
    { id: 'projection', name: 'Previsão 30 Dias', visible: true },
    { id: 'aging', name: 'Aging (Atraso)', visible: true },
    { id: 'ai', name: 'Análise Inteligente', visible: true },
    { id: 'performance', name: 'Performance Pagto', visible: true },
    
    // Contas a Pagar
    { id: 'dist_pag_fornecedor', name: 'Pagar: Por Fornecedor', visible: true },
    { id: 'geo_pagar', name: 'Pagar: Por UF', visible: true },
    { id: 'dist_tipo_pag', name: 'Pagar: Tipo Pagamento', visible: true },
    { id: 'dist_cond_pag', name: 'Pagar: Condição Pagto', visible: true },
    { id: 'evolucao_pag', name: 'Pagar: Evolução', visible: true },
    { id: 'curva_pag', name: 'Pagar: Curva Venc.', visible: true },
    { id: 'top_pag', name: 'Pagar: Top 10', visible: true },
    { id: 'faixa_pag', name: 'Pagar: Faixa Valor', visible: true },

    // Contas a Receber
    { id: 'dist_rec_cliente', name: 'Receber: Por Cliente', visible: true },
    { id: 'geo_receber', name: 'Receber: Por UF', visible: true },
    { id: 'evolucao_rec', name: 'Receber: Evolução', visible: true },
    { id: 'curva_rec', name: 'Receber: Curva Venc.', visible: true },
    { id: 'top_rec', name: 'Receber: Top 10', visible: true },
    { id: 'faixa_rec', name: 'Receber: Faixa Valor', visible: true },

    // Gestão e Eficiência (Fase 2)
    { id: 'efficiency_kpis', name: 'Gestão: KPIs Eficiência', visible: true },
    { id: 'vol_dia_mes', name: 'Gestão: Vol. por Dia', visible: true },
    { id: 'liq_empresa', name: 'Gestão: Liq. por Empresa', visible: true },
    { id: 'fluxo_diario_proj', name: 'Gestão: Fluxo Diário Proj.', visible: true },
    { id: 'vol_cpf_cnpj', name: 'Gestão: Vol. por CPF/CNPJ', visible: true },
    { id: 'saldo_acumulado', name: 'Gestão: Saldo Acumulado', visible: true },
    { id: 'dist_faixa_prazo', name: 'Gestão: Faixas de Prazo', visible: true },

    // Fase 3
    { id: 'pm_rec_cli', name: 'F3: PM Rec. por Cliente', visible: true },
    { id: 'pm_pag_for', name: 'F3: PM Pag. por Fornecedor', visible: true },
    { id: 'tm_rec_cli', name: 'F3: Ticket Médio/Cliente', visible: true },
    { id: 'tm_pag_for', name: 'F3: Ticket Médio/Fornecedor', visible: true },
    { id: 'docs_cli', name: 'F3: Docs por Cliente', visible: true },
    { id: 'docs_for', name: 'F3: Docs por Fornecedor', visible: true },
];

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
    lg: [
        { i: 'kpis', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
        { i: 'summary', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
        { i: 'flow', x: 0, y: 8, w: 8, h: 10, minW: 4, minH: 6 },
        { i: 'ai', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'projection', x: 0, y: 18, w: 8, h: 10, minW: 4, minH: 6 },
        
        // Pagar Line 1
        { i: 'evolucao_pag', x: 0, y: 28, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'curva_pag', x: 6, y: 28, w: 6, h: 9, minW: 3, minH: 6 },

        // Pagar Line 2
        { i: 'dist_pag_fornecedor', x: 0, y: 37, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'top_pag', x: 4, y: 37, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'faixa_pag', x: 8, y: 37, w: 4, h: 9, minW: 3, minH: 6 },

        // Pagar Line 3
        { i: 'geo_pagar', x: 0, y: 46, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'dist_tipo_pag', x: 4, y: 46, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'dist_cond_pag', x: 8, y: 46, w: 4, h: 9, minW: 3, minH: 6 },

        // Receber Line 1
        { i: 'evolucao_rec', x: 0, y: 55, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'curva_rec', x: 6, y: 55, w: 6, h: 9, minW: 3, minH: 6 },

        // Receber Line 2
        { i: 'dist_rec_cliente', x: 0, y: 64, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'top_rec', x: 4, y: 64, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'faixa_rec', x: 8, y: 64, w: 4, h: 9, minW: 3, minH: 6 },

        // Receber Line 3
        { i: 'geo_receber', x: 0, y: 73, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'performance', x: 4, y: 73, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'aging', x: 8, y: 73, w: 4, h: 9, minW: 3, minH: 6 },

        // Fase 2 Management
        { i: 'efficiency_kpis', x: 0, y: 82, w: 12, h: 10, minW: 6, minH: 6 },
        { i: 'saldo_acumulado', x: 0, y: 92, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'fluxo_diario_proj', x: 8, y: 92, w: 4, h: 12, minW: 3, minH: 8 },
        { i: 'vol_dia_mes', x: 0, y: 104, w: 6, h: 10, minW: 3, minH: 6 },
        { i: 'dist_faixa_prazo', x: 6, y: 104, w: 6, h: 10, minW: 3, minH: 6 },
        { i: 'liq_empresa', x: 0, y: 114, w: 6, h: 10, minW: 3, minH: 6 },
        { i: 'vol_cpf_cnpj', x: 6, y: 108, w: 6, h: 9, minW: 3, minH: 6 },

        // Fase 3
        { i: 'pm_rec_cli', x: 0, y: 117, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'pm_pag_for', x: 4, y: 117, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'tm_rec_cli', x: 8, y: 117, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'tm_pag_for', x: 0, y: 126, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'docs_cli', x: 4, y: 126, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'docs_for', x: 8, y: 126, w: 4, h: 9, minW: 3, minH: 6 },
    ]
};

export default function FinanceAnalyticsDashboard() {
    const { data: session } = useSession();

    // Data State
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [monthlyFlow, setMonthlyFlow] = useState<MonthlyFlow[]>([]);
    const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisData | null>(null);
    const [advanced, setAdvanced] = useState<AdvancedDashboard | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filters (Default to last 12 months to prevent timeouts)
    const [startDate, setStartDate] = useState<string>(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

    // Layout Persistent State
    const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
    const [savedLayouts, setSavedLayouts] = useState<ResponsiveLayouts>(DEFAULT_LAYOUTS);

    // UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);

    const userId = session?.user?.id || 'default';

    // Unified layout change handler
    const onLayoutChange = (_current: Layout, all: ResponsiveLayouts) => {
        if (isEditMode) {
            setSavedLayouts(all);
            localStorage.setItem(`finance_v5_layouts_${userId}`, JSON.stringify(all));
        }
    };

    // Responsive Grid Hooks
    const { width, containerRef, mounted: containerMounted } = useContainerWidth();
    const { layouts, setLayouts } = useResponsiveLayout({
        width,
        layouts: savedLayouts,
        onLayoutChange
    });

    useEffect(() => {
        setMounted(true);
        // Load persistence
        const sWidgets = localStorage.getItem(`finance_v5_widgets_${userId}`);
        const sLayouts = localStorage.getItem(`finance_v5_layouts_${userId}`);

        if (sWidgets) {
            try { setWidgets(JSON.parse(sWidgets)); } catch (e) { }
        }
        if (sLayouts) {
            try {
                const parsed = JSON.parse(sLayouts);
                setSavedLayouts(parsed);
                setLayouts(parsed);
            } catch (e) { }
        }
    }, [setLayouts]);

    useEffect(() => {
        if (session) {
            const user = session.user as any;
            const hasAnyAccess = user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || 
                                user.hasPayableDashboardAccess || 
                                user.hasReceivableDashboardAccess || 
                                user.hasBankingDashboardAccess;

            if (!hasAnyAccess) {
                window.location.href = "/chat";
                return;
            }

            // Filter widgets based on access
            const filteredWidgets = DEFAULT_WIDGETS.filter(w => {
                if (user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
                
                // Widgets that require Receber
                const receiveWidgets = ['aging', 'performance', 'dist_rec_cliente', 'geo_receber', 'evolucao_rec', 'curva_rec', 'top_rec', 'faixa_rec'];
                if (receiveWidgets.includes(w.id) && !user.hasReceivableDashboardAccess) return false;

                const payableWidgets = ['dist_pag_fornecedor', 'geo_pagar', 'dist_tipo_pag', 'dist_cond_pag', 'evolucao_pag', 'curva_pag', 'top_pag', 'faixa_pag'];
                if (payableWidgets.includes(w.id) && !user.hasPayableDashboardAccess) return false;
                
                return true;
            });
            setWidgets(filteredWidgets);

            fetchData(startDate, endDate);
        }
    }, [session]);

    const handleFilter = () => fetchData(startDate, endDate);
    const handleClearFilters = () => {
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        const start = lastYear.toISOString().split('T')[0];
        const end = new Date().toISOString().split('T')[0];

        setStartDate(start);
        setEndDate(end);
        fetchData(start, end);
    };

    const fetchData = async (start?: string, end?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const [summaryData, flowData, debtorsData, aiData, advancedData] = await Promise.all([
                financeAnalyticsService.getSummary(start, end),
                financeAnalyticsService.getMonthlyFlow(start, end),
                financeAnalyticsService.getTopDebtors(start, end),
                financeAnalyticsService.getAiAnalysisData(start, end),
                financeAnalyticsService.getAdvancedAnalytics(start, end)
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

    const toggleWidget = (id: string) => {
        const newWidgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
        setWidgets(newWidgets);
        localStorage.setItem(`finance_v5_widgets_${userId}`, JSON.stringify(newWidgets));
    };

    const resetLayout = () => {
        setSavedLayouts(DEFAULT_LAYOUTS);
        setLayouts(DEFAULT_LAYOUTS);
        setWidgets(DEFAULT_WIDGETS);
        localStorage.removeItem(`finance_v5_layouts_${userId}`);
        localStorage.removeItem(`finance_v5_widgets_${userId}`);
        setShowResetModal(false);
    };

    const isWidgetVisible = (id: string) => widgets.find(w => w.id === id)?.visible;

    // Render logic for grid items
    const renderWidget = (id: string) => {
        switch (id) {
            case 'kpis':
                return (
                    <div key="kpis">
                        <DashboardWidget id="kpis" title="Indicadores de Saúde" showControls={isEditMode} onRemove={toggleWidget}>
                            <AdvancedKpiCards data={advanced?.saudeFinanceira || null} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'summary':
                return (
                    <div key="summary">
                        <DashboardWidget id="summary" title="Resumo Geral" showControls={isEditMode} onRemove={toggleWidget}>
                            <FinanceSummaryCards data={summary} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'flow':
                return (
                    <div key="flow">
                        <DashboardWidget id="flow" title="Fluxo de Caixa Mensal" showControls={isEditMode} onRemove={toggleWidget}>
                            <MonthlyFlowChart data={monthlyFlow} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'projection':
                return (
                    <div key="projection">
                        <DashboardWidget id="projection" title="Previsão (30 dias)" showControls={isEditMode} onRemove={toggleWidget}>
                            <CashProjectionChart data={advanced?.previsaoCaixa || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'aging':
                return (
                    <div key="aging">
                        <DashboardWidget id="aging" title="Aging (Inadimplência)" showControls={isEditMode} onRemove={toggleWidget}>
                            <AgingChart data={advanced?.aging || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'ai':
                return (
                    <div key="ai">
                        <DashboardWidget id="ai" title="Assistente de Análise" showControls={isEditMode} onRemove={toggleWidget}>
                            <AiAnalysisPanel data={aiAnalysis} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'performance':
                return (
                    <div key="performance">
                        <DashboardWidget id="performance" title="Performance de Recebimento" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.performanceRecebimento?.map(i => ({ label: i.categoria, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'dist_pag_fornecedor':
                return (
                    <div key="dist_pag_fornecedor">
                        <DashboardWidget id="dist_pag_fornecedor" title="Pagar por Fornecedor (Top 15)" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoPagarFornecedor || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'geo_pagar':
                return (
                    <div key="geo_pagar">
                        <DashboardWidget id="geo_pagar" title="Pagar por Estado (UF)" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.geograficoPagar?.map(i => ({ label: i.local, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'dist_tipo_pag':
                return (
                    <div key="dist_tipo_pag">
                        <DashboardWidget id="dist_tipo_pag" title="Tipo de Pagamento" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoTipoPagamento || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'dist_cond_pag':
                return (
                    <div key="dist_cond_pag">
                        <DashboardWidget id="dist_cond_pag" title="Condição de Pagamento" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoCondicaoPagamento || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'faixa_pag':
                return (
                    <div key="faixa_pag">
                        <DashboardWidget id="faixa_pag" title="Pagar por Faixa de Valor" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoFaixaValorPagar || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'evolucao_pag':
                return (
                    <div key="evolucao_pag">
                        <DashboardWidget id="evolucao_pag" title="Evolução de Pagamentos" showControls={isEditMode} onRemove={toggleWidget}>
                            <MonthlyEvolutionChart title="" data={advanced?.evolucaoMensalPagamento || []} isLoading={isLoading} color="#f43f5e" fillColor="#f43f5e" dataKey="valor" />
                        </DashboardWidget>
                    </div>
                );
            case 'curva_pag':
                return (
                    <div key="curva_pag">
                        <DashboardWidget id="curva_pag" title="Curva de Vencimentos (Pagar)" showControls={isEditMode} onRemove={toggleWidget}>
                            <MonthlyEvolutionChart title="" data={advanced?.curvaVencimentoPagar || []} isLoading={isLoading} color="#e11d48" fillColor="#e11d48" dataKey="valor" />
                        </DashboardWidget>
                    </div>
                );
            case 'top_pag':
                return (
                    <div key="top_pag">
                        <DashboardWidget id="top_pag" title="Top 10 a Pagar" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.topContasPagar || []} isLoading={isLoading} iconColor="text-rose-500" valueColor="text-rose-600" />
                        </DashboardWidget>
                    </div>
                );
            case 'dist_rec_cliente':
                return (
                    <div key="dist_rec_cliente">
                        <DashboardWidget id="dist_rec_cliente" title="Receitas por Cliente (Top 15)" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoReceberCliente || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'geo_receber':
                return (
                    <div key="geo_receber">
                        <DashboardWidget id="geo_receber" title="Receber por Estado (UF)" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.geograficoReceber?.map(i => ({ label: i.local, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'faixa_rec':
                return (
                    <div key="faixa_rec">
                        <DashboardWidget id="faixa_rec" title="Receber por Faixa de Valor" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoFaixaValorReceber || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'evolucao_rec':
                return (
                    <div key="evolucao_rec">
                        <DashboardWidget id="evolucao_rec" title="Evolução de Recebimentos" showControls={isEditMode} onRemove={toggleWidget}>
                            <MonthlyEvolutionChart title="" data={advanced?.evolucaoMensalRecebimento || []} isLoading={isLoading} color="#10b981" fillColor="#10b981" dataKey="valor" />
                        </DashboardWidget>
                    </div>
                );
            case 'curva_rec':
                return (
                    <div key="curva_rec">
                        <DashboardWidget id="curva_rec" title="Curva de Vencimentos (Receber)" showControls={isEditMode} onRemove={toggleWidget}>
                            <MonthlyEvolutionChart title="" data={advanced?.curvaVencimentoReceber || []} isLoading={isLoading} color="#059669" fillColor="#059669" dataKey="valor" />
                        </DashboardWidget>
                    </div>
                );
            case 'top_rec':
                return (
                    <div key="top_rec">
                        <DashboardWidget id="top_rec" title="Top 10 a Receber" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.topContasReceber || []} isLoading={isLoading} iconColor="text-emerald-500" valueColor="text-emerald-600" />
                        </DashboardWidget>
                    </div>
                );
            case 'efficiency_kpis':
                return (
                    <div key="efficiency_kpis">
                        <DashboardWidget id="efficiency_kpis" title="Indicadores de Eficiência e Risco" showControls={isEditMode} onRemove={toggleWidget}>
                            <EfficiencyKpiCards data={advanced?.saudeFinanceira || null} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'vol_dia_mes':
                return (
                    <div key="vol_dia_mes">
                        <DashboardWidget id="vol_dia_mes" title="Volume por Dia do Mês" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.volumePorDia || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'liq_empresa':
                return (
                    <div key="liq_empresa">
                        <DashboardWidget id="liq_empresa" title="Índice de Liquidez por Empresa" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.indiceLiquidezPorEmpresa || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'fluxo_diario_proj':
                return (
                    <div key="fluxo_diario_proj">
                        <DashboardWidget id="fluxo_diario_proj" title="Fluxo Diário Projetado" showControls={isEditMode} onRemove={toggleWidget}>
                            <DailyBalanceChart data={advanced?.fluxoCaixaDiarioProjetado || []} isLoading={isLoading} color="#8b5cf6" />
                        </DashboardWidget>
                    </div>
                );
            case 'vol_cpf_cnpj':
                return (
                    <div key="vol_cpf_cnpj">
                        <DashboardWidget id="vol_cpf_cnpj" title="Concentração por CPF/CNPJ" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.volumePorCpfCnpj?.map((i) => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-indigo-500" valueColor="text-indigo-600" />
                        </DashboardWidget>
                    </div>
                );
            case 'saldo_acumulado':
                return (
                    <div key="saldo_acumulado">
                        <DashboardWidget id="saldo_acumulado" title="Saldo Financeiro Acumulado" showControls={isEditMode} onRemove={toggleWidget}>
                            <DailyBalanceChart data={advanced?.evolucaoSaldo?.map((i) => ({ ano: 2024, mes: 1, valor: i.saldoAcumulado, mesAno: i.data.toString().split('T')[0] })) || []} isLoading={isLoading} color="#10b981" />
                        </DashboardWidget>
                    </div>
                );
            case 'dist_faixa_prazo':
                return (
                    <div key="dist_faixa_prazo">
                        <DashboardWidget id="dist_faixa_prazo" title="Distribuição por Faixa de Prazo" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoFaixaPrazoVencimento || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'pm_rec_cli':
                return (
                    <div key="pm_rec_cli">
                        <DashboardWidget id="pm_rec_cli" title="PM Rec. por Cliente" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.prazoMedioRecebimentoPorCliente || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'pm_pag_for':
                return (
                    <div key="pm_pag_for">
                        <DashboardWidget id="pm_pag_for" title="PM Pag. por Fornecedor" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.prazoMedioPagamentoPorFornecedor || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'tm_rec_cli':
                return (
                    <div key="tm_rec_cli">
                        <DashboardWidget id="tm_rec_cli" title="Ticket Médio por Cliente" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.ticketMedioPorCliente?.map(i => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-emerald-500" valueColor="text-emerald-600" />
                        </DashboardWidget>
                    </div>
                );
            case 'tm_pag_for':
                return (
                    <div key="tm_pag_for">
                        <DashboardWidget id="tm_pag_for" title="Ticket Médio por Fornecedor" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.ticketMedioPorFornecedor?.map(i => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-rose-500" valueColor="text-rose-600" />
                        </DashboardWidget>
                    </div>
                );
            case 'docs_cli':
                return (
                    <div key="docs_cli">
                        <DashboardWidget id="docs_cli" title="Documentos por Cliente" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.documentosPorClienteAtivo?.map(i => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-blue-500" valueColor="text-blue-600" />
                        </DashboardWidget>
                    </div>
                );
            case 'docs_for':
                return (
                    <div key="docs_for">
                        <DashboardWidget id="docs_for" title="Documentos por Fornecedor" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopAccountsList title="" data={advanced?.documentosPorFornecedorAtivo?.map(i => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-orange-500" valueColor="text-orange-600" />
                        </DashboardWidget>
                    </div>
                );
            default: return null;
        }
    };

    if (!mounted) return null;

    return (
        <div className="flex-1 overflow-auto bg-neutral-50/50 scroll-smooth">
            <div className="max-w-[1700px] mx-auto p-4 sm:p-6 lg:p-8">

                {/* Custom Header */}
                <div className="mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-black text-neutral-900 tracking-tight tracking-[-0.02em]">Financial Intelligence</h1>
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-[0_2px_10px_-3px_rgba(79,70,229,0.5)]">V4 PRO</span>
                        </div>
                        <p className="text-neutral-500 text-sm font-medium">Análise preditiva e layout interativo de alta performance.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => setShowResetModal(true)}
                            className="bg-white text-neutral-500 border border-neutral-200 p-2.5 rounded-xl hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm"
                            title="Resetar Layout"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>

                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${isEditMode
                                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-lg shadow-indigo-100'
                                : 'bg-white text-neutral-700 border border-neutral-200 hover:border-indigo-300'
                                }`}
                        >
                            {isEditMode ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                            {isEditMode ? 'Travar Layout' : 'Modo Edição'}
                        </button>

                        <div className="h-8 w-px bg-neutral-200 hidden sm:block mx-1"></div>

                        <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-neutral-200 shadow-sm">
                            <div className="flex items-center gap-2 px-3 border-r border-neutral-100">
                                <Calendar className="w-4 h-4 text-neutral-400" />
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs font-bold outline-none w-28 text-neutral-700" />
                                <span className="text-neutral-300">/</span>
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs font-bold outline-none w-28 text-neutral-700" />
                            </div>
                            <button onClick={handleFilter} className="bg-neutral-900 text-white px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider hover:bg-black transition-colors">
                                Atualizar
                            </button>
                        </div>
                    </div>
                </div>

                {isEditMode && (
                    <div className="mb-8 p-6 bg-white rounded-2xl border-2 border-dashed border-indigo-200/60 animate-in fade-in zoom-in-95 duration-300 shadow-[inset_0_2px_20px_-10px_rgba(79,70,229,0.1)]">
                        <h4 className="text-sm font-black text-indigo-900 mb-4 flex items-center gap-2">
                            <LayoutIcon className="w-4 h-4" />
                            GESTÃO DE MÓDULOS
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                            {widgets.map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => toggleWidget(w.id)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${w.visible
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100'
                                        : 'bg-neutral-50 text-neutral-400 border-neutral-200 opacity-60'
                                        }`}
                                >
                                    {w.visible ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0" />}
                                    <span className="truncate">{w.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-8 flex items-center gap-4 animate-in slide-in-from-left-4">
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <span className="font-bold">{error}</span>
                    </div>
                )}

                {/* The Interactive Grid */}
                <div ref={containerRef} className="relative min-h-[1000px]">
                    {containerMounted && (
                        <ResponsiveGridLayout
                            className="layout"
                            layouts={layouts}
                            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                            width={width}
                            rowHeight={30}
                            dragConfig={{
                                enabled: isEditMode,
                                handle: ".drag-handle",
                                threshold: 10
                            }}
                            resizeConfig={{
                                enabled: isEditMode
                            }}
                            onLayoutChange={onLayoutChange}
                            margin={[24, 24]}
                        >
                            {widgets.filter(w => w.visible).map(w => renderWidget(w.id))}
                        </ResponsiveGridLayout>
                    )}
                </div>
            </div>

            {/* Custom Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowResetModal(false)}
                    />
                    <div className="relative bg-white rounded-3xl shadow-2xl shadow-neutral-900/20 max-w-sm w-full p-8 text-center animate-in zoom-in-95 fade-in duration-300">
                        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <RotateCcw className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-neutral-900 mb-2">
                            Resetar Layout?
                        </h3>
                        <p className="text-neutral-500 text-sm mb-8 leading-relaxed">
                            Isso removerá todas as suas personalizações e voltará para a visualização padrão do sistema.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={resetLayout}
                                className="w-full bg-rose-600 text-white font-black py-4 rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 active:scale-[0.98]"
                            >
                                SIM, RESETAR AGORA
                            </button>
                            <button
                                onClick={() => setShowResetModal(false)}
                                className="w-full bg-neutral-50 text-neutral-600 font-bold py-4 rounded-2xl hover:bg-neutral-100 transition-all active:scale-[0.98]"
                            >
                                CANCELAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
