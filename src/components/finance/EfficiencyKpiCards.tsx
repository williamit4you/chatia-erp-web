"use client";

import { FinancialHealth } from "@/services/finance-analytics.service";
import { 
    Zap, 
    TrendingUp, 
    AlertTriangle, 
    ShieldCheck, 
    Users, 
    Truck, 
    Calendar,
    BarChart3,
    Clock,
    Target
} from "lucide-react";

interface EfficiencyKpiCardsProps {
    data: FinancialHealth | null;
    isLoading: boolean;
}

export default function EfficiencyKpiCards({ data, isLoading }: EfficiencyKpiCardsProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-white p-3 rounded-xl border border-neutral-100 h-20"></div>
                ))}
            </div>
        );
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val: number) => `${val.toFixed(1)}%`;

    const kpis = [
        { label: "Índ. Cobertura", value: `${data.indiceCobertura.toFixed(2)}x`, icon: ShieldCheck, color: "text-indigo-600", bg: "bg-indigo-50", sub: "Receber / Pagar" },
        { label: "Gap Financeiro", value: formatCurrency(data.gapFinanceiro), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", sub: "Receber - Pagar" },
        { label: "Projeção 30d", value: formatCurrency(data.saldoFinanceiro30Dias), icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", sub: "Saldo Previsto" },
        { label: "% Rec. no Prazo", value: formatPercent(data.percRecebidoNoPrazo), icon: Zap, color: "text-cyan-600", bg: "bg-cyan-50", sub: "Eficiência Cobrança" },
        { label: "% Pago no Prazo", value: formatPercent(data.percPagoNoPrazo), icon: Zap, color: "text-blue-600", bg: "bg-blue-50", sub: "Pontualidade" },
        { label: "Atraso Rec. (Médio)", value: `${data.diasMedioAtrasoReceber.toFixed(0)}d`, icon: Calendar, color: "text-yellow-700", bg: "bg-yellow-50", sub: "Dias em atraso" },
        { label: "Atraso Pag. (Médio)", value: `${data.diasMedioAtrasoPagar.toFixed(0)}d`, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50", sub: "Dias em atraso" },
        { label: "Dependência Cliente", value: formatPercent(data.indiceDependenciaCliente), icon: Users, color: "text-violet-600", bg: "bg-violet-50", sub: "Risco Concentração" },
        { label: "Dependência Fornec.", value: formatPercent(data.indiceDependenciaFornecedor), icon: Truck, color: "text-slate-600", bg: "bg-slate-50", sub: "Risco Suprimento" },
        { label: "Rotação Financeira", value: formatCurrency(data.rotacaoFinanceira), icon: BarChart3, color: "text-pink-600", bg: "bg-pink-50", sub: "Giro por Doc" },
        { label: "Prazo Rest. Rec.", value: `${data.prazoMedioRestanteReceber.toFixed(0)}d`, icon: Clock, color: "text-emerald-600", bg: "bg-emerald-50", sub: "Média p/ vencer" },
        { label: "Prazo Rest. Pag.", value: `${data.prazoMedioRestantePagar.toFixed(0)}d`, icon: Clock, color: "text-yellow-700", bg: "bg-yellow-50", sub: "Média p/ vencer" },
        { label: "Parcelas em Atraso", value: formatPercent(data.percParcelasAtraso), icon: AlertTriangle, color: "text-yellow-800", bg: "bg-yellow-50", sub: "Risco Imediato" },
        { label: "Vlr Médio Cliente", value: formatCurrency(data.valorMedioCliente), icon: Users, color: "text-indigo-600", bg: "bg-indigo-50", sub: "Ticket p/ Cliente" },
        { label: "Vlr Médio Fornec.", value: formatCurrency(data.valorMedioFornecedor), icon: Truck, color: "text-amber-600", bg: "bg-amber-50", sub: "Ticket p/ Fornec" },
        { label: "Índ. Liquidação", value: formatPercent(data.indiceLiquidacaoDocumentos * 100), icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", sub: "% de Docs Pagos" },
        { label: "Conc. Top 5 Cli", value: formatPercent(data.concentracaoTop5Clientes), icon: Target, color: "text-purple-600", bg: "bg-purple-50", sub: "Faturamento Top 5" },
        { label: "Conc. Top 5 For", value: formatPercent(data.concentracaoTop5Fornecedores), icon: Target, color: "text-slate-600", bg: "bg-slate-50", sub: "Despesa Top 5" },
        { label: "Cresc. Receber", value: formatPercent(data.crescimentoRecebimentos), icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", sub: "Evolução Real" },
        { label: "Cresc. Pagar", value: formatPercent(data.crescimentoPagamentos), icon: TrendingUp, color: "text-orange-600", bg: "bg-orange-50", sub: "Evolução Custos" },
        { label: "% Próx. Venc.", value: formatPercent(data.percContasProximoVencimento), icon: Clock, color: "text-orange-600", bg: "bg-orange-50", sub: "Próximos 7 dias" },
        { label: "Média Emis-Venc", value: `${data.mediaDiasEmissaoVencimento.toFixed(0)}d`, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50", sub: "Prazo negociado" },
        { label: "Vlr Médio Parc.", value: formatCurrency(data.valorMedioParcelamento), icon: BarChart3, color: "text-neutral-600", bg: "bg-neutral-50", sub: "Média de parcelas" },

        // Phase 3
        { label: "% Rec. Antecip.", value: formatPercent(data.percRecebimentoAntecipado), icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50", sub: "Pagto antecipado" },
        { label: "% Pag. Antecip.", value: formatPercent(data.percPagamentoAntecipado), icon: Zap, color: "text-yellow-700", bg: "bg-yellow-50", sub: "Pagto antecipado" },
        { label: "Ciclo Emis-Pag", value: `${data.tempoMedioEmissaoPagamento.toFixed(0)}d`, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50", sub: "Tempo liquidação" },
        { label: "% Parcelados", value: formatPercent(data.percDocumentosParcelados), icon: BarChart3, color: "text-blue-500", bg: "bg-blue-50", sub: "Docs fatiados" },
        { label: "Média Parcelas", value: data.mediaParcelasPorDocumento.toFixed(1), icon: BarChart3, color: "text-slate-500", bg: "bg-slate-50", sub: "Parc. por Doc" },
        { label: "Entradas 7 d", value: formatPercent(data.percRecebimentos7Dias), icon: Calendar, color: "text-green-500", bg: "bg-green-50", sub: "Rec. próximos" },
        { label: "Tempo Restante", value: `${data.tempoMedioRestanteVencimento.toFixed(0)}d`, icon: Clock, color: "text-amber-500", bg: "bg-amber-50", sub: "Média p/ vencer" }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-yellow-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`p-1.5 rounded-lg ${kpi.bg} ${kpi.color}`}>
                            <kpi.icon className="w-4 h-4" />
                        </div>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">{kpi.label}</p>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-neutral-900">{kpi.value}</span>
                    </div>
                    <p className="text-[9px] text-neutral-400 font-medium mt-0.5">{kpi.sub}</p>
                </div>
            ))}
        </div>
    );
}
