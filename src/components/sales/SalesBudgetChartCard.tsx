"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type SalesBudgetChartCardProps = {
  chart: SalesBudgetChartDataset | null;
  chartId: string;
  fallbackTitle: string;
  isLoading?: boolean;
  accentColor?: string;
  startDate?: string;
  endDate?: string;
  categoryName?: string | null;
};

export default function SalesBudgetChartCard({
  chart,
  chartId,
  fallbackTitle,
  isLoading = false,
  accentColor,
  startDate,
  endDate,
  categoryName,
}: SalesBudgetChartCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const title = chart?.title ?? fallbackTitle;
  const warnings = chart?.meta?.warnings ?? [];

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
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
            <SalesBudgetChartDetailsButton onClick={() => setIsDetailsOpen(true)} />
            <Link
              href={`/chat/sales-budget-analytics/${chartId}`}
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Abrir gráfico"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
          <SalesBudgetChartRenderer
            chart={chart}
            isLoading={isLoading}
            compact
            accentColor={accentColor}
          />
        </div>
      </article>

      <SalesBudgetChartDetailsModal
        isOpen={isDetailsOpen}
        title={title}
        entries={[{ id: chartId, title, categoryName }]}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
