"use client";

import { MonthlyEvolution } from "@/services/finance-analytics.service";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface MonthlyEvolutionChartProps {
    data: MonthlyEvolution[];
    isLoading: boolean;
    title: string;
    dataKey: string;
    color: string;
    fillColor: string;
}

export default function MonthlyEvolutionChart({ data, isLoading, title, color, fillColor }: MonthlyEvolutionChartProps) {
    if (isLoading) {
        return <div className="h-[300px] w-full bg-neutral-50 animate-pulse rounded-xl"></div>;
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm w-full flex flex-col">
            {title ? <h3 className="text-lg font-bold text-neutral-900 mb-6">{title}</h3> : null}
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={`gradient_${(title || "monthlyEvolution").replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={fillColor} stopOpacity={0.8} />
                                <stop offset="95%" stopColor={fillColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis 
                            dataKey="mesAno" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6B7280' }} 
                            dy={10} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 12, fill: '#6B7280' }} 
                            tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`} 
                            dx={-10} 
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => [formatCurrency(Number(value)), "Valor"]}
                            labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="valor" 
                            stroke={color} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill={`url(#gradient_${(title || "monthlyEvolution").replace(/\s+/g, '')})`} 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
