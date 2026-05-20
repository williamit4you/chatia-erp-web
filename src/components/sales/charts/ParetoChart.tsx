"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type ParetoChartProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
};

const ZONE_COLORS = {
  A: "#16a34a", // green-600
  B: "#eab308", // yellow-500
  C: "#dc2626", // red-600
} as const;

function getZone(cumulativePct: number): keyof typeof ZONE_COLORS {
  if (cumulativePct <= 0.8) return "A";
  if (cumulativePct <= 0.95) return "B";
  return "C";
}

function formatValue(chart: SalesBudgetChartDataset, value: number): string {
  if (chart.data.some((d) => (d.amount ?? 0) !== 0)) {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

export default function ParetoChart({ chart, compact = false }: ParetoChartProps) {
  if (!chart.data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Sem dados para exibir.
      </div>
    );
  }

  const sorted = [...chart.data]
    .map((d) => ({
      label: d.label,
      value: d.value ?? d.amount ?? d.count ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const total = sorted.reduce((sum, d) => sum + d.value, 0);

  let cumulative = 0;
  const data = sorted.map((d) => {
    cumulative += d.value;
    const cumulativePct = total > 0 ? cumulative / total : 0;
    return {
      ...d,
      cumulativePct,
      zone: getZone(cumulativePct),
    };
  });

  const height = compact ? 260 : 360;

  return (
    <div className={`h-[${height}px]`} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 24, left: 0, bottom: 16 }}>
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
            yAxisId="value"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: compact ? 10 : 11 }}
            tickFormatter={(v) => formatValue(chart, Number(v))}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            axisLine={false}
            tickLine={false}
            domain={[0, 1]}
            tick={{ fill: "#737373", fontSize: compact ? 10 : 11 }}
            tickFormatter={(v) => formatPercent(Number(v), { maximumFractionDigits: 0 })}
          />

          <ReferenceLine
            yAxisId="pct"
            y={0.8}
            stroke="#16a34a"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: "80%",
              position: "right",
              fill: "#16a34a",
              fontSize: 10,
              fontWeight: 700,
            }}
          />
          <ReferenceLine
            yAxisId="pct"
            y={0.95}
            stroke="#eab308"
            strokeDasharray="6 3"
            strokeWidth={1.5}
            label={{
              value: "95%",
              position: "right",
              fill: "#eab308",
              fontSize: 10,
              fontWeight: 700,
            }}
          />

          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "12px 16px",
            }}
            formatter={(value: any, name: any) => {
              if (name === "cumulativePct") {
                return [formatPercent(Number(value), { maximumFractionDigits: 1 }), "Acumulado"];
              }
              return [formatValue(chart, Number(value)), "Valor"];
            }}
            labelStyle={{ fontWeight: 700, color: "#262626" }}
          />

          <Bar yAxisId="value" dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={ZONE_COLORS[entry.zone]} fillOpacity={0.85} />
            ))}
          </Bar>

          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="cumulativePct"
            stroke="#4f46e5"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#4f46e5", strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
