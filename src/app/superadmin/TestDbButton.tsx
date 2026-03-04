"use client";

import { useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { superAdminService } from "@/services/superadmin.service";

export default function TestDbButton() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleTest = async () => {
        setIsLoading(true);
        setResult(null);

        try {
            const data = await superAdminService.testDb();
            setResult(data);
        } catch (error: any) {
            setResult({
                success: false,
                error: error.response?.data?.error || error.message
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm mb-10 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Database className="text-blue-400" size={20} />
                        Testar Conexão SQL Server (Local)
                    </h3>
                    <p className="text-sm text-neutral-400">Clique para testar a comunicação com a string na `.env` através do `select top 1 * from ped_venda`.</p>
                </div>
                <button
                    onClick={handleTest}
                    disabled={isLoading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Testar Agora</span>}
                </button>
            </div>

            {/* Resultado do Teste */}
            {result && (
                <div className={`mt-4 p-4 rounded-lg border text-sm overflow-x-auto ${result.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                    <div className="font-bold mb-2">
                        {result.success ? "✅ Sucesso!" : "❌ Falha:"}
                    </div>
                    {/* Imprime o resultado formatado como código JSON */}
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
