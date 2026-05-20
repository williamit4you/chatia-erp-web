"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import SalesBudgetChartCard from "@/components/sales/SalesBudgetChartCard";
import { applySalesBudgetCatalogColors, salesBudgetCatalog } from "@/lib/sales-budget-catalog";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import salesBudgetAnalyticsService, {
  type SalesBudgetCategory,
  type SalesBudgetChartAvailability,
  type SalesBudgetChartDataset,
  type SalesBudgetChartPoint,
  type SalesBudgetKpiItem,
} from "@/services/sales-budget-analytics.service";
import { Calendar, Lock, Search } from "lucide-react";
import { useSessionStorageDate } from "@/hooks/useSessionStorageDate";

const LIVE_KPI_IDS = [
  "kpi_total_budget_amount",
  "kpi_budget_count",
  "kpi_avg_ticket",
  "kpi_conversion_rate",
  "kpi_open_amount",
  "kpi_approved_amount",
  "kpi_lost_amount",
] as const;

type DashboardScope = "budget" | "order" | "invoice";

type ScopeOption = {
  key: DashboardScope;
  label: string;
  emptyTitle?: string;
  emptyDescription?: string;
};

const DASHBOARD_SCOPES: ScopeOption[] = [
  { key: "budget", label: "Orçamento" },
  {
    key: "order",
    label: "Pedido",
    emptyTitle: "Pedidos",
    emptyDescription: "Os gráficos de pedidos vão aparecer aqui em uma próxima etapa.",
  },
  {
    key: "invoice",
    label: "Nota Fiscal",
    emptyTitle: "Notas fiscais",
    emptyDescription: "Os gráficos de notas fiscais vão aparecer aqui em uma próxima etapa.",
  },
];

type DashboardAccessUser = {
  role?: string;
  hasBudgetDashboardAccess?: boolean;
};

type VisibleChart = {
  id: string;
  title: string;
  availability: SalesBudgetChartAvailability;
  categoryId: string;
  categoryName: string;
  accentColor?: string;
};

const formatKpiValue = (item: SalesBudgetKpiItem) => {
  if (item.format === "text") return item.textValue ?? "Sem dados";
  const value = Number(item.value ?? 0);
  if (item.format === "currency") {
    return formatCurrency(value, { compact: true, maximumFractionDigits: 1 });
  }
  if (item.format === "percentage") {
    return formatPercent(value, { maximumFractionDigits: 1 });
  }
  return formatNumber(value, { compact: true, maximumFractionDigits: 0 });
};

