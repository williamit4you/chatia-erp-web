"use client";

import { useEffect, useState, useMemo, useRef } from "react";
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
import TopDebtorsList from "@/components/finance/TopDebtorsList";
import AiAnalysisPanel from "@/components/finance/AiAnalysisPanel";
import AgingChart from "@/components/finance/AgingChart";
import DistributionPieChart from "@/components/finance/DistributionPieChart";
import AdvancedKpiCards from "@/components/finance/AdvancedKpiCards";
import CashProjectionChart from "@/components/finance/CashProjectionChart";
import DashboardWidget from "@/components/finance/DashboardWidget";

// Icons
import {
    AlertCircle,
    Calendar,
    Filter,
    X,
    Layout as LayoutIcon,
    Settings2,
    Eye,
    EyeOff,
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
    { id: 'kpis', name: 'Indicadores de Saúde', visible: true },
    { id: 'summary', name: 'Cards de Resumo', visible: true },
    { id: 'flow', name: 'Fluxo Mensal', visible: true },
    { id: 'projection', name: 'Previsão 30 Dias', visible: true },
    { id: 'aging', name: 'Aging (Atraso)', visible: true },
    { id: 'ai', name: 'Análise Inteligente', visible: true },
    { id: 'dist_clients', name: 'Principais Receitas', visible: true },
    { id: 'performance', name: 'Performance Pagto', visible: true },
    { id: 'debtors', name: 'Lista de Devedores', visible: true },
];

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
    lg: [
        { i: 'kpis', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
        { i: 'summary', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
        { i: 'flow', x: 0, y: 8, w: 8, h: 10, minW: 4, minH: 6 },
        { i: 'projection', x: 0, y: 18, w: 8, h: 10, minW: 4, minH: 6 },
        { i: 'aging', x: 0, y: 28, w: 8, h: 10, minW: 4, minH: 6 },
        { i: 'ai', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'dist_clients', x: 8, y: 14, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'performance', x: 8, y: 23, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'debtors', x: 8, y: 32, w: 4, h: 10, minW: 3, minH: 6 },
    ]
};

export default function FinanceAnalyticsDashboard() {
    const { data: session } = useSession();

    // Data State
    const [summary, setSummary] = useState<FinanceSummary | null>(null);
    const [monthlyFlow, setMonthlyFlow] = useState<MonthlyFlow[]>([]);
    const [topDebtors, setTopDebtors] = useState<TopDebtor[]>([]);
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

    // Unified layout change handler
    const onLayoutChange = (current: Layout, all: ResponsiveLayouts) => {
        if (isEditMode) {
            setSavedLayouts(all);
            localStorage.setItem('finance_dashboard_layouts_v4', JSON.stringify(all));
        }
    };

    // Responsive Grid Hooks
    const { width, containerRef, mounted: containerMounted } = useContainerWidth();
    const { layout, layouts, cols, setLayouts } = useResponsiveLayout({
        width,
        layouts: savedLayouts,
        onLayoutChange
    });

    useEffect(() => {
        setMounted(true);
        // Load persistence
        const sWidgets = localStorage.getItem('finance_dashboard_widgets_v4');
        const sLayouts = localStorage.getItem('finance_dashboard_layouts_v4');

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
            const hasAccess = user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || user.hasDashboardAccess;

            if (!hasAccess) {
                window.location.href = "/chat";
                return;
            }

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
            setTopDebtors(debtorsData);
            setAiAnalysis(aiData);
            setAdvanced(advancedData);
        } catch (err: any) {
            console.error(err);
            setError("Erro ao carregar dados financeiros.");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleWidget = (id: string) => {
        const newWidgets = widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
        setWidgets(newWidgets);
        localStorage.setItem('finance_dashboard_widgets_v4', JSON.stringify(newWidgets));
    };

    const resetLayout = () => {
        if (confirm("Deseja resetar o layout para o padrão?")) {
            setSavedLayouts(DEFAULT_LAYOUTS);
            setLayouts(DEFAULT_LAYOUTS);
            setWidgets(DEFAULT_WIDGETS);
            localStorage.removeItem('finance_dashboard_layouts_v4');
            localStorage.removeItem('finance_dashboard_widgets_v4');
        }
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
            case 'dist_clients':
                return (
                    <div key="dist_clients">
                        <DashboardWidget id="dist_clients" title="Distribuição por Cliente" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.distribuicaoReceber || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'performance':
                return (
                    <div key="performance">
                        <DashboardWidget id="performance" title="Performance de Recebimento" showControls={isEditMode} onRemove={toggleWidget}>
                            <DistributionPieChart title="" data={advanced?.performanceRecebimento.map(i => ({ label: i.categoria, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />
                        </DashboardWidget>
                    </div>
                );
            case 'debtors':
                return (
                    <div key="debtors">
                        <DashboardWidget id="debtors" title="Top 5 Devedores" showControls={isEditMode} onRemove={toggleWidget}>
                            <TopDebtorsList data={topDebtors} isLoading={isLoading} />
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
                            onClick={resetLayout}
                            className="p-2.5 bg-white text-neutral-400 border border-neutral-200 rounded-xl hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
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
                        <div className="flex flex-wrap gap-2">
                            {widgets.map((w) => (
                                <button
                                    key={w.id}
                                    onClick={() => toggleWidget(w.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${w.visible
                                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100'
                                        : 'bg-neutral-50 text-neutral-400 border-neutral-200 opacity-60'
                                        }`}
                                >
                                    {w.visible ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                    {w.name}
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
        </div>
    );
}
