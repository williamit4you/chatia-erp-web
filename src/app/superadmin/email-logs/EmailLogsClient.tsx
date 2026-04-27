"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { emailAdminService } from "@/services/email-admin.service";

export default function EmailLogsClient() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [toEmail, setToEmail] = useState("");

  const load = async () => {
    const data = await emailAdminService.getLogs({
      page,
      pageSize: 20,
      status: status || undefined,
      toEmail: toEmail || undefined,
      sortDirection: "desc",
    });
    setLogs(data.items || []);
    setTotal(data.total || 0);
  };

  useEffect(() => {
    load();
  }, [page]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900">Logs de e-mail</h1>
        <p className="text-sm text-neutral-500 mt-1">Histórico de envios transacionais do sistema.</p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm mb-5 flex flex-col sm:flex-row gap-3">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-3 border border-neutral-200 rounded-xl">
          <option value="">Todos os status</option>
          <option value="SUCCESS">Sucesso</option>
          <option value="ERROR">Erro</option>
          <option value="PENDING">Pendente</option>
        </select>
        <input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="Destinatário" className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl" />
        <button onClick={() => { setPage(1); load(); }} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neutral-900 text-white font-bold">
          <Search className="h-4 w-4" />
          Filtrar
        </button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-500">
            <tr>
              <th className="text-left px-4 py-3">Data</th>
              <th className="text-left px-4 py-3">Destinatário</th>
              <th className="text-left px-4 py-3">Template</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Solicitante</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-neutral-100">
                <td className="px-4 py-3">{new Date(log.createdAt).toLocaleString("pt-BR")}</td>
                <td className="px-4 py-3">{log.toEmail}</td>
                <td className="px-4 py-3">{log.templateKey || "-"}</td>
                <td className="px-4 py-3">{log.status}</td>
                <td className="px-4 py-3">{log.requestedByUserName || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
        <span>Total: {total}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="px-3 py-2 rounded-lg border border-neutral-200 disabled:opacity-50">Anterior</button>
          <button disabled={page * 20 >= total} onClick={() => setPage(page + 1)} className="px-3 py-2 rounded-lg border border-neutral-200 disabled:opacity-50">Próxima</button>
        </div>
      </div>
    </div>
  );
}

