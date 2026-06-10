"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BadgePercent,
  Building2,
  CircleDollarSign,
  FileText,
  Flag,
  Gauge,
  MapPinned,
  Package,
  Percent,
  ReceiptText,
  Store,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserRound,
  Wallet,
  MessageSquareText,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import {
  buildSalesBudgetChartHref,
  useSalesBudgetDashboardReturnTo,
} from "@/components/sales/salesBudgetChartNavigation";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type KpiCardItem = {
  chartId: string;
  title: string;
  chart: SalesBudgetChartDataset | null;
};

type SalesBudgetExecutiveKpiGridProps = {
  items: KpiCardItem[];
  isLoading: boolean;
};

type KpiVisualConfig = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

const KPI_VISUALS: Record<string, KpiVisualConfig> = {
  kpi_total_budget_amount: { icon: CircleDollarSign, color: "text-blue-600", bgColor: "bg-blue-100" },
  kpi_budget_count: { icon: FileText, color: "text-violet-600", bgColor: "bg-violet-100" },
  kpi_avg_ticket: { icon: ReceiptText, color: "text-amber-600", bgColor: "bg-amber-100" },
  kpi_conversion_rate: { icon: Percent, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  kpi_open_amount: { icon: Wallet, color: "text-orange-600", bgColor: "bg-orange-100" },
  kpi_approved_amount: { icon: Trophy, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  kpi_lost_amount: { icon: AlertTriangle, color: "text-rose-600", bgColor: "bg-rose-100" },
  kpi_best_seller: { icon: UserRound, color: "text-indigo-600", bgColor: "bg-indigo-100" },
  kpi_best_customer: { icon: Building2, color: "text-sky-600", bgColor: "bg-sky-100" },
  kpi_best_product: { icon: Package, color: "text-fuchsia-600", bgColor: "bg-fuchsia-100" },
  kpi_best_city: { icon: MapPinned, color: "text-teal-600", bgColor: "bg-teal-100" },
  kpi_best_uf: { icon: Flag, color: "text-lime-600", bgColor: "bg-lime-100" },
  kpi_best_origin: { icon: Store, color: "text-cyan-700", bgColor: "bg-cyan-100" },
  kpi_highest_discount: { icon: BadgePercent, color: "text-rose-600", bgColor: "bg-rose-100" },
  kpi_avg_discount: { icon: BadgePercent, color: "text-orange-600", bgColor: "bg-orange-100" },
  kpi_avg_markup: { icon: Gauge, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  kpi_avg_freight: { icon: CircleDollarSign, color: "text-slate-600", bgColor: "bg-slate-100" },
  kpi_most_quoted_product: { icon: Package, color: "text-purple-600", bgColor: "bg-purple-100" },
  kpi_highest_potential_customer: { icon: Building2, color: "text-blue-700", bgColor: "bg-blue-100" },
  kpi_seller_highest_growth: { icon: TrendingUp, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  kpi_seller_highest_drop: { icon: TrendingDown, color: "text-rose-600", bgColor: "bg-rose-100" },
  kpi_product_highest_growth: { icon: TrendingUp, color: "text-green-600", bgColor: "bg-green-100" },
  kpi_product_highest_drop: { icon: TrendingDown, color: "text-red-600", bgColor: "bg-red-100" },
  kpi_channel_highest_conversion: { icon: TrendingUp, color: "text-cyan-600", bgColor: "bg-cyan-100" },
  kpi_channel_lowest_conversion: { icon: TrendingDown, color: "text-amber-700", bgColor: "bg-amber-100" },
};

function getPrimaryValue(chart: SalesBudgetChartDataset | null) {
  const point = chart?.data?.[0];
  if (!point) return null;
  return point.value ?? point.amount ?? point.count ?? point.percentage ?? null;
}

function formatPrimaryValue(chart: SalesBudgetChartDataset | null) {
  if (!chart) return "-";

  const point = chart.data?.[0];
  if (!point) return "-";

  if (chart.visualization === "kpi_text") {
    return point.label || "Sem dados";
  }

  const value = Number(getPrimaryValue(chart) ?? 0);
  if (chart.data.some((item) => (item.amount ?? 0) !== 0)) {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  if (chart.data.some((item) => (item.percentage ?? 0) !== 0) || chart.chartId.includes("conversion")) {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

function formatSecondaryValue(chart: SalesBudgetChartDataset | null) {
  if (!chart || chart.visualization !== "kpi_text") return null;

  const point = chart.data?.[0];
  if (!point) return null;

  const raw = point.amount ?? point.value ?? point.count ?? point.percentage ?? null;
  if (raw === null || raw === undefined) return null;

  if ((point.amount ?? null) !== null) {
    return formatCurrency(Number(raw), { compact: true, maximumFractionDigits: 1 });
  }
  return formatNumber(Number(raw), { compact: true, maximumFractionDigits: 0 });
}

function getWarning(chart: SalesBudgetChartDataset | null) {
  return chart?.meta?.warnings?.[0] ?? null;
}

function getValueTextClass(text: string, isTextKpi: boolean) {
  const length = text.replace(/\s/g, "").length;

  if (isTextKpi) {
    if (length >= 26) return "text-sm sm:text-base";
    if (length >= 16) return "text-base sm:text-lg";
    return "text-lg sm:text-xl";
  }

  if (length >= 16) return "text-base sm:text-lg";
  if (length >= 13) return "text-lg sm:text-xl";
  return "text-xl sm:text-2xl";
}

export default function SalesBudgetExecutiveKpiGrid({
  items,
  isLoading,
}: SalesBudgetExecutiveKpiGridProps) {
  const returnTo = useSalesBudgetDashboardReturnTo();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
      {items.map((item, index) => {
        const config = KPI_VISUALS[item.chartId] ?? {
          icon: CircleDollarSign,
          color: "text-neutral-700",
          bgColor: "bg-neutral-100",
        };
        const valueText = !isLoading || item.chart ? formatPrimaryValue(item.chart) : "...";
        const secondaryValue = !isLoading ? formatSecondaryValue(item.chart) : null;
        const warning = getWarning(item.chart);
        const isTextKpi = item.chart?.visualization === "kpi_text";

        return (
          <div
            key={item.chartId}
            className={`rounded-xl border border-neutral-100 bg-white px-4 py-4 shadow-sm ${
              index < 2 ? "2xl:col-span-2" : "2xl:col-span-1"
            }`}
          >
            <div className="flex min-h-[104px] flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <div className={`shrink-0 rounded-md p-1.5 ${config.bgColor} ${config.color}`}>
                    <config.icon className="h-3.5 w-3.5" />
                  </div>
                  <p
                    className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-700"
                    title={item.title}
                  >
                    {item.title}
                  </p>
                </div>
                <Link
                  href={buildSalesBudgetChartHref(item.chartId, returnTo)}
                  className="shrink-0 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="Abrir KPI e conversar com a IA"
                >
                  <MessageSquareText className="h-4 w-4" />
                </Link>
              </div>

              <h3
                className={`mt-4 whitespace-normal [overflow-wrap:anywhere] font-semibold leading-tight ${
                  getValueTextClass(String(valueText), isTextKpi)
                } ${
                  isTextKpi ? "text-neutral-900" : config.color
                }`}
                title={String(valueText)}
              >
                {valueText}
              </h3>

              <p className="mt-2 min-h-7 text-[11px] font-medium leading-4 text-neutral-500">
                {warning ?? secondaryValue ?? "\u00a0"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
