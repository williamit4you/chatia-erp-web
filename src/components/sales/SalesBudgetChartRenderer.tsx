"use client";

import { useEffect, useState, type ReactNode } from "react";
import DistributionBarChart from "@/components/finance/DistributionBarChart";
import DistributionPieChart from "@/components/finance/DistributionPieChart";
import ChartLoadingState from "@/components/finance/ChartLoadingState";
import BrazilUfMapChart from "@/components/finance/BrazilUfMapChart";
import ParetoChart from "./charts/ParetoChart";
import RankingTable from "./charts/RankingTable";
import TableView from "./charts/TableView";
import StackedBarChart from "./charts/StackedBarChart";
import ComparisonCards from "./charts/ComparisonCards";
import ComparisonKpiGrid from "./charts/ComparisonKpiGrid";
import ComboChart from "./charts/ComboChart";
import MultiLineChart from "./charts/MultiLineChart";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import { buildTintPalette, hexToRgba, normalizeHexColor } from "@/lib/colorUtils";
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
  accentColor?: string;
};

const BR_UFS = new Set([
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]);

const UF_MAP_TOGGLE_CHART_IDS = new Set([
  "geo_amount_by_uf",
  "geo_count_by_uf",
  "geo_avg_ticket_by_uf",
  "geo_conversion_by_uf",
  "customer_by_uf",
  "product_by_geo",
  "source_by_geo",
  "geo_top_product_by_uf",
  "geo_origin_by_region",
  "geo_highest_avg_discount_regions",
  "geo_highest_markup_regions",
  "geo_growth_opportunity_regions",
]);

const normalizeLabel = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();

const extractUfFromLabel = (label?: string | null) => {
  if (!label) return null;
  const normalized = normalizeLabel(label);

  // Most common: "SP", "SP / PRODUTO", "NENHUM / SP"
  const candidates = normalized
    .split(/[\|/;,>-]+/g)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const token of candidates) {
    const maybe = token.slice(0, 2);
    if (BR_UFS.has(maybe)) return maybe;
  }

  // Fallback: any standalone UF in the string
  const match = normalized.match(/\b[A-Z]{2}\b/g) ?? [];
  for (const token of match) {
    if (BR_UFS.has(token)) return token;
  }

  return null;
};

const buildUfAggregation = (chart: SalesBudgetChartDataset) => {
  const valuesByUf = new Map<string, number>();
  for (const point of chart.data) {
    const uf = extractUfFromLabel(point.label);
    if (!uf) continue;
    const raw = Number(point.value ?? point.amount ?? point.count ?? point.percentage ?? 0);
    const current = valuesByUf.get(uf) ?? 0;
    valuesByUf.set(uf, current + (Number.isFinite(raw) ? raw : 0));
  }

  return Array.from(valuesByUf.entries())
    .map(([local, valor]) => ({ local, valor }))
    .sort((a, b) => b.valor - a.valor || a.local.localeCompare(b.local, "pt-BR"));
};

