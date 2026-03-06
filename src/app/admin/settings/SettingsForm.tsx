"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/services/admin.service";

export default function SettingsForm({ initialIaToken, initialErpToken }: { initialIaToken: string; initialErpToken: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        iaToken: initialIaToken,
        erpToken: initialErpToken,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        try {
            await adminService.updateSettings(formData);
            setSuccess(true);
            router.refresh();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
                {success && (
                    <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl text-sm border border-emerald-100 font-medium">
                        Configurações salvas com sucesso!
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Token da Inteligência Artificial (IT4You IA)</label>
                    <div className="mt-2">
                        <input
                            name="iaToken"
                            type="text"
                            className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            value={formData.iaToken}
                            onChange={(e) => setFormData({ ...formData, iaToken: e.target.value })}
                        />
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">A chave da API para conectar aos modelos de IA (AI Models).</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700">Token de Integração do ERP</label>
                    <div className="mt-2">
                        <input
                            name="erpToken"
                            type="text"
                            className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            value={formData.erpToken}
                            onChange={(e) => setFormData({ ...formData, erpToken: e.target.value })}
                        />
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">A chave da API para habilitar as 'tools' de busca e inserção de dados no seu ERP.</p>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex justify-center py-2.5 px-6 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                    >
                        {loading ? "Salvando..." : "Salvar Configurações"}
                    </button>
                </div>
            </form>
        </div>
    );
}
