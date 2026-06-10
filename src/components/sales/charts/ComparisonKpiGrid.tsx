"use client";

import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

type ComparisonKpiGridProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
  startDate?: string;
  endDate?: string;
};

type MetricKey = "amount" | "count" | "ticket";

type MetricRow = {
  key: MetricKey;
  label: string;
  kind: "currency" | "number";
  current: number;
  previous: number;
};

const parseMetricKey = (raw: string): MetricKey | null => {
  const value = raw.trim().toLowerCase();
  if (value.startsWith("valor")) return "amount";
  if (value.startsWith("qtd")) return "count";
  if (value.startsWith("ticket")) return "ticket";
  return null;
};

const parsePeriodKind = (raw: string): "current" | "previous" | null => {
  const value = raw.trim().toLowerCase();
  if (value.includes("atual")) return "current";
  if (value.includes("anterior")) return "previous";
  return null;
};

const splitLabel = (label: string) => {
  const match = label.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (!match) return { metricPart: label, periodPart: "" };
  return { metricPart: match[1] ?? label, periodPart: match[2] ?? "" };
};

const formatValue = (kind: "currency" | "number", value: number, compact: boolean) => {
  if (kind === "currency") {
    return formatCurrency(value, { compact, maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact, maximumFractionDigits: 0 });
};

const buildDelta = (current: number, previous: number) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return { direction: "neutral" as const, pct: 0, abs: current - previous };
  }
  const abs = current - previous;
  const pct = abs / Math.abs(previous);
  const direction = pct > 0.001 ? "up" : pct < -0.001 ? "down" : "neutral";
  return { direction, pct, abs };
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

const shiftMonth = (value: string, amount: number) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setMonth(date.getMonth() + amount);
  return date.toISOString().slice(0, 10);
};

const shiftYear = (value: string, amount: number) => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  date.setFullYear(date.getFullYear() + amount);
  return date.toISOString().slice(0, 10);
};

function ComparisonPeriodHint({
  chartId,
  startDate,
  endDate,
  compact,
}: {
  chartId: string;
  startDate?: string;
  endDate?: string;
  compact: boolean;
}) {
  const hasRange = Boolean(startDate && endDate);
  const previousStart =
    chartId === "overview_current_year_vs_previous_year"
      ? shiftYear(startDate ?? "", -1)
      : shiftMonth(startDate ?? "", -1);
  const previousEnd =
    chartId === "overview_current_year_vs_previous_year"
      ? shiftYear(endDate ?? "", -1)
      : shiftMonth(endDate ?? "", -1);

  const currentRangeText =
    hasRange && formatDate(startDate) && formatDate(endDate)
      ? `${formatDate(startDate)!} a ${formatDate(endDate)!}`
      : null;
  const previousRangeText =
    previousStart && previousEnd && formatDate(previousStart) && formatDate(previousEnd)
      ? `${formatDate(previousStart)!} a ${formatDate(previousEnd)!}`
      : null;

  const title =
    chartId === "overview_current_year_vs_previous_year"
      ? "Comparando com o mesmo intervalo do ano anterior"
      : "Comparando com o mesmo intervalo do mês anterior";

  return (
    <div className={`rounded-2xl border border-blue-100 bg-blue-50/70 ${compact ? "p-3" : "p-4"}`}>
      <div className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">
        Base de comparação
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-blue-900">{title}</p>
      {currentRangeText ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-white/80 px-3 py-2">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
              Período atual
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">{currentRangeText}</div>
          </div>
          <div className="rounded-xl bg-white/80 px-3 py-2">
            <div className="text-[10px] font-black uppercase tracking-[0.14em] text-blue-500">
              Período comparado
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900">
              {previousRangeText ?? "Intervalo equivalente anterior"}
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-blue-900">
          Selecione data inicial e data final no filtro para montar o período atual e o equivalente anterior.
        </p>
      )}
    </div>
  );
}

