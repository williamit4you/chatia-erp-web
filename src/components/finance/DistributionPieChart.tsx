"use client";

import type { ChartSelection, Distribution } from "@/services/finance-analytics.service";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useDrilldownSelect } from "@/components/finance/drilldownContext";
import { formatCurrency } from "@/lib/formatters/financeFormat";
import { payableColors, semanticColors } from "@/lib/financeChartTokens";
import { useEffect, useState } from "react";

interface DistributionPieChartProps {
    data: Distribution[];
    isLoading: boolean;
    title: string;
    colors?: string[];
    maxItems?: number;
    displayMode?: "default" | "detail";
    onDrilldownSelect?: (selection: ChartSelection) => void;
}

export default function DistributionPieChart({
    data,
    isLoading,
    title,
    colors,
    maxItems = 6,
    displayMode = "default",
    onDrilldownSelect,
}: DistributionPieChartProps) {
    const drilldownFromContext = useDrilldownSelect();
    const drillHandler = onDrilldownSelect ?? drilldownFromContext ?? null;
    const [isXL, setIsXL] = useState(false);
    const isDetailMode = displayMode === "detail";

    useEffect(() => {
        if (typeof window === "undefined") return;
        const mq = window.matchMedia("(min-width: 1280px)");
        const apply = () => setIsXL(mq.matches);
        apply();
        mq.addEventListener?.("change", apply);
        return () => mq.removeEventListener?.("change", apply);
    }, []);

    if (isLoading) {
        return <div className={`${isDetailMode ? "h-full min-h-[420px]" : "h-[300px]"} w-full rounded-xl bg-neutral-50`} />;
    }

    const COLORS =
        colors || [semanticColors.info, semanticColors.positive, semanticColors.warning, payableColors.outflow, "#8b5cf6", "#06b6d4", semanticColors.neutral];
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
            <div
                className={`flex ${isDetailMode ? "h-full min-h-[420px]" : "h-[300px]"} w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 text-sm font-medium text-neutral-400`}
            >
                Nenhum dado disponivel no periodo
            </div>
        );
    }

    const total = visibleData.reduce((sum, item) => sum + item.valor, 0);
    const innerRadius = isDetailMode ? (visibleData.length > 5 ? 86 : 94) : visibleData.length > 5 ? 52 : 58;
    const outerRadius = isDetailMode ? (visibleData.length > 5 ? 128 : 138) : visibleData.length > 5 ? 78 : 86;
    // Shift slightly left on desktop, but keep enough margin to avoid clipping.
    const chartCx = isXL ? (isDetailMode ? "44%" : "46%") : "50%";

    const formatMoney = (value: number, compact: boolean) => formatCurrency(value, { compact, maximumFractionDigits: compact ? 1 : 2 });

    return (
        <div className={`flex ${isDetailMode ? "h-full min-h-[420px]" : "h-[300px]"} w-full flex-col gap-3`}>
            {title && <h3 className="text-sm font-black text-neutral-900">{title}</h3>}
            <div className={`grid min-h-0 flex-1 grid-cols-1 gap-3 ${isDetailMode ? "xl:grid-cols-[minmax(340px,1.35fr)_minmax(220px,0.9fr)]" : "xl:grid-cols-[minmax(220px,1fr)_minmax(180px,260px)]"}`}>
                <div className={`relative ${isDetailMode ? "min-h-[320px] xl:pl-4" : "min-h-[210px] xl:pl-2"}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={visibleData}
                                cx={chartCx}
                                cy="50%"
                                innerRadius={innerRadius}
                                outerRadius={outerRadius}
                                paddingAngle={visibleData.length > 5 ? 3 : 5}
                                dataKey="valor"
                                nameKey="label"
                                onClick={(entry: any) => {
                                    if (!drillHandler) return;
                                    const label = entry?.label;
                                    if (!label || label === "Outros") return;
                                    drillHandler({ kind: "category", key: String(label), label: String(label) });
                                }}
                            >
                                {visibleData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${entry.label}-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        className={drillHandler && entry.label !== "Outros" ? "cursor-pointer" : undefined}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                formatter={(value: any) => formatMoney(Number(value), false)}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={`${isDetailMode ? "text-xs" : "text-[10px]"} font-black text-neutral-500`}>Total</span>
                        <span className={`${isDetailMode ? "text-xl leading-tight" : "text-xs"} font-black text-neutral-900`}>{formatMoney(total, true)}</span>
                    </div>
                </div>
                <div className={`flex min-w-0 flex-row flex-wrap content-center gap-2 overflow-hidden xl:flex-col xl:flex-nowrap xl:justify-center xl:overflow-visible ${isDetailMode ? "xl:gap-3" : ""}`}>
                    {visibleData.map((item, index) => (
                        <div key={`${item.label}-${index}`} className={`${isDetailMode ? "text-xs" : "text-[11px]"} flex min-w-0 items-center gap-2 font-bold text-neutral-700`}>
                            <span className={`${isDetailMode ? "h-3.5 w-3.5" : "h-3 w-3"} shrink-0 rounded-sm`} style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className={`truncate xl:whitespace-normal xl:break-words xl:line-clamp-2 ${isDetailMode ? "xl:leading-5" : "xl:leading-4"}`} title={item.label}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
