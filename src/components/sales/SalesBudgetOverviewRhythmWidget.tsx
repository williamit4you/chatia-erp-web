"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CalendarRange, Search } from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import {
  buildSalesBudgetChartHref,
  useSalesBudgetDashboardReturnTo,
} from "@/components/sales/salesBudgetChartNavigation";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type RhythmTabId =
  | "overview_monthly_evolution"
  | "overview_weekly_evolution"
  | "overview_daily_evolution";

type RhythmCharts = Partial<Record<RhythmTabId, SalesBudgetChartDataset | null>>;

const TABS: Array<{ id: RhythmTabId; label: string; icon: typeof CalendarDays }> = [
  { id: "overview_monthly_evolution", label: "Mensal", icon: CalendarRange },
  { id: "overview_weekly_evolution", label: "Semanal", icon: CalendarDays },
  { id: "overview_daily_evolution", label: "Diário", icon: CalendarDays },
];

export default function SalesBudgetOverviewRhythmWidget({
  charts,
  isLoading,
  startDate,
  endDate,
}: {
  charts: RhythmCharts;
  isLoading: boolean;
  startDate?: string;
  endDate?: string;
}) {
  const returnTo = useSalesBudgetDashboardReturnTo();
  const [activeTab, setActiveTab] = useState<RhythmTabId>("overview_monthly_evolution");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    if (charts[activeTab]) return;
    const firstAvailable = TABS.find((tab) => charts[tab.id]);
    if (firstAvailable) setActiveTab(firstAvailable.id);
  }, [activeTab, charts]);

  const activeChart = charts[activeTab] ?? null;
  const title = useMemo(
    () => activeChart?.title ?? "Ritmo do período",
    [activeChart?.title]
  );

  return (
    <>
      <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
          <div>
            <h3 className="text-base font-black tracking-tight text-neutral-900">Ritmo do período</h3>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">
              acompanhe a cadência por janela de tempo
            </p>
          </div>
          <div className="flex items-center gap-1">
            <SalesBudgetChartDetailsButton onClick={() => setIsDetailsOpen(true)} />
            <Link
              href={buildSalesBudgetChartHref(activeTab, returnTo)}
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Abrir gráfico"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="border-b border-neutral-100 bg-neutral-50/70 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 p-4">
          <SalesBudgetChartRenderer
            chart={activeChart}
            isLoading={isLoading && !activeChart}
            compact
          />
        </div>
      </article>

      <SalesBudgetChartDetailsModal
        isOpen={isDetailsOpen}
        title={title}
        entries={TABS.map((tab) => ({
          id: tab.id,
          title: charts[tab.id]?.title ?? tab.label,
          categoryName: "Visão geral",
        }))}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
