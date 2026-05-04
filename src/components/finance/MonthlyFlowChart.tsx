"use client";

import { MonthlyFlow } from "@/services/finance-analytics.service";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MonthlyFlowChartProps {
    data: MonthlyFlow[];
    isLoading: boolean;
}

export default function MonthlyFlowChart({ data, isLoading }: MonthlyFlowChartProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 animate-pulse min-h-[400px]">
                <div className="h-6 w-1/4 bg-neutral-200 rounded mb-8"></div>
                <div className="h-[300px] w-full bg-neutral-100 rounded"></div>
            </div>
        );
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(value);
    };

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col h-full">
            <h3 className="text-lg font-bold text-neutral-800 mb-6">Fluxo Financeiro Mensal</h3>

            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm py-10">
                    Nenhum dado de fluxo financeiro disponível.
                </div>
            ) : (
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRecebidos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPagos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="mes"
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={(value: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                                contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area type="monotone" name="Recebidos" dataKey="valoresRecebidos" stroke="#059669" fillOpacity={1} fill="url(#colorRecebidos)" />
                            <Area type="monotone" name="Pagos" dataKey="valoresPagos" stroke="#f97316" fillOpacity={1} fill="url(#colorPagos)" />
                            <Area type="monotone" name="A Vencer" dataKey="valoresAVencer" stroke="#f59e0b" fillOpacity={0} strokeDasharray="5 5" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}
