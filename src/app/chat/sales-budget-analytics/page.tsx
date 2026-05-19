"use client";

import { useDeferredValue, useMemo, useState, startTransition } from "react";
import { useSession } from "next-auth/react";
import SidebarToggle from "@/components/chat/SidebarToggle";
import ChatCompanyDropdown from "@/components/chat/ChatCompanyDropdown";
import {
  salesBudgetCatalog,
  salesBudgetTotals,
  type SalesBudgetChartAvailability,
} from "@/lib/sales-budget-catalog";
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

type DashboardAccessUser = {
  role?: string;
  hasBudgetDashboardAccess?: boolean;
};

export default function SalesBudgetAnalyticsPage() {
  const { data: session, status } = useSession();
  const user = (session?.user ?? null) as DashboardAccessUser | null;

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

  const activeCategory =
    salesBudgetCatalog.find((category) => category.id === activeCategoryId) ??
    salesBudgetCatalog[0];

  const filteredHighlights = useMemo(() => {
    return activeCategory.highlights.filter((chart) => {
      if (!deferredSearch) return true;
      return (
        chart.title.toLowerCase().includes(deferredSearch) ||
        chart.id.toLowerCase().includes(deferredSearch)
      );
    });
  }, [activeCategory, deferredSearch]);

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
              precisa estar habilitado para carregar os catalogos, filtros,
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
                Catalogo inicial pronto para execucao
              </div>
              <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl">
                Vendas &gt; Orcamento
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
                Abertura por categorias, filtro de datas global e catalogo de
                graficos preparado para entrar em lotes, sem disparar centenas
                de consultas no primeiro carregamento.
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
              {salesBudgetCatalog.length}
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
              {salesBudgetTotals.plannedCharts}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              IDs e categorias definidos para backend e frontend.
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
              {salesBudgetTotals.availableNowCharts}
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
              {salesBudgetTotals.needsNewViewCharts}
            </p>
            <p className="mt-2 text-sm text-neutral-500">
              Bloqueados ate existir faturamento, metas, estoque ou custo.
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-[30px] border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Categorias e seletor otimizado
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                O carregamento final desta tela sera por categoria ativa,
                graficos visiveis e abertura individual.
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
            {salesBudgetCatalog.map((category) => {
              const isActive = category.id === activeCategory.id;
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

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_2fr]">
            <div className="rounded-[26px] border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                Categoria ativa
              </p>
              <h3 className="mt-3 text-2xl font-black tracking-tight text-neutral-900">
                {activeCategory.name}
              </h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {activeCategory.description}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                    Planejados
                  </p>
                  <p className="mt-2 text-2xl font-black text-neutral-900">
                    {activeCategory.plannedCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
                    Disponiveis
                  </p>
                  <p className="mt-2 text-2xl font-black text-neutral-900">
                    {activeCategory.availableNowCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-700">
                    Novas views
                  </p>
                  <p className="mt-2 text-2xl font-black text-neutral-900">
                    {activeCategory.needsNewViewCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-neutral-200 bg-white p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-neutral-500">
                    Destaques da categoria
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Recorte inicial para construir selects, drill-down e IA por grafico.
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {filteredHighlights.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500 lg:col-span-2">
                    Nenhum grafico desta categoria corresponde ao filtro digitado.
                  </div>
                ) : (
                  filteredHighlights.map((chart) => (
                    <article
                      key={chart.id}
                      className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-black tracking-tight text-neutral-900">
                            {chart.title}
                          </h4>
                          <p className="mt-2 text-xs font-mono text-neutral-500">
                            {chart.id}
                          </p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${availabilityClassName[chart.availability]}`}
                        >
                          {availabilityLabel[chart.availability]}
                        </span>
                      </div>
                    </article>
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
