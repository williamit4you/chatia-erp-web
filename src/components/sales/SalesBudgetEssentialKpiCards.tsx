"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  MessageSquareText,
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
    title: "Valor total or\u00e7ado",
    subtitle: "Volume total do per\u00edodo",
  },
  kpi_budget_count: {
    icon: FileText,
    color: "text-violet-600",
    bgColor: "bg-violet-100",
    title: "Quantidade de or\u00e7amentos",
    subtitle: "Total de documentos gerados",
  },
  kpi_avg_ticket: {
    icon: ReceiptText,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    title: "Ticket m\u00e9dio",
    subtitle: "Valor m\u00e9dio por or\u00e7amento",
  },
  kpi_conversion_rate: {
    icon: Percent,
    color: "text-cyan-600",
    bgColor: "bg-cyan-100",
    title: "Taxa de convers\u00e3o",
    subtitle: "Or\u00e7amentos aprovados no per\u00edodo",
  },
  kpi_open_amount: {
    icon: Wallet,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    title: "Valor em aberto",
    subtitle: "Pipeline ainda n\u00e3o conclu\u00eddo",
  },
  kpi_approved_amount: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    title: "Valor aprovado",
    subtitle: "Montante convertido em aprova\u00e7\u00e3o",
  },
  kpi_lost_amount: {
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    title: "Valor perdido",
    subtitle: "Or\u00e7amentos perdidos/cancelados",
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

  if (length >= 16) return "text-sm sm:text-base lg:text-lg";
  if (length >= 13) return "text-base sm:text-lg lg:text-xl";
  return "text-base sm:text-lg lg:text-xl";
}

export default function SalesBudgetEssentialKpiCards({
  items,
  isLoading,
}: SalesBudgetEssentialKpiCardsProps) {
  if (isLoading && items.length === 0) {
    return (
      <>
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className={`h-28 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm ${
              index < 2 ? "xl:col-span-2" : "xl:col-span-1"
            }`}
          />
        ))}
      </>
    );
  }

  return (
    <>
      {items.map((item, index) => {
        const config = KPI_VISUALS[item.kpiId] ?? {
          icon: CircleDollarSign,
          color: "text-neutral-700",
          bgColor: "bg-neutral-100",
          title: item.label,
          subtitle: item.warning ?? "Indicador do per\u00edodo",
        };
        const formattedValue = formatKpiValue(item);

        return (
          <div
            key={item.kpiId}
            className={`flex items-start justify-between gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm ${
              index < 2 ? "xl:col-span-2" : "xl:col-span-1"
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-3">
                <p
                  className="min-w-0 text-xs font-medium leading-5 text-neutral-500 sm:text-sm"
                  title={config.title}
                >
                  {config.title}
                </p>
                <Link
                  href={`/chat/sales-budget-analytics/${item.kpiId}`}
                  className="shrink-0 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title="Abrir KPI e conversar com a IA"
                >
                  <MessageSquareText className="h-4 w-4" />
                </Link>
              </div>
              <h3
                className={`${getValueTextClass(formattedValue)} font-bold leading-tight whitespace-normal [overflow-wrap:anywhere] ${config.color}`}
                title={formattedValue}
              >
                {formattedValue}
              </h3>
              <p className="mt-1 text-[11px] font-semibold leading-4 text-neutral-600">
                {item.warning ?? config.subtitle}
              </p>
            </div>
            <div className={`mt-1 shrink-0 rounded-full p-2 lg:p-3 ${config.bgColor} ${config.color}`}>
              <config.icon className="h-5 w-5 2xl:h-6 2xl:w-6" />
            </div>
          </div>
        );
      })}
    </>
  );
}