export default function ComparisonKpiGrid({
  chart,
  compact = false,
  startDate,
  endDate,
}: ComparisonKpiGridProps) {
  const currentByMetric = new Map<MetricKey, number>();
  const previousByMetric = new Map<MetricKey, number>();

  for (const point of chart.data) {
    const { metricPart, periodPart } = splitLabel(point.label ?? "");
    const metricKey = parseMetricKey(metricPart);
    const periodKind = parsePeriodKind(periodPart);
    if (!metricKey || !periodKind) continue;

    const value = Number(point.amount ?? point.value ?? point.count ?? 0);
    if (periodKind === "current") currentByMetric.set(metricKey, value);
    if (periodKind === "previous") previousByMetric.set(metricKey, value);
  }

  const rows: MetricRow[] = [
    {
      key: "amount",
      label: "Valor total",
      kind: "currency",
      current: Number(currentByMetric.get("amount") ?? 0),
      previous: Number(previousByMetric.get("amount") ?? 0),
    },
    {
      key: "count",
      label: "Qtd. orçamentos",
      kind: "number",
      current: Number(currentByMetric.get("count") ?? 0),
      previous: Number(previousByMetric.get("count") ?? 0),
    },
    {
      key: "ticket",
      label: "Ticket médio",
      kind: "currency",
      current: Number(currentByMetric.get("ticket") ?? 0),
      previous: Number(previousByMetric.get("ticket") ?? 0),
    },
  ];

  const isValid =
    rows.some((row) => row.current !== 0 || row.previous !== 0) &&
    rows.every((row) => Number.isFinite(row.current) && Number.isFinite(row.previous));

  if (!isValid) {
    return (
      <div className="space-y-3">
        <ComparisonPeriodHint
          chartId={chart.chartId}
          startDate={startDate}
          endDate={endDate}
          compact={compact}
        />
        <div className="flex h-[200px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 px-6 text-center text-sm font-medium text-neutral-500">
          Dados insuficientes para comparação neste intervalo. Ajuste a data inicial e a data final para gerar o comparativo.
        </div>
      </div>
    );
  }

  const gridClass = "grid gap-3 sm:grid-cols-3";

  return (
    <div className="space-y-3">
      <ComparisonPeriodHint
        chartId={chart.chartId}
        startDate={startDate}
        endDate={endDate}
        compact={compact}
      />
      <div className={gridClass}>
        {rows.map((row) => {
          const delta = buildDelta(row.current, row.previous);
          const badgeClass =
            delta.direction === "up"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : delta.direction === "down"
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-neutral-200 bg-neutral-100 text-neutral-600";

          const Icon =
            delta.direction === "up"
              ? ArrowUpRight
              : delta.direction === "down"
                ? ArrowDownRight
                : ArrowRight;

          return (
            <div
              key={`${chart.chartId}-${row.key}`}
              className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] font-black tracking-tight text-neutral-700">
                    {row.label}
                  </div>
                  <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                    <div className="text-2xl font-black tracking-tight text-neutral-900 tabular-nums">
                      {formatValue(row.kind, row.current, true)}
                    </div>
                    <div className="text-[11px] font-bold text-neutral-500">
                      <span className="mr-1 text-neutral-400">Anterior:</span>
                      <span className="tabular-nums">
                        {formatValue(row.kind, row.previous, true)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-black ${badgeClass}`}
                  title="Variação vs. período anterior"
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>
                    {delta.pct >= 0 ? "+" : ""}
                    {formatPercent(delta.pct, { maximumFractionDigits: 1 })}
                  </span>
                </div>
              </div>

              {!compact ? (
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold text-neutral-500">
                  <div className="rounded-xl bg-neutral-50 px-2.5 py-2">
                    Atual
                    <div className="mt-1 text-sm font-black text-neutral-900">
                      {formatValue(row.kind, row.current, false)}
                    </div>
                  </div>
                  <div className="rounded-xl bg-neutral-50 px-2.5 py-2">
                    Anterior
                    <div className="mt-1 text-sm font-black text-neutral-700">
                      {formatValue(row.kind, row.previous, false)}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
