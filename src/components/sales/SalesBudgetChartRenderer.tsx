"use client";

import DistributionBarChart from "@/components/finance/DistributionBarChart";
import DistributionPieChart from "@/components/finance/DistributionPieChart";
import ChartLoadingState from "@/components/finance/ChartLoadingState";
import ParetoChart from "./charts/ParetoChart";
import RankingTable from "./charts/RankingTable";
import TableView from "./charts/TableView";
import StackedBarChart from "./charts/StackedBarChart";
import ComparisonCards from "./charts/ComparisonCards";
import ComparisonKpiGrid from "./charts/ComparisonKpiGrid";
import ComboChart from "./charts/ComboChart";
import MultiLineChart from "./charts/MultiLineChart";
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

function HeatmapView({
  chart,
  compact,
}: {
  chart: SalesBudgetChartDataset;
  compact: boolean;
}) {
  const maxValue = Math.max(...chart.data.map((item) => item.value ?? 0), 0);

  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
      {chart.data.map((item) => {
        const value = item.value ?? 0;
        const intensity = maxValue > 0 ? value / maxValue : 0;
        const alpha = 0.08 + intensity * 0.32;
        const borderAlpha = 0.14 + intensity * 0.26;
        return (
          <div
            key={`${chart.chartId}-${item.label}`}
            className={`relative overflow-hidden rounded-2xl border bg-white p-3 shadow-sm ${
              compact ? "min-h-[76px]" : "min-h-[84px]"
            }`}
            style={{
              borderColor: `rgba(99, 102, 241, ${borderAlpha})`,
              backgroundImage: `linear-gradient(135deg, rgba(99, 102, 241, ${alpha}) 0%, rgba(99, 102, 241, ${
                alpha * 0.55
              }) 100%)`,
            }}
          >
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-neutral-700 truncate">
              {item.label ?? "—"}
            </div>
            <div className="mt-2 text-base font-black tracking-tight text-neutral-900 tabular-nums truncate">
              {formatValueByVisualization(chart, value)}
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/40" />
          </div>
        );
      })}
    </div>
  );
}

function KpiGridView({ chart, compact }: { chart: SalesBudgetChartDataset; compact: boolean }) {
  const gridClass =
    chart.data.length === 6
      ? "grid gap-3 sm:grid-cols-3"
      : compact
        ? "grid gap-3 sm:grid-cols-2"
        : "grid gap-3 sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div className={gridClass}>
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
            className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="text-[11px] font-black uppercase tracking-[0.14em] text-neutral-500 line-clamp-2">
              {item.label ?? "—"}
            </div>
            <div className="mt-2 text-2xl font-black tracking-tight text-neutral-900 tabular-nums">
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
        title="Gráfico"
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
        Este gráfico ainda depende de uma próxima etapa de implementação ou de novas views.
      </div>
    );
  }

  if (chart.visualization === "error") {
    const errorMessage = chart.meta?.warnings?.[0] ?? "Não foi possível gerar este gráfico.";
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
    if (
      chart.chartId === "overview_current_vs_previous_month" ||
      chart.chartId === "overview_current_year_vs_previous_year"
    ) {
      return <ComparisonKpiGrid chart={chart} compact={compact} />;
    }

    return <KpiGridView chart={chart} compact={compact} />;
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
    return <HeatmapView chart={chart} compact={compact} />;
  }

  if (chart.visualization === "pareto") {
    return <ParetoChart chart={chart} compact={compact} />;
  }

  if (chart.visualization === "ranking") {
    return <RankingTable chart={chart} compact={compact} />;
  }

  if (chart.visualization === "table") {
    return <TableView chart={chart} compact={compact} />;
  }

  if (chart.visualization === "stacked") {
    return <StackedBarChart chart={chart} compact={compact} />;
  }

  if (chart.visualization === "comparison") {
    return <ComparisonCards chart={chart} />;
  }

  if (chart.visualization === "combo") {
    return <ComboChart chart={chart} compact={compact} />;
  }

  if (chart.visualization === "multiline") {
    return <MultiLineChart chart={chart} compact={compact} />;
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
