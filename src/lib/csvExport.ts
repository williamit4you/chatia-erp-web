export type CsvExportOptions = {
    filename: string;
    separator?: ";" | "," | "\t";
    includeBom?: boolean;
};

const escapeCsvValue = (value: unknown, separator: string) => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    const mustQuote = str.includes('"') || str.includes("\n") || str.includes("\r") || str.includes(separator);
    const escaped = str.replace(/"/g, '""');
    return mustQuote ? `"${escaped}"` : escaped;
};

export function downloadCsv(rows: Record<string, unknown>[], options: CsvExportOptions) {
    const separator = options.separator ?? ";";
    const includeBom = options.includeBom ?? true;

    const headers = Array.from(
        rows.reduce((set, row) => {
            Object.keys(row || {}).forEach((k) => set.add(k));
            return set;
        }, new Set<string>())
    );

    const lines = [
        headers.map((h) => escapeCsvValue(h, separator)).join(separator),
        ...rows.map((row) => headers.map((h) => escapeCsvValue(row?.[h], separator)).join(separator)),
    ];

    const bom = includeBom ? "\ufeff" : "";
    const csv = bom + lines.join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = options.filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
}

