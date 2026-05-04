"use client";

import { Distribution } from "@/services/finance-analytics.service";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface DistributionPieChartProps {
    data: Distribution[];
    isLoading: boolean;
    title: string;
    colors?: string[];
}

export default function DistributionPieChart({ data, isLoading, title, colors }: DistributionPieChartProps) {
    if (isLoading) {
        return <div className="h-[350px] w-full bg-neutral-50 animate-pulse rounded-xl"></div>;
    }

    const COLORS = colors || ['#6366f1', '#10b981', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm h-full flex flex-col">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">{title}</h3>
            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="valor"
                            nameKey="label"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                        />
                        <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
