"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Save, Shield, UserCog } from "lucide-react";
import { superAdminService } from "@/services/superadmin.service";

const permissionLabels = {
    hasPayableChatAccess: "Pagar - Chat",
    hasPayableDashboardAccess: "Pagar - Dashboard",
    hasReceivableChatAccess: "Receber - Chat",
    hasReceivableDashboardAccess: "Receber - Dashboard",
    hasBankingChatAccess: "Bancos - Chat",
    hasBankingDashboardAccess: "Bancos - Dashboard",
};

export default function UserEditClient({ tenant, user }: { tenant: any; user: any }) {
    const router = useRouter();

    const [email, setEmail] = useState(user.email || "");
    const [name, setName] = useState(user.name || "");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState(user.role || "TENANT_USER");
    const [isActive, setIsActive] = useState(user.isActive ?? true);
    const [permissions, setPermissions] = useState({
        hasPayableChatAccess: Boolean(user.hasPayableChatAccess),
        hasPayableDashboardAccess: Boolean(user.hasPayableDashboardAccess),
        hasReceivableChatAccess: Boolean(user.hasReceivableChatAccess),
        hasReceivableDashboardAccess: Boolean(user.hasReceivableDashboardAccess),
        hasBankingChatAccess: Boolean(user.hasBankingChatAccess),
        hasBankingDashboardAccess: Boolean(user.hasBankingDashboardAccess),
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ text: string; type: "success" | "error" | "" }>({
        text: "",
        type: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback({ text: "", type: "" });

        try {
            const payload: any = {
                email,
                name,
                role,
                isActive,
                ...permissions,
            };

            if (password.trim()) {
                payload.password = password;
            }

            await superAdminService.updateTenantUser(tenant.id, user.id, payload);
            setFeedback({ text: "Usuario atualizado com sucesso!", type: "success" });
            setPassword("");
            router.refresh();
        } catch (error: any) {
            setFeedback({
                text: error.response?.data?.message || error.message || "Erro ao atualizar usuario.",
                type: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center gap-4 bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                        <UserCog className="text-blue-400 h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Dados do Usuario</h2>
                        <p className="text-sm text-neutral-400">Visualize e atualize o cadastro completo</p>
                    </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">Nome</label>
                        <input
                            type="text"
                            className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">E-mail</label>
                        <input
                            type="email"
                            required
                            className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">Nova senha</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="block w-full pr-14 pl-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder="Preencha apenas se quiser alterar"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-blue-400 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">Funcao / Perfil</label>
                        <select
                            className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none custom-select"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="TENANT_USER">Usuario Chat</option>
                            <option value="TENANT_ADMIN">Administrador da Empresa</option>
                        </select>
                    </div>
                </div>
            </section>

            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center gap-4 bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                        <Shield className="text-emerald-400 h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Permissoes e Status</h2>
                        <p className="text-sm text-neutral-400">Controle de acesso para chat e dashboards</p>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <label className="inline-flex items-center gap-3 text-sm font-bold text-neutral-200 bg-neutral-950 border border-neutral-800 rounded-2xl px-4 py-3">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        Usuario ativo
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.entries(permissionLabels).map(([key, label]) => (
                            <label
                                key={key}
                                className="flex items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-200"
                            >
                                <input
                                    type="checkbox"
                                    checked={(permissions as any)[key]}
                                    onChange={(e) =>
                                        setPermissions((current) => ({
                                            ...current,
                                            [key]: e.target.checked,
                                        }))
                                    }
                                />
                                {label}
                            </label>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-black">Consultas feitas</p>
                            <p className="text-2xl font-bold text-white mt-2">{user.queryCount ?? 0}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-black">Tenant</p>
                            <p className="text-base font-semibold text-white mt-2">{tenant.name}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 px-4 py-4">
                            <p className="text-[11px] uppercase tracking-widest text-neutral-500 font-black">Role atual</p>
                            <p className="text-base font-semibold text-white mt-2">{role}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    {feedback.text && (
                        <div className={`px-4 py-3 rounded-2xl text-sm font-bold border ${feedback.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                            {feedback.text}
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <Link
                        href={`/superadmin/tenants/${tenant.id}`}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white hover:border-neutral-500 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {loading ? "Salvando..." : "Salvar Alteracoes"}
                    </button>
                </div>
            </div>
        </form>
    );
}
