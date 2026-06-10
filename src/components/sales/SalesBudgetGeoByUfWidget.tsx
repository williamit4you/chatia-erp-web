"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BarChart3, Percent, Search, ShoppingCart, TrendingUp } from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import {
  buildSalesBudgetChartHref,
  useSalesBudgetDashboardReturnTo,
} from "@/components/sales/salesBudgetChartNavigation";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type GeoUfTabId =
  | "geo_amount_by_uf"
  | "geo_count_by_uf"
  | "geo_avg_ticket_by_uf"
  | "geo_conversion_by_uf";

type GeoByUfCharts = Partial<Record<GeoUfTabId, SalesBudgetChartDataset | null>>;

const TABS: Array<{
  id: GeoUfTabId;
  label: string;
  icon: typeof BarChart3;
}> = [
  { id: "geo_amount_by_uf", label: "Valor", icon: TrendingUp },
  { id: "geo_count_by_uf", label: "Quantidade", icon: ShoppingCart },
  { id: "geo_avg_ticket_by_uf", label: "Ticket médio", icon: BarChart3 },
  { id: "geo_conversion_by_uf", label: "Conversão", icon: Percent },
];

export default function SalesBudgetGeoByUfWidget({
  charts,
  isLoading,
  accentColor,
  defaultTabId,
  startDate,
  endDate,
  categoryName,
}: {
  charts: GeoByUfCharts;
  isLoading: boolean;
  accentColor?: string;
  defaultTabId?: string | null;
  startDate?: string;
  endDate?: string;
  categoryName?: string | null;
}) {
  const storageKey = "sales_budget_geo_by_uf_tab";
  const returnTo = useSalesBudgetDashboardReturnTo();
  const [activeTab, setActiveTab] = useState<GeoUfTabId>("geo_amount_by_uf");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fromDefault = TABS.find((t) => t.id === defaultTabId)?.id ?? null;
    if (fromDefault) {
      setActiveTab(fromDefault);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey) as GeoUfTabId | null;
      if (saved && TABS.some((t) => t.id === saved)) setActiveTab(saved);
    } catch {
      // ignore
    }
  }, [defaultTabId]);

  const updateTab = (next: GeoUfTabId) => {
    setActiveTab(next);
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // ignore
    }
  };

  const activeChart = charts[activeTab] ?? null;
  const title = useMemo(() => {
    const fromChart = activeChart?.title;
    if (fromChart) return fromChart;
    const fallback = TABS.find((t) => t.id === activeTab)?.label ?? "UF";
    return `${fallback} por UF`;
  }, [activeChart?.title, activeTab]);

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-50 px-4 py-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-neutral-700">{title}</h3>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
              • UF ordenado por maior valor relativo
            </div>
          </div>

          <div className="flex items-center gap-1">
            <SalesBudgetChartDetailsButton onClick={() => setIsDetailsOpen(true)} />
            <Link
              href={buildSalesBudgetChartHref(activeTab, returnTo)}
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Abrir gráfico / iniciar chat"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="border-b border-neutral-100 bg-white px-4 py-2">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const isActive = tab.id === activeTab;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => updateTab(tab.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-black transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden p-3 sm:p-4">
          <SalesBudgetChartRenderer
            chart={activeChart}
            isLoading={isLoading && !activeChart}
            compact
            accentColor={accentColor}
          />
        </div>
      </article>

      <SalesBudgetChartDetailsModal
        isOpen={isDetailsOpen}
        title={title}
        entries={[{ id: activeTab, title, categoryName }]}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
