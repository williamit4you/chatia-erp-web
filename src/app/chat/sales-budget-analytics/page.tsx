"use client";

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import SalesBudgetChartCard from "@/components/sales/SalesBudgetChartCard";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import SalesBudgetFunnelByStatusWidget from "@/components/sales/SalesBudgetFunnelByStatusWidget";
import SalesBudgetFunnelConversionWidget from "@/components/sales/SalesBudgetFunnelConversionWidget";
import SalesBudgetFunnelHealthWidget from "@/components/sales/SalesBudgetFunnelHealthWidget";
import SalesBudgetOverviewCompanyWidget from "@/components/sales/SalesBudgetOverviewCompanyWidget";
import SalesBudgetOverviewHeroWidget from "@/components/sales/SalesBudgetOverviewHeroWidget";
import SalesBudgetOverviewPeaksWidget from "@/components/sales/SalesBudgetOverviewPeaksWidget";
import SalesBudgetOverviewRhythmWidget from "@/components/sales/SalesBudgetOverviewRhythmWidget";
import SalesBudgetOverviewSeasonalityWidget from "@/components/sales/SalesBudgetOverviewSeasonalityWidget";
import SalesBudgetGeoByUfWidget from "@/components/sales/SalesBudgetGeoByUfWidget";
import SalesBudgetEssentialKpiCards from "@/components/sales/SalesBudgetEssentialKpiCards";
import SalesBudgetExecutiveKpiGrid from "@/components/sales/SalesBudgetExecutiveKpiGrid";
import SalesBudgetCategoryExplorerWidget from "@/components/sales/SalesBudgetCategoryExplorerWidget";
import DashboardSection from "@/components/finance/DashboardSection";
import SectionChartGrid from "@/components/finance/SectionChartGrid";
import type { DashboardThemeKey } from "@/components/finance/dashboardThemes";
import { applySalesBudgetCatalogColors, salesBudgetCatalog } from "@/lib/sales-budget-catalog";
import { formatCurrency } from "@/lib/formatters/financeFormat";
import { getSalesBudgetChartDefinition } from "@/lib/salesBudgetChartDefinitions";
import salesBudgetAnalyticsService, {
  type SalesBudgetCategory,
  type SalesBudgetChartAvailability,
  type SalesBudgetChartDataset,
  type SalesBudgetChartPoint,
  type SalesBudgetKpiItem,
} from "@/services/sales-budget-analytics.service";
import { BookOpenText, Calendar, Lock, Search } from "lucide-react";
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

const SALES_BUDGET_CATEGORY_THEMES: Record<string, DashboardThemeKey> = {
  overview: "general",
  funnel: "receivable",
  seller: "general",
  customer: "analysis",
  product: "payable",
  margin: "analysis",
  source: "cashflow",
  geo: "cashflow",
  payment: "payable",
  freight: "efficiency",
  executive: "general",
  seller_insights: "receivable",
  future_data: "analysis",
  kpis: "general",
  velocity: "payable",
  risk: "efficiency",
  efficiency: "efficiency",
  predictive: "analysis",
};

const EXPLORER_CATEGORY_IDS = new Set([
  "seller",
  "customer",
  "product",
  "margin",
  "source",
  "payment",
  "freight",
  "seller_insights",
  "executive",
  "future_data",
]);

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

type ChartViewMode = "grouped" | "individual";

export default function SalesBudgetAnalyticsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const initialScope = searchParams?.get("scope");
  const initialCategoryId = searchParams?.get("category") ?? "overview";
  const initialSearch = searchParams?.get("q") ?? "";
  const [activeScope, setActiveScope] = useState<DashboardScope>(
    initialScope === "order" || initialScope === "invoice" ? initialScope : "budget"
  );
  const [activeCategoryId, setActiveCategoryId] = useState(initialCategoryId);
  const [search, setSearch] = useState(initialSearch);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>("grouped");
  const [isChartDetailsOpen, setIsChartDetailsOpen] = useState(false);

  const deferredSearch = useDeferredValue(search.trim().toLowerCase());

  const canSeeSalesBudget =
    user?.role === "TENANT_ADMIN" ||
    user?.role === "SUPER_ADMIN" ||
    user?.hasBudgetDashboardAccess;

  useEffect(() => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
  }, [endDate, startDate]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("salesBudgetChartViewMode");
      if (saved === "grouped" || saved === "individual") {
        setChartViewMode(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("salesBudgetChartViewMode", chartViewMode);
    } catch {
      // ignore
    }
  }, [chartViewMode]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (activeScope === "budget") {
      params.delete("scope");
    } else {
      params.set("scope", activeScope);
    }

    if (activeCategoryId && activeCategoryId !== "overview") {
      params.set("category", activeCategoryId);
    } else {
      params.delete("category");
    }

    if (search.trim()) {
      params.set("q", search.trim());
    } else {
      params.delete("q");
    }

    const currentQuery = searchParams?.toString() ?? "";
    const nextQuery = params.toString();
    if (nextQuery === currentQuery) return;

    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [activeCategoryId, activeScope, pathname, router, search, searchParams]);

  const handleFilter = () => {
    setStartDate(draftStartDate);
    setEndDate(draftEndDate);
  };

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

  const activeCategoryNumber = useMemo(() => {
    const index = visibleCatalog.findIndex((category) => category.id === activeCategory?.id);
    return index >= 0 ? index + 1 : 1;
  }, [activeCategory?.id, visibleCatalog]);

  const activeCategoryTheme = activeCategory
    ? activeCategory.id === "overview"
      ? "executive"
      : SALES_BUDGET_CATEGORY_THEMES[activeCategory.id] ?? "general"
    : "general";

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

  type RenderItem =
    | { kind: "single"; chart: VisibleChart }
    | { kind: "geo_by_uf"; charts: VisibleChart[]; defaultTabId?: string | null }
    | {
        kind: "funnel_conversion_segments";
        charts: VisibleChart[];
        defaultTabId?: string | null;
      }
    | {
        kind: "funnel_by_status_family";
        charts: VisibleChart[];
        defaultTabId?: string | null;
      }
    | { kind: "funnel_health_summary"; charts: VisibleChart[] }
    | { kind: "overview_hero_summary"; charts: VisibleChart[] }
    | { kind: "overview_peaks_summary"; charts: VisibleChart[] }
    | { kind: "overview_company_summary"; charts: VisibleChart[] }
    | { kind: "overview_rhythm_summary"; charts: VisibleChart[] }
    | { kind: "overview_seasonality_summary"; charts: VisibleChart[] };

  const buildRenderHighlights = (sourceCharts: VisibleChart[]): RenderItem[] => {
    if (sourceCharts.length === 0) return [];

    const localFilteredHighlights = sourceCharts.filter((chart) => {
      if (!deferredSearch) return true;
      return chart.title.toLowerCase().includes(deferredSearch);
    });

    if (localFilteredHighlights.length === 0) return [];

    if (chartViewMode === "individual") {
      return localFilteredHighlights.map((chart) => ({ kind: "single", chart }));
    }

    const groupIdByChartId = new Map<string, string | null>();
    for (const item of sourceCharts) {
      const def = getSalesBudgetChartDefinition(item.id);
      groupIdByChartId.set(item.id, def?.groupId ?? null);
    }

    const geoGroupChartsAll = sourceCharts.filter(
      (item) => groupIdByChartId.get(item.id) === "geo_by_uf"
    );

    const conversionGroupChartsAll = sourceCharts.filter(
      (item) => groupIdByChartId.get(item.id) === "funnel_conversion_segments"
    );

    const statusGroupChartsAll = sourceCharts.filter(
      (item) => groupIdByChartId.get(item.id) === "funnel_by_status_family"
    );
    const funnelHealthChartsAll = sourceCharts.filter((item) =>
      [
        "funnel_pending_amount",
        "funnel_approval_rate",
        "funnel_loss_cancel_rate",
      ].includes(item.id)
    );
    const overviewHeroChartsAll = sourceCharts.filter((item) =>
      [
        "overview_total_amount_period",
        "overview_total_count_period",
        "overview_avg_ticket",
      ].includes(item.id)
    );
    const overviewRhythmChartsAll = sourceCharts.filter((item) =>
      [
        "overview_monthly_evolution",
        "overview_weekly_evolution",
        "overview_daily_evolution",
      ].includes(item.id)
    );
    const overviewPeaksChartsAll = sourceCharts.filter((item) =>
      [
        "overview_top_days_by_volume",
        "overview_top_months_by_amount",
      ].includes(item.id)
    );
    const overviewCompanyChartsAll = sourceCharts.filter((item) =>
      [
        "overview_amount_by_company",
        "overview_count_by_company",
      ].includes(item.id)
    );
    const overviewSeasonalityChartsAll = sourceCharts.filter((item) =>
      [
        "overview_month_seasonality",
        "overview_weekday_heatmap",
        "overview_month_year_heatmap",
      ].includes(item.id)
    );

    const matchedIds = new Set(localFilteredHighlights.map((c) => c.id));

    const showGeoGroup =
      geoGroupChartsAll.length >= 2 &&
      (deferredSearch ? geoGroupChartsAll.some((c) => matchedIds.has(c.id)) : true);

    const showConversionGroup =
      conversionGroupChartsAll.length >= 2 &&
      (deferredSearch
        ? conversionGroupChartsAll.some((c) => matchedIds.has(c.id))
        : true);

    const showStatusGroup =
      statusGroupChartsAll.length >= 2 &&
      (deferredSearch
        ? statusGroupChartsAll.some((c) => matchedIds.has(c.id))
        : true);
    const showFunnelHealthGroup =
      funnelHealthChartsAll.length >= 2 &&
      (deferredSearch
        ? funnelHealthChartsAll.some((c) => matchedIds.has(c.id))
        : true);
    const showOverviewHeroGroup =
      overviewHeroChartsAll.length >= 2 &&
      (deferredSearch
        ? overviewHeroChartsAll.some((c) => matchedIds.has(c.id))
        : true);
    const showOverviewRhythmGroup =
      overviewRhythmChartsAll.length >= 2 &&
      (deferredSearch
        ? overviewRhythmChartsAll.some((c) => matchedIds.has(c.id))
        : true);
    const showOverviewPeaksGroup =
      overviewPeaksChartsAll.length >= 2 &&
      (deferredSearch
        ? overviewPeaksChartsAll.some((c) => matchedIds.has(c.id))
        : true);
    const showOverviewCompanyGroup =
      overviewCompanyChartsAll.length >= 2 &&
      (deferredSearch
        ? overviewCompanyChartsAll.some((c) => matchedIds.has(c.id))
        : true);
    const showOverviewSeasonalityGroup =
      overviewSeasonalityChartsAll.length >= 2 &&
      (deferredSearch
        ? overviewSeasonalityChartsAll.some((c) => matchedIds.has(c.id))
        : true);

    const geoSet = new Set(geoGroupChartsAll.map((c) => c.id));
    const conversionSet = new Set(conversionGroupChartsAll.map((c) => c.id));
    const statusSet = new Set(statusGroupChartsAll.map((c) => c.id));
    const funnelHealthSet = new Set(funnelHealthChartsAll.map((c) => c.id));
    const overviewHeroSet = new Set(overviewHeroChartsAll.map((c) => c.id));
    const overviewRhythmSet = new Set(overviewRhythmChartsAll.map((c) => c.id));
    const overviewPeaksSet = new Set(overviewPeaksChartsAll.map((c) => c.id));
    const overviewCompanySet = new Set(overviewCompanyChartsAll.map((c) => c.id));
    const overviewSeasonalitySet = new Set(overviewSeasonalityChartsAll.map((c) => c.id));

    const items: RenderItem[] = [];

    const pushGeoGroup = () => {
      const defaultTabId = deferredSearch
        ? geoGroupChartsAll.find((c) => matchedIds.has(c.id))?.id ?? null
        : null;
      items.push({ kind: "geo_by_uf", charts: geoGroupChartsAll, defaultTabId });
    };

    const pushConversionGroup = () => {
      const defaultTabId = deferredSearch
        ? conversionGroupChartsAll.find((c) => matchedIds.has(c.id))?.id ?? null
        : null;
      items.push({
        kind: "funnel_conversion_segments",
        charts: conversionGroupChartsAll,
        defaultTabId,
      });
    };

    const pushStatusGroup = () => {
      const defaultTabId = deferredSearch
        ? statusGroupChartsAll.find((c) => matchedIds.has(c.id))?.id ?? null
        : null;
      items.push({
        kind: "funnel_by_status_family",
        charts: statusGroupChartsAll,
        defaultTabId,
      });
    };
    const pushFunnelHealthGroup = () => {
      items.push({
        kind: "funnel_health_summary",
        charts: funnelHealthChartsAll,
      });
    };
    const pushOverviewHeroGroup = () => {
      items.push({
        kind: "overview_hero_summary",
        charts: overviewHeroChartsAll,
      });
    };
    const pushOverviewRhythmGroup = () => {
      items.push({
        kind: "overview_rhythm_summary",
        charts: overviewRhythmChartsAll,
      });
    };
    const pushOverviewPeaksGroup = () => {
      items.push({
        kind: "overview_peaks_summary",
        charts: overviewPeaksChartsAll,
      });
    };
    const pushOverviewCompanyGroup = () => {
      items.push({
        kind: "overview_company_summary",
        charts: overviewCompanyChartsAll,
      });
    };
    const pushOverviewSeasonalityGroup = () => {
      items.push({
        kind: "overview_seasonality_summary",
        charts: overviewSeasonalityChartsAll,
      });
    };

    // Render order: keep list order, but collapse group members into one widget.
    for (const chart of localFilteredHighlights) {
      if (showGeoGroup && geoSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "geo_by_uf")) pushGeoGroup();
        continue;
      }

      if (showConversionGroup && conversionSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "funnel_conversion_segments"))
          pushConversionGroup();
        continue;
      }

      if (showStatusGroup && statusSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "funnel_by_status_family")) pushStatusGroup();
        continue;
      }

      if (showFunnelHealthGroup && funnelHealthSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "funnel_health_summary")) pushFunnelHealthGroup();
        continue;
      }

      if (showOverviewHeroGroup && overviewHeroSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "overview_hero_summary")) pushOverviewHeroGroup();
        continue;
      }

      if (showOverviewRhythmGroup && overviewRhythmSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "overview_rhythm_summary")) pushOverviewRhythmGroup();
        continue;
      }

      if (showOverviewPeaksGroup && overviewPeaksSet.has(chart.id)) {
        if (!items.some((i) => i.kind === "overview_peaks_summary")) pushOverviewPeaksGroup();
        continue;
      }

      if (showOverviewCompanyGroup && overviewCompanySet.has(chart.id)) {
        if (!items.some((i) => i.kind === "overview_company_summary")) pushOverviewCompanyGroup();
        continue;
      }

      if (showOverviewSeasonalityGroup && overviewSeasonalitySet.has(chart.id)) {
        if (!items.some((i) => i.kind === "overview_seasonality_summary"))
          pushOverviewSeasonalityGroup();
        continue;
      }

      items.push({ kind: "single", chart });
    }

    return items;
  };

  const renderHighlights = useMemo<RenderItem[]>(() => {
    return buildRenderHighlights(activeCategoryCharts);
  }, [activeCategoryCharts, chartViewMode, deferredSearch]);

  const overviewSections = useMemo(() => {
    if (activeCategoryId !== "overview") return [];

    return visibleCatalog
      .map((category, index) => {
        const categoryCharts = (category.highlights ?? [])
          .filter((chart) => chart.availability === "available_now")
          .map((chart) => ({
            id: chart.id,
            title: chart.title,
            availability: chart.availability,
            categoryId: category.id,
            categoryName: category.name,
            accentColor: chart.color ?? category.color,
          }));

        const items = buildRenderHighlights(categoryCharts);

        return {
          id: category.id,
          name: category.name,
          description: category.description,
          number: index + 1,
          theme: SALES_BUDGET_CATEGORY_THEMES[category.id] ?? "general",
          items,
        };
      })
      .filter((section) => section.items.length > 0);
  }, [activeCategoryId, chartViewMode, deferredSearch, visibleCatalog]);

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

  const renderHighlightItem = (item: RenderItem, index: number, fallbackCategoryName?: string | null) => {
    if (item.kind === "geo_by_uf") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      const accentColor =
        item.charts.find((c) => c.categoryId === "geo")?.accentColor ??
        item.charts[0]?.accentColor;

      return (
        <div key={`geo_by_uf_${index}`}>
          <SalesBudgetGeoByUfWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            accentColor={accentColor}
            defaultTabId={item.defaultTabId ?? null}
            startDate={startDate}
            endDate={endDate}
            categoryName={item.charts[0]?.categoryName ?? fallbackCategoryName ?? "Geo"}
          />
        </div>
      );
    }

    if (item.kind === "funnel_conversion_segments") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      const accentColor =
        item.charts.find((c) => c.categoryId === "funnel")?.accentColor ??
        item.charts[0]?.accentColor;

      return (
        <div key={`funnel_conversion_${index}`}>
          <SalesBudgetFunnelConversionWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            accentColor={accentColor}
            defaultTabId={item.defaultTabId ?? null}
            startDate={startDate}
            endDate={endDate}
            categoryName={item.charts[0]?.categoryName ?? fallbackCategoryName ?? "Funil"}
          />
        </div>
      );
    }

    if (item.kind === "funnel_by_status_family") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      const accentColor =
        item.charts.find((c) => c.categoryId === "funnel")?.accentColor ??
        item.charts[0]?.accentColor;

      return (
        <div key={`funnel_by_status_${index}`}>
          <SalesBudgetFunnelByStatusWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            accentColor={accentColor}
            defaultTabId={item.defaultTabId ?? null}
            startDate={startDate}
            endDate={endDate}
            categoryName={item.charts[0]?.categoryName ?? fallbackCategoryName ?? "Funil"}
          />
        </div>
      );
    }

    if (item.kind === "funnel_health_summary") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      return (
        <div key={`funnel_health_${index}`} className="sm:col-span-2 xl:col-span-2">
          <SalesBudgetFunnelHealthWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            startDate={startDate}
            endDate={endDate}
            categoryName={item.charts[0]?.categoryName ?? fallbackCategoryName ?? "Funil"}
          />
        </div>
      );
    }

    if (item.kind === "overview_hero_summary") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }
      byId.funnel_count_by_status = chartsById.funnel_count_by_status ?? null;

      return (
        <div key={`overview_hero_${index}`} className="sm:col-span-2 xl:col-span-3">
          <SalesBudgetOverviewHeroWidget
            charts={byId as any}
            kpiMap={kpiMap}
            isLoading={isLoadingCharts || isLoadingKpis}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      );
    }

    if (item.kind === "overview_rhythm_summary") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      return (
        <div key={`overview_rhythm_${index}`} className="xl:col-span-2">
          <SalesBudgetOverviewRhythmWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      );
    }

    if (item.kind === "overview_peaks_summary") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      return (
        <div key={`overview_peaks_${index}`}>
          <SalesBudgetOverviewPeaksWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      );
    }

    if (item.kind === "overview_company_summary") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      return (
        <div key={`overview_company_${index}`}>
          <SalesBudgetOverviewCompanyWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      );
    }

    if (item.kind === "overview_seasonality_summary") {
      const byId: Record<string, SalesBudgetChartDataset | null> = {};
      for (const chart of item.charts) {
        byId[chart.id] = chartsById[chart.id] ?? null;
      }

      return (
        <div key={`overview_seasonality_${index}`}>
          <SalesBudgetOverviewSeasonalityWidget
            charts={byId as any}
            isLoading={isLoadingCharts}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      );
    }

    const chart = item.chart;
    return (
      <div key={chart.id}>
        <SalesBudgetChartCard
          chart={chartsById[chart.id] ?? null}
          chartId={chart.id}
          fallbackTitle={chart.title}
          isLoading={isLoadingCharts && !chartsById[chart.id]}
          accentColor={chart.accentColor}
          startDate={startDate}
          endDate={endDate}
          categoryName={chart.categoryName ?? fallbackCategoryName ?? activeCategory?.name ?? null}
        />
      </div>
    );
  };

  if (status === "loading") {
    return (
      <div className="flex-1 overflow-auto bg-neutral-50/70 scroll-smooth">
        <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
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
      <div className="flex-1 overflow-auto bg-neutral-50/70 scroll-smooth">
        <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
          <div className="rounded-[28px] border border-rose-200 bg-white p-8 shadow-sm">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Lock className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-neutral-900">
              Vendas
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
    <div className="flex-1 overflow-auto bg-neutral-50/70 scroll-smooth">
      <div className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-neutral-900">
                Vendas
              </h1>
              <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-[0_2px_10px_-3px_rgba(37,99,235,0.5)]">
                ORÇAMENTO
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-500">
              Gráficos e KPIs organizados por categoria e período selecionado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-white p-1.5 shadow-sm">
              <div className="flex items-center gap-2 px-3 sm:border-r sm:border-neutral-100">
                <Calendar className="h-4 w-4 text-neutral-400" />
                <input
                  type="date"
                  value={draftStartDate}
                  onChange={(event) => setDraftStartDate(event.target.value)}
                  className="w-28 text-xs font-bold text-neutral-700 outline-none"
                />
                <span className="text-neutral-300">/</span>
                <input
                  type="date"
                  value={draftEndDate}
                  onChange={(event) => setDraftEndDate(event.target.value)}
                  className="w-28 text-xs font-bold text-neutral-700 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleFilter}
                className="rounded-lg bg-neutral-900 px-5 py-1.5 text-xs font-black uppercase text-white transition-colors hover:bg-black"
              >
                Atualizar
              </button>
              <button
                type="button"
                onClick={() => setIsChartDetailsOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-black uppercase text-blue-700 transition-colors hover:bg-blue-100"
              >
                <BookOpenText className="h-4 w-4" />
                Detalhes dos gráficos
              </button>
            </div>
          </div>
        </div>

        <SalesBudgetChartDetailsModal
          isOpen={isChartDetailsOpen}
          title={activeCategory?.name ? `Vendas - ${activeCategory.name}` : "Vendas"}
          entries={activeCategoryCharts.map((chart) => ({
            id: chart.id,
            title: chart.title,
            categoryName: chart.categoryName,
          }))}
          startDate={draftStartDate}
          endDate={draftEndDate}
          onClose={() => setIsChartDetailsOpen(false)}
        />

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-1.5 shadow-sm">
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
                  className={`rounded-xl px-4 py-2 text-sm font-black transition-colors ${
                    isActive
                      ? "bg-neutral-900 text-white"
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  }`}
                >
                  {scope.label}
                </button>
              );
            })}
          </div>
        </div>

        {activeScope === "budget" && (
          <>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
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
                    <span className={`ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                      isActive ? "bg-white/15 text-white" : "bg-neutral-200 text-neutral-600"
                    }`}>
                      {category.id === "overview" ? overviewChartsCount : category.availableNowCount}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mb-6 flex flex-col gap-3 rounded-[24px] border border-neutral-200 bg-[linear-gradient(135deg,_#ffffff_0%,_#f8fafc_100%)] p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                Modo de visualização
              </div>
              <p className="mt-1 text-sm text-neutral-600">
                Use a leitura guiada para ver os blocos consolidados ou abra todos os gráficos individualmente.
              </p>
            </div>

            <div className="inline-flex w-fit rounded-2xl border border-neutral-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setChartViewMode("grouped")}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                  chartViewMode === "grouped"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                Leitura guiada
              </button>
              <button
                type="button"
                onClick={() => setChartViewMode("individual")}
                className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition-colors ${
                  chartViewMode === "individual"
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900"
                }`}
              >
                Todos os gráficos
              </button>
            </div>
          </div>
          <DashboardSection
            number={activeCategoryNumber}
            title={
              activeCategoryId === "overview"
                ? "GRUPO DE GR\u00c1FICOS"
                : activeCategory?.name ?? "Gr\u00e1ficos por categoria"
            }
            description={
              activeCategoryId === "overview"
                ? "Cole\u00e7\u00e3o principal de visualiza\u00e7\u00f5es organizadas por tema e leitura."
                : activeCategory?.description ?? "Escolha uma categoria para explorar os gr\u00e1ficos do per\u00edodo."
            }
            theme={activeCategoryTheme}
          >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-black tracking-tight text-neutral-900">
                Gráficos por categoria
              </h2>
              <p className="mt-1 text-sm text-neutral-500">
                Escolha uma categoria para explorar os gráficos do período.
              </p>
            </div>

            <div className="flex w-full max-w-3xl flex-col gap-3 lg:items-end">
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
            {activeCategoryId === "overview" ? (
              <div className="space-y-6">
                {overviewSections.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500">
                    {"Nenhum gr\u00e1fico da vis\u00e3o geral corresponde ao filtro digitado."}
                  </div>
                ) : (
                  overviewSections.map((section) => (
                    <DashboardSection
                      key={section.id}
                      number={section.number}
                      title={section.name}
                      description={section.description}
                      theme={section.theme}
                    >
                      <SectionChartGrid variant="analysis">
                        {section.items.map((item, index) =>
                          renderHighlightItem(item, index, section.name)
                        )}
                      </SectionChartGrid>
                    </DashboardSection>
                  ))
                )}
              </div>
            ) : null}
            {activeCategoryId === "kpis" ? (
            <SalesBudgetExecutiveKpiGrid
              items={filteredHighlights.map((chart) => ({
                chartId: chart.id,
                title: chart.title,
                chart: chartsById[chart.id] ?? null,
              }))}
              isLoading={isLoadingCharts}
            />
            ) : null}
            {EXPLORER_CATEGORY_IDS.has(activeCategoryId) && chartViewMode === "grouped" ? (
            <SalesBudgetCategoryExplorerWidget
              categoryId={activeCategoryId}
              categoryName={activeCategory?.name ?? "Explorador"}
              categoryDescription={activeCategory?.description ?? null}
              items={filteredHighlights.map((chart) => ({
                id: chart.id,
                label: chart.title,
                chart: chartsById[chart.id] ?? null,
              }))}
              isLoading={isLoadingCharts}
              accentColor={activeCategory?.color}
              startDate={startDate}
              endDate={endDate}
            />
            ) : null}
            {EXPLORER_CATEGORY_IDS.has(activeCategoryId) && chartViewMode === "individual" ? (
            <SectionChartGrid variant="analysis">
              {filteredHighlights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500 xl:col-span-3">
                  Nenhum gráfico desta categoria corresponde ao filtro digitado.
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
                      startDate={startDate}
                      endDate={endDate}
                      categoryName={chart.categoryName ?? activeCategory?.name ?? null}
                    />
                  </div>
                ))
              )}
            </SectionChartGrid>
            ) : null}
            {activeCategoryId !== "overview" &&
            activeCategoryId !== "kpis" &&
            !EXPLORER_CATEGORY_IDS.has(activeCategoryId) ? (
            <SectionChartGrid variant="analysis">
              {renderHighlights.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-sm text-neutral-500 xl:col-span-3">
                  {upcomingCategoryCharts.length > 0 && !deferredSearch
                    ? "Esta categoria ainda não possui gráficos disponíveis."
                    : "Nenhum gráfico desta categoria corresponde ao filtro digitado."}
                </div>
              ) : (
                renderHighlights.map((item, index) =>
                  renderHighlightItem(item, index, activeCategory?.name ?? null)
                )
              )}
            </SectionChartGrid>
            ) : null}
          </div>
          </DashboardSection>
          </>
        )}

        {activeScope === "budget" ? (
          <div className="mt-6">
          <DashboardSection
            number={visibleCatalog.length + 1}
            title="Resumo do período"
            description="Visão rápida dos principais indicadores para o intervalo selecionado."
            theme="general"
          >
          <div className="hidden items-center justify-between gap-4">
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

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SalesBudgetEssentialKpiCards
              items={LIVE_KPI_IDS.map((kpiId) => kpiMap[kpiId]).filter(Boolean)}
              isLoading={isLoadingKpis}
            />

            <div className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="mb-1 text-xs font-medium leading-5 text-neutral-500 sm:text-sm">
                    Top 5 vendedores
                  </div>
                  <p className="text-[11px] font-semibold leading-4 text-neutral-600">
                    {"Ranking por valor or\u00e7ado no per\u00edodo selecionado."}
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-neutral-600">
                  Ranking
                </div>
              </div>

              {isLoadingKpis && topSellerRows.length === 0 ? (
                <div className="mt-4 space-y-3">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <div key={item} className="h-10 animate-pulse rounded-xl bg-neutral-50" />
                  ))}
                </div>
              ) : topSellerRows.length > 0 ? (
                <div className="mt-4 space-y-3">
                  {topSellerRows.map((seller) => (
                    <div
                      key={`${seller.rank}-${seller.name}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-3 py-2.5"
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
                  <div className="mt-4 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-500">
                  {topSellersError ?? "Sem dados para montar o ranking neste per\u00edodo."}
                </div>
              )}
            </div>
          </div>
          </DashboardSection>
          </div>
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

