import type { ReactNode } from "react";
import { X, FileText, Database, Sigma, TrendingUp, AlertTriangle } from "lucide-react";
import { ChartDetail } from "@/lib/chartDetails";

export type ChartDetailsEntry = {
    id: string;
    title: string;
    groupTitle: string;
    description?: string;
    detail: ChartDetail;
};

interface ChartDetailsModalProps {
    isOpen: boolean;
    title: string;
    entries: ChartDetailsEntry[];
    onClose: () => void;
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

export default function ChartDetailsModal({ isOpen, title, entries, onClose }: ChartDetailsModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-neutral-950/55 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-neutral-200 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-5 sm:px-8">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                            <FileText className="h-3.5 w-3.5" />
                            Detalhes dos graficos
                        </div>
                        <h2 className="mt-3 text-2xl font-black tracking-tight text-neutral-900">{title}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-500">
                            Esta visao explica o objetivo, a logica de calculo, a origem dos dados e a melhor forma de interpretar cada grafico disponivel.
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
                    <div className="grid gap-5 xl:grid-cols-2">
                        {entries.map((entry) => (
                            <article key={entry.id} className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-sm">
                                <div className="mb-4 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
                                        {entry.groupTitle}
                                    </span>
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
                                        {entry.title}
                                    </span>
                                </div>

                                <div className="mb-4 rounded-2xl bg-blue-50/70 p-4">
                                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">O que este grafico mostra</p>
                                    <p className="mt-2 text-sm leading-6 text-neutral-700">{entry.detail.objective}</p>
                                </div>

                                <div className="space-y-3">
                                    <SectionList icon={<Sigma className="h-4 w-4" />} title="Como e calculado" items={entry.detail.calculation} />
                                    <SectionList icon={<Database className="h-4 w-4" />} title="Origem das informacoes" items={entry.detail.dataSources} />
                                    <SectionList icon={<TrendingUp className="h-4 w-4" />} title="Como interpretar" items={entry.detail.interpretation} />
                                    <SectionList icon={<AlertTriangle className="h-4 w-4" />} title="Cuidados na leitura" items={entry.detail.cautions || []} />
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
