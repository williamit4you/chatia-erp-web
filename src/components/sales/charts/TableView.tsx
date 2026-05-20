"use client";

import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type {
  SalesBudgetChartDataset,
  SalesBudgetChartPoint,
} from "@/services/sales-budget-analytics.service";

type TableViewProps = {
  chart: SalesBudgetChartDataset;
  compact?: boolean;
};

const COLUMN_LABELS: Record<string, string> = {
  label: "Item",
  value: "Valor",
  amount: "Montante",
  count: "Quantidade",
  percentage: "Percentual",
  date: "Data",
};

function formatCell(key: string, value: unknown): string {
  if (value === null || value === undefined) return "—";

  const num = Number(value);

  if (key === "amount" && Number.isFinite(num)) {
    return formatCurrency(num, { compact: true, maximumFractionDigits: 1 });
  }
  if (key === "percentage" && Number.isFinite(num)) {
    return formatPercent(num, { maximumFractionDigits: 1 });
  }
  if ((key === "value" || key === "count") && Number.isFinite(num)) {
    return formatNumber(num, { compact: true, maximumFractionDigits: 0 });
  }
  if (key === "date" && typeof value === "string") {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value));
    } catch {
      return String(value);
    }
  }

  return String(value);
}

function deriveColumns(data: SalesBudgetChartPoint[]): string[] {
  const keysWithData = new Set<string>();

  for (const point of data) {
    for (const [key, val] of Object.entries(point)) {
      if (val !== null && val !== undefined) {
        keysWithData.add(key);
      }
    }
  }

  // Preserve consistent column order
  const ordered = ["label", "value", "amount", "count", "percentage", "date"];
  return ordered.filter((k) => keysWithData.has(k));
}

export default function TableView({ chart, compact = false }: TableViewProps) {
  const maxRows = compact ? 8 : 20;

  if (!chart.data.length) {
    return (
      <div className="flex h-[260px] items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-sm font-medium text-neutral-500">
        Sem dados para exibir.
      </div>
    );
  }

  const columns = deriveColumns(chart.data);
  const rows = chart.data.slice(0, maxRows);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              {columns.map((col) => (
                <th
                  key={col}
                  className={`px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-neutral-500 ${
                    col === "label" ? "text-left" : "text-right"
                  }`}
                >
                  {COLUMN_LABELS[col] ?? col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr
                key={`${chart.chartId}-row-${idx}`}
                className={`border-b border-neutral-100 transition-colors hover:bg-indigo-50/30 ${
                  idx % 2 === 1 ? "bg-neutral-50/50" : "bg-white"
                }`}
              >
                {columns.map((col) => {
                  const raw = row[col as keyof SalesBudgetChartPoint];
                  return (
                    <td
                      key={col}
                      className={`px-4 py-2.5 ${
                        col === "label"
                          ? "font-bold tracking-tight text-neutral-900"
                          : "text-right font-semibold tabular-nums text-neutral-700"
                      }`}
                    >
                      {formatCell(col, raw)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {chart.data.length > maxRows && (
        <div className="border-t border-neutral-100 px-4 py-2 text-center text-xs font-medium text-neutral-400">
          Mostrando {maxRows} de {chart.data.length} linhas
        </div>
      )}
    </div>
  );
}
