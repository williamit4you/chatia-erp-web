"use client";

import { Distribution } from "@/services/finance-analytics.service";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DistributionBarChartProps {
    data: Distribution[];
    isLoading: boolean;
    color?: string;
}

export default function DistributionBarChart({ data, isLoading, color = "#7c3aed" }: DistributionBarChartProps) {
    if (isLoading) {
        return <div className="h-[280px] w-full animate-pulse rounded-xl bg-neutral-50" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex h-[280px] w-full items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 text-sm font-medium text-neutral-400">
                Nenhum dado disponivel no periodo
            </div>
        );
    }

    const chartData = data.slice(0, 10).map((item) => ({
        label: item.label,
        valor: item.valor,
        shortLabel: item.label.length > 10 ? `${item.label.slice(0, 9)}.` : item.label,
    }));

    return (
        <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="shortLabel"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#737373", fontSize: 10, fontWeight: 600 }}
                        interval={0}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#737373", fontSize: 10, fontWeight: 600 }}
                        tickFormatter={(value) => `${value >= 1000 ? `${(Number(value) / 1000).toFixed(0)}k` : value}`}
                    />
                    <Tooltip
                        cursor={{ fill: "rgba(124, 58, 237, 0.08)" }}
                        contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        formatter={(value: any) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(Number(value))}
                        labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
                    />
                    <Bar dataKey="valor" fill={color} radius={[5, 5, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

