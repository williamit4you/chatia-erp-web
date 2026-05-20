"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import { salesBudgetCatalog } from "@/lib/sales-budget-catalog";
import salesBudgetAnalyticsService, {
  type SalesBudgetChartDataset,
} from "@/services/sales-budget-analytics.service";
import { ArrowLeft, FileSpreadsheet, FileText, Lock, MessageSquareText } from "lucide-react";
import { useSessionStorageDate } from "@/hooks/useSessionStorageDate";

type DashboardAccessUser = {
  role?: string;
  hasBudgetDashboardAccess?: boolean;
};

const catalogIndex = salesBudgetCatalog.flatMap((category) =>
  category.highlights.map((chart) => ({
    ...chart,
    categoryName: category.name,
    categoryId: category.id,
  }))
);

export default function SalesBudgetAnalyticsDetailPage() {
  const params = useParams<{ chartId: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = (session?.user ?? null) as DashboardAccessUser | null;
  const chartId = String(params?.chartId ?? "");

  const [startDate, setStartDate] = useSessionStorageDate("salesBudgetStartDate", () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useSessionStorageDate("salesBudgetEndDate", () => new Date().toISOString().split("T")[0]);
  const [chart, setChart] = useState<SalesBudgetChartDataset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSeeSalesBudget =
    user?.role === "TENANT_ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.hasBudgetDashboardAccess;

  const chartMeta = useMemo(
    () => catalogIndex.find((item) => item.id === chartId),
    [chartId]
  );

  useEffect(() => {
    if (!canSeeSalesBudget || !chartId) return;
    let isMounted = true;
    const loadChart = async () => {
      setIsLoading(true);
      try {
        const response = await salesBudgetAnalyticsService.getChartsBatch({
          chartIds: [chartId],
          filters: { startDate, endDate },
        });
        if (!isMounted) return;
        setChart(response.items[0] ?? null);
        setError(null);
      } catch {
        if (!isMounted) return;
        setError("Não foi possível carregar este gráfico agora.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadChart();

    return () => {
      isMounted = false;
    };
  }, [canSeeSalesBudget, chartId, endDate, startDate]);

  if (status === "loading") {
    return <div className="h-full w-full bg-neutral-50" />;
  }

  if (!canSeeSalesBudget) {
    return (
      <div className="h-full w-full overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <SidebarToggle />
            <ChatCompanyDropdown />
          </div>
        </header>
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
               Gráfico de Vendas
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
               O acesso a esta análise depende da permissão de dashboard de Orçamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <SidebarToggle />
          <ChatCompanyDropdown />
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/chat/sales-budget-analytics")}
                className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar para Vendas
              </button>
              <div className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                {chartMeta?.categoryName ?? "Vendas"}
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-neutral-900">
                {chart?.title ?? chartMeta?.title ?? chartId}
              </h1>
              {chart?.meta?.warnings?.[0] ? (
                <p className="mt-4 max-w-3xl text-sm leading-6 text-amber-700">
                  {chart.meta.warnings[0]}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center">
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-bold text-neutral-700 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/chat/new?prompt=${encodeURIComponent(
                    `Analise o gráfico ${chart?.title ?? chartMeta?.title ?? chartId} de Vendas > Orçamento no período de ${startDate} a ${endDate}.`
                  )}`
                )
              }
              className="inline-flex items-center gap-2 rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-black text-white transition hover:bg-black"
            >
              <MessageSquareText className="h-4 w-4" />
              Perguntar sobre este gráfico
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-400"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Excel
            </button>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-black text-neutral-400"
            >
              <FileText className="h-4 w-4" />
              PDF
            </button>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {error}
            </div>
          ) : null}

          <SalesBudgetChartRenderer chart={chart} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
