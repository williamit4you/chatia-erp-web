"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BookOpenText,
  FileText,
  Sigma,
  TrendingUp,
  X,
} from "lucide-react";
import { getSalesBudgetChartDefinition } from "@/lib/salesBudgetChartDefinitions";
import salesBudgetAnalyticsService, {
  type SalesBudgetChartQueryDetailsItem,
} from "@/services/sales-budget-analytics.service";

export type SalesBudgetChartDetailsEntry = {
  id: string;
  title: string;
  categoryName?: string | null;
};

interface SalesBudgetChartDetailsModalProps {
  isOpen: boolean;
  title: string;
  entries: SalesBudgetChartDetailsEntry[];
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

function SectionList({
  icon,
  title,
  items,
}: {
  icon: ReactNode;
  title: string;
  items: string[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-neutral-900">
        <span className="text-neutral-500">{icon}</span>
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm leading-6 text-neutral-600">
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

export default function SalesBudgetChartDetailsModal({
  isOpen,
  title,
  entries,
  onClose,
  startDate,
  endDate,
}: SalesBudgetChartDetailsModalProps) {
  const isSingle = entries.length === 1;
  const [queryDetailsByChartId, setQueryDetailsByChartId] = useState<
    Record<string, SalesBudgetChartQueryDetailsItem>
  >({});
  const [isLoadingQueries, setIsLoadingQueries] = useState(false);
  const cacheRef = useRef<
    Map<string, Record<string, SalesBudgetChartQueryDetailsItem>>
  >(new Map());

  const chartIds = useMemo(
    () => entries.map((entry) => entry.id).filter(Boolean),
    [entries]
  );

  const queryKey = useMemo(() => {
    const idsKey = [...chartIds].sort().join(",");
    return `${idsKey}|${startDate || ""}|${endDate || ""}`;
  }, [chartIds, endDate, startDate]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    if (chartIds.length === 0) return;

    const cached = cacheRef.current.get(queryKey);
    if (cached) {
      setQueryDetailsByChartId(cached);
      return;
    }

    setIsLoadingQueries(true);
    salesBudgetAnalyticsService
      .getChartQueryDetails({ chartIds, startDate, endDate })
      .then((res) => {
        const map: Record<string, SalesBudgetChartQueryDetailsItem> = {};
        for (const item of res.items || []) {
          if (item?.chartId) map[item.chartId] = item;
        }
        cacheRef.current.set(queryKey, map);
        setQueryDetailsByChartId(map);
      })
      .catch(() => {
        setQueryDetailsByChartId({});
      })
      .finally(() => {
        setIsLoadingQueries(false);
      });
  }, [chartIds, endDate, isOpen, queryKey, startDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-5 sm:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
              <FileText className="h-3.5 w-3.5" />
              Detalhes dos gráficos
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-neutral-900">
              {title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
              Esta visão explica o objetivo, a lógica de cálculo, a origem dos dados e a melhor forma de interpretar cada gráfico disponível.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-neutral-200 p-3 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
            title="Fechar detalhes"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <div className={`grid gap-5 ${isSingle ? "" : "xl:grid-cols-2"}`}>
            {entries.map((entry) => {
              const def = getSalesBudgetChartDefinition(entry.id);
              const detail = def?.help;
              const queryDetails = queryDetailsByChartId[entry.id];

              return (
                <article
                  key={entry.id}
                  className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                      {entry.categoryName || "Análise do gráfico"}
                    </span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                      {entry.title}
                    </span>
                  </div>

                  <div className="mb-4 flex justify-end">
                    <Link
                      href={`/chat/sales-budget-analytics/${entry.id}`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-100"
                      title="Abrir gráfico"
                    >
                      <BookOpenText className="h-4 w-4" />
                      Abrir
                    </Link>
                  </div>

                  {isSingle ? (
                    <div className="grid gap-3 lg:grid-cols-2">
                      <div className="space-y-3">
                        <div className="rounded-2xl bg-blue-50/70 p-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                            O que este gráfico mostra
                          </p>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">
                            {detail?.objective || "Explica o objetivo e como interpretar este gráfico."}
                          </p>
                        </div>
                        <SectionList
                          icon={<TrendingUp className="h-4 w-4" />}
                          title="Como interpretar"
                          items={detail?.howToRead || []}
                        />
                      </div>
                      <div className="space-y-3">
                        <SectionList
                          icon={<Sigma className="h-4 w-4" />}
                          title="Como é calculado"
                          items={detail?.calculation || []}
                        />
                        <SectionList
                          icon={<AlertTriangle className="h-4 w-4" />}
                          title="Cuidados na leitura"
                          items={detail?.cautions || []}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 rounded-2xl bg-blue-50/70 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                          O que este gráfico mostra
                        </p>
                        <p className="mt-2 text-sm leading-6 text-neutral-700">
                          {detail?.objective || "Explica o objetivo e como interpretar este gráfico."}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <SectionList
                          icon={<Sigma className="h-4 w-4" />}
                          title="Como é calculado"
                          items={detail?.calculation || []}
                        />
                        <SectionList
                          icon={<TrendingUp className="h-4 w-4" />}
                          title="Como interpretar"
                          items={detail?.howToRead || []}
                        />
                        <SectionList
                          icon={<AlertTriangle className="h-4 w-4" />}
                          title="Cuidados na leitura"
                          items={detail?.cautions || []}
                        />
                      </div>
                    </>
                  )}

                  {(queryDetails?.sqlQueries?.length ||
                    queryDetails?.rules?.length ||
                    isLoadingQueries) && (
                    <details className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                      <summary className="cursor-pointer select-none text-sm font-black text-neutral-900">
                        Consultas e regras
                        {isLoadingQueries && (
                          <span className="ml-2 text-[11px] font-bold text-neutral-500">
                            (carregando...)
                          </span>
                        )}
                      </summary>

                      {queryDetails?.rules?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                            Regras aplicadas
                          </p>
                          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-neutral-700">
                            {queryDetails.rules.map((rule) => (
                              <li key={rule}>{rule}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {queryDetails?.sqlQueries?.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                            SQL
                          </p>
                          <div className="mt-2 space-y-2">
                            {queryDetails.sqlQueries.map((query, index) => (
                              <pre
                                key={`${entry.id}-${index}`}
                                className="overflow-x-auto whitespace-pre-wrap break-all rounded-xl bg-neutral-900 p-3 font-mono text-[11px] leading-relaxed text-green-400"
                              >
                                {query}
                              </pre>
                            ))}
                          </div>
                        </div>
                      )}
                    </details>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
