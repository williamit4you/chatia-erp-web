"use client";

import { Geographic } from "@/services/finance-analytics.service";

interface BrazilUfMapChartProps {
    data: Geographic[];
    isLoading: boolean;
    color?: string;
}

const UF_POSITIONS = [
    { uf: "RR", row: 1, col: 4 },
    { uf: "AP", row: 1, col: 7 },
    { uf: "AM", row: 2, col: 3 },
    { uf: "PA", row: 2, col: 6 },
    { uf: "MA", row: 3, col: 7 },
    { uf: "CE", row: 3, col: 9 },
    { uf: "RN", row: 3, col: 10 },
    { uf: "AC", row: 4, col: 1 },
    { uf: "RO", row: 4, col: 3 },
    { uf: "MT", row: 4, col: 5 },
    { uf: "TO", row: 4, col: 7 },
    { uf: "PI", row: 4, col: 8 },
    { uf: "PB", row: 4, col: 10 },
    { uf: "PE", row: 5, col: 10 },
    { uf: "AL", row: 6, col: 10 },
    { uf: "SE", row: 7, col: 10 },
    { uf: "BA", row: 6, col: 8 },
    { uf: "GO", row: 6, col: 6 },
    { uf: "DF", row: 6, col: 7 },
    { uf: "MS", row: 7, col: 5 },
    { uf: "MG", row: 7, col: 7 },
    { uf: "ES", row: 7, col: 9 },
    { uf: "SP", row: 8, col: 6 },
    { uf: "RJ", row: 8, col: 8 },
    { uf: "PR", row: 9, col: 6 },
    { uf: "SC", row: 10, col: 6 },
    { uf: "RS", row: 11, col: 5 },
];

const UF_ALIASES: Record<string, string> = {
    ACRE: "AC",
    ALAGOAS: "AL",
    AMAPA: "AP",
    AMAZONAS: "AM",
    BAHIA: "BA",
    CEARA: "CE",
    "DISTRITO FEDERAL": "DF",
    ESPIRITO_SANTO: "ES",
    "ESPIRITO SANTO": "ES",
    GOIAS: "GO",
    MARANHAO: "MA",
    "MATO GROSSO": "MT",
    "MATO GROSSO DO SUL": "MS",
    "MINAS GERAIS": "MG",
    PARA: "PA",
    PARAIBA: "PB",
    PARANA: "PR",
    PERNAMBUCO: "PE",
    PIAUI: "PI",
    "RIO DE JANEIRO": "RJ",
    "RIO GRANDE DO NORTE": "RN",
    "RIO GRANDE DO SUL": "RS",
    RONDONIA: "RO",
    RORAIMA: "RR",
    "SANTA CATARINA": "SC",
    "SAO PAULO": "SP",
    SERGIPE: "SE",
    TOCANTINS: "TO",
};

const normalizeUf = (value: string) => {
    const normalized = value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

    if (normalized.length === 2) return normalized;
    return UF_ALIASES[normalized] || normalized.slice(0, 2);
};

export default function BrazilUfMapChart({ data, isLoading, color = "#16a34a" }: BrazilUfMapChartProps) {
    if (isLoading) {
        return <div className="h-[280px] w-full animate-pulse rounded-xl bg-neutral-50" />;
    }

    const valuesByUf = new Map(data.map((item) => [normalizeUf(item.local), item.valor]));
    const maxValue = Math.max(...Array.from(valuesByUf.values()), 0);
    const minValue = Math.min(...Array.from(valuesByUf.values()), 0);

    const opacityFor = (uf: string) => {
        const value = valuesByUf.get(uf) || 0;
        if (!value || maxValue === 0) return 0.12;
        if (maxValue === minValue) return 0.85;
        return 0.18 + ((value - minValue) / (maxValue - minValue)) * 0.72;
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

    return (
        <div className="flex h-[280px] w-full items-center gap-5">
            <div className="grid flex-1 grid-cols-10 grid-rows-11 gap-1.5">
                {UF_POSITIONS.map((state) => {
                    const value = valuesByUf.get(state.uf) || 0;
                    return (
                        <div
                            key={state.uf}
                            title={`${state.uf}: ${formatCurrency(value)}`}
                            className="flex min-h-6 items-center justify-center rounded border border-white text-[9px] font-black text-white shadow-sm"
                            style={{
                                gridColumn: state.col,
                                gridRow: state.row,
                                backgroundColor: color,
                                opacity: opacityFor(state.uf),
                            }}
                        >
                            {state.uf}
                        </div>
                    );
                })}
            </div>
            <div className="flex w-20 flex-col items-center gap-2 text-[10px] font-bold text-neutral-500">
                <span>Maior valor</span>
                <div
                    className="h-24 w-5 rounded"
                    style={{ background: `linear-gradient(to bottom, ${color}, #f8fafc)` }}
                />
                <span>Menor valor</span>
            </div>
        </div>
    );
}