const inferValueKind = (
  chart: SalesBudgetChartDataset
): "currency" | "number" | "percent" => {
  const id = chart.chartId;
  if (id.includes("conversion")) return "percent";

  const hasAmount = chart.data.some((item) => (item.amount ?? 0) !== 0);
  if (hasAmount) return "currency";

  const hasPercentage = chart.data.some((item) => (item.percentage ?? 0) !== 0);
  if (hasPercentage) return "percent";

  const values = chart.data
    .map((item) => Number(item.value ?? item.count ?? 0))
    .filter((value) => Number.isFinite(value));

  const looksLikePercent =
    values.length > 0 &&
    values.every((value) => value >= 0 && value <= 1) &&
    (id.includes("markup") || id.includes("discount"));

  if (looksLikePercent) return "percent";

  return "number";
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

function StateHeatmapToggleView({
  chart,
  compact,
  accentColor,
}: {
  chart: SalesBudgetChartDataset;
  compact: boolean;
  accentColor: string;
}) {
  return (
    <UfToggleView
      chart={chart}
      compact={compact}
      accentColor={accentColor}
      valueKind="currency"
      renderCards={() => (
        <HeatmapView chart={chart} compact={compact} accentColor={accentColor} />
      )}
    />
  );
}

function UfToggleView({
  chart,
  compact,
  accentColor,
  valueKind,
  renderCards,
}: {
  chart: SalesBudgetChartDataset;
  compact: boolean;
  accentColor: string;
  valueKind: "currency" | "number" | "percent";
  renderCards: () => ReactNode;
}) {
  const storageKey = `sales_budget_geo_view_${chart.chartId}`;
  const [view, setView] = useState<"cards" | "map">("cards");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved === "map" || saved === "cards") setView(saved);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateView = (next: "cards" | "map") => {
    setView(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }
  };

  const mapData = buildUfAggregation(chart);

  const activeClass =
    "bg-white text-neutral-900 shadow-sm ring-1 ring-neutral-200/80";
  const inactiveClass = "text-neutral-500 hover:text-neutral-800";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <div className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 p-1 text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
          <button
            type="button"
            onClick={() => updateView("cards")}
            className={`rounded-full px-3 py-1.5 transition ${
              view === "cards" ? activeClass : inactiveClass
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => updateView("map")}
            className={`rounded-full px-3 py-1.5 transition ${
              view === "map" ? activeClass : inactiveClass
            }`}
          >
            Mapa
          </button>
        </div>
      </div>

      {view === "cards" ? (
        renderCards()
      ) : (
        <BrazilUfMapChart
          data={mapData}
          isLoading={false}
          color={accentColor}
          valueKind={valueKind}
          displayMode={compact ? "compact" : "detail"}
          variant={compact ? "map_only" : "full"}
        />
      )}
    </div>
  );
}

function HeatmapView({
  chart,
  compact,
  accentColor,
}: {
  chart: SalesBudgetChartDataset;
  compact: boolean;
  accentColor?: string;
}) {
  const maxValue = Math.max(...chart.data.map((item) => item.value ?? 0), 0);
  const baseColor = normalizeHexColor(accentColor) ?? "#4f46e5";

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
              borderColor: hexToRgba(baseColor, borderAlpha),
              backgroundImage: `linear-gradient(135deg, ${hexToRgba(baseColor, alpha)} 0%, ${hexToRgba(
                baseColor,
                alpha * 0.55
              )} 100%)`,
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
  accentColor,
}: {
  chart: SalesBudgetChartDataset;
  compact: boolean;
  accentColor?: string;
}) {
  const data = chart.data.map((item) => ({
    label: item.label,
    valor: item.value ?? item.amount ?? item.count ?? 0,
  }));
  const baseColor = normalizeHexColor(accentColor) ?? "#4f46e5";

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
            stroke={baseColor}
            strokeWidth={3}
            dot={{ r: 4, fill: baseColor }}
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
  accentColor,
}: SalesBudgetChartRendererProps) {
  const resolvedAccentColor = normalizeHexColor(accentColor) ?? "#4f46e5";
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
        colors={buildTintPalette(resolvedAccentColor)}
      />
    );
  }

  if (chart.visualization === "line") {
    return <LineView chart={chart} compact={compact} accentColor={resolvedAccentColor} />;
  }

  if (chart.visualization === "heatmap") {
    if (chart.chartId === "geo_state_heatmap") {
      return (
        <StateHeatmapToggleView
          chart={chart}
          compact={compact}
          accentColor={resolvedAccentColor}
        />
      );
    }

    return (
      <HeatmapView
        chart={chart}
        compact={compact}
        accentColor={resolvedAccentColor}
      />
    );
  }

  if (chart.visualization === "pareto") {
    return <ParetoChart chart={chart} compact={compact} />;
  }

  if (chart.visualization === "ranking") {
    const content = <RankingTable chart={chart} compact={compact} />;
    if (UF_MAP_TOGGLE_CHART_IDS.has(chart.chartId)) {
      return (
        <UfToggleView
          chart={chart}
          compact={compact}
          accentColor={resolvedAccentColor}
          valueKind={inferValueKind(chart)}
          renderCards={() => content}
        />
      );
    }
    return content;
  }

  if (chart.visualization === "table") {
    return <TableView chart={chart} compact={compact} />;
  }

  if (chart.visualization === "stacked") {
    return <StackedBarChart chart={chart} compact={compact} accentColor={resolvedAccentColor} />;
  }

  if (chart.visualization === "comparison") {
    return <ComparisonCards chart={chart} />;
  }

  if (chart.visualization === "combo") {
    return <ComboChart chart={chart} compact={compact} accentColor={resolvedAccentColor} />;
  }

  if (chart.visualization === "multiline") {
    return <MultiLineChart chart={chart} compact={compact} accentColor={resolvedAccentColor} />;
  }

  return (
    (() => {
      const content = (
        <DistributionBarChart
          data={chart.data.map((item) => ({
            label: item.label,
            valor: Number(item.value ?? item.amount ?? item.count ?? 0),
          }))}
          isLoading={false}
          color={resolvedAccentColor}
          valueKind={
            chart.data.some((item) => (item.amount ?? 0) !== 0)
              ? "currency"
              : "number"
          }
          layout={compact ? "vertical" : "horizontal"}
          maxItems={compact ? 8 : 12}
          preserveOrder={chart.visualization === "bar" ? false : true}
        />
      );

      if (!UF_MAP_TOGGLE_CHART_IDS.has(chart.chartId)) return content;
      if (buildUfAggregation(chart).length === 0) return content;

      return (
        <UfToggleView
          chart={chart}
          compact={compact}
          accentColor={resolvedAccentColor}
          valueKind={inferValueKind(chart)}
          renderCards={() => content}
        />
      );
    })()
  );
}
