type CurrencyFormatOptions = {
    compact?: boolean;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    currency?: string;
    locale?: string;
};

type NumberFormatOptions = {
    compact?: boolean;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    locale?: string;
};

type PercentFormatOptions = {
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
    locale?: string;
};

const numberFormatterCache = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = `${locale}|${JSON.stringify(options)}`;
    const cached = numberFormatterCache.get(key);
    if (cached) return cached;
    const nf = new Intl.NumberFormat(locale, options);
    numberFormatterCache.set(key, nf);
    return nf;
}

export function formatCurrency(value: number, options: CurrencyFormatOptions = {}): string {
    if (!Number.isFinite(value)) return "—";
    const locale = options.locale ?? "pt-BR";
    const currency = options.currency ?? "BRL";
    const maximumFractionDigits = options.maximumFractionDigits ?? (options.compact ? 1 : 2);
    const minimumFractionDigits = options.minimumFractionDigits ?? 0;

    return getNumberFormatter(locale, {
        style: "currency",
        currency,
        notation: options.compact ? "compact" : "standard",
        maximumFractionDigits,
        minimumFractionDigits,
    }).format(value);
}

export function formatNumber(value: number, options: NumberFormatOptions = {}): string {
    if (!Number.isFinite(value)) return "—";
    const locale = options.locale ?? "pt-BR";
    const maximumFractionDigits = options.maximumFractionDigits ?? 0;
    const minimumFractionDigits = options.minimumFractionDigits ?? 0;

    return getNumberFormatter(locale, {
        notation: options.compact ? "compact" : "standard",
        maximumFractionDigits,
        minimumFractionDigits,
    }).format(value);
}

export function formatPercent(value: number, options: PercentFormatOptions = {}): string {
    if (!Number.isFinite(value)) return "—";
    const locale = options.locale ?? "pt-BR";
    const maximumFractionDigits = options.maximumFractionDigits ?? 0;
    const minimumFractionDigits = options.minimumFractionDigits ?? 0;

    return getNumberFormatter(locale, {
        style: "percent",
        maximumFractionDigits,
        minimumFractionDigits,
    }).format(value);
}

