"use client";

import { useMemo, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { ChartSelection, Geographic } from "@/services/finance-analytics.service";
import brUfsGeoJson from "@/data/br-ufs.json";
import { useDrilldownSelect } from "@/components/finance/drilldownContext";
import MapLoadingState from "@/components/finance/MapLoadingState";

interface BrazilUfMapChartProps {
    data: Geographic[];
    isLoading: boolean;
    color?: string;
    displayMode?: "default" | "detail";
    onDrilldownSelect?: (selection: ChartSelection) => void;
}

type GeoFeature = {
    type: "Feature";
    properties: { codarea?: string };
    geometry: GeoGeometry;
};

type GeoFeatureCollection = {
    type: "FeatureCollection";
    features: GeoFeature[];
};

type GeoGeometry =
    | {
          type: "Polygon";
          coordinates: number[][][];
      }
    | {
          type: "MultiPolygon";
          coordinates: number[][][][];
      };

const DEFAULT_MAP_WIDTH = 360;
const DEFAULT_MAP_HEIGHT = 320;
const DETAIL_MAP_WIDTH = 500;
const DETAIL_MAP_HEIGHT = 380;

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

const reverseRing = (ring: number[][]) => [...ring].reverse();

const normalizeGeometryForD3 = (geometry: GeoGeometry): GeoGeometry => {
    if (geometry.type === "Polygon") {
        return {
            ...geometry,
            coordinates: geometry.coordinates.map(reverseRing),
        };
    }

    return {
        ...geometry,
        coordinates: geometry.coordinates.map((polygon) => polygon.map(reverseRing)),
    };
};

const normalizeGeoDataForD3 = (geoData: GeoFeatureCollection): GeoFeatureCollection => ({
    ...geoData,
    features: geoData.features.map((feature) => ({
        ...feature,
        geometry: normalizeGeometryForD3(feature.geometry),
    })),
});

export default function BrazilUfMapChart({ data, isLoading, color = "#16a34a", displayMode = "default", onDrilldownSelect }: BrazilUfMapChartProps) {
    const drilldownFromContext = useDrilldownSelect();
    const drillHandler = onDrilldownSelect ?? drilldownFromContext ?? null;
    const [hoveredUf, setHoveredUf] = useState<string | null>(null);
    const geoData = useMemo(() => normalizeGeoDataForD3(brUfsGeoJson as GeoFeatureCollection), []);
    const isDetailMode = displayMode === "detail";
    const mapWidth = isDetailMode ? DETAIL_MAP_WIDTH : DEFAULT_MAP_WIDTH;
    const mapHeight = isDetailMode ? DETAIL_MAP_HEIGHT : DEFAULT_MAP_HEIGHT;

    const valuesByUf = useMemo(() => {
        return new Map(data.map((item) => [normalizeUf(item.local), item.valor]));
    }, [data]);

    const rankedValues = useMemo(
        () =>
            data
                .map((item) => ({ uf: normalizeUf(item.local), valor: item.valor }))
                .sort((a, b) => b.valor - a.valor || a.uf.localeCompare(b.uf, "pt-BR")),
        [data]
    );

    const mapPaths = useMemo(() => {
        const projection = geoMercator().fitSize([mapWidth, mapHeight], geoData);
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
    }, [geoData, mapHeight, mapWidth]);

    if (isLoading) {
        return (
            <MapLoadingState
                svgPaths={mapPaths.map((state) => state.d).filter(Boolean)}
                viewBoxWidth={mapWidth}
                viewBoxHeight={mapHeight}
                accentColor={color}
                displayMode={displayMode}
                label="Carregando mapa"
            />
        );
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
        <div className={`grid w-full items-stretch ${isDetailMode ? "h-[380px] grid-cols-[minmax(0,1fr)_176px_148px] gap-4" : "h-[320px] grid-cols-[minmax(0,1fr)_168px_96px] gap-4"}`}>
            <div className="relative flex h-full min-w-0 items-center justify-center overflow-hidden">
                <svg
                    viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                    className="block h-auto w-auto max-h-full max-w-full"
                    preserveAspectRatio="xMidYMid meet"
                    role="img"
                    aria-label="Mapa do Brasil por UF"
                >
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
                                    stroke={isHovered ? "#ffffff" : "#d6d3d1"}
                                    strokeWidth={isHovered ? 1.4 : 0.7}
                                    className={drillHandler ? "transition-colors duration-150 cursor-pointer" : "transition-colors duration-150"}
                                    onMouseEnter={() => setHoveredUf(state.uf)}
                                    onMouseLeave={() => setHoveredUf(null)}
                                    onClick={() => {
                                        if (!drillHandler) return;
                                        if (!state.uf) return;
                                        drillHandler({ kind: "geo_uf", uf: state.uf, label: state.uf });
                                    }}
                                >
                                    <title>{`${state.uf}: ${formatCurrency(value)}`}</title>
                                </path>
                            );
                        })}
                    </g>
                </svg>

                {hoveredUf && (
                    <div className={`pointer-events-none absolute left-3 top-3 rounded-lg border border-neutral-200 bg-white/95 font-bold text-neutral-700 shadow-sm ${isDetailMode ? "px-2.5 py-1.5 text-[11px]" : "px-3 py-2 text-xs"}`}>
                        <div className="text-neutral-900">{hoveredUf}</div>
                        <div>{formatCurrency(hoveredValue || 0)}</div>
                    </div>
                )}
            </div>

            <div className={`min-h-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white/90 ${isDetailMode ? "p-2.5" : "p-3"}`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                    <span className={`font-black uppercase tracking-widest text-neutral-500 ${isDetailMode ? "text-[9px]" : "text-[10px]"}`}>Valores por UF</span>
                    <span className={`font-bold text-neutral-400 ${isDetailMode ? "text-[9px]" : "text-[10px]"}`}>{rankedValues.length}</span>
                </div>

                <div className="h-full overflow-y-auto pr-1">
                    <div className="space-y-1.5">
                        {rankedValues.length === 0 ? (
                            <div className={`rounded-xl bg-neutral-50 text-neutral-400 ${isDetailMode ? "px-2 py-2 text-[10px]" : "px-2.5 py-2 text-[11px]"}`}>
                                Sem valores no periodo
                            </div>
                        ) : (
                            rankedValues.map((item) => {
                                const isHovered = hoveredUf === item.uf;
                                return (
                                    <button
                                        key={item.uf}
                                        type="button"
                                        onMouseEnter={() => setHoveredUf(item.uf)}
                                        onMouseLeave={() => setHoveredUf(null)}
                                        onClick={() => {
                                            if (!drillHandler) return;
                                            drillHandler({ kind: "geo_uf", uf: item.uf, label: item.uf });
                                        }}
                                        className={`flex w-full items-center justify-between rounded-xl border px-2.5 py-2 text-left transition ${
                                            isHovered
                                                ? "border-neutral-300 bg-neutral-50"
                                                : "border-transparent bg-neutral-50/70 hover:border-neutral-200 hover:bg-neutral-50"
                                        } ${drillHandler ? "cursor-pointer" : "cursor-default"}`}
                                    >
                                        <span className={`font-black text-neutral-700 ${isDetailMode ? "text-[10px]" : "text-[11px]"}`}>{item.uf}</span>
                                        <span className={`font-bold tabular-nums text-neutral-600 ${isDetailMode ? "text-[10px]" : "text-[11px]"}`}>{formatCurrency(item.valor)}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className={`flex flex-col items-center font-bold text-neutral-500 ${isDetailMode ? "gap-1.5 text-[9px]" : "gap-2 text-[10px]"}`}>
                <span>Maior valor</span>
                <div className={`${isDetailMode ? "h-20 w-4" : "h-24 w-5"} rounded`} style={{ background: `linear-gradient(to bottom, ${color}, ${colorWithIntensity(color, 0.08)})` }} />
                <span>Menor valor</span>
            </div>
        </div>
    );
}
