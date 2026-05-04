"use client";

import { FinancialHealth } from "@/services/finance-analytics.service";
import { Activity, Percent, Clock, Target } from "lucide-react";

interface AdvancedKpiCardsProps {
    data: FinancialHealth | null;
    isLoading: boolean;
}

export default function AdvancedKpiCards({ data, isLoading }: AdvancedKpiCardsProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm animate-pulse h-24"></div>
                ))}
            </div>
        );
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

    const kpis = [
        {
            label: "Ticket Médio (Receber)",
            value: formatCurrency(data.ticketMedioRecebimento),
            suffix: "",
            icon: Target,
            color: "text-emerald-600",
            bgColor: "bg-emerald-50",
            sub: "Por documento recebido"
        },
        {
            label: "Ticket Médio (Pagar)",
            value: formatCurrency(data.ticketMedioPagamento),
            suffix: "",
            icon: Target,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            sub: "Por documento pago"
        },
        {
            label: "Prazo Médio Rec.",
            value: data.prazoMedioRecebimento.toFixed(0),
            suffix: " dias",
            icon: Clock,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            sub: "Tempo para receber"
        },
        {
            label: "Prazo Médio Pagt.",
            value: data.prazoMedioPagamento.toFixed(0),
            suffix: " dias",
            icon: Clock,
            color: "text-amber-600",
            bgColor: "bg-amber-50",
            sub: "Tempo para pagar"
        },
        {
            label: "Índ. de Liquidez",
            value: data.indiceLiquidezOperacional.toFixed(2),
            suffix: "x",
            icon: Activity,
            color: "text-cyan-600",
            bgColor: "bg-cyan-50",
            sub: "Receitas / Despesas"
        },
        {
            label: "Inadimplência",
            value: data.inadimplencia.toFixed(1),
            suffix: "%",
            icon: Percent,
            color: "text-yellow-700",
            bgColor: "bg-yellow-50",
            sub: "Total Vencido vs Geral"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpis.map((kpi, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${kpi.bgColor} ${kpi.color}`}>
                        <kpi.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs text-neutral-500 font-medium">{kpi.label}</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-neutral-900">{kpi.value}</span>
                            <span className="text-xs text-neutral-400 font-medium">{kpi.suffix}</span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{kpi.sub}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
