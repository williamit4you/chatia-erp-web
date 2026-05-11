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
            <div className="p-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm" />
                    ))}
                </div>
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
        <div className="p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {kpis.map((kpi, idx) => (
                    <div key={idx} className="flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                        <div className={`rounded-lg p-3 ${kpi.bgColor} ${kpi.color}`}>
                            <kpi.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-neutral-600">{kpi.label}</p>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-bold text-neutral-900">{kpi.value}</span>
                                <span className="text-xs font-medium text-neutral-500">{kpi.suffix}</span>
                            </div>
                            <p className="mt-1 text-[11px] font-semibold leading-4 text-neutral-600">{kpi.sub}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
