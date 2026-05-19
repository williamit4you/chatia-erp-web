"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import SalesBudgetChartCard from "@/components/sales/SalesBudgetChartCard";
import {
  salesBudgetCatalog,
  type SalesBudgetChartAvailability,
} from "@/lib/sales-budget-catalog";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/formatters/financeFormat";
import salesBudgetAnalyticsService, {
  type SalesBudgetCategory,
  type SalesBudgetChartDataset,
  type SalesBudgetKpiItem,
} from "@/services/sales-budget-analytics.service";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  LayoutGrid,
  Lock,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

const availabilityLabel: Record<SalesBudgetChartAvailability, string> = {
  available_now: "Disponivel agora",
  needs_mapping: "Depende de mapeamento",
  needs_new_view: "Precisa de nova view",
};

const availabilityClassName: Record<SalesBudgetChartAvailability, string> = {
  available_now: "border-emerald-200 bg-emerald-50 text-emerald-700",
  needs_mapping: "border-amber-200 bg-amber-50 text-amber-700",
  needs_new_view: "border-rose-200 bg-rose-50 text-rose-700",
};

const LIVE_KPI_IDS = [
  "kpi_total_budget_amount",
  "kpi_budget_count",
  "kpi_avg_ticket",
  "kpi_conversion_rate",
  "kpi_open_amount",
  "kpi_approved_amount",
  "kpi_lost_amount",
  "kpi_best_seller",
] as const;

