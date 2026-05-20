"use client";

import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type RankingTableProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
};

const MEDAL_COLORS = ["#fbbf24", "#9ca3af", "#d97706"] as const; // gold, silver, bronze

function MedalIcon({ position }: { position: number }) {
  if (position > 3) return null;
  const color = MEDAL_COLORS[position - 1];
  return (
    <span
      className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-white shadow-sm"
      style={{ backgroundColor: color }}
    >
      {position}
    </span>
  );
}

function PositionBadge({ position }: { position: number }) {
  if (position <= 3) return <MedalIcon position={position} />;
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
      {position}
    </span>
  );
}

function formatItemValue(chart: SalesBudgetChartDataset, value: number): string {
  if (chart.data.some((d) => (d.amount ?? 0) !== 0)) {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  if (chart.data.some((d) => (d.percentage ?? 0) !== 0) && value <= 1) {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

export default function RankingTable({ chart, compact = false }: RankingTableProps) {
  const maxItems = compact ? 8 : 15;

  if (!chart.data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Sem dados para exibir.
      </div>
    );
  }

  const items = [...chart.data]
    .map((d) => ({
      label: d.label,
      value: d.value ?? d.amount ?? d.count ?? 0,
      percentage: d.percentage ?? null,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, maxItems);

  const maxValue = Math.max(...items.map((d) => d.value), 0);

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <ul className="divide-y divide-neutral-100">
        {items.map((item, idx) => {
          const position = idx + 1;
          const barWidth = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <li
              key={`${chart.chartId}-rank-${position}`}
              className="group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/80"
            >
              {/* Background bar */}
              <div
                className="absolute inset-y-0 left-0 rounded-r-lg opacity-[0.06] transition-opacity group-hover:opacity-[0.1]"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: position <= 3 ? "#4f46e5" : "#a3a3a3",
                }}
              />

              <div className="relative z-10 flex w-full items-center gap-3">
                <PositionBadge position={position} />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold tracking-tight text-neutral-900">
                    {item.label}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.percentage !== null && (
                    <span className="text-xs font-semibold text-neutral-400">
                      {formatPercent(item.percentage, { maximumFractionDigits: 1 })}
                    </span>
                  )}
                  <span className="text-sm font-black tracking-tight text-neutral-800">
                    {formatItemValue(chart, item.value)}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {chart.data.length > maxItems && (
        <div className="border-t border-neutral-100 px-4 py-2 text-center text-xs font-medium text-neutral-400">
          +{chart.data.length - maxItems} itens não exibidos
        </div>
      )}
    </div>
  );
}
