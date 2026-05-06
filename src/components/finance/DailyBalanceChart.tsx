"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from "recharts";
import { MonthlyEvolution } from "@/services/finance-analytics.service";

interface DailyBalanceChartProps {
    data: MonthlyEvolution[];
    isLoading: boolean;
    title?: string;
    color?: string;
}

export default function DailyBalanceChart({ data, isLoading, title, color = "#6366f1" }: DailyBalanceChartProps) {
    if (isLoading) {
        return <div className="w-full h-[300px] bg-neutral-50 rounded-xl" />;
    }

    if (!data || data.length === 0) {
        return (
            <div className="w-full h-[300px] flex items-center justify-center text-neutral-400 text-sm font-medium bg-neutral-50/50 rounded-xl border border-dashed border-neutral-200">
                Nenhum dado disponível no período
            </div>
        );
    }

    return (
        <div className="w-full h-[300px]">
            {title && <h3 className="text-sm font-bold text-neutral-800 mb-4">{title}</h3>}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                        dataKey="mesAno" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#A3A3A3', fontWeight: 600 }}
                        minTickGap={30}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#A3A3A3', fontWeight: 600 }}
                        tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : val}`}
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: 'bold' }}
                        formatter={(val: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val)), 'Saldo']}
                    />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
                    <Area 
                        type="monotone" 
                        dataKey="valor" 
                        stroke={color} 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorBalance)" 
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
