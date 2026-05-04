"use client";

import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type BarLayout = "vertical" | "horizontal";

export interface BarDistributionItem {
    label: string;
    valor: number;
}

interface DistributionBarChartProps {
    data: BarDistributionItem[];
    isLoading: boolean;
    color?: string;
    layout?: BarLayout;
    maxItems?: number;
    valueKind?: "currency" | "number";
    preserveOrder?: boolean;
    showZeroLine?: boolean;
}

export default function DistributionBarChart({
    data,
    isLoading,
    color = "#7c3aed",
    layout = "vertical",
    maxItems = 10,
    valueKind = "currency",
    preserveOrder = false,
    showZeroLine = false,
}: DistributionBarChartProps) {
    if (isLoading) {
        return <div className="h-[300px] w-full animate-pulse rounded-xl bg-neutral-50" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 text-sm font-medium text-neutral-400">
                Nenhum dado disponivel no periodo
            </div>
        );
    }

    const visibleItems = data
        .filter((item) => Number.isFinite(item.valor))
        .sort((a, b) => (preserveOrder ? 0 : b.valor - a.valor))
        .slice(0, maxItems);

    const chartData = visibleItems.map((item) => ({
        label: item.label,
        valor: item.valor,
        shortLabel: item.label.length > 11 ? `${item.label.slice(0, 10)}.` : item.label,
    }));

    const chartHeight = layout === "horizontal" ? Math.max(260, chartData.length * 38) : 300;
    const formatValue = (value: number) => {
        if (valueKind === "number") {
            return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(value);
        }
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", notation: "compact", maximumFractionDigits: 1 }).format(value);
    };

    if (layout === "horizontal") {
        return (
            <div className="w-full overflow-x-hidden overflow-y-auto pr-2" style={{ height: 300 }}>
                <div style={{ height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 22, left: 8, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} tickFormatter={(value) => formatValue(Number(value))} />
                            <YAxis type="category" dataKey="shortLabel" width={84} axisLine={false} tickLine={false} tick={{ fill: "#404040", fontSize: 11, fontWeight: 700 }} />
                            <Tooltip
                                cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                formatter={(value: any) => formatValue(Number(value))}
                                labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
                            />
                            {showZeroLine && <ReferenceLine x={0} stroke="#94a3b8" strokeWidth={1.2} />}
                            <Bar dataKey="valor" fill={color} radius={[0, 5, 5, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 18 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="shortLabel"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#737373", fontSize: chartData.length > 5 ? 9 : 11, fontWeight: 700 }}
                        interval={0}
                        angle={chartData.length > 5 ? -35 : 0}
                        textAnchor={chartData.length > 5 ? "end" : "middle"}
                        height={chartData.length > 5 ? 52 : 28}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#737373", fontSize: 10 }} tickFormatter={(value) => formatValue(Number(value))} />
                    <Tooltip
                        cursor={{ fill: "rgba(249, 115, 22, 0.08)" }}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        formatter={(value: any) => formatValue(Number(value))}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
                    />
                    {showZeroLine && <ReferenceLine y={0} stroke="#94a3b8" strokeWidth={1.2} />}
                    <Bar dataKey="valor" fill={color} radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
