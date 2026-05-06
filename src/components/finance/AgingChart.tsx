"use client";

import { Aging } from "@/services/finance-analytics.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AgingChartProps {
    data: Aging[];
    isLoading: boolean;
}

export default function AgingChart({ data, isLoading }: AgingChartProps) {
    if (isLoading) {
        return <div className="h-[300px] w-full bg-neutral-50 rounded-xl"></div>;
    }

    const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#7f1d1d'];

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Aging de Contas (Atraso)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
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
                            tick={{ fill: '#737373', fontSize: 12 }}
                            tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}
                        />
                        <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
