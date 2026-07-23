"use client";

import { useMemo, useState } from "react";
import { Building2, Check, ChevronDown, Search } from "lucide-react";
import type { FinanceCompanyOption } from "@/services/finance-analytics.service";

type FinanceCompanyMultiSelectProps = {
    options: FinanceCompanyOption[];
    selectedIds: string[];
    onChange: (nextIds: string[]) => void;
};

export default function FinanceCompanyMultiSelect({ options, selectedIds, onChange }: FinanceCompanyMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");

    const filtered = useMemo(() => {
        const term = query.trim().toLowerCase();
        if (!term) return options;
        return options.filter((option) =>
            [option.label, option.cpfCnpj, option.city, option.uf]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(term))
        );
    }, [options, query]);

    const summaryLabel =
        selectedIds.length === 0
            ? "Todas as empresas"
            : selectedIds.length === 1
              ? "1 empresa"
              : `${selectedIds.length} empresas`;

    const toggleItem = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id));
            return;
        }
        onChange([...selectedIds, id]);
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex min-w-[260px] items-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 shadow-sm"
            >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700">
                    <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Empresas</p>
                    <p className="truncate text-sm font-bold text-neutral-900">{summaryLabel}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 z-30 mt-2 w-[360px] max-w-[90vw] rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)]">
                    <div className="mb-3 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
                        <Search className="h-4 w-4 text-neutral-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Buscar empresa, CNPJ, cidade ou UF"
                            className="h-10 w-full bg-transparent text-sm text-neutral-700 outline-none"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => onChange([])}
                        className={`mb-2 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-bold transition-colors ${
                            selectedIds.length === 0 ? "bg-blue-50 text-blue-700" : "hover:bg-neutral-50"
                        }`}
                    >
                        <span>Todas as empresas</span>
                        {selectedIds.length === 0 ? <Check className="h-4 w-4" /> : null}
                    </button>

                    <div className="max-h-72 overflow-y-auto">
                        {filtered.map((option) => {
                            const checked = selectedIds.includes(option.id);
                            const meta = [option.uf, option.city, option.cpfCnpj].filter(Boolean).join(" • ");
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => toggleItem(option.id)}
                                    className={`mb-1 flex w-full items-start justify-between rounded-xl px-3 py-2 text-left transition-colors ${
                                        checked ? "bg-blue-50 text-blue-700" : "hover:bg-neutral-50"
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">{option.label}</p>
                                        {meta ? <p className="truncate text-xs text-neutral-500">{meta}</p> : null}
                                    </div>
                                    {checked ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : null}
                                </button>
                            );
                        })}
                        {filtered.length === 0 ? <p className="px-3 py-4 text-sm text-neutral-500">Nenhuma empresa encontrada.</p> : null}
                    </div>
                </div>
            )}
        </div>
    );
}
