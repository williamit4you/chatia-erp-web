"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Save, UserPlus, Server, Users } from "lucide-react";
import { superAdminService } from "@/services/superadmin.service";

export default function TenantDetailsClient({ tenant }: { tenant: any }) {
    const router = useRouter();

    // Tokens Form State
    const [iaToken, setIaToken] = useState(tenant.iaToken || "");
    const [erpToken, setErpToken] = useState(tenant.erpToken || "");
    const [tokensLoading, setTokensLoading] = useState(false);
    const [tokensMsg, setTokensMsg] = useState("");

    // User Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("TENANT_USER");
    const [userLoading, setUserLoading] = useState(false);
    const [userMsg, setUserMsg] = useState("");

    const updateTokens = async (e: React.FormEvent) => {
        e.preventDefault();
        setTokensLoading(true);
        setTokensMsg("");

        try {
            await superAdminService.updateTenant(tenant.id, { iaToken, erpToken });
            setTokensMsg("Tokens atualizados com sucesso!");
            router.refresh();
        } catch (error: any) {
            setTokensMsg(error.response?.data?.message || error.message);
        } finally {
            setTokensLoading(false);
            setTimeout(() => setTokensMsg(""), 3000);
        }
    };

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserLoading(true);
        setUserMsg("");

        try {
            await superAdminService.createTenantUser(tenant.id, { email, password, role });
            setUserMsg(`Usuário adicionado com sucesso!`);
            setEmail("");
            setPassword("");
            setRole("TENANT_USER");
            router.refresh();
        } catch (error: any) {
            setUserMsg(error.response?.data?.message || error.message);
        } finally {
            setUserLoading(false);
            setTimeout(() => setUserMsg(""), 3000);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Tokens Section */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl self-start">
                <div className="px-6 py-5 border-b border-neutral-800 flex items-center gap-3">
                    <Server className="text-emerald-500 h-5 w-5" />
                    <h3 className="text-lg font-semibold text-white">Configuração de Tokens</h3>
                </div>
                <div className="p-6">
                    <form onSubmit={updateTokens} className="space-y-5">
                        {tokensMsg && (
                            <div className={`p-4 rounded-xl text-sm font-medium border ${tokensMsg.includes("sucesso") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                {tokensMsg}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Token Google Gemini (IA)</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Insira a API Key da IA..."
                                    className="pl-10 appearance-none block w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl placeholder-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    value={iaToken}
                                    onChange={(e) => setIaToken(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">Token ERP / Bearer</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-5 w-5 text-neutral-500" />
                                <input
                                    type="text"
                                    placeholder="Insira a API Key do ERP..."
                                    className="pl-10 appearance-none block w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl placeholder-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    value={erpToken}
                                    onChange={(e) => setErpToken(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={tokensLoading}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                <Save className="h-4 w-4" />
                                {tokensLoading ? "Salvando..." : "Salvar Tokens"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>

            {/* Users Management Section */}
            <div className="space-y-8">
                {/* Add User */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b border-neutral-800 flex items-center gap-3">
                        <UserPlus className="text-blue-500 h-5 w-5" />
                        <h3 className="text-lg font-semibold text-white">Adicionar Usuário</h3>
                    </div>
                    <div className="p-6">
                        <form onSubmit={createUser} className="space-y-5">
                            {userMsg && (
                                <div className={`p-4 rounded-xl text-sm font-medium border ${userMsg.includes("sucesso") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                    {userMsg}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@empresa.com"
                                        className="appearance-none block w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl placeholder-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Senha</label>
                                    <input
                                        type="password"
                                        required
                                        placeholder="******"
                                        className="appearance-none block w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl placeholder-neutral-600 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Função</label>
                                <select
                                    className="appearance-none block w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all custom-select"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="TENANT_USER">Usuário Chat</option>
                                    <option value="TENANT_ADMIN">Administrador da Empresa</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={userLoading}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    {userLoading ? "Adicionando..." : "Criar Usuário"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* List Users */}
                <section className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="text-amber-500 h-5 w-5" />
                            <h3 className="text-lg font-semibold text-white">Usuários da Empresa</h3>
                        </div>
                        <span className="bg-neutral-800 text-neutral-300 py-1 px-3 rounded-full text-xs font-medium">
                            {tenant.users.length} total
                        </span>
                    </div>
                    {tenant.users.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-neutral-500 text-sm">Nenhum usuário cadastrado nesta empresa ainda.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-neutral-800">
                            {tenant.users.map((user: any) => (
                                <li key={user.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-800/20">
                                    <div>
                                        <p className="font-medium text-white">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-neutral-500">
                                                Consultas: <strong className="text-neutral-300">{user.queryCount}</strong>
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className={`inline-flex px-2 py-1 rounded text-xs font-semibold ${user.role === 'TENANT_ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-neutral-800 text-neutral-400'}`}>
                                            {user.role === 'TENANT_ADMIN' ? 'Admin' : 'Membro'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

        </div>
    );
}
