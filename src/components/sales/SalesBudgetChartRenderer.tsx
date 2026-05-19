"use client";

import DistributionBarChart from "@/components/finance/DistributionBarChart";
import DistributionPieChart from "@/components/finance/DistributionPieChart";
import ChartLoadingState from "@/components/finance/ChartLoadingState";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type SalesBudgetChartRendererProps = {
  chart: SalesBudgetChartDataset | null;
  isLoading?: boolean;
  compact?: boolean;
};

const getPrimaryValue = (chart: SalesBudgetChartDataset) => {
  const point = chart.data[0];
  if (!point) return 0;
  return point.value ?? point.amount ?? point.count ?? point.percentage ?? 0;
};

const formatValueByVisualization = (
  chart: SalesBudgetChartDataset,
  value: number
) => {
  if (
    chart.visualization === "kpi" &&
    chart.data[0]?.percentage !== null &&
    chart.data[0]?.percentage !== undefined &&
    value <= 1
  ) {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }

  if (chart.data.some((item) => (item.amount ?? 0) !== 0)) {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }

  if (chart.data.some((item) => (item.percentage ?? 0) !== 0) && value <= 1) {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }

  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
};

function HeatmapView({ chart }: { chart: SalesBudgetChartDataset }) {
  const maxValue = Math.max(...chart.data.map((item) => item.value ?? 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
      {chart.data.map((item) => {
        const value = item.value ?? 0;
        const intensity = maxValue > 0 ? value / maxValue : 0;
        return (
          <div
            key={`${chart.chartId}-${item.label}`}
            className="rounded-2xl border border-neutral-200 p-3"
            style={{
              backgroundColor: `rgba(99, 102, 241, ${0.08 + intensity * 0.32})`,
            }}
          >
            <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-600">
              {item.label}
            </div>
            <div className="mt-2 text-lg font-black tracking-tight text-neutral-900">
              {formatValueByVisualization(chart, value)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KpiGridView({ chart }: { chart: SalesBudgetChartDataset }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {chart.data.map((item) => {
        const value =
          item.value ?? item.amount ?? item.count ?? item.percentage ?? 0;
        const formatted =
          item.percentage !== null &&
          item.percentage !== undefined &&
          value <= 1
            ? formatPercent(value, { maximumFractionDigits: 1 })
            : item.amount !== null && item.amount !== undefined
              ? formatCurrency(value, { compact: true, maximumFractionDigits: 1 })
              : formatNumber(value, { compact: true, maximumFractionDigits: 0 });

        return (
          <div
            key={`${chart.chartId}-${item.label}`}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
              {item.label}
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-neutral-900">
              {formatted}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LineView({
  chart,
  compact,
}: {
  chart: SalesBudgetChartDataset;
  compact: boolean;
}) {
  const data = chart.data.map((item) => ({
    label: item.label,
    valor: item.value ?? item.amount ?? item.count ?? 0,
  }));

  return (
    <div className={compact ? "h-[260px]" : "h-[360px]"}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 12 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: compact ? 10 : 11, fontWeight: 700 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#737373", fontSize: compact ? 10 : 11 }}
            tickFormatter={(value) =>
              formatValueByVisualization(chart, Number(value))
            }
          />
          <Tooltip
            formatter={(value) =>
              formatValueByVisualization(chart, Number(value ?? 0))
            }
            contentStyle={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Line
            type="monotone"
            dataKey="valor"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ r: 4, fill: "#4f46e5" }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function SalesBudgetChartRenderer({
  chart,
  isLoading = false,
  compact = false,
}: SalesBudgetChartRendererProps) {
  if (isLoading) {
    return (
      <ChartLoadingState
        heightClass={compact ? "h-[260px]" : "h-[360px]"}
        variant="bar"
        title="Grafico"
      />
    );
  }

  if (!chart) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Nenhum dado carregado.
      </div>
    );
  }

  if (chart.visualization === "planned") {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center text-sm font-medium leading-6 text-neutral-500">
        Este grafico ainda depende de uma proxima etapa de implementacao ou de novas views.
      </div>
    );
  }

  if (chart.visualization === "error") {
    const errorMessage = chart.meta?.warnings?.[0] ?? "Nao foi possivel gerar este grafico.";
    return (
      <div className="flex h-[260px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/50 px-6 text-center">
        <div className="text-sm font-bold text-rose-700">Erro ao carregar</div>
        <div className="max-w-xs text-xs leading-5 text-rose-600">{errorMessage}</div>
      </div>
    );
  }

  if (chart.visualization === "kpi") {
    const value = getPrimaryValue(chart);
    return (
      <div className="flex h-[260px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 px-6 text-center">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
          {chart.data[0]?.label ?? chart.title}
        </div>
        <div className="mt-4 text-4xl font-black tracking-tight text-neutral-900">
          {formatValueByVisualization(chart, value)}
        </div>
      </div>
    );
  }

  if (chart.visualization === "kpi_text") {
    return (
      <div className="flex h-[260px] flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 px-6 text-center">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
          Destaque
        </div>
        <div className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
          {chart.data[0]?.label ?? "Sem dados"}
        </div>
        {chart.data[0]?.value ? (
          <div className="mt-3 text-sm font-medium text-neutral-500">
            {formatCurrency(Number(chart.data[0].value), {
              compact: true,
              maximumFractionDigits: 1,
            })}
          </div>
        ) : null}
      </div>
    );
  }

  if (chart.visualization === "kpi_grid") {
    return <KpiGridView chart={chart} />;
  }

  if (chart.visualization === "pie") {
    return (
      <DistributionPieChart
        title=""
        data={chart.data.map((item) => ({
          label: item.label,
          valor: Number(item.value ?? item.amount ?? item.count ?? 0),
          percentual: Number(item.percentage ?? 0),
        }))}
        isLoading={false}
        displayMode={compact ? "default" : "detail"}
      />
    );
  }

  if (chart.visualization === "line") {
    return <LineView chart={chart} compact={compact} />;
  }

  if (chart.visualization === "heatmap") {
    return <HeatmapView chart={chart} />;
  }

  return (
    <DistributionBarChart
      data={chart.data.map((item) => ({
        label: item.label,
        valor: Number(item.value ?? item.amount ?? item.count ?? 0),
      }))}
      isLoading={false}
      valueKind={
        chart.data.some((item) => (item.amount ?? 0) !== 0) ? "currency" : "number"
      }
      layout={compact ? "vertical" : "horizontal"}
      maxItems={compact ? 8 : 12}
      preserveOrder={chart.visualization === "bar" ? false : true}
    />
  );
}