type DashboardAccessUser = {
  role?: string;
  hasBudgetDashboardAccess?: boolean;
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
  const [catalog, setCatalog] = useState<SalesBudgetCategory[]>(salesBudgetCatalog);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<SalesBudgetKpiItem[]>([]);
  const [isLoadingKpis, setIsLoadingKpis] = useState(false);
  const [kpiError, setKpiError] = useState<string | null>(null);
  const [chartsById, setChartsById] = useState<Record<string, SalesBudgetChartDataset>>({});
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [chartsError, setChartsError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split("T")[0]);
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
        setCatalog(response.categories);
        setCatalogError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setCatalogError("Usando catalogo local enquanto o backend analitico termina de subir.");
      });

    return () => {
      isMounted = false;
    };
  }, [canSeeSalesBudget]);

  useEffect(() => {
    if (!canSeeSalesBudget) return;
    let isMounted = true;
    setIsLoadingKpis(true);

    salesBudgetAnalyticsService
      .getKpis({
        filters: { startDate, endDate },
        kpiIds: [...LIVE_KPI_IDS],
      })
      .then((response) => {
        if (!isMounted) return;
        setKpis(response.items);
        setKpiError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setKpiError("Nao foi possivel carregar os KPIs agora.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingKpis(false);
      });

    return () => {
      isMounted = false;
    };
  }, [canSeeSalesBudget, startDate, endDate]);

  const activeCategory =
    catalog.find((category) => category.id === activeCategoryId) ?? catalog[0];

  useEffect(() => {
    if (!canSeeSalesBudget || !activeCategory) return;
    const chartIds = activeCategory.highlights.map((chart) => chart.id);
    if (chartIds.length === 0) return;

    let isMounted = true;
    setIsLoadingCharts(true);

    salesBudgetAnalyticsService
      .getChartsBatch({
        chartIds,
        filters: { startDate, endDate },
      })
      .then((response) => {
        if (!isMounted) return;
        setChartsById((current) => {
          const next = { ...current };
          for (const item of response.items) {
            next[item.chartId] = item;
          }
          return next;
        });
        setChartsError(null);
      })
      .catch(() => {
        if (!isMounted) return;
        setChartsError("Nao foi possivel carregar o lote inicial de graficos desta categoria.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingCharts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeCategory, canSeeSalesBudget, startDate, endDate]);

  const totals = useMemo(() => {
    return catalog.reduce(
      (acc, category) => {
        acc.plannedCharts += category.plannedCount;
        acc.availableNowCharts += category.availableNowCount;
        acc.needsNewViewCharts += category.needsNewViewCount;
        return acc;
      },
      {
        plannedCharts: 0,
        availableNowCharts: 0,
        needsNewViewCharts: 0,
      }
    );
  }, [catalog]);

  const filteredHighlights = useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.highlights.filter((chart) => {
      if (!deferredSearch) return true;
      return (
        chart.title.toLowerCase().includes(deferredSearch) ||
        chart.id.toLowerCase().includes(deferredSearch)
      );
    });
  }, [activeCategory, deferredSearch]);

  const kpiMap = useMemo(() => {
    return kpis.reduce<Record<string, SalesBudgetKpiItem>>((acc, item) => {
      acc[item.kpiId] = item;
      return acc;
    }, {});
  }, [kpis]);

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
              Vendas &gt; Orcamento
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Este painel usa a permissao de dashboard de Orcamento. O acesso
              precisa estar habilitado para carregar catalogos, filtros,
              graficos e exportacoes desta area.
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
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">
                <Sparkles className="h-3.5 w-3.5" />
                Catalogo e lotes iniciais ativos
              </div>
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Vendas &gt; Orcamento
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
                Filtro global por data, KPIs ao abrir a tela e graficos carregados
                por categoria em lotes pequenos, evitando disparar centenas de
                consultas no primeiro acesso.
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
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[26px] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                Categorias
              </p>
              <LayoutGrid className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
              {catalog.length}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Estruturadas para carga sob demanda.
            </p>
          </div>

          <div className="rounded-[26px] border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                Graficos mapeados
              </p>
              <BarChart3 className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
              {totals.plannedCharts}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              IDs e categorias prontos para backend e frontend.
            </p>
          </div>

          <div className="rounded-[26px] border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                Disponiveis agora
              </p>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
              {totals.availableNowCharts}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Dependem apenas das views atuais de orcamento e itens.
            </p>
          </div>

          <div className="rounded-[26px] border border-rose-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
                Novas views
              </p>
              <AlertCircle className="h-4 w-4 text-rose-600" />
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-neutral-900">
              {totals.needsNewViewCharts}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Bloqueados ate existir faturamento, metas, estoque ou custo.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                KPIs essenciais
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Leitura inicial do periodo selecionado, no mesmo fluxo em que a
                categoria depois abre seus graficos.
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
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Categorias e seletor otimizado
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Cada troca de categoria carrega apenas o lote principal de
                graficos daquela sessao.
              </p>
            </div>

            <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2">
              <Search className="h-4 w-4 text-neutral-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar grafico por nome ou id"
                className="w-full bg-transparent text-sm text-neutral-700 outline-none placeholder:text-neutral-400"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
            {catalog.map((category) => {
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
                  <div className="text-sm font-black tracking-tight">
                    {category.name}
                  </div>
                  <div
                    className={`text-xs ${
                      isActive ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {category.plannedCount} itens planejados
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

          <div className="mt-6 grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
            <div className="rounded-[26px] border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                Categoria ativa
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-neutral-900">
                {activeCategory?.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {activeCategory?.description}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                    Planejados
                  </p>
                  <p className="mt-2 text-2xl font-black text-neutral-900">
                    {activeCategory?.plannedCount ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    Disponiveis
                  </p>
                  <p className="mt-2 text-2xl font-black text-neutral-900">
                    {activeCategory?.availableNowCount ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
                    Novas views
                  </p>
                  <p className="mt-2 text-2xl font-black text-neutral-900">
                    {activeCategory?.needsNewViewCount ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="grid gap-4 xl:grid-cols-2">
                {filteredHighlights.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500 xl:col-span-2">
                    Nenhum grafico desta categoria corresponde ao filtro digitado.
                  </div>
                ) : (
                  filteredHighlights.map((chart) => (
                    <div key={chart.id} className="flex flex-col gap-2">
                      <div className="flex items-center justify-between px-1">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${availabilityClassName[chart.availability]}`}
                        >
                          {availabilityLabel[chart.availability]}
                        </span>
                      </div>
                      <SalesBudgetChartCard
                        chart={chartsById[chart.id] ?? null}
                        chartId={chart.id}
                        fallbackTitle={chart.title}
                        isLoading={isLoadingCharts && !chartsById[chart.id]}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
