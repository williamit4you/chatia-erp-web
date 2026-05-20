"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type ComboChartProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
};

/**
 * Determines the primary (bar) and secondary (line) data keys
 * from available numeric fields in the dataset.
 */
function resolveKeys(chart: SalesBudgetChartDataset): {
  barKey: string;
  lineKey: string | null;
  barLabel: string;
  lineLabel: string;
} {
  const hasAmount = chart.data.some((d) => d.amount !== null && d.amount !== undefined);
  const hasValue = chart.data.some((d) => d.value !== null && d.value !== undefined);
  const hasCount = chart.data.some((d) => d.count !== null && d.count !== undefined);
  const hasPct = chart.data.some((d) => d.percentage !== null && d.percentage !== undefined);

  // Primary = first available: amount > value > count
  // Secondary = next available, or percentage
  if (hasAmount && hasCount) return { barKey: "amount", lineKey: "count", barLabel: "Montante", lineLabel: "Quantidade" };
  if (hasAmount && hasPct) return { barKey: "amount", lineKey: "percentage", barLabel: "Montante", lineLabel: "Percentual" };
  if (hasAmount && hasValue) return { barKey: "amount", lineKey: "value", barLabel: "Montante", lineLabel: "Valor" };
  if (hasValue && hasCount) return { barKey: "value", lineKey: "count", barLabel: "Valor", lineLabel: "Quantidade" };
  if (hasValue && hasPct) return { barKey: "value", lineKey: "percentage", barLabel: "Valor", lineLabel: "Percentual" };
  if (hasAmount) return { barKey: "amount", lineKey: null, barLabel: "Montante", lineLabel: "" };
  if (hasValue) return { barKey: "value", lineKey: null, barLabel: "Valor", lineLabel: "" };
  return { barKey: "count", lineKey: null, barLabel: "Quantidade", lineLabel: "" };
}

function formatByKey(key: string, value: number): string {
  if (key === "amount") return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  if (key === "percentage") return formatPercent(value, { maximumFractionDigits: 1 });
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

export default function ComboChart({ chart, compact = false }: ComboChartProps) {
  if (!chart.data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Sem dados para exibir.
      </div>
    );
  }

  const { barKey, lineKey, barLabel, lineLabel } = resolveKeys(chart);

  const data = chart.data.map((d) => ({
    label: d.label,
    [barKey]: (d as Record<string, unknown>)[barKey] ?? 0,
    ...(lineKey ? { [lineKey]: (d as Record<string, unknown>)[lineKey] ?? 0 } : {}),
  }));

  const height = compact ? 260 : 360;

  return (
    <div style={{ height }}>
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
            yAxisId="bar"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: compact ? 10 : 11 }}
            tickFormatter={(v) => formatByKey(barKey, Number(v))}
          />
          {lineKey && (
            <YAxis
              yAxisId="line"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#737373", fontSize: compact ? 10 : 11 }}
              tickFormatter={(v) => formatByKey(lineKey, Number(v))}
            />
          )}
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              padding: "12px 16px",
            }}
            formatter={(value: any, name: any) => [
              formatByKey(String(name), Number(value)),
              name === barKey ? barLabel : lineLabel,
            ]}
            labelStyle={{ fontWeight: 700, color: "#262626" }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingTop: 8 }}
            formatter={(value: string) => (
              <span className="text-xs font-semibold text-neutral-600">
                {value === barKey ? barLabel : lineLabel}
              </span>
            )}
          />

          <Bar
            yAxisId="bar"
            dataKey={barKey}
            fill="#4f46e5"
            fillOpacity={0.85}
            radius={[6, 6, 0, 0]}
            maxBarSize={48}
          />

          {lineKey && (
            <Line
              yAxisId="line"
              type="monotone"
              dataKey={lineKey}
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
