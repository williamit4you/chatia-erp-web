import { useEffect, useMemo, useState } from "react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import financeAnalyticsService, { ChartSelection, ChartDrilldownResponse } from "@/services/finance-analytics.service";
import { toast } from "sonner";

type DrilldownKind = ChartSelection["kind"];

type DrilldownOption = {
    label: string;
    value: string;
};

type ChartDrilldownModalProps = {
    isOpen: boolean;
    chartId: string;
    title: string;
    startDate: string;
    endDate: string;
    entityValue: string | null;
    kind: DrilldownKind;
    options: DrilldownOption[];
    onClose: () => void;
};

const formatCell = (value: any, kind?: string) => {
    if (value === null || value === undefined) return "-";
    if (kind === "currency") {
        const num = Number(value);
        if (!Number.isFinite(num)) return String(value);
        return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
    }
    if (kind === "date") {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);
        return d.toLocaleDateString("pt-BR");
    }
    if (kind === "number") {
        const num = Number(value);
        if (!Number.isFinite(num)) return String(value);
        return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 }).format(num);
    }
    return String(value);
};

export default function ChartDrilldownModal({ isOpen, chartId, title, startDate, endDate, entityValue, kind, options, onClose }: ChartDrilldownModalProps) {
    const [selected, setSelected] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(50);
    const [result, setResult] = useState<ChartDrilldownResponse | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setSelected("");
        setPage(1);
        setResult(null);
    }, [isOpen, chartId]);

    const total = result?.meta?.total ?? 0;
    const totalPages = useMemo(() => (total ? Math.max(1, Math.ceil(total / pageSize)) : 1), [total, pageSize]);

    const buildSelection = (): ChartSelection | null => {
        if (!selected) return null;
        if (kind === "geo_uf") return { kind, uf: selected, label: selected };
        return { kind, key: selected, label: selected } as any;
    };

    const canSearch = Boolean(selected);

    const load = async (nextPage?: number) => {
        const selection = buildSelection();
        if (!selection) {
            toast.error("Selecione um recorte para detalhar.");
            return;
        }

        const p = nextPage ?? page;
        setIsLoading(true);
        try {
            const res = await financeAnalyticsService.getChartDrilldown({
                chartId,
                startDate,
                endDate,
                entityValue,
                selection,
                page: p,
                pageSize,
            });
            setResult(res);
            setPage(p);
        } catch (e) {
            console.error("Erro no drill-down:", e);
            toast.error("Não foi possível carregar o detalhamento agora.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-neutral-950/55 p-4 backdrop-blur-sm">
            <div className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]">
                <div className="flex items-start justify-between gap-4 border-b border-neutral-100 px-6 py-5 sm:px-8">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">Drill-down</p>
                        <h2 className="mt-2 text-xl font-black tracking-tight text-neutral-900">{title}</h2>
                        <p className="mt-1 text-sm text-neutral-500">
                            Selecione um recorte e visualize os itens detalhados do período ({startDate} → {endDate}).
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-2xl border border-neutral-200 p-3 text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
                        title="Fechar"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-4 overflow-y-auto px-6 py-6 sm:px-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <label className="text-[11px] font-black uppercase tracking-wider text-neutral-500">Recorte</label>
                            <select
                                value={selected}
                                onChange={(e) => setSelected(e.target.value)}
                                className="h-11 w-full rounded-2xl border border-neutral-200 bg-white px-4 text-sm font-bold text-neutral-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                            >
                                <option value="">Selecione...</option>
                                {options.map((o) => (
                                    <option key={o.value} value={o.value}>
                                        {o.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            disabled={!canSearch || isLoading}
                            onClick={() => load(1)}
                            className="h-11 shrink-0 rounded-2xl bg-neutral-900 px-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-black disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            <Search className="h-4 w-4" />
                            Buscar
                        </button>
                    </div>

                    <div className="rounded-3xl border border-neutral-200 bg-white overflow-hidden">
                        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 px-4 py-3">
                            <div className="text-xs font-black uppercase tracking-widest text-neutral-600">
                                Resultados
                                {typeof result?.meta?.total === "number" ? <span className="ml-2 text-neutral-400">({result.meta.total})</span> : null}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    disabled={isLoading || page <= 1}
                                    onClick={() => load(page - 1)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                                    title="Anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <div className="text-xs font-bold text-neutral-500">
                                    Página {page} / {totalPages}
                                </div>
                                <button
                                    type="button"
                                    disabled={isLoading || page >= totalPages}
                                    onClick={() => load(page + 1)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                                    title="Próxima"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-700">
                                    <tr>
                                        {(result?.columns || []).map((col) => (
                                            <th key={col.key} className="px-4 py-3 text-xs font-black uppercase tracking-widest">
                                                {col.label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={(result?.columns || []).length || 1} className="px-4 py-6 text-center text-neutral-400 font-bold">
                                                Carregando...
                                            </td>
                                        </tr>
                                    ) : (result?.rows?.length || 0) === 0 ? (
                                        <tr>
                                            <td colSpan={(result?.columns || []).length || 1} className="px-4 py-6 text-center text-neutral-400 font-bold">
                                                Nenhum item encontrado.
                                            </td>
                                        </tr>
                                    ) : (
                                        result!.rows.map((row, idx) => (
                                            <tr key={idx} className="border-t border-neutral-100 hover:bg-neutral-50/60">
                                                {result!.columns.map((col) => (
                                                    <td key={col.key} className="px-4 py-3 font-medium text-neutral-800 whitespace-nowrap">
                                                        {formatCell(row[col.key], col.kind)}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
