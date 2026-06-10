"use client";

import Link from "next/link";
import { AlertTriangle, Search, Target, TrendingDown, Wallet } from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import { formatCurrency, formatPercent } from "@/lib/formatters/financeFormat";
import { useMemo, useState } from "react";
import {
  buildSalesBudgetChartHref,
  useSalesBudgetDashboardReturnTo,
} from "@/components/sales/salesBudgetChartNavigation";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type FunnelHealthChartId =
  | "funnel_pending_amount"
  | "funnel_approval_rate"
  | "funnel_loss_cancel_rate";

type FunnelHealthCharts = Partial<Record<FunnelHealthChartId, SalesBudgetChartDataset | null>>;

const CARDS: Array<{
  id: FunnelHealthChartId;
  label: string;
  icon: typeof Wallet;
  tone: string;
  iconTone: string;
  href: string;
}> = [
  {
    id: "funnel_pending_amount",
    label: "Em aberto",
    icon: Wallet,
    tone: "border-sky-200 bg-sky-50/80",
    iconTone: "bg-sky-100 text-sky-700",
    href: "/chat/sales-budget-analytics/funnel_pending_amount",
  },
  {
    id: "funnel_approval_rate",
    label: "Conversao",
    icon: Target,
    tone: "border-emerald-200 bg-emerald-50/80",
    iconTone: "bg-emerald-100 text-emerald-700",
    href: "/chat/sales-budget-analytics/funnel_approval_rate",
  },
  {
    id: "funnel_loss_cancel_rate",
    label: "Perdas",
    icon: TrendingDown,
    tone: "border-amber-200 bg-amber-50/80",
    iconTone: "bg-amber-100 text-amber-700",
    href: "/chat/sales-budget-analytics/funnel_loss_cancel_rate",
  },
];

function formatMetricValue(id: FunnelHealthChartId, chart: SalesBudgetChartDataset | null) {
  const point = chart?.data?.[0];
  const rawValue = Number(point?.value ?? point?.amount ?? point?.percentage ?? 0);

  if (id === "funnel_pending_amount") {
    return formatCurrency(rawValue, { compact: true, maximumFractionDigits: 1 });
  }

  return formatPercent(rawValue, { maximumFractionDigits: 0 });
}

export default function SalesBudgetFunnelHealthWidget({
  charts,
  isLoading,
  startDate,
  endDate,
  categoryName,
}: {
  charts: FunnelHealthCharts;
  isLoading: boolean;
  startDate?: string;
  endDate?: string;
  categoryName?: string | null;
}) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const returnTo = useSalesBudgetDashboardReturnTo();

  const entries = useMemo(
    () =>
      CARDS.map((item) => ({
        id: item.id,
        title: charts[item.id]?.title ?? item.label,
        categoryName,
      })),
    [categoryName, charts]
  );

  const warnings = CARDS.flatMap((item) => charts[item.id]?.meta?.warnings ?? []);
  const summaryWarning = warnings[0] ?? null;

  return (
    <>
      <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-50 px-4 py-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-neutral-700">Saude do funil comercial</h3>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
              • consolida aberto, conversao e perdas
            </div>
          </div>

          <div className="flex items-center gap-1">
            <SalesBudgetChartDetailsButton onClick={() => setIsDetailsOpen(true)} />
            <Link
              href={buildSalesBudgetChartHref(CARDS[0].id, returnTo)}
              className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
              title="Abrir detalhe do funil"
            >
              <Search className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 p-3 sm:p-4">
          {summaryWarning ? (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{summaryWarning}</span>
            </div>
          ) : null}

          <div className="grid flex-1 gap-3 md:grid-cols-3">
            {CARDS.map((item) => {
              const chart = charts[item.id] ?? null;
              const Icon = item.icon;
              const hasData = Boolean(chart?.data?.length);

              return (
                <Link
                  key={item.id}
                  href={buildSalesBudgetChartHref(item.id, returnTo)}
                  className={`flex min-h-[180px] flex-col rounded-2xl border p-4 transition-transform hover:-translate-y-0.5 ${item.tone}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${item.iconTone}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                      KPI
                    </span>
                  </div>

                  <div className="mt-6 text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                    {item.label}
                  </div>

                  <div className="mt-3 text-3xl font-black tracking-tight text-neutral-900">
                    {isLoading && !hasData ? "..." : formatMetricValue(item.id, chart)}
                  </div>

                  <div className="mt-auto pt-6 text-xs leading-5 text-neutral-600">
                    {chart?.title ?? "Indicador consolidado do funil no periodo selecionado."}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </article>

      <SalesBudgetChartDetailsModal
        isOpen={isDetailsOpen}
        title="Saude do funil comercial"
        entries={entries}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
