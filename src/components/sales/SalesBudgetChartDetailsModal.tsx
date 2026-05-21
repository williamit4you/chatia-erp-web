"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BookOpenText, FileText, X } from "lucide-react";
import {
  getSalesBudgetChartDefinition,
  getSalesBudgetChartHelpMarkdown,
} from "@/lib/salesBudgetChartDefinitions";

export type SalesBudgetChartDetailsEntry = {
  id: string;
  title: string;
  categoryName?: string | null;
};

export default function SalesBudgetChartDetailsModal({
  isOpen,
  title,
  entries,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  entries: SalesBudgetChartDetailsEntry[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

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
              Objetivo, como interpretar e cuidados de leitura para cada gráfico.
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

        <div className="min-h-0 flex-1 overflow-y-auto bg-neutral-50 px-6 py-6 sm:px-8">
          <div className="grid gap-4 lg:grid-cols-2">
            {entries.map((entry) => {
              const def = getSalesBudgetChartDefinition(entry.id);
              const helpMd =
                getSalesBudgetChartHelpMarkdown({
                  chartId: entry.id,
                  titleFallback: entry.title,
                }) ?? null;

              const objective = def?.help?.objective ?? "";
              const howToRead = def?.help?.howToRead ?? [];
              const cautions = def?.help?.cautions ?? [];

              return (
                <article
                  key={entry.id}
                  className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-black tracking-tight text-neutral-900">
                        {entry.title}
                      </h3>
                      {entry.categoryName ? (
                        <p className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                          {entry.categoryName}
                        </p>
                      ) : null}
                    </div>

                    <Link
                      href={`/chat/sales-budget-analytics/${entry.id}?help=1`}
                      className="inline-flex items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700 transition-colors hover:bg-blue-100"
                      title="Abrir com help"
                    >
                      <BookOpenText className="h-4 w-4" />
                      Abrir
                    </Link>
                  </div>

                  {objective ? (
                    <div className="mt-4 rounded-2xl bg-blue-50/70 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                        O que este gráfico mostra
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {objective}
                      </p>
                    </div>
                  ) : helpMd ? (
                    <div className="mt-4 rounded-2xl bg-blue-50/70 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                        O que este gráfico mostra
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        Veja o help ao abrir o gráfico.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-blue-50/70 p-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                        O que este gráfico mostra
                      </p>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        Explica o objetivo e como interpretar no detalhe.
                      </p>
                    </div>
                  )}

                  {howToRead.length ? (
                    <div className="mt-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                        Como interpretar
                      </p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-neutral-700">
                        {howToRead.slice(0, 4).map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {cautions.length ? (
                    <div className="mt-4">
                      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                        Cuidados
                      </p>
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-neutral-700">
                        {cautions.slice(0, 4).map((line) => (
                          <li key={line}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

