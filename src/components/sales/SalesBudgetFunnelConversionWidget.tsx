"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Building2, CreditCard, MapPinned, Search, User, Waypoints } from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import {
  buildSalesBudgetChartHref,
  useSalesBudgetDashboardReturnTo,
} from "@/components/sales/salesBudgetChartNavigation";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type ConversionTabId =
  | "funnel_conversion_by_seller"
  | "funnel_conversion_by_customer"
  | "funnel_conversion_by_origin"
  | "funnel_conversion_by_geo"
  | "funnel_conversion_by_payment";

type ConversionCharts = Partial<Record<ConversionTabId, SalesBudgetChartDataset | null>>;

const TABS: Array<{
  id: ConversionTabId;
  label: string;
  icon: typeof User;
}> = [
  { id: "funnel_conversion_by_seller", label: "Vendedor", icon: User },
  { id: "funnel_conversion_by_customer", label: "Cliente", icon: Building2 },
  { id: "funnel_conversion_by_origin", label: "Origem", icon: Waypoints },
  { id: "funnel_conversion_by_geo", label: "Geo", icon: MapPinned },
  { id: "funnel_conversion_by_payment", label: "Pagamento", icon: CreditCard },
];

export default function SalesBudgetFunnelConversionWidget({
  charts,
  isLoading,
  accentColor,
  defaultTabId,
  startDate,
  endDate,
  categoryName,
}: {
  charts: ConversionCharts;
  isLoading: boolean;
  accentColor?: string;
  defaultTabId?: string | null;
  startDate?: string;
  endDate?: string;
  categoryName?: string | null;
}) {
  const storageKey = "sales_budget_funnel_conversion_tab";
  const returnTo = useSalesBudgetDashboardReturnTo();
  const [activeTab, setActiveTab] = useState<ConversionTabId>("funnel_conversion_by_seller");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fromDefault = TABS.find((t) => t.id === defaultTabId)?.id ?? null;
    if (fromDefault) {
      setActiveTab(fromDefault);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey) as ConversionTabId | null;
      if (saved && TABS.some((t) => t.id === saved)) setActiveTab(saved);
    } catch {
      // ignore
    }
  }, [defaultTabId]);

  const updateTab = (next: ConversionTabId) => {
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
    const fallback = TABS.find((t) => t.id === activeTab)?.label ?? "Conversão";
    return `Conversão por ${fallback.toLowerCase()}`;
  }, [activeChart?.title, activeTab]);

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-50 px-4 py-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-neutral-700">{title}</h3>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
              • compare taxa e volume antes de concluir
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
            startDate={startDate}
            endDate={endDate}
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
