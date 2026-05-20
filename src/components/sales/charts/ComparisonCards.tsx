"use client";

import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type ComparisonCardsProps = {
  chart: SalesBudgetChartDataset;
};

function formatCardValue(chart: SalesBudgetChartDataset, value: number): string {
  if (chart.data.some((d) => (d.amount ?? 0) !== 0)) {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  if (chart.data.some((d) => (d.percentage ?? 0) !== 0) && value <= 1) {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

function ArrowIcon({ direction }: { direction: "up" | "down" | "neutral" }) {
  if (direction === "neutral") {
    return (
      <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
      </svg>
    );
  }

  const isUp = direction === "up";
  return (
    <svg
      className={`h-4 w-4 ${isUp ? "text-emerald-600" : "text-rose-600"}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d={isUp ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
      />
    </svg>
  );
}

export default function ComparisonCards({ chart }: ComparisonCardsProps) {
  if (chart.data.length < 2) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Dados insuficientes para comparação.
      </div>
    );
  }

  const current = chart.data[0];
  const previous = chart.data[1];
  const currentVal = current.value ?? current.amount ?? current.count ?? 0;
  const previousVal = previous.value ?? previous.amount ?? previous.count ?? 0;

  const delta = previousVal !== 0 ? (currentVal - previousVal) / Math.abs(previousVal) : 0;
  const direction: "up" | "down" | "neutral" =
    delta > 0.001 ? "up" : delta < -0.001 ? "down" : "neutral";

  const deltaColor =
    direction === "up"
      ? "text-emerald-600 bg-emerald-50"
      : direction === "down"
        ? "text-rose-600 bg-rose-50"
        : "text-neutral-500 bg-neutral-100";

  const deltaAccent =
    direction === "up"
      ? "border-emerald-200"
      : direction === "down"
        ? "border-rose-200"
        : "border-neutral-200";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Current Period */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-gradient-to-b from-white to-neutral-50 p-5">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
          {current.label}
        </div>
        <div className="mt-3 text-3xl font-black tracking-tight text-neutral-900">
          {formatCardValue(chart, currentVal)}
        </div>

        {/* Delta badge */}
        <div
          className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 ${deltaColor} ${deltaAccent}`}
        >
          <ArrowIcon direction={direction} />
          <span className="text-xs font-bold">
            {delta >= 0 ? "+" : ""}
            {formatPercent(delta, { maximumFractionDigits: 1 })}
          </span>
        </div>

        {/* Decorative gradient */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-indigo-500/5" />
      </div>

      {/* Previous Period */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
        <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
          {previous.label}
        </div>
        <div className="mt-3 text-3xl font-black tracking-tight text-neutral-600">
          {formatCardValue(chart, previousVal)}
        </div>

        <div className="mt-4 text-xs font-semibold text-neutral-400">
          Período anterior
        </div>

        {/* Decorative gradient */}
        <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-neutral-300/10" />
      </div>
    </div>
  );
}
