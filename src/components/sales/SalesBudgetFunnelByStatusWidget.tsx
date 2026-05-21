"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Filter, Percent, Scale, Sigma, Workflow } from "lucide-react";
import { ArrowUpRight, BookOpenText } from "lucide-react";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type StatusTabId =
  | "funnel_by_status"
  | "funnel_amount_by_status"
  | "funnel_count_by_status"
  | "funnel_conversion_percent_by_status"
  | "funnel_open_approved_lost";

type StatusCharts = Partial<Record<StatusTabId, SalesBudgetChartDataset | null>>;

const TABS: Array<{
  id: StatusTabId;
  label: string;
  icon: typeof Workflow;
}> = [
  { id: "funnel_by_status", label: "Status", icon: Workflow },
  { id: "funnel_amount_by_status", label: "Valor", icon: Sigma },
  { id: "funnel_count_by_status", label: "Quantidade", icon: Scale },
  { id: "funnel_conversion_percent_by_status", label: "Conversão", icon: Percent },
  { id: "funnel_open_approved_lost", label: "Resumo", icon: Filter },
];

export default function SalesBudgetFunnelByStatusWidget({
  charts,
  isLoading,
  accentColor,
  defaultTabId,
}: {
  charts: StatusCharts;
  isLoading: boolean;
  accentColor?: string;
  defaultTabId?: string | null;
}) {
  const storageKey = "sales_budget_funnel_by_status_tab";
  const [activeTab, setActiveTab] = useState<StatusTabId>("funnel_by_status");

  useEffect(() => {
    const fromDefault = TABS.find((t) => t.id === defaultTabId)?.id ?? null;
    if (fromDefault) {
      setActiveTab(fromDefault);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey) as StatusTabId | null;
      if (saved && TABS.some((t) => t.id === saved)) setActiveTab(saved);
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateTab = (next: StatusTabId) => {
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
    const fallback = TABS.find((t) => t.id === activeTab)?.label ?? "Status";
    return `Funil por ${fallback.toLowerCase()}`;
  }, [activeChart?.title, activeTab]);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-50 px-4 py-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-neutral-700">{title}</h3>
          <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
            • compare etapa, volume e taxa
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Link
            href={`/chat/sales-budget-analytics/${activeTab}?help=1`}
            className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
            title="Entender este gráfico"
          >
            <BookOpenText className="h-4 w-4" />
          </Link>
          <Link
            href={`/chat/sales-budget-analytics/${activeTab}`}
            className="rounded p-1 text-neutral-400 transition-colors hover:bg-neutral-50 hover:text-neutral-700"
            title="Abrir gráfico / iniciar chat"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {accentColor ? (
        <div className="h-0.5 w-full" style={{ backgroundColor: accentColor }} aria-hidden="true" />
      ) : null}

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
  );
}