export default function SalesBudgetAnalyticsPage() {
  const { data: session, status } = useSession();
  const user = (session?.user ?? null) as DashboardAccessUser | null;
  const [catalog, setCatalog] = useState<SalesBudgetCategory[]>(
    applySalesBudgetCatalogColors(salesBudgetCatalog)
  );
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<SalesBudgetKpiItem[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [topSellers, setTopSellers] = useState<SalesBudgetChartPoint[]>([]);
  const [topSellersError, setTopSellersError] = useState<string | null>(null);
  const [chartsById, setChartsById] = useState<Record<string, SalesBudgetChartDataset>>({});
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [startDate, setStartDate] = useSessionStorageDate("salesBudgetStartDate", () => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useSessionStorageDate("salesBudgetEndDate", () => new Date().toISOString().split("T")[0]);
  const [activeScope, setActiveScope] = useState<DashboardScope>("budget");
  const [activeCategoryId, setActiveCategoryId] = useState("overview");
  const [search, setSearch] = useState("");

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const canSeeSalesBudget =
    user?.role === "TENANT_ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.hasBudgetDashboardAccess;

  useEffect(() => {
    if (!canSeeSalesBudget) return;

    let isMounted = true;

    salesBudgetAnalyticsService
      .getCatalog()
      .then((response) => {
        if (!isMounted || !response?.categories?.length) return;
        setCatalog(applySalesBudgetCatalogColors(response.categories));
        setCatalogError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setCatalogError("Alguns dados de apoio não foram carregados, mas os gráficos principais continuam disponíveis.");
      });

    return () => {
      isMounted = false;
    };
  }, [canSeeSalesBudget]);

  useEffect(() => {
    if (!canSeeSalesBudget) return;
    let isMounted = true;
    const loadKpis = async () => {
      setIsLoadingKpis(true);
      try {
        const [kpiResponse, topSellersResponse] = await Promise.all([
          salesBudgetAnalyticsService.getKpis({
            filters: { startDate, endDate },
            kpiIds: [...LIVE_KPI_IDS],
          }),
          salesBudgetAnalyticsService.getChartsBatch({
            chartIds: ["seller_total_amount"],
            filters: { startDate, endDate },
          }),
        ]);
        if (!isMounted) return;
        setKpis(kpiResponse.items);
        setKpiError(null);
        setTopSellers(topSellersResponse.items[0]?.data?.slice(0, 5) ?? []);
        setTopSellersError(null);
      } catch {
        if (!isMounted) return;
        setKpiError("Não foi possível carregar os KPIs agora.");
        setTopSellers([]);
        setTopSellersError("Não foi possível carregar o ranking de vendedores agora.");
      } finally {
        if (isMounted) setIsLoadingKpis(false);
      }
    };

    void loadKpis();

    return () => {
      isMounted = false;
    };
  }, [canSeeSalesBudget, startDate, endDate]);

  const visibleCatalog = useMemo(() => {
    if (activeScope !== "budget") return [];
    return catalog;
  }, [activeScope, catalog]);

  const activeScopeOption =
    DASHBOARD_SCOPES.find((scope) => scope.key === activeScope) ?? DASHBOARD_SCOPES[0];

  const activeCategory =
    visibleCatalog.find((category) => category.id === activeCategoryId) ??
    visibleCatalog[0] ??
    null;

  const overviewChartsCount = useMemo(() => {
    if (!visibleCatalog.length) return 0;
    const seen = new Set<string>();
    for (const category of visibleCatalog) {
      for (const chart of category.highlights ?? []) {
        if (chart.availability !== "available_now") continue;
        if (seen.has(chart.id)) continue;
        seen.add(chart.id);
      }
    }
    return seen.size;
  }, [visibleCatalog]);

  const activeCategoryCharts = useMemo<VisibleChart[]>(() => {
    if (!visibleCatalog.length) return [];

    if (activeCategoryId === "overview") {
      const allAvailableCharts = visibleCatalog.flatMap((category) =>
        category.highlights
          .filter((chart) => chart.availability === "available_now")
          .map((chart) => ({
            id: chart.id,
            title: chart.title,
            availability: chart.availability,
            categoryId: category.id,
            categoryName: category.name,
            accentColor: chart.color ?? category.color,
          }))
      );

      return allAvailableCharts.filter(
        (chart, index, items) => items.findIndex((item) => item.id === chart.id) === index
      );
    }

    return (activeCategory?.highlights ?? [])
      .filter((chart) => chart.availability === "available_now")
      .map((chart) => ({
        id: chart.id,
        title: chart.title,
        availability: chart.availability,
        categoryId: activeCategory?.id ?? "",
        categoryName: activeCategory?.name ?? "",
        accentColor: chart.color ?? activeCategory?.color,
      }));
  }, [activeCategory, activeCategoryId, visibleCatalog]);

  const upcomingCategoryCharts = useMemo<VisibleChart[]>(() => {
    if (!activeCategory || activeCategoryId === "overview") return [];
    return (activeCategory.highlights ?? [])
      .filter((chart) => chart.availability !== "available_now")
      .map((chart) => ({
        id: chart.id,
        title: chart.title,
        availability: chart.availability,
        categoryId: activeCategory.id,
        categoryName: activeCategory.name,
      }));
  }, [activeCategory, activeCategoryId]);

  useEffect(() => {
    if (!canSeeSalesBudget || activeCategoryCharts.length === 0) return;
    const chartIds = activeCategoryCharts.map((chart) => chart.id);
    if (chartIds.length === 0) return;

    let isMounted = true;
    const loadCharts = async () => {
      setIsLoadingCharts(true);
      try {
        const response = await salesBudgetAnalyticsService.getChartsBatch({
          chartIds,
          filters: { startDate, endDate },
        });
        if (!isMounted) return;
        setChartsById((current) => {
          const next = { ...current };
          for (const item of response.items) {
            next[item.chartId] = item;
          }
          return next;
        });
        setChartsError(null);
      } catch {
        if (!isMounted) return;
        setChartsError("Não foi possível carregar os gráficos desta categoria agora.");
      } finally {
        if (isMounted) setIsLoadingCharts(false);
      }
    };

    void loadCharts();

    return () => {
      isMounted = false;
    };
  }, [activeCategoryCharts, canSeeSalesBudget, startDate, endDate]);

  const filteredHighlights = useMemo(() => {
    if (activeCategoryCharts.length === 0) return [];
    return activeCategoryCharts.filter((chart) => {
      if (!deferredSearch) return true;
      return chart.title.toLowerCase().includes(deferredSearch);
    });
  }, [activeCategoryCharts, deferredSearch]);

  const kpiMap = useMemo(() => {
    return kpis.reduce<Record<string, SalesBudgetKpiItem>>((acc, item) => {
      acc[item.kpiId] = item;
      return acc;
    }, {});
  }, [kpis]);

  const topSellerRows = useMemo(() => {
    return topSellers.map((seller, index) => ({
      rank: index + 1,
      name: seller.label || "Sem vendedor",
      amount: Number(seller.amount ?? seller.value ?? 0),
    }));
  }, [topSellers]);

  if (status === "loading") {
    return (
      <div className="h-full w-full overflow-y-auto bg-neutral-50">
        <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <SidebarToggle />
            <ChatCompanyDropdown />
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-3xl border border-neutral-200 bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
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
              Vendas &gt; Orçamento
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
               O acesso a esta área precisa estar habilitado para a sua conta.
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
        <section className="rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Vendas &gt; Orçamento
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
                Acompanhe os principais indicadores e explore os gráficos do período selecionado.
              </p>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-32 bg-transparent text-xs font-bold text-neutral-700 outline-none"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  className="w-32 bg-transparent text-xs font-bold text-neutral-700 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-[28px] border border-neutral-200 bg-neutral-50 p-2 shadow-sm">
            {DASHBOARD_SCOPES.map((scope) => {
              const isActive = activeScope === scope.key;
              return (
                <button
                  key={scope.key}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setActiveScope(scope.key);
                    })
                  }
                  className={`rounded-[20px] px-5 py-3 text-sm font-black transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                >
                  {scope.label}
                </button>
              );
            })}
          </div>
        </section>

        {activeScope === "budget" && (
          <section className="mt-6 rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Gráficos por categoria
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Escolha uma categoria para explorar os gráficos do período.
              </p>
            </div>

            <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar gráfico"
                className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {visibleCatalog.map((category) => {
              const isActive = category.id === activeCategory?.id;

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    startTransition(() => {
                      setActiveCategoryId(category.id);
                    })
                  }
                  className={`min-w-fit rounded-2xl border px-4 py-3 text-left transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-black tracking-tight">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: category.color ?? "#e5e7eb" }}
                    />
                    <span className="truncate">{category.name}</span>
                    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-neutral-200 px-1.5 text-[10px] font-black text-neutral-600">
                      {category.id === "overview" ? overviewChartsCount : category.highlights.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {chartsError && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {chartsError}
            </div>
          )}

          {upcomingCategoryCharts.length > 0 && activeCategoryId !== "overview" && !deferredSearch ? (
            <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                Em breve ({upcomingCategoryCharts.length})
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {upcomingCategoryCharts.map((chart) => (
                  <span
                    key={chart.id}
                    className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-bold text-neutral-700"
                    title={chart.id}
                  >
                    {chart.title}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6">
            <div className="grid gap-4 xl:grid-cols-2">
              {filteredHighlights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500 xl:col-span-2">
                  {upcomingCategoryCharts.length > 0 && !deferredSearch
                    ? "Esta categoria ainda não possui gráficos disponíveis."
                    : "Nenhum gráfico desta categoria corresponde ao filtro digitado."}
                </div>
              ) : (
                filteredHighlights.map((chart) => (
                  <div key={chart.id}>
                    <SalesBudgetChartCard
                      chart={chartsById[chart.id] ?? null}
                      chartId={chart.id}
                      fallbackTitle={chart.title}
                      isLoading={isLoadingCharts && !chartsById[chart.id]}
                      accentColor={chart.accentColor}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
          </section>
        )}

        {activeScope === "budget" ? (
          <section className="mt-6 rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Resumo do período
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Visão rápida dos principais indicadores para o intervalo selecionado.
              </p>
            </div>
          </div>

          {(catalogError || kpiError) && (
            <div className="mt-4 grid gap-3">
              {catalogError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                  {catalogError}
                </div>
              ) : null}
              {kpiError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                  {kpiError}
                </div>
              ) : null}
            </div>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {LIVE_KPI_IDS.map((kpiId) => {
              const item = kpiMap[kpiId];
              return (
                <div
                  key={kpiId}
                  className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5"
                >
                  <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                    {item?.label ?? "Carregando"}
                  </div>
                  <div className="mt-3 text-3xl font-black tracking-tight text-neutral-900">
                    {isLoadingKpis && !item ? "..." : item ? formatKpiValue(item) : "-"}
                  </div>
                  <div className="mt-2 min-h-5 text-xs font-medium text-neutral-500">
                    {item?.warning ?? "\u00a0"}
                  </div>
                </div>
              );
            })}

            <div className="rounded-[24px] border border-neutral-200 bg-neutral-50 p-5">
              <div className="text-xs font-black uppercase tracking-[0.16em] text-neutral-500">
                Top 5 vendedores
              </div>

              {isLoadingKpis && topSellerRows.length === 0 ? (
                <div className="mt-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="h-8 animate-pulse rounded-xl bg-white" />
                  ))}
                </div>
              ) : topSellerRows.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {topSellerRows.map((seller) => (
                    <div
                      key={`${seller.rank}-${seller.name}`}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-black text-white">
                          {seller.rank}
                        </div>
                        <div className="truncate text-sm font-bold text-neutral-800">
                          {seller.name}
                        </div>
                      </div>
                      <div className="shrink-0 text-sm font-black text-neutral-900">
                        {formatCurrency(seller.amount, {
                          compact: true,
                          maximumFractionDigits: 1,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-neutral-500">
                  {topSellersError ?? "Sem dados para montar o ranking neste período."}
                </div>
              )}
            </div>
          </div>
          </section>
        ) : (
          <section className="mt-6 rounded-[30px] border border-neutral-200 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-black tracking-tight text-neutral-900">
              {activeScopeOption.emptyTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
              {activeScopeOption.emptyDescription}
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
