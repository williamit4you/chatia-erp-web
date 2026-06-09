"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Percent,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import type { SalesBudgetKpiItem } from "@/services/sales-budget-analytics.service";

type SalesBudgetEssentialKpiCardsProps = {
  items: SalesBudgetKpiItem[];
  isLoading: boolean;
};

type KpiVisualConfig = {
  icon: LucideIcon;
  color: string;
  bgColor: string;
  title: string;
  subtitle: string;
};

const KPI_VISUALS: Record<string, KpiVisualConfig> = {
  kpi_total_budget_amount: {
    icon: CircleDollarSign,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    title: "Valor total orçado",
    subtitle: "Volume total do período",
  },
  kpi_budget_count: {
    icon: FileText,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
    title: "Quantidade de orçamentos",
    subtitle: "Total de documentos gerados",
  },
  kpi_avg_ticket: {
    icon: ReceiptText,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    title: "Ticket médio",
    subtitle: "Valor médio por orçamento",
  },
  kpi_conversion_rate: {
    icon: Percent,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    title: "Taxa de conversão",
    subtitle: "Orçamentos aprovados no período",
  },
  kpi_open_amount: {
    icon: Wallet,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    title: "Valor em aberto",
    subtitle: "Pipeline ainda não concluído",
  },
  kpi_approved_amount: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    title: "Valor aprovado",
    subtitle: "Montante convertido em aprovação",
  },
  kpi_lost_amount: {
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    title: "Valor perdido",
    subtitle: "Orçamentos perdidos/cancelados",
  },
};

function formatKpiValue(item: SalesBudgetKpiItem) {
  if (item.format === "text") return item.textValue ?? "Sem dados";

  const value = Number(item.value ?? 0);
  if (item.format === "currency") {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  if (item.format === "percentage") {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
}

function getValueTextClass(formattedValue: string) {
  const length = formattedValue.replace(/\s/g, "").length;

  if (length >= 16) return "text-lg sm:text-xl";
  if (length >= 12) return "text-xl sm:text-2xl";
  return "text-2xl";
}

export default function SalesBudgetEssentialKpiCards({
  items,
  isLoading,
}: SalesBudgetEssentialKpiCardsProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={`rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm ${
              index < 2 ? "min-h-[142px]" : "min-h-[128px]"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const config = KPI_VISUALS[item.kpiId] ?? {
          icon: CircleDollarSign,
          color: "text-neutral-700",
          bgColor: "bg-neutral-100",
          title: item.label,
          subtitle: item.warning ?? "Indicador do período",
        };
        const formattedValue = formatKpiValue(item);

        return (
          <div
            key={item.kpiId}
            className={`relative overflow-hidden rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm ${
              index < 2 ? "min-h-[142px]" : "min-h-[128px]"
            }`}
          >
            <div className="min-w-0 pr-16">
              <p
                className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-neutral-500 sm:text-xs"
                title={config.title}
              >
                {config.title}
              </p>
              <h3
                className={`${getValueTextClass(formattedValue)} font-bold leading-tight whitespace-normal [overflow-wrap:anywhere] ${config.color}`}
                title={formattedValue}
              >
                {formattedValue}
              </h3>
              <p className="mt-3 text-xs font-medium leading-5 text-neutral-600">
                {item.warning ?? config.subtitle}
              </p>
            </div>
            <div className={`absolute right-5 top-5 shrink-0 rounded-full p-2.5 ${config.bgColor} ${config.color}`}>
              <config.icon className="h-5 w-5" />
            </div>
            <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-neutral-100/60" />
          </div>
        );
      })}
    </div>
  );
}
