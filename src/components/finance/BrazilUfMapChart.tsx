"use client";

import { Geographic } from "@/services/finance-analytics.service";

interface BrazilUfMapChartProps {
    data: Geographic[];
    isLoading: boolean;
    color?: string;
}

type UfShape = {
    uf: string;
    points: string;
    label: [number, number];
};

const UF_SHAPES: UfShape[] = [
    { uf: "RR", points: "86,20 111,22 105,43 82,42", label: [96, 33] },
    { uf: "AP", points: "151,24 174,30 169,50 149,46", label: [160, 38] },
    { uf: "AM", points: "43,50 105,44 122,78 90,108 39,97 24,69", label: [74, 76] },
    { uf: "PA", points: "112,50 175,52 191,88 166,117 119,97 122,75", label: [151, 79] },
    { uf: "AC", points: "15,104 47,99 53,119 27,128 10,118", label: [30, 114] },
    { uf: "RO", points: "51,103 87,109 85,137 50,136 39,119", label: [67, 123] },
    { uf: "MT", points: "88,111 132,101 153,135 132,170 85,154", label: [119, 136] },
    { uf: "MA", points: "175,91 205,95 209,122 183,126 166,116", label: [189, 110] },
    { uf: "PI", points: "181,128 209,126 218,154 198,172 176,153", label: [197, 148] },
    { uf: "CE", points: "210,102 235,109 234,130 211,132", label: [224, 119] },
    { uf: "RN", points: "236,116 252,121 244,133 233,130", label: [241, 125] },
    { uf: "PB", points: "219,134 246,135 241,148 217,147", label: [231, 142] },
    { uf: "PE", points: "207,150 242,151 234,166 202,165", label: [222, 158] },
    { uf: "AL", points: "223,168 238,169 231,181 218,178", label: [228, 174] },
    { uf: "SE", points: "215,181 229,183 221,194 211,189", label: [219, 187] },
    { uf: "TO", points: "154,122 181,128 175,162 150,157 139,137", label: [164, 144] },
    { uf: "BA", points: "176,164 211,190 199,230 159,216 148,180", label: [180, 197] },
    { uf: "GO", points: "132,158 154,160 158,185 137,201 119,181", label: [140, 178] },
    { uf: "DF", points: "145,176 153,178 151,186 143,184", label: [148, 181] },
    { uf: "MS", points: "82,157 119,183 112,218 74,203 65,176", label: [95, 188] },
    { uf: "MG", points: "139,202 160,218 191,231 184,260 142,252 120,222", label: [156, 231] },
    { uf: "ES", points: "190,233 203,239 198,260 185,259", label: [195, 248] },
    { uf: "SP", points: "111,220 141,253 124,276 89,262 85,237", label: [113, 249] },
    { uf: "RJ", points: "143,257 184,261 174,278 137,274", label: [160, 267] },
    { uf: "PR", points: "85,265 124,278 120,303 82,297 70,280", label: [99, 284] },
    { uf: "SC", points: "83,301 122,306 115,326 79,322", label: [100, 315] },
    { uf: "RS", points: "76,326 116,330 107,362 66,352 54,334", label: [88, 344] },
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
        return <div className="h-[300px] w-full animate-pulse rounded-xl bg-neutral-50" />;
    }

    const valuesByUf = new Map(data.map((item) => [normalizeUf(item.local), item.valor]));
    const maxValue = Math.max(...Array.from(valuesByUf.values()), 0);
    const minValue = Math.min(...Array.from(valuesByUf.values()), 0);

    const opacityFor = (uf: string) => {
        const value = valuesByUf.get(uf) || 0;
        if (!value || maxValue === 0) return 0.14;
        if (maxValue === minValue) return 0.88;
        return 0.2 + ((value - minValue) / (maxValue - minValue)) * 0.72;
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

    return (
        <div className="flex h-[300px] w-full items-center gap-4">
            <svg viewBox="0 0 270 374" className="h-full min-w-0 flex-1" role="img" aria-label="Mapa do Brasil por UF">
                <path
                    d="M86 18 113 22 142 18 177 28 191 53 218 92 252 121 237 166 222 194 203 238 198 264 174 279 124 305 108 365 66 352 54 334 83 300 69 279 86 238 66 176 16 128 24 69 43 50Z"
                    fill="#f8fafc"
                    stroke="#d4d4d4"
                    strokeWidth="2"
                />
                {UF_SHAPES.map((shape) => {
                    const value = valuesByUf.get(shape.uf) || 0;
                    return (
                        <g key={shape.uf}>
                            <polygon
                                points={shape.points}
                                fill={color}
                                opacity={opacityFor(shape.uf)}
                                stroke="#ffffff"
                                strokeWidth="2"
                            >
                                <title>{`${shape.uf}: ${formatCurrency(value)}`}</title>
                            </polygon>
                            <text
                                x={shape.label[0]}
                                y={shape.label[1]}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-white text-[9px] font-black"
                            >
                                {shape.uf}
                            </text>
                        </g>
                    );
                })}
            </svg>
            <div className="flex w-20 flex-col items-center gap-2 text-[10px] font-bold text-neutral-500">
                <span>Maior valor</span>
                <div className="h-24 w-5 rounded" style={{ background: `linear-gradient(to bottom, ${color}, #f8fafc)` }} />
                <span>Menor valor</span>
            </div>
        </div>
    );
}

