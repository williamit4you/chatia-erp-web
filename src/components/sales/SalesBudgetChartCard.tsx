"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpenText } from "lucide-react";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type SalesBudgetChartCardProps = {
  chart: SalesBudgetChartDataset | null;
  chartId: string;
  fallbackTitle: string;
  isLoading?: boolean;
  accentColor?: string;
};

export default function SalesBudgetChartCard({
  chart,
  chartId,
  fallbackTitle,
  isLoading = false,
  accentColor,
}: SalesBudgetChartCardProps) {
  const title = chart?.title ?? fallbackTitle;
  const warnings = chart?.meta?.warnings ?? [];

  return (
    <article className="group relative h-full overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-50 px-4 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-neutral-700">{title}</h3>
          {warnings.length > 0 ? (
            <div className="text-[10px] font-black uppercase tracking-wider text-amber-700">
              •{" "}
              <span className="font-bold normal-case tracking-normal text-amber-600">
                {warnings[0]}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/chat/sales-budget-analytics/${chartId}?help=1`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:bg-blue-50 hover:text-blue-700"
            title="Ajuda do gráfico"
          >
            <BookOpenText className="h-4 w-4" />
          </Link>
          <Link
            href={`/chat/sales-budget-analytics/${chartId}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-400 transition hover:bg-neutral-50 hover:text-neutral-700"
            title="Abrir gráfico"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {accentColor ? (
        <div
          className="h-0.5 w-full"
          style={{ backgroundColor: accentColor }}
          aria-hidden="true"
        />
      ) : null}

      <div className="min-h-0 p-4">
        <SalesBudgetChartRenderer
          chart={chart}
          isLoading={isLoading}
          compact
          accentColor={accentColor}
        />
      </div>
    </article>
  );
}
