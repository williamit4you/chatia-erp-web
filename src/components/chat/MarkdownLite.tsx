import type { ReactNode } from "react";

function renderInlineMarkdown(text: string): ReactNode[] {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g).filter(Boolean);

    return parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <strong key={index} className="font-semibold text-slate-900">
                    {part.slice(2, -2)}
                </strong>
            );
        }

        if (part.startsWith("`") && part.endsWith("`")) {
            return (
                <code key={index} className="rounded bg-slate-100 px-1 py-0.5 text-[0.95em] text-slate-800">
                    {part.slice(1, -1)}
                </code>
            );
        }

        return <span key={index}>{part}</span>;
    });
}

function isTableSeparatorLine(line: string) {
    const normalized = line.trim();
    return /^\|?[\s:-]+(\|[\s:-]+)+\|?$/.test(normalized);
}

function isTableContentLine(line: string) {
    return line.trim().startsWith("|") && line.trim().endsWith("|");
}

function parseTableRow(line: string) {
    return line
        .trim()
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim());
}

export default function MarkdownLite({ content, tone = "default" }: { content: string; tone?: "default" | "soft" }) {
    const lines = content.split("\n");
    const blocks: ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
        const rawLine = lines[i];
        const line = rawLine.trim();

        if (!line) {
            i++;
            continue;
        }

        if (isTableContentLine(line) && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) {
            const header = parseTableRow(lines[i]);
            const rows: string[][] = [];
            i += 2;

            while (i < lines.length && isTableContentLine(lines[i].trim())) {
                rows.push(parseTableRow(lines[i]));
                i++;
            }

            blocks.push(
                <div key={`table-${blocks.length}`} className="-mx-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
                    <table className="min-w-full border-collapse text-left text-sm text-slate-700">
                        <thead className="bg-slate-100">
                            <tr>
                                {header.map((cell, index) => (
                                    <th key={index} className="px-4 py-3 font-semibold text-slate-800">
                                        {renderInlineMarkdown(cell)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className="border-t border-slate-100">
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="px-4 py-3 align-top">
                                            {renderInlineMarkdown(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            const items: string[] = [];
            while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
                items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
                i++;
            }

            blocks.push(
                <ul key={`list-${blocks.length}`} className="space-y-2 pl-5 text-sm leading-7 text-slate-700">
                    {items.map((item, index) => (
                        <li key={index} className="list-disc">
                            {renderInlineMarkdown(item)}
                        </li>
                    ))}
                </ul>
            );

            continue;
        }

        const paragraphLines = [line];
        i++;
        while (i < lines.length) {
            const nextLine = lines[i].trim();
            if (!nextLine) {
                i++;
                break;
            }
            if (/^[-*]\s+/.test(nextLine)) break;
            if (isTableContentLine(nextLine) && i + 1 < lines.length && isTableSeparatorLine(lines[i + 1])) break;
            paragraphLines.push(nextLine);
            i++;
        }

        blocks.push(
            <p key={`p-${blocks.length}`} className={`text-sm leading-7 ${tone === "soft" ? "text-slate-700" : "text-slate-700"}`}>
                {renderInlineMarkdown(paragraphLines.join(" "))}
            </p>
        );
    }

    return <div className="space-y-4">{blocks}</div>;
}

