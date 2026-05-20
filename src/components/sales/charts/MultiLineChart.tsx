"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import { normalizeHexColor } from "@/lib/colorUtils";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type MultiLineChartProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
  accentColor?: string;
};

const LINE_COLORS = [
  "#4f46e5", // indigo-600
  "#06b6d4", // cyan-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#ec4899", // pink-500
] as const;

const SERIES_LABELS: Record<string, string> = {
  value: "Valor",
  amount: "Montante",
  count: "Quantidade",
  percentage: "Percentual",
};

function formatSeriesValue(key: string, value: number): string {
  if (key === "amount") return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  if (key === "percentage") return formatPercent(value, { maximumFractionDigits: 1 });
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

export default function MultiLineChart({ chart, compact = false, accentColor }: MultiLineChartProps) {
  if (!chart.data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Sem dados para exibir.
      </div>
    );
  }

  // Discover which numeric series are available
  const seriesKeys: string[] = [];
  const numericFields = ["value", "amount", "count", "percentage"] as const;
  for (const field of numericFields) {
    if (chart.data.some((d) => d[field] !== null && d[field] !== undefined)) {
      seriesKeys.push(field);
    }
  }

  // Limit to 5 series
  const activeSeries = seriesKeys.slice(0, 5);

  const data = chart.data.map((d) => {
    const point: Record<string, unknown> = { label: d.label };
    for (const key of activeSeries) {
      point[key] = (d as Record<string, unknown>)[key] ?? 0;
    }
    return point;
  });

  const height = compact ? 260 : 360;

  // Use the first series key for the Y-axis formatter
  const primaryKey = activeSeries[0] ?? "value";
  const baseColor = normalizeHexColor(accentColor);
  const palette = baseColor ? [baseColor, ...LINE_COLORS] : [...LINE_COLORS];

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
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
            tickFormatter={(v) => formatSeriesValue(primaryKey, Number(v))}
          />
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "12px 16px",
            }}
            formatter={(value: any, name: any) => [
              formatSeriesValue(String(name), Number(value)),
              SERIES_LABELS[String(name)] ?? name,
            ]}
            labelStyle={{ fontWeight: 700, color: "#262626" }}
          />
          <Legend
            verticalAlign="top"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: 12 }}
            formatter={(value: string) => (
              <span className="text-xs font-semibold text-neutral-600">
                {SERIES_LABELS[value] ?? value}
              </span>
            )}
          />

          {activeSeries.map((key, i) => {
            const stroke = palette[i % palette.length];
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={stroke}
                strokeWidth={2.5}
                dot={{ r: compact ? 2 : 3, fill: stroke, strokeWidth: 0 }}
                activeDot={{ r: compact ? 4 : 5, strokeWidth: 0 }}
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
