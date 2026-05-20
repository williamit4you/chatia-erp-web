"use client";

import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
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
    <article className="overflow-hidden rounded-[26px] border border-neutral-200 bg-white shadow-sm">
      <div className="h-1.5 w-full" style={{ backgroundColor: accentColor ?? "#e5e7eb" }} />
      <div className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-black tracking-tight text-neutral-900">
            {title}
          </h3>
        </div>
        <Link
          href={`/chat/sales-budget-analytics/${chartId}`}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 hover:text-neutral-900"
          title="Abrir gráfico"
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      {warnings.length > 0 && (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{warnings[0]}</span>
          </div>
        </div>
      )}

      <div className="mt-4">
        <SalesBudgetChartRenderer chart={chart} isLoading={isLoading} compact accentColor={accentColor} />
      </div>
      </div>
    </article>
  );
}
