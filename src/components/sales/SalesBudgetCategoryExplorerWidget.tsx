"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import SalesBudgetChartDetailsButton from "@/components/sales/SalesBudgetChartDetailsButton";
import SalesBudgetChartDetailsModal from "@/components/sales/SalesBudgetChartDetailsModal";
import SalesBudgetChartRenderer from "@/components/sales/SalesBudgetChartRenderer";
import type { SalesBudgetChartDataset } from "@/services/sales-budget-analytics.service";

type ExplorerItem = {
  id: string;
  label: string;
  chart: SalesBudgetChartDataset | null;
};

type ExplorerGroup = {
  key: string;
  label: string;
  items: ExplorerItem[];
};

type SalesBudgetCategoryExplorerWidgetProps = {
  categoryId: string;
  categoryName: string;
  categoryDescription?: string | null;
  items: ExplorerItem[];
  isLoading: boolean;
  accentColor?: string;
  startDate?: string;
  endDate?: string;
};

function shortenExplorerLabel(label: string) {
  return label
    .replace(/ por vendedor/gi, "")
    .replace(/ por cliente/gi, "")
    .replace(/ por produto/gi, "")
    .replace(/ por origem/gi, "")
    .replace(/ por condi(?:\u00e7|\u00c3\u00a7)(?:\u00e3|\u00c3\u00a3)o de pagamento/gi, "")
    .replace(/ de vendedores/gi, "")
    .replace(/ de clientes/gi, "")
    .replace(/ de produtos/gi, "")
    .replace(/ concedido/gi, "")
    .replace(/ valor total/gi, " valor")
    .replace(/ quantidade de or(?:\u00e7|\u00c3\u00a7)amentos/gi, " quantidade")
    .replace(/Vendedores com mais /gi, "")
    .replace(/Clientes com maior /gi, "")
    .replace(/Produtos com maior /gi, "")
    .replace(/Top clientes /gi, "")
    .replace(/Top produtos /gi, "")
    .replace(/Top vendedores /gi, "")
    .replace(/Ranking de /gi, "")
    .replace(/Condi(?:\u00e7|\u00c3\u00a7)(?:\u00e3|\u00c3\u00a3)o de pagamento x /gi, "")
    .replace(/Cliente x /gi, "")
    .replace(/Produtos? x /gi, "")
    .replace(/Origem x /gi, "")
    .replace(/Rela(?:\u00e7\u00e3o|\u00c3\u00a7\u00c3\u00a3o) /gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function buildDisplayLabels(items: ExplorerItem[]) {
  const shortenedById = new Map<string, string>();
  const counts = new Map<string, number>();

  for (const item of items) {
    const shortened = shortenExplorerLabel(item.label);
    shortenedById.set(item.id, shortened);
    counts.set(shortened, (counts.get(shortened) ?? 0) + 1);
  }

  return new Map(
    items.map((item) => {
      const shortened = shortenedById.get(item.id) ?? item.label;
      const hasCollision = (counts.get(shortened) ?? 0) > 1;
      return [item.id, hasCollision ? item.label : shortened];
    })
  );
}

function buildExplorerGroups(categoryId: string, items: ExplorerItem[]): ExplorerGroup[] {
  const groups = new Map<string, ExplorerGroup>();

  const ensureGroup = (key: string, label: string) => {
    const existing = groups.get(key);
    if (existing) return existing;
    const next = { key, label, items: [] };
    groups.set(key, next);
    return next;
  };

  const getGroupMeta = (item: ExplorerItem) => {
    const text = `${item.id} ${item.label}`.toLowerCase();

    if (categoryId === "executive") {
      if (/dashboard|receita|total|consolid|open_pipeline|pipeline/.test(text)) {
        return { key: "overview", label: "Resumo executivo" };
      }
      if (/meta|goal|forecast|growth|evolu/.test(text)) {
        return { key: "planning", label: "Planejamento" };
      }
      if (/seller|customer|product|region|origin|share|participa/.test(text)) {
        return { key: "composition", label: "Participa\u00e7\u00e3o" };
      }
      if (/markup|margin|discount/.test(text)) {
        return { key: "profitability", label: "Rentabilidade" };
      }
      if (/lost|negotiation|opportunit|alert/.test(text)) {
        return { key: "alerts", label: "Alertas e oportunidades" };
      }
    }

    if (categoryId === "future_data") {
      if (/budget_vs_sold|converted_to_order|conversion_time|approval_time|pedido|fatur/.test(text)) {
        return { key: "conversion", label: "Convers\u00e3o e faturamento" };
      }
      if (/loss_reason|cancel_reason/.test(text)) {
        return { key: "reasons", label: "Motivos" };
      }
      if (/goal|meta/.test(text)) {
        return { key: "goals", label: "Metas" };
      }
      if (/margin|profit|cogs|rentab/.test(text)) {
        return { key: "profitability", label: "Rentabilidade" };
      }
      if (/stock|estoque|inventory|demand/.test(text)) {
        return { key: "inventory", label: "Estoque e demanda" };
      }
      if (/commission|seller/.test(text)) {
        return { key: "seller", label: "Vendedores" };
      }
      if (/customer|ltv|churn|repurchase|frequency|inadimpl/.test(text)) {
        return { key: "customer", label: "Clientes e ciclo" };
      }
      if (/marketing|campaign|cross-sell|upsell/.test(text)) {
        return { key: "expansion", label: "Marketing e expans\u00e3o" };
      }
    }

    if (categoryId === "seller_insights") {
      if (/conversion|convers|chance/.test(text)) {
        return { key: "conversion", label: "Convers\u00e3o" };
      }
      if (/frequ|recorr|recompra/.test(text)) {
        return { key: "frequency", label: "Recorr\u00eancia e recompra" };
      }
      if (/stopped|pararam|inativ|old_open|follow/.test(text)) {
        return { key: "attention", label: "Follow-up e aten\u00e7\u00e3o" };
      }
      if (/product|produto/.test(text)) {
        return { key: "product", label: "Produtos recomendados" };
      }
      if (/region|regi[a\u00e3]o/.test(text)) {
        return { key: "region", label: "Regi\u00f5es e territ\u00f3rio" };
      }
      if (/ranking|avg|compar|team/.test(text)) {
        return { key: "comparison", label: "Comparativos e equipe" };
      }
    }

    if (/ticket/.test(text)) return { key: "ticket", label: "Ticket" };
    if (/convers|approval|aprov/.test(text)) return { key: "conversion", label: "Convers\u00e3o" };
    if (/quantidade|count|volume|usad/.test(text)) return { key: "quantity", label: "Quantidade" };
    if (/desconto|discount/.test(text)) return { key: "discount", label: "Desconto" };
    if (/markup|margem|margin/.test(text)) return { key: "markup", label: "Markup" };
    if (/acr[\u00e9e]scimo|surcharge/.test(text)) return { key: "surcharge", label: "Acr\u00e9scimo" };
    if (/frete|freight/.test(text)) return { key: "freight", label: "Frete" };
    if (/ranking|top |melhor|maior|menor|best|highest|lowest|most|least/.test(text)) {
      return { key: "ranking", label: "Ranking" };
    }
    if (/evolu|growth|drop|period|monthly/.test(text)) return { key: "trend", label: "Evolu\u00e7\u00e3o" };
    if (/share|participa|abc/.test(text)) return { key: "share", label: "Participa\u00e7\u00e3o" };
    if (/cliente x|vendedor x|origem x|produto x|respons\u00e1vel|responsible|cooccurrence|juntos/.test(text)) {
      return { key: "cross", label: "Rela\u00e7\u00f5es" };
    }
    if (/origem|channel|canal/.test(text) && categoryId !== "source") {
      return { key: "origin", label: "Origem" };
    }
    if (/cidade|uf|geo|regi/.test(text) && categoryId !== "geo") {
      return { key: "geo", label: "Geografia" };
    }
    if (/valor|amount|receita|aberto|perdido|aprovado/.test(text)) {
      return { key: "value", label: "Valor" };
    }

    switch (categoryId) {
      case "seller":
        return { key: "seller", label: "Vendedores" };
      case "customer":
        return { key: "customer", label: "Clientes" };
      case "product":
        return { key: "product", label: "Produtos" };
      case "margin":
        return { key: "margin", label: "Margem" };
      case "source":
        return { key: "source", label: "Origem" };
      case "payment":
        return { key: "payment", label: "Pagamento" };
      case "freight":
        return { key: "freight", label: "Frete" };
      default:
        return { key: "general", label: "Resumo" };
    }
  };

  for (const item of items) {
    const groupMeta = getGroupMeta(item);
    ensureGroup(groupMeta.key, groupMeta.label).items.push(item);
  }

  const preferredOrder = [
    "value",
    "quantity",
    "ticket",
    "conversion",
    "overview",
    "planning",
    "composition",
    "profitability",
    "alerts",
    "reasons",
    "goals",
    "inventory",
    "expansion",
    "discount",
    "markup",
    "surcharge",
    "freight",
    "ranking",
    "trend",
    "share",
    "frequency",
    "attention",
    "region",
    "comparison",
    "origin",
    "geo",
    "cross",
    "general",
    "seller",
    "customer",
    "product",
    "margin",
    "source",
    "payment",
  ];

  return Array.from(groups.values()).sort((a, b) => {
    const aIndex = preferredOrder.indexOf(a.key);
    const bIndex = preferredOrder.indexOf(b.key);
    const safeA = aIndex === -1 ? preferredOrder.length : aIndex;
    const safeB = bIndex === -1 ? preferredOrder.length : bIndex;
    return safeA - safeB || a.label.localeCompare(b.label);
  });
}

export default function SalesBudgetCategoryExplorerWidget({
  categoryId,
  categoryName,
  categoryDescription,
  items,
  isLoading,
  accentColor,
  startDate,
  endDate,
}: SalesBudgetCategoryExplorerWidgetProps) {
  const storageKey = `sales_budget_category_explorer_${categoryId}`;
  const [activeChartId, setActiveChartId] = useState<string>(items[0]?.id ?? "");
  const [activeGroupKey, setActiveGroupKey] = useState<string>("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const groups = useMemo(() => buildExplorerGroups(categoryId, items), [categoryId, items]);
  const displayLabels = useMemo(() => buildDisplayLabels(items), [items]);

  useEffect(() => {
    const validIds = new Set(items.map((item) => item.id));
    const currentIsValid = activeChartId && validIds.has(activeChartId);
    if (currentIsValid) return;

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && validIds.has(saved)) {
        setActiveChartId(saved);
        return;
      }
    } catch {
      // ignore
    }

    setActiveChartId(items[0]?.id ?? "");
  }, [activeChartId, items, storageKey]);

  useEffect(() => {
    if (groups.length === 0) {
      if (activeGroupKey) setActiveGroupKey("");
      return;
    }

    const currentGroup = groups.find((group) => group.key === activeGroupKey);
    const groupContainsActive = currentGroup?.items.some((item) => item.id === activeChartId);
    if (currentGroup && groupContainsActive) return;

    const matchingGroup = groups.find((group) =>
      group.items.some((item) => item.id === activeChartId)
    );

    setActiveGroupKey(matchingGroup?.key ?? groups[0]?.key ?? "");
  }, [activeChartId, activeGroupKey, groups]);

  const updateActiveChart = (nextId: string) => {
    setActiveChartId(nextId);
    try {
      localStorage.setItem(storageKey, nextId);
    } catch {
      // ignore
    }
  };

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeChartId) ?? items[0] ?? null,
    [activeChartId, items]
  );

  const activeGroup = useMemo(
    () => groups.find((group) => group.key === activeGroupKey) ?? groups[0] ?? null,
    [activeGroupKey, groups]
  );

  const title = activeItem?.chart?.title ?? activeItem?.label ?? categoryName;

  return (
    <>
      <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-4 py-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black tracking-tight text-neutral-900">
              {categoryName}
            </h3>
            <p className="mt-1 text-sm text-neutral-500">
              {categoryDescription ?? "Escolha um indicador para alternar a leitura do mesmo painel."}
            </p>
          </div>

          <div className="flex items-center gap-1">
            {activeItem ? (
              <>
                <SalesBudgetChartDetailsButton
                  onClick={() => setIsDetailsOpen(true)}
                  title="Entender este indicador"
                />
                <Link
                  href={`/chat/sales-budget-analytics/${activeItem.id}`}
                  className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                  title={"Abrir gr\u00e1fico"}
                >
                  <Search className="h-4 w-4" />
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="border-b border-neutral-100 bg-neutral-50/60 px-4 py-3">
          {groups.length > 1 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {groups.map((group) => {
                const isActive = group.key === activeGroup?.key;
                return (
                  <button
                    key={group.key}
                    type="button"
                    onClick={() => {
                      setActiveGroupKey(group.key);
                      if (!group.items.some((item) => item.id === activeChartId)) {
                        updateActiveChart(group.items[0]?.id ?? "");
                      }
                    }}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-500 ring-1 ring-neutral-200 hover:bg-neutral-100 hover:text-neutral-700"
                    }`}
                  >
                    {group.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            {(activeGroup?.items ?? items).map((item) => {
              const isActive = item.id === activeItem?.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => updateActiveChart(item.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-black transition-colors ${
                    isActive
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                  }`}
                  title={item.label}
                >
                  {displayLabels.get(item.id) ?? item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4">
          <SalesBudgetChartRenderer
            chart={activeItem?.chart ?? null}
            isLoading={isLoading && !activeItem?.chart}
            accentColor={accentColor}
          />
        </div>
      </article>

      {activeItem ? (
        <SalesBudgetChartDetailsModal
          isOpen={isDetailsOpen}
          title={title}
          entries={[{ id: activeItem.id, title, categoryName }]}
          startDate={startDate}
          endDate={endDate}
          onClose={() => setIsDetailsOpen(false)}
        />
      ) : null}
    </>
  );
}
