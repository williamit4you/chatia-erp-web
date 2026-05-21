"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type StackedBarChartProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
  accentColor?: string;
};

const PALETTE = [
  "#4f46e5", // indigo-600
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#ec4899", // pink-500
  "#8b5cf6", // violet-500
  "#f97316", // orange-500
  "#14b8a6", // teal-500
] as const;

function formatAxisValue(chart: SalesBudgetChartDataset, value: number): string {
  if (chart.data.some((d) => (d.amount ?? 0) !== 0)) {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

export default function StackedBarChart({ chart, compact = false, accentColor }: StackedBarChartProps) {
  if (!chart.data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Sem dados para exibir.
      </div>
    );
  }

  // Derive stacked segments from numeric keys present in data
  const numericKeys = new Set<string>();
  for (const point of chart.data) {
    if (point.value !== null && point.value !== undefined) numericKeys.add("value");
    if (point.amount !== null && point.amount !== undefined) numericKeys.add("amount");
    if (point.count !== null && point.count !== undefined) numericKeys.add("count");
    if (point.percentage !== null && point.percentage !== undefined) numericKeys.add("percentage");
  }

  const segments = Array.from(numericKeys);

  // If only one segment, create stacked effect by using the single key
  const data = chart.data.map((d) => ({
    label: d.label,
    value: d.value ?? 0,
    amount: d.amount ?? 0,
    count: d.count ?? 0,
    percentage: d.percentage ?? 0,
  }));

  const height = compact ? 260 : 360;

  const SEGMENT_LABELS: Record<string, string> = {
    value: "Valor",
    amount: "Montante",
    count: "Quantidade",
    percentage: "Percentual",
  };

  const palette = accentColor ? [accentColor, ...PALETTE] : [...PALETTE];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: compact ? 9 : 11, fontWeight: 700 }}
            interval={compact ? "preserveStartEnd" : 0}
            angle={compact ? -30 : 0}
            textAnchor={compact ? "end" : "middle"}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: compact ? 10 : 11 }}
            tickFormatter={(v) => formatAxisValue(chart, Number(v))}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "12px 16px",
            }}
            formatter={(value: any, name: any) => [
              formatAxisValue(chart, Number(value)),
              SEGMENT_LABELS[String(name)] ?? name,
            ]}
            labelStyle={{ fontWeight: 700, color: "#262626" }}
          />
          {segments.length > 1 && (
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="top"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: 8 }}
              formatter={(value: string) => (
                <span className="text-xs font-semibold text-neutral-600">
                  {SEGMENT_LABELS[value] ?? value}
                </span>
              )}
            />
          )}
          {segments.map((seg, i) => (
            <Bar
              key={seg}
              dataKey={seg}
              stackId="stack"
              fill={palette[i % palette.length]}
              radius={i === segments.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
              maxBarSize={56}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
