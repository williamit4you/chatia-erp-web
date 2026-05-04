"use client";

import { useEffect, useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { Geographic } from "@/services/finance-analytics.service";

interface BrazilUfMapChartProps {
    data: Geographic[];
    isLoading: boolean;
    color?: string;
}

type GeoFeature = {
    type: "Feature";
    properties: { codarea?: string };
    geometry: unknown;
};

type GeoFeatureCollection = {
    type: "FeatureCollection";
    features: GeoFeature[];
};

const GEO_URL = "/maps/br-ufs.geojson";
const MAP_WIDTH = 330;
const MAP_HEIGHT = 300;

const IBGE_CODE_TO_UF: Record<string, string> = {
    "11": "RO",
    "12": "AC",
    "13": "AM",
    "14": "RR",
    "15": "PA",
    "16": "AP",
    "17": "TO",
    "21": "MA",
    "22": "PI",
    "23": "CE",
    "24": "RN",
    "25": "PB",
    "26": "PE",
    "27": "AL",
    "28": "SE",
    "29": "BA",
    "31": "MG",
    "32": "ES",
    "33": "RJ",
    "35": "SP",
    "41": "PR",
    "42": "SC",
    "43": "RS",
    "50": "MS",
    "51": "MT",
    "52": "GO",
    "53": "DF",
};

const UF_ALIASES: Record<string, string> = {
    ACRE: "AC",
    ALAGOAS: "AL",
    AMAPA: "AP",
    AMAZONAS: "AM",
    BAHIA: "BA",
    CEARA: "CE",
    "DISTRITO FEDERAL": "DF",
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

const hexToRgb = (hex: string) => {
    const normalized = hex.replace("#", "");
    const value = parseInt(normalized.length === 3 ? normalized.split("").map((char) => char + char).join("") : normalized, 16);
    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
};

const colorWithIntensity = (hex: string, intensity: number) => {
    const base = hexToRgb(hex);
    const white = { r: 255, g: 247, b: 237 };
    const ratio = Math.max(0, Math.min(1, intensity));
    const r = Math.round(white.r + (base.r - white.r) * ratio);
    const g = Math.round(white.g + (base.g - white.g) * ratio);
    const b = Math.round(white.b + (base.b - white.b) * ratio);
    return `rgb(${r}, ${g}, ${b})`;
};

export default function BrazilUfMapChart({ data, isLoading, color = "#16a34a" }: BrazilUfMapChartProps) {
    const [geoData, setGeoData] = useState<GeoFeatureCollection | null>(null);
    const [hoveredUf, setHoveredUf] = useState<string | null>(null);

    useEffect(() => {
        let active = true;

        fetch(GEO_URL)
            .then((response) => response.json())
            .then((json) => {
                if (active) setGeoData(json);
            })
            .catch(() => {
                if (active) setGeoData(null);
            });

        return () => {
            active = false;
        };
    }, []);

    const valuesByUf = useMemo(() => {
        return new Map(data.map((item) => [normalizeUf(item.local), item.valor]));
    }, [data]);

    const mapPaths = useMemo(() => {
        if (!geoData) return [];

        const projection = geoMercator().fitSize([MAP_WIDTH, MAP_HEIGHT], geoData);
        const path = geoPath(projection);

        return geoData.features.map((feature) => {
            const uf = IBGE_CODE_TO_UF[String(feature.properties?.codarea)] || "";
            const centroid = path.centroid(feature);

            return {
                uf,
                d: path(feature) || "",
                centroid,
            };
        });
    }, [geoData]);

    if (isLoading || !geoData) {
        return <div className="h-[300px] w-full animate-pulse rounded-xl bg-neutral-50" />;
    }

    const values = Array.from(valuesByUf.values());
    const maxValue = Math.max(...values, 0);
    const minValue = Math.min(...values, 0);

    const intensityFor = (uf: string) => {
        const value = valuesByUf.get(uf) || 0;
        if (!value || maxValue === 0) return 0.08;
        if (maxValue === minValue) return 0.82;
        return 0.16 + ((value - minValue) / (maxValue - minValue)) * 0.84;
    };

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

    const hoveredValue = hoveredUf ? valuesByUf.get(hoveredUf) || 0 : null;

    return (
        <div className="grid h-[300px] w-full grid-cols-[minmax(0,1fr)_92px] items-center gap-4">
            <div className="relative h-full min-w-0">
                <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="h-full w-full" role="img" aria-label="Mapa do Brasil por UF">
                    <g>
                        {mapPaths.map((state) => {
                            const value = valuesByUf.get(state.uf) || 0;
                            const fill = colorWithIntensity(color, intensityFor(state.uf));
                            const isHovered = hoveredUf === state.uf;

                            return (
                                <path
                                    key={state.uf}
                                    d={state.d}
                                    fill={isHovered ? color : fill}
                                    stroke="#ffffff"
                                    strokeWidth={1}
                                    className="transition-colors duration-150"
                                    onMouseEnter={() => setHoveredUf(state.uf)}
                                    onMouseLeave={() => setHoveredUf(null)}
                                >
                                    <title>{`${state.uf}: ${formatCurrency(value)}`}</title>
                                </path>
                            );
                        })}
                    </g>
                </svg>

                {hoveredUf && (
                    <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-neutral-200 bg-white/95 px-3 py-2 text-xs font-bold text-neutral-700 shadow-sm">
                        <div className="text-neutral-900">{hoveredUf}</div>
                        <div>{formatCurrency(hoveredValue || 0)}</div>
                    </div>
                )}
            </div>

            <div className="flex flex-col items-center gap-2 text-[10px] font-bold text-neutral-500">
                <span>Maior valor</span>
                <div className="h-24 w-5 rounded" style={{ background: `linear-gradient(to bottom, ${color}, ${colorWithIntensity(color, 0.08)})` }} />
                <span>Menor valor</span>
            </div>
        </div>
    );
}

