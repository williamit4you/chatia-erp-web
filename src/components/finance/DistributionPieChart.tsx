"use client";

import { Distribution } from "@/services/finance-analytics.service";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface DistributionPieChartProps {
    data: Distribution[];
    isLoading: boolean;
    title: string;
    colors?: string[];
    maxItems?: number;
}

export default function DistributionPieChart({ data, isLoading, title, colors, maxItems = 6 }: DistributionPieChartProps) {
    if (isLoading) {
        return <div className="h-[300px] w-full rounded-xl bg-neutral-50" />;
    }

    const COLORS = colors || ["#2563eb", "#16a34a", "#f59e0b", "#f97316", "#8b5cf6", "#06b6d4", "#64748b"];
    const sortedData = [...(data || [])].filter((item) => Number.isFinite(item.valor)).sort((a, b) => b.valor - a.valor);
    const visibleData =
        sortedData.length > maxItems
            ? [
                  ...sortedData.slice(0, maxItems - 1),
                  {
                      label: "Outros",
                      valor: sortedData.slice(maxItems - 1).reduce((sum, item) => sum + item.valor, 0),
                      percentual: 0,
                  },
              ]
            : sortedData;

    if (visibleData.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 text-sm font-medium text-neutral-400">
                Nenhum dado disponivel no periodo
            </div>
        );
    }

    const total = visibleData.reduce((sum, item) => sum + item.valor, 0);
    const innerRadius = visibleData.length > 5 ? 52 : 58;
    const outerRadius = visibleData.length > 5 ? 78 : 86;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);

    return (
        <div className="flex h-[300px] w-full flex-col gap-3">
            {title && <h3 className="text-sm font-black text-neutral-900">{title}</h3>}
            <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_118px]">
                <div className="relative min-h-[210px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={visibleData}
                                cx="50%"
                                cy="50%"
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                paddingAngle={visibleData.length > 5 ? 3 : 5}
                                dataKey="valor"
                                nameKey="label"
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell key={`cell-${entry.label}-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                formatter={(value: any) => formatCurrency(Number(value))}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-neutral-500">Total</span>
                        <span className="text-xs font-black text-neutral-900">{formatCurrency(total)}</span>
                    </div>
                </div>
                <div className="flex min-w-0 flex-row flex-wrap content-center gap-2 overflow-hidden xl:flex-col xl:flex-nowrap xl:justify-center">
                    {visibleData.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2 text-[11px] font-bold text-neutral-700">
                            <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="truncate" title={item.label}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
