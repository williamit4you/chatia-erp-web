"use client";

import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import apiClient from "@/lib/api-client";

async function downloadExport(exportId: string, onStart: () => void, onEnd: () => void) {
    onStart();
    try {
        const response = await apiClient.get(`/api/chat/export/${exportId}`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers["content-disposition"] ?? "";
        const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n;]+)\1/);
        link.download = match ? match[2] : `relatorio_${exportId.slice(0, 8)}.xlsx`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
        console.error("[download] Erro ao baixar export:", err);
        alert("Erro ao baixar o relatorio. O arquivo pode ter expirado (30 min). Solicite novamente.");
    } finally {
        onEnd();
    }
}

async function downloadExportPdf(exportId: string, onStart: () => void, onEnd: () => void) {
    onStart();
    try {
        const response = await apiClient.get(`/api/chat/export/${exportId}/pdf`, {
            responseType: "blob",
        });
        const blob = new Blob([response.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const disposition = response.headers["content-disposition"] ?? "";
        const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'"\n;]+)\1/);
        link.download = match ? match[2] : `relatorio_${exportId.slice(0, 8)}.pdf`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
        console.error("[download-pdf] Erro ao baixar PDF:", err);
        alert("Erro ao gerar o PDF. O arquivo pode ter expirado (30 min). Solicite novamente.");
    } finally {
        onEnd();
    }
}

export default function ExportButtons({ exportId, exportTotal, compact = false }: { exportId: string; exportTotal?: number; compact?: boolean }) {
    const [loadingXlsx, setLoadingXlsx] = useState(false);
    const [loadingPdf, setLoadingPdf] = useState(false);

    return (
        <div className={`mt-4 flex flex-wrap items-center gap-2 ${compact ? "text-[11px]" : ""}`}>
            <button
                onClick={() => downloadExport(exportId, () => setLoadingXlsx(true), () => setLoadingXlsx(false))}
                disabled={loadingXlsx || loadingPdf}
                className={`inline-flex items-center gap-2 rounded-xl bg-emerald-600 text-white shadow-sm transition-all duration-150 hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60 ${
                    compact ? "px-3 py-2 text-[11px] font-bold" : "px-4 py-2.5 text-xs font-semibold"
                }`}
            >
                {loadingXlsx ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
                <span>{loadingXlsx ? "Gerando download..." : "Baixar Excel"}</span>
                {exportTotal && !loadingXlsx && (
                    <span className="rounded-lg bg-emerald-500 px-2 py-0.5 text-[10px] font-bold">
                        {exportTotal.toLocaleString("pt-BR")} reg.
                    </span>
                )}
                {!loadingXlsx && <Download size={12} className="ml-0.5" />}
            </button>

            <button
                onClick={() => downloadExportPdf(exportId, () => setLoadingPdf(true), () => setLoadingPdf(false))}
                disabled={loadingXlsx || loadingPdf}
                className={`inline-flex items-center gap-2 rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 transition-all duration-150 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60 ${
                    compact ? "px-3 py-2 text-[11px] font-bold" : "px-4 py-2.5 text-xs font-semibold"
                }`}
            >
                {loadingPdf ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
                <span>{loadingPdf ? "Gerando PDF..." : "Baixar PDF"}</span>
                {!loadingPdf && <Download size={12} className="ml-0.5" />}
            </button>
        </div>
    );
}
