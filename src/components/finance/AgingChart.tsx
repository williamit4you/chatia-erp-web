"use client";

import { Aging, ChartSelection } from "@/services/finance-analytics.service";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useDrilldownSelect } from "@/components/finance/drilldownContext";
import { formatCurrency, formatPercent } from "@/lib/formatters/financeFormat";
import { payableColors, semanticColors } from "@/lib/financeChartTokens";
import ChartLoadingState from "@/components/finance/ChartLoadingState";

interface AgingChartProps {
    data: Aging[];
    isLoading: boolean;
    onDrilldownSelect?: (selection: ChartSelection) => void;
}

export default function AgingChart({ data, isLoading, onDrilldownSelect }: AgingChartProps) {
    const drilldownFromContext = useDrilldownSelect();
    const drillHandler = onDrilldownSelect ?? drilldownFromContext ?? null;
    const [viewMode, setViewMode] = useState<"value" | "percent">("value");

    if (isLoading) {
        return <ChartLoadingState heightClass="h-[300px]" variant="bar" title="Aging" />;
    }

    const COLORS = [semanticColors.positive, semanticColors.warning, payableColors.outflow, semanticColors.negative, "#7f1d1d"];
    const total = useMemo(() => data.reduce((sum, item) => sum + (Number(item.valor) || 0), 0), [data]);
    const chartData = useMemo(
        () =>
            data.map((item) => ({
                ...item,
                percentual: total > 0 ? item.valor / total : 0,
            })),
        [data, total]
    );
    const dataKey = viewMode === "percent" ? "percentual" : "valor";

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-neutral-900">Aging de Contas (Atraso)</h3>
                <div className="inline-flex w-fit rounded-full border border-neutral-200 bg-neutral-50 p-1">
                    <button
                        type="button"
                        onClick={() => setViewMode("value")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            viewMode === "value" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                        }`}
                    >
                        Valor
                    </button>
                    <button
                        type="button"
                        onClick={() => setViewMode("percent")}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                            viewMode === "percent" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
                        }`}
                    >
                        %
                    </button>
                </div>
            </div>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 12, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="faixa"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#737373', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            width={84}
                            tick={{ fill: '#737373', fontSize: 12 }}
                            tickFormatter={(value) =>
                                viewMode === "percent"
                                    ? formatPercent(Number(value), { maximumFractionDigits: 1 })
                                    : formatCurrency(Number(value), { compact: true, maximumFractionDigits: 1 })
                            }
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any, _name: any, payload: any) =>
                                viewMode === "percent"
                                    ? [
                                          formatPercent(Number(value), { maximumFractionDigits: 1 }),
                                          `${payload?.payload?.faixa ?? "Faixa"} (% do total)`,
                                      ]
                                    : [
                                          formatCurrency(Number(value), { compact: false, maximumFractionDigits: 2 }),
                                          payload?.payload?.faixa ?? "Faixa",
                                      ]
                            }
                        />
                        <Bar
                            dataKey={dataKey}
                            radius={[4, 4, 0, 0]}
                            className={drillHandler ? "cursor-pointer" : undefined}
                            onClick={(d: any) => {
                                if (!drillHandler) return;
                                const faixa = d?.payload?.faixa;
                                if (!faixa) return;
                                drillHandler({ kind: "range_bucket", key: String(faixa), label: String(faixa) });
                            }}
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
