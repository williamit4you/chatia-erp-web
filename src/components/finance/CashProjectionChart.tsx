"use client";

import { CashProjection } from "@/services/finance-analytics.service";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { formatCurrency } from "@/lib/formatters/financeFormat";
import { payableColors, semanticColors } from "@/lib/financeChartTokens";
import ChartLoadingState from "@/components/finance/ChartLoadingState";

interface CashProjectionChartProps {
    data: CashProjection[];
    isLoading: boolean;
}

export default function CashProjectionChart({ data, isLoading }: CashProjectionChartProps) {
    if (isLoading) {
        return <ChartLoadingState heightClass="h-[300px]" variant="line" title="Previsao" />;
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-neutral-100 shadow-sm">
            <h3 className="text-lg font-bold text-neutral-900 mb-6">Previsão de Caixa (30 dias)</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis
                            dataKey="data"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#737373', fontSize: 12 }}
                            tickFormatter={formatDate}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#737373', fontSize: 12 }}
                            tickFormatter={(value) => formatCurrency(Number(value), { compact: true, maximumFractionDigits: 1 })}
                        />
                        <Tooltip
                            labelFormatter={(label: any) => formatDate(String(label))}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: any) => formatCurrency(Number(value), { compact: false, maximumFractionDigits: 2 })}
                        />
                        <Legend verticalAlign="top" align="right" layout="vertical" />
                        <Line
                            type="monotone"
                            dataKey="pagamentos"
                            name="Pagamentos"
                            stroke={payableColors.outflow}
                            strokeWidth={3}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="recebimentos"
                            name="Recebimentos"
                            stroke={semanticColors.positive}
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
