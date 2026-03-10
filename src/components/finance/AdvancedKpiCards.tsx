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

    const kpis = [
        {
            label: "Score de Saúde",
            value: data.score.toFixed(0),
            suffix: "/100",
            icon: Activity,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50",
            sub: "Índice Ponderado"
        },
        {
            label: "Inadimplência",
            value: data.inadimplencia.toFixed(1),
            suffix: "%",
            icon: Percent,
            color: "text-red-600",
            bgColor: "bg-red-50",
            sub: "Total Vencido"
        },
        {
            label: "DSO (Prazo Médio)",
            value: data.dso.toFixed(0),
            suffix: " dias",
            icon: Clock,
            color: "text-orange-600",
            bgColor: "bg-orange-50",
            sub: "Velocidade Rec."
        },
        {
            label: "Conc. Receita",
            value: data.concentracaoReceita.toFixed(1),
            suffix: "%",
            icon: Target,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            sub: "Dependência Top 1"
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
