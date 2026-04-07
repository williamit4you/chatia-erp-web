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
import ChartAnalysisView from "@/components/finance/ChartAnalysisView";

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

const PAYABLE_WIDGETS = [
    'dist_pag_fornecedor', 'geo_pagar', 'dist_tipo_pag', 'dist_cond_pag', 
    'evolucao_pag', 'curva_pag', 'top_pag', 'faixa_pag', 
    'pm_pag_for', 'tm_pag_for', 'docs_for'
];

const RECEIVABLE_WIDGETS = [
    'aging', 'performance', 'dist_rec_cliente', 'geo_receber', 
    'evolucao_rec', 'curva_rec', 'top_rec', 'faixa_rec', 
    'pm_rec_cli', 'tm_rec_cli', 'docs_cli'
];

const DEFAULT_LAYOUTS: ResponsiveLayouts = {
    lg: [
        { i: 'kpis', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
        { i: 'summary', x: 0, y: 4, w: 12, h: 4, minW: 6, minH: 3 },
        { i: 'flow', x: 0, y: 8, w: 8, h: 10, minW: 4, minH: 6 },
        { i: 'ai', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
        { i: 'projection', x: 0, y: 18, w: 8, h: 10, minW: 4, minH: 6 },
        { i: 'evolucao_pag', x: 0, y: 28, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'curva_pag', x: 6, y: 28, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'dist_pag_fornecedor', x: 0, y: 37, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'top_pag', x: 4, y: 37, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'faixa_pag', x: 8, y: 37, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'geo_pagar', x: 0, y: 46, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'dist_tipo_pag', x: 4, y: 46, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'dist_cond_pag', x: 8, y: 46, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'evolucao_rec', x: 0, y: 55, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'curva_rec', x: 6, y: 55, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'dist_rec_cliente', x: 0, y: 64, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'top_rec', x: 4, y: 64, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'faixa_rec', x: 8, y: 64, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'geo_receber', x: 0, y: 73, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'performance', x: 4, y: 73, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'aging', x: 8, y: 73, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'efficiency_kpis', x: 0, y: 82, w: 12, h: 10, minW: 6, minH: 6 },
        { i: 'saldo_acumulado', x: 0, y: 92, w: 8, h: 12, minW: 4, minH: 8 },
        { i: 'fluxo_diario_proj', x: 8, y: 92, w: 4, h: 12, minW: 3, minH: 8 },
        { i: 'vol_dia_mes', x: 0, y: 104, w: 6, h: 10, minW: 3, minH: 6 },
        { i: 'dist_faixa_prazo', x: 6, y: 104, w: 6, h: 10, minW: 3, minH: 6 },
        { i: 'liq_empresa', x: 0, y: 114, w: 6, h: 10, minW: 3, minH: 6 },
        { i: 'vol_cpf_cnpj', x: 6, y: 108, w: 6, h: 9, minW: 3, minH: 6 },
        { i: 'pm_rec_cli', x: 0, y: 117, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'pm_pag_for', x: 4, y: 117, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'tm_rec_cli', x: 8, y: 117, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'tm_pag_for', x: 0, y: 126, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'docs_cli', x: 4, y: 126, w: 4, h: 9, minW: 3, minH: 6 },
        { i: 'docs_for', x: 8, y: 126, w: 4, h: 9, minW: 3, minH: 6 },
    ]
};

// Auto-generate md and sm from lg to prevent tiny items
// Auto-generate md and sm from lg to prevent tiny items
const generateResponsiveLayouts = (lg: any[]): ResponsiveLayouts => {
    const md = lg.map(item => ({ ...item, w: Math.min(item.w, 10), x: Math.min(item.x, 9) }));
    const sm = lg.map(item => ({ ...item, w: Math.min(item.w, 6), x: Math.min(item.x, 5) }));
    return { lg, md, sm };
};

const FINAL_DEFAULT_LAYOUTS = generateResponsiveLayouts(DEFAULT_LAYOUTS.lg as any);

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
    const [savedLayouts, setSavedLayouts] = useState<ResponsiveLayouts>(FINAL_DEFAULT_LAYOUTS);

    // UI State
    const [isEditMode, setIsEditMode] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [analysisChartId, setAnalysisChartId] = useState<string | null>(null);
    const [filterMode, setFilterMode] = useState<'all' | 'payable' | 'receivable'>('all');

    const userId = session?.user?.id || 'default';

    const onLayoutChange = (_current: Layout, all: ResponsiveLayouts) => {
        if (!isEditMode) return;

        setSavedLayouts((prev) => {
            const updated = { ...prev };
            
            Object.keys(all).forEach((breakpoint) => {
                const newBpLayout = all[breakpoint as keyof ResponsiveLayouts] || [];
                const existingBpLayout = [...(prev[breakpoint as keyof ResponsiveLayouts] || [])];

                newBpLayout.forEach((newItem: any) => {
                    const defaultItem = (DEFAULT_LAYOUTS.lg as any[] || []).find(d => d.i === newItem.i);
                    
                    // Sanitize: never save smaller than min or 1x1 if default is bigger
                    const sanitizedItem = {
                        ...newItem,
                        w: Math.max(newItem.w, defaultItem?.minW || 1),
                        h: Math.max(newItem.h, defaultItem?.minH || 1)
                    };

                    const idx = existingBpLayout.findIndex((item: any) => item.i === newItem.i);
                    if (idx !== -1) {
                        existingBpLayout[idx] = { ...existingBpLayout[idx], ...sanitizedItem };
                    } else {
                        existingBpLayout.push(sanitizedItem);
                    }
                });

                updated[breakpoint as keyof ResponsiveLayouts] = existingBpLayout;
            });

            localStorage.setItem(`finance_v5_layouts_${userId}`, JSON.stringify(updated));
            return updated;
        });
    };

    // Helper to merge saved layout with defaults (Ensures no missing/tiny items)
    const mergeWithDefaults = (saved: ResponsiveLayouts): ResponsiveLayouts => {
        const merged = { ...FINAL_DEFAULT_LAYOUTS, ...saved };
        Object.keys(FINAL_DEFAULT_LAYOUTS).forEach(bp => {
            const dLayout = FINAL_DEFAULT_LAYOUTS[bp as keyof ResponsiveLayouts] || [];
            const sLayout = [...(merged[bp as keyof ResponsiveLayouts] || [])];
            
            dLayout.forEach(dItem => {
                const sItemIdx = sLayout.findIndex(si => si.i === dItem.i);
                if (sItemIdx === -1) {
                    sLayout.push(dItem);
                } else {
                    // Force minimum height/width if they somehow became 0 or tiny
                    sLayout[sItemIdx] = { 
                        ...dItem, 
                        ...sLayout[sItemIdx],
                        w: Math.max(sLayout[sItemIdx].w, dItem.minW || 1),
                        h: Math.max(sLayout[sItemIdx].h, dItem.minH || 1)
                    };
                }
            });
            merged[bp as keyof ResponsiveLayouts] = sLayout;
        });
        return merged;
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

        if (session) {
            const user = session.user as any;
            const currentUserId = user.id || 'default';

            // Check for any access and redirect if none
            const hasAnyAccess = user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || 
                                 user.hasPayableDashboardAccess || 
                                 user.hasReceivableDashboardAccess || 
                                 user.hasBankingDashboardAccess;

            if (!hasAnyAccess) {
                window.location.href = "/chat";
                return;
            }

            // 1. Load from storage
            const sWidgets = localStorage.getItem(`finance_v5_widgets_${currentUserId}`);
            const sLayouts = localStorage.getItem(`finance_v5_layouts_${currentUserId}`);

            let savedWidgets: WidgetConfig[] = [];
            if (sWidgets) {
                try { savedWidgets = JSON.parse(sWidgets); } catch (e) { }
            }

            // 2. Filter default widgets by access (Master list)
            const availableWidgets = DEFAULT_WIDGETS.filter(w => {
                if (user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
                
                // Widgets that require Receber
                const receiveWidgets = ['aging', 'performance', 'dist_rec_cliente', 'geo_receber', 'evolucao_rec', 'curva_rec', 'top_rec', 'faixa_rec', 'pm_rec_cli', 'tm_rec_cli', 'docs_cli'];
                if (receiveWidgets.includes(w.id) && !user.hasReceivableDashboardAccess) return false;

                const payableWidgets = ['dist_pag_fornecedor', 'geo_pagar', 'dist_tipo_pag', 'dist_cond_pag', 'evolucao_pag', 'curva_pag', 'top_pag', 'faixa_pag', 'pm_pag_for', 'tm_pag_for', 'docs_for'];
                if (payableWidgets.includes(w.id) && !user.hasPayableDashboardAccess) return false;
                
                return true;
            });

            // 3. Apply saved visibility to available widgets
            const finalWidgets = availableWidgets.map(aw => {
                const saved = savedWidgets.find(sw => sw.id === aw.id);
                return {
                    ...aw,
                    visible: saved ? saved.visible : aw.visible
                };
            });

            setWidgets(finalWidgets);

            // 4. Load Layouts
            if (sLayouts) {
                try {
                    const parsed = JSON.parse(sLayouts);
                    const merged = mergeWithDefaults(parsed);
                    setSavedLayouts(merged);
                    setLayouts(merged);
                } catch (e) { }
            }

            // 5. Load Filter Mode
            const sFilterMode = localStorage.getItem(`finance_v5_filter_mode_${currentUserId}`);
            if (sFilterMode && ['all', 'payable', 'receivable'].includes(sFilterMode)) {
                setFilterMode(sFilterMode as any);
            }

            fetchData(startDate, endDate);
        }
    }, [session]); // Removed setLayouts from deps to prevent loops

    // Sync grid layout when items are toggled or filter changed
    useEffect(() => {
        if (mounted) {
            setLayouts(savedLayouts);
        }
    }, [filterMode, widgets, mounted, setLayouts, savedLayouts]);

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

    const applyFilterMode = (mode: 'all' | 'payable' | 'receivable') => {
        setFilterMode(mode);
        const newWidgets = widgets.map(w => {
            if (mode === 'payable') {
                if (RECEIVABLE_WIDGETS.includes(w.id)) return { ...w, visible: false };
                if (PAYABLE_WIDGETS.includes(w.id)) return { ...w, visible: true };
            } else if (mode === 'receivable') {
                if (PAYABLE_WIDGETS.includes(w.id)) return { ...w, visible: false };
                if (RECEIVABLE_WIDGETS.includes(w.id)) return { ...w, visible: true };
            } else if (mode === 'all') {
                return { ...w, visible: true };
            }
            return w;
        });
        setWidgets(newWidgets);
        localStorage.setItem(`finance_v5_widgets_${userId}`, JSON.stringify(newWidgets));
        localStorage.setItem(`finance_v5_filter_mode_${userId}`, mode);
        
        // Force a layout merge and update immediately
        const currentMerged = mergeWithDefaults(savedLayouts);
        setSavedLayouts(currentMerged);
        setLayouts(currentMerged);
    };

    const resetLayout = () => {
        setSavedLayouts(FINAL_DEFAULT_LAYOUTS);
        setLayouts(FINAL_DEFAULT_LAYOUTS);
        setWidgets(DEFAULT_WIDGETS);
        setFilterMode('all');
        localStorage.removeItem(`finance_v5_layouts_${userId}`);
        localStorage.removeItem(`finance_v5_widgets_${userId}`);
        setShowResetModal(false);
    };

    const isWidgetVisible = (id: string) => widgets.find(w => w.id === id)?.visible;

    const getWidgetInfo = (id: string) => {
        const descriptions: Record<string, string> = {
            'kpis': 'Visão geral dos principais indicadores de saúde financeira, incluindo score, DSO e prazos médios.',
            'summary': 'Resumo consolidado dos valores totais a pagar, a receber e saldo projetado.',
            'flow': 'Comparativo mensal entre valores recebidos, pagos e previsões de entradas.',
            'projection': 'Projeção detalhada de saldo e fluxo financeiro para os próximos 30 dias.',
            'aging': 'Análise de documentos vencidos distribuídos por faixas de atraso.',
            'ai': 'Insights gerados automaticamente pela IA baseados em tendências de comportamento dos dados.',
            'performance': 'Mede a pontualidade dos recebimentos históricos.',
            'dist_pag_fornecedor': 'Identifica quais fornecedores concentram a maior parte das despesas em aberto.',
            'geo_pagar': 'Distribuição geográfica das obrigações financeiras por estado.',
            'dist_tipo_pag': 'Análise dos métodos de pagamento mais utilizados (Boleto, Pix, Cartão, etc).',
            'dist_cond_pag': 'Distribuição das condições de parcelamento negociadas com fornecedores.',
            'evolucao_pag': 'Demonstra o volume de pagamentos realizados mês a mês.',
            'curva_pag': 'Visualização temporal do volume a pagar futuro (curva de vencimentos).',
            'top_pag': 'Lista dos 10 maiores documentos individuais pendentes de pagamento.',
            'faixa_pag': 'Distribuição da contagem de documentos por faixas de valor financeiro.',
            'dist_rec_cliente': 'Identifica a concentração de receita em clientes específicos.',
            'geo_receber': 'Distribuição geográfica das receitas por estado.',
            'evolucao_rec': 'Evolução mensal do volume total de recebimentos efetuados.',
            'curva_rec': 'Visualização temporal do volume a receber futuro.',
            'top_rec': 'Lista dos 10 maiores recebíveis individuais em aberto.',
            'faixa_rec': 'Distribuição do volume de títulos a receber por faixas de valor.',
            'efficiency_kpis': '23 indicadores avançados de performance, risco e eficiência operacional.',
            'vol_dia_mes': 'Volume total de movimentação diária para identificar picos de carga mensal.',
            'liq_empresa': 'Índice de liquidez segregado por unidade de negócio ou filial.',
            'fluxo_diario_proj': 'Projeção de saldo acumulado dia a dia nos próximos 30 dias.',
            'vol_cpf_cnpj': 'Volume transacionado por identificador de documento.',
            'dist_faixa_prazo': 'Agrupamento de documentos pelo tempo restante até o vencimento.',
            'pm_rec_cli': 'Prazo médio que cada cliente leva para efetuar o pagamento após o vencimento.',
            'pm_pag_for': 'Prazo médio de pagamento para fornecedores específicos.',
            'tm_rec_cli': 'Valor médio por documento faturado para cada cliente.',
            'tm_pag_for': 'Valor médio das compras realizadas com cada fornecedor.',
            'docs_cli': 'Quantidade total de documentos ativos ou liquidados por cliente.',
            'docs_for': 'Quantidade total de documentos gerados por fornecedor.'
        };
        return {
            title: widgets.find(w => w.id === id)?.name || "Análise de Gráfico",
            description: descriptions[id] || "Esta análise permite visualizar o comportamento dos dados financeiros através deste indicador.",
            data: advanced ? (advanced as any)[id] || advanced.saudeFinanceira : null
        };
    };

    // Render logic for grid items
    const renderWidget = (id: string, onlyContent = false) => {
        const widget = widgets.find(w => w.id === id);
        if (!widget) return null;

        const content = (() => {
            switch (id) {
                case 'kpis': return <AdvancedKpiCards data={advanced?.saudeFinanceira || null} isLoading={isLoading} />;
                case 'summary': return <FinanceSummaryCards data={summary} isLoading={isLoading} />;
                case 'flow': return <MonthlyFlowChart data={monthlyFlow} isLoading={isLoading} />;
                case 'projection': return <CashProjectionChart data={advanced?.previsaoCaixa || []} isLoading={isLoading} />;
                case 'aging': return <AgingChart data={advanced?.aging || []} isLoading={isLoading} />;
                case 'ai': return <AiAnalysisPanel data={aiAnalysis} isLoading={isLoading} />;
                case 'performance': return <DistributionPieChart title="" data={advanced?.performanceRecebimento?.map(i => ({ label: i.categoria, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />;
                case 'dist_pag_fornecedor': return <DistributionPieChart title="" data={advanced?.distribuicaoPagarFornecedor || []} isLoading={isLoading} />;
                case 'geo_pagar': return <DistributionPieChart title="" data={advanced?.geograficoPagar?.map(i => ({ label: i.local, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />;
                case 'dist_tipo_pag': return <DistributionPieChart title="" data={advanced?.distribuicaoTipoPagamento || []} isLoading={isLoading} />;
                case 'dist_cond_pag': return <DistributionPieChart title="" data={advanced?.distribuicaoCondicaoPagamento || []} isLoading={isLoading} />;
                case 'faixa_pag': return <DistributionPieChart title="" data={advanced?.distribuicaoFaixaValorPagar || []} isLoading={isLoading} />;
                case 'evolucao_pag': return <MonthlyEvolutionChart title="" data={advanced?.evolucaoMensalPagamento || []} isLoading={isLoading} color="#f43f5e" fillColor="#f43f5e" dataKey="valor" />;
                case 'curva_pag': return <MonthlyEvolutionChart title="" data={advanced?.curvaVencimentoPagar || []} isLoading={isLoading} color="#e11d48" fillColor="#e11d48" dataKey="valor" />;
                case 'top_pag': return <TopAccountsList title="" data={advanced?.topContasPagar || []} isLoading={isLoading} iconColor="text-rose-500" valueColor="text-rose-600" />;
                case 'dist_rec_cliente': return <DistributionPieChart title="" data={advanced?.distribuicaoReceberCliente || []} isLoading={isLoading} />;
                case 'geo_receber': return <DistributionPieChart title="" data={advanced?.geograficoReceber?.map(i => ({ label: i.local, valor: i.valor, percentual: 0 })) || []} isLoading={isLoading} />;
                case 'faixa_rec': return <DistributionPieChart title="" data={advanced?.distribuicaoFaixaValorReceber || []} isLoading={isLoading} />;
                case 'evolucao_rec': return <MonthlyEvolutionChart title="" data={advanced?.evolucaoMensalRecebimento || []} isLoading={isLoading} color="#10b981" fillColor="#10b981" dataKey="valor" />;
                case 'curva_rec': return <MonthlyEvolutionChart title="" data={advanced?.curvaVencimentoReceber || []} isLoading={isLoading} color="#059669" fillColor="#059669" dataKey="valor" />;
                case 'top_rec': return <TopAccountsList title="" data={advanced?.topContasReceber || []} isLoading={isLoading} iconColor="text-emerald-500" valueColor="text-emerald-600" />;
                case 'efficiency_kpis': return <EfficiencyKpiCards data={advanced?.saudeFinanceira || null} isLoading={isLoading} />;
                case 'vol_dia_mes': return <DistributionPieChart title="" data={advanced?.volumePorDia || []} isLoading={isLoading} />;
                case 'liq_empresa': return <DistributionPieChart title="" data={advanced?.indiceLiquidezPorEmpresa || []} isLoading={isLoading} />;
                case 'fluxo_diario_proj': return <DailyBalanceChart data={advanced?.fluxoCaixaDiarioProjetado || []} isLoading={isLoading} color="#8b5cf6" />;
                case 'vol_cpf_cnpj': return <TopAccountsList title="" data={advanced?.volumePorCpfCnpj?.map((i: any) => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-indigo-500" valueColor="text-indigo-600" />;
                case 'saldo_acumulado': return <DailyBalanceChart data={advanced?.evolucaoSaldo?.map((i: any) => ({ ano: 2024, mes: 1, valor: i.saldoAcumulado, mesAno: i.data.toString().split('T')[0] })) || []} isLoading={isLoading} color="#10b981" />;
                case 'dist_faixa_prazo': return <DistributionPieChart title="" data={advanced?.distribuicaoFaixaPrazoVencimento || []} isLoading={isLoading} />;
                case 'pm_rec_cli': return <DistributionPieChart title="" data={advanced?.prazoMedioRecebimentoPorCliente || []} isLoading={isLoading} />;
                case 'pm_pag_for': return <DistributionPieChart title="" data={advanced?.prazoMedioPagamentoPorFornecedor || []} isLoading={isLoading} />;
                case 'tm_rec_cli': return <TopAccountsList title="" data={advanced?.ticketMedioPorCliente?.map((i: any) => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-emerald-500" valueColor="text-emerald-600" />;
                case 'tm_pag_for': return <TopAccountsList title="" data={advanced?.ticketMedioPorFornecedor?.map((i: any) => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-rose-500" valueColor="text-rose-600" />;
                case 'docs_cli': return <TopAccountsList title="" data={advanced?.documentosPorClienteAtivo?.map((i: any) => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-blue-500" valueColor="text-blue-600" />;
                case 'docs_for': return <TopAccountsList title="" data={advanced?.documentosPorFornecedorAtivo?.map((i: any) => ({ documento: i.label, valor: i.valor })) || []} isLoading={isLoading} iconColor="text-orange-500" valueColor="text-orange-600" />;
                default: return null;
            }
        })();

        if (onlyContent) return <div className="h-full w-full min-h-[500px] flex flex-col">{content}</div>;

        return (
            <div key={id} className="h-full">
                <DashboardWidget id={id} title={widget.name} showControls={isEditMode} onRemove={toggleWidget} onAnalyze={setAnalysisChartId}>
                    {content}
                </DashboardWidget>
            </div>
        );
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

                            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => applyFilterMode('all')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterMode === 'all'
                                        ? 'bg-white text-neutral-900 shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Todos
                                </button>
                                <button
                                    onClick={() => applyFilterMode('payable')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterMode === 'payable'
                                        ? 'bg-rose-500 text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Pagar
                                </button>
                                <button
                                    onClick={() => applyFilterMode('receivable')}
                                    className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${filterMode === 'receivable'
                                        ? 'bg-emerald-500 text-white shadow-sm'
                                        : 'text-neutral-500 hover:text-neutral-700'
                                        }`}
                                >
                                    Receber
                                </button>
                            </div>

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
                    <div className="mb-8 p-6 bg-white rounded-3xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-500 shadow-xl shadow-indigo-100/20">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-black text-neutral-900 flex items-center gap-2 tracking-tight">
                                <LayoutIcon className="w-5 h-5 text-indigo-600" />
                                GESTÃO E CONFIGURAÇÃO DA DASHBOARD
                            </h4>
                            <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-widest">
                                Layout Interativo
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Coluna Receber */}
                            <div className="space-y-4 p-4 rounded-2xl bg-emerald-50/30 border border-emerald-100/50">
                                <h5 className="text-[11px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    Módulos de Recebimento
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                    {widgets.filter(w => RECEIVABLE_WIDGETS.includes(w.id)).map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => toggleWidget(w.id)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${w.visible
                                                ? 'bg-white text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-100'
                                                : 'bg-neutral-50/50 text-neutral-400 border-neutral-100 opacity-60'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${w.visible ? 'bg-emerald-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                                                {w.visible ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                            </div>
                                            <span className="truncate">{w.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Coluna Geral / Ambos */}
                            <div className="space-y-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                                <h5 className="text-[11px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    Visão Geral e IA
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                    {widgets.filter(w => !RECEIVABLE_WIDGETS.includes(w.id) && !PAYABLE_WIDGETS.includes(w.id)).map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => toggleWidget(w.id)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${w.visible
                                                ? 'bg-white text-indigo-700 border-indigo-200 shadow-sm shadow-indigo-100'
                                                : 'bg-neutral-50/50 text-neutral-400 border-neutral-100 opacity-60'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${w.visible ? 'bg-indigo-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                                                {w.visible ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                            </div>
                                            <span className="truncate">{w.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Coluna Pagar */}
                            <div className="space-y-4 p-4 rounded-2xl bg-rose-50/30 border border-rose-100/50">
                                <h5 className="text-[11px] font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                    Módulos de Pagamento
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                    {widgets.filter(w => PAYABLE_WIDGETS.includes(w.id)).map((w) => (
                                        <button
                                            key={w.id}
                                            onClick={() => toggleWidget(w.id)}
                                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${w.visible
                                                ? 'bg-white text-rose-700 border-rose-200 shadow-sm shadow-rose-100'
                                                : 'bg-neutral-50/50 text-neutral-400 border-neutral-100 opacity-60'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded-md flex items-center justify-center transition-colors ${w.visible ? 'bg-rose-500 text-white' : 'bg-neutral-200 text-neutral-400'}`}>
                                                {w.visible ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                            </div>
                                            <span className="truncate">{w.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
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

            {/* AI Deep Analysis View */}
            {analysisChartId && (
                <ChartAnalysisView
                    id={analysisChartId}
                    {...getWidgetInfo(analysisChartId)}
                    chartComponent={renderWidget(analysisChartId, true)}
                    onClose={() => setAnalysisChartId(null)}
                    initialStartDate={startDate}
                    initialEndDate={endDate}
                />
            )}

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
