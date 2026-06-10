"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarRange,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Percent,
  ReceiptText,
  Search,
  Target,
  TrendingDown,
  Wallet,
} from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import {
  buildSalesBudgetChartHref,
  useSalesBudgetDashboardReturnTo,
} from "@/components/sales/salesBudgetChartNavigation";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/formatters/financeFormat";
import type {
  SalesBudgetChartDataset,
  SalesBudgetKpiItem,
} from "@/services/sales-budget-analytics.service";

type OverviewHeroCharts = Partial<
  Record<
    | "overview_total_amount_period"
    | "overview_total_count_period"
    | "overview_avg_ticket"
    | "funnel_count_by_status",
    SalesBudgetChartDataset | null
  >
>;

const HERO_ENTRY_IDS = [
  "overview_total_amount_period",
  "overview_total_count_period",
  "overview_avg_ticket",
  "funnel_count_by_status",
] as const;

function formatDateRange(startDate?: string, endDate?: string) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
  const end = endDate ? new Date(`${endDate}T00:00:00`) : null;

  if (!start || Number.isNaN(start.getTime()) || !end || Number.isNaN(end.getTime())) {
    return "Período selecionado";
  }

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}

function normalizeLabel(label?: string | null) {
  return (label ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toUpperCase();
}

function getStatusCountSummary(chart: SalesBudgetChartDataset | null) {
  const summary = {
    total: 0,
    open: 0,
    closed: 0,
    lost: 0,
  };

  if (!chart?.data?.length) return summary;

  for (const point of chart.data) {
    const label = normalizeLabel(point.label);
    const value = Number(point.count ?? point.value ?? 0);
    if (!Number.isFinite(value)) continue;

    summary.total += value;

    if (["PROJETO", "ABERTO", "PARCIAL"].some((token) => label.includes(token))) {
      summary.open += value;
      continue;
    }

    if (["FECHADO", "PEDIDO"].some((token) => label.includes(token))) {
      summary.closed += value;
      continue;
    }

    if (["PERDEU", "CANCEL"].some((token) => label.includes(token))) {
      summary.lost += value;
    }
  }

  return summary;
}

function getKpiValue(items: Record<string, SalesBudgetKpiItem>, key: string) {
  return Number(items[key]?.value ?? 0);
}

export default function SalesBudgetOverviewHeroWidget({
  charts,
  kpiMap,
  isLoading,
  startDate,
  endDate,
}: {
  charts: OverviewHeroCharts;
  kpiMap: Record<string, SalesBudgetKpiItem>;
  isLoading: boolean;
  startDate?: string;
  endDate?: string;
}) {
  const returnTo = useSalesBudgetDashboardReturnTo();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const statusCounts = useMemo(
    () => getStatusCountSummary(charts.funnel_count_by_status ?? null),
    [charts.funnel_count_by_status]
  );

  const totalAmount = getKpiValue(kpiMap, "kpi_total_budget_amount");
  const avgTicket = getKpiValue(kpiMap, "kpi_avg_ticket");
  const conversionRate = getKpiValue(kpiMap, "kpi_conversion_rate");
  const openAmount = getKpiValue(kpiMap, "kpi_open_amount");
  const approvedAmount = getKpiValue(kpiMap, "kpi_approved_amount");
  const lostAmount = getKpiValue(kpiMap, "kpi_lost_amount");

  const heroStats = [
    {
      label: "Total de orçamentos",
      value: formatNumber(statusCounts.total, { maximumFractionDigits: 0 }),
      icon: ReceiptText,
      tone: "border-blue-200/80 bg-blue-50/70 text-blue-700",
    },
    {
      label: "Em aberto",
      value: formatNumber(statusCounts.open, { maximumFractionDigits: 0 }),
      icon: Clock3,
      tone: "border-amber-200/80 bg-amber-50/70 text-amber-700",
    },
    {
      label: "Fechados",
      value: formatNumber(statusCounts.closed, { maximumFractionDigits: 0 }),
      icon: CheckCircle2,
      tone: "border-emerald-200/80 bg-emerald-50/70 text-emerald-700",
    },
    {
      label: "Perdidos",
      value: formatNumber(statusCounts.lost, { maximumFractionDigits: 0 }),
      icon: TrendingDown,
      tone: "border-rose-200/80 bg-rose-50/70 text-rose-700",
    },
  ];

  const valueStats = [
    {
      label: "Valor total",
      value: formatCurrency(totalAmount, { compact: true, maximumFractionDigits: 1 }),
      icon: CircleDollarSign,
      description: "volume consolidado",
    },
    {
      label: "Ticket médio",
      value: formatCurrency(avgTicket, { compact: true, maximumFractionDigits: 1 }),
      icon: Wallet,
      description: "média por orçamento",
    },
    {
      label: "Conversão",
      value: formatPercent(conversionRate, { maximumFractionDigits: 0 }),
      icon: Percent,
      description: "taxa de aprovação",
    },
  ];

  const pipelineAmounts = [
    {
      label: "Pipeline em aberto",
      value: formatCurrency(openAmount, { compact: true, maximumFractionDigits: 1 }),
      color: "bg-amber-500",
      ratio:
        totalAmount > 0 ? Math.min(1, Math.max(0, openAmount / totalAmount)) : 0,
    },
    {
      label: "Já aprovado",
      value: formatCurrency(approvedAmount, { compact: true, maximumFractionDigits: 1 }),
      color: "bg-emerald-500",
      ratio:
        totalAmount > 0 ? Math.min(1, Math.max(0, approvedAmount / totalAmount)) : 0,
    },
    {
      label: "Perdido",
      value: formatCurrency(lostAmount, { compact: true, maximumFractionDigits: 1 }),
      color: "bg-rose-500",
      ratio:
        totalAmount > 0 ? Math.min(1, Math.max(0, lostAmount / totalAmount)) : 0,
    },
  ];

  return (
    <>
      <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.16),_transparent_34%),linear-gradient(135deg,_#ffffff_0%,_#f8fbff_45%,_#eef6ff_100%)] shadow-sm">
        <div className="border-b border-white/70 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/85 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                <CalendarRange className="h-3.5 w-3.5" />
                {formatDateRange(startDate, endDate)}
              </div>
              <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Panorama executivo do período
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Abertura rápida para entender volume, pipeline, conversão e quanto ainda falta virar fechamento.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <SalesBudgetChartDetailsButton onClick={() => setIsDetailsOpen(true)} />
              <Link
                href={buildSalesBudgetChartHref("overview_total_amount_period", returnTo)}
                className="rounded-xl border border-blue-200 bg-white/80 p-2 text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-700"
                title="Abrir gráfico principal"
              >
                <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 p-5 sm:p-6 xl:grid-cols-[1.3fr_0.9fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`rounded-2xl border px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] ${stat.tone}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-black uppercase tracking-[0.18em]">
                        {stat.label}
                      </span>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                      {isLoading ? "..." : stat.value}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {valueStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-4 shadow-[0_18px_30px_-28px_rgba(15,23,42,0.38)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
                        {stat.label}
                      </span>
                      <Icon className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="mt-4 text-3xl font-black tracking-tight text-slate-950">
                      {isLoading ? "..." : stat.value}
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {stat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[26px] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_40px_-34px_rgba(15,23,42,0.42)]">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">
              <Target className="h-4 w-4 text-blue-500" />
              Saúde financeira do funil
            </div>

            <div className="mt-4 space-y-4">
              {pipelineAmounts.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-bold text-slate-700">{item.label}</div>
                    <div className="text-sm font-black text-slate-950">
                      {isLoading ? "..." : item.value}
                    </div>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${Math.max(item.ratio * 100, item.ratio > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    {totalAmount > 0
                      ? `${formatPercent(item.ratio, { maximumFractionDigits: 0 })} do valor total`
                      : "Sem base suficiente no período"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      <SalesBudgetChartDetailsModal
        isOpen={isDetailsOpen}
        title="Panorama executivo do período"
        entries={HERO_ENTRY_IDS.map((id) => ({
          id,
          title:
            charts[id]?.title ??
            (id === "funnel_count_by_status"
              ? "Quantidade por status"
              : "Resumo executivo"),
          categoryName: "Visão geral",
        }))}
        startDate={startDate}
        endDate={endDate}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
