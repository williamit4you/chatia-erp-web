"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Save, UserPlus, Server, Users, Edit2, X, Eye, EyeOff, Info, Database, Shield, LayoutGrid } from "lucide-react";
import { superAdminService } from "@/services/superadmin.service";

export default function TenantDetailsClient({ tenant }: { tenant: any }) {
    const router = useRouter();

    // Settings State (Tokens + DB)
    const [iaToken, setIaToken] = useState(tenant.iaToken || "");
    const [chatAiToken, setChatAiToken] = useState(tenant.chatAiToken || "");
    const [erpToken, setErpToken] = useState(tenant.erpToken || "");
    
    const [dbIp, setDbIp] = useState(tenant.dbIp || "");
    const [dbName, setDbName] = useState(tenant.dbName || "");
    const [dbType, setDbType] = useState(tenant.dbType || "SQL Server");
    const [dbUser, setDbUser] = useState(tenant.dbUser || "");
    const [dbPassword, setDbPassword] = useState(tenant.dbPassword || "");
    const [showDbPassword, setShowDbPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "success" });

    // User Form State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("TENANT_USER");
    const [userLoading, setUserLoading] = useState(false);
    const [userMsg, setUserMsg] = useState("");
    const [showPasswordAdd, setShowPasswordAdd] = useState(false);

    // Edit User State
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editEmail, setEditEmail] = useState("");
    const [editName, setEditName] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editRole, setEditRole] = useState("TENANT_USER");
    const [editIsActive, setEditIsActive] = useState(true);
    const [editPermissions, setEditPermissions] = useState({
        hasPayableChatAccess: false,
        hasPayableDashboardAccess: false,
        hasReceivableChatAccess: false,
        hasReceivableDashboardAccess: false,
        hasBankingChatAccess: false,
        hasBankingDashboardAccess: false,
    });
    const [showPasswordEdit, setShowPasswordEdit] = useState(false);

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        try {
            await superAdminService.updateTenant(tenant.id, { 
                iaToken, erpToken, chatAiToken,
                dbIp, dbName, dbType, dbUser, dbPassword
            });
            setMsg({ text: "Configurações atualizadas com sucesso!", type: "success" });
            router.refresh();
        } catch (error: any) {
            setMsg({ text: error.response?.data?.message || error.message, type: "error" });
        } finally {
            setLoading(false);
            setTimeout(() => setMsg({ text: "", type: "" }), 3000);
        }
    };

    const createUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserLoading(true);
        setUserMsg("");

        try {
            await superAdminService.createTenantUser(tenant.id, { email, password, role, name });
            setUserMsg(`Usuário adicionado com sucesso!`);
            setTimeout(() => {
                setIsAddUserOpen(false);
                setEmail("");
                setName("");
                setPassword("");
                setRole("TENANT_USER");
                setUserMsg("");
            }, 1500);
            router.refresh();
        } catch (error: any) {
            setUserMsg(error.response?.data?.message || error.message);
        } finally {
            setUserLoading(false);
        }
    };

    const startEdit = (user: any) => {
        setEditingUserId(user.id);
        setEditEmail(user.email || "");
        setEditName(user.name || "");
        setEditRole(user.role || "TENANT_USER");
        setEditIsActive(user.isActive ?? true);
        setEditPermissions({
            hasPayableChatAccess: Boolean(user.hasPayableChatAccess),
            hasPayableDashboardAccess: Boolean(user.hasPayableDashboardAccess),
            hasReceivableChatAccess: Boolean(user.hasReceivableChatAccess),
            hasReceivableDashboardAccess: Boolean(user.hasReceivableDashboardAccess),
            hasBankingChatAccess: Boolean(user.hasBankingChatAccess),
            hasBankingDashboardAccess: Boolean(user.hasBankingDashboardAccess),
        });
        setEditPassword("");
        setIsAddUserOpen(true); // Reuses the overlay card for editing
    };

    const cancelEdit = () => {
        setEditingUserId(null);
        setIsAddUserOpen(false);
        setEditEmail("");
        setEditName("");
        setEditPassword("");
    };

    const updateEditedUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserLoading(true);
        setUserMsg("");

        try {
            const data: any = { email: editEmail, name: editName, role: editRole, isActive: editIsActive, ...editPermissions };
            if (editPassword) data.password = editPassword;
            
            await superAdminService.updateTenantUser(tenant.id, editingUserId!, data);
            setUserMsg("Usuário atualizado com sucesso!");
            setTimeout(() => {
                cancelEdit();
                setUserMsg("");
            }, 1000);
            router.refresh();
        } catch (error: any) {
            setUserMsg(error.response?.data?.message || error.message);
        } finally {
            setUserLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-10 pb-20">
            {/* 1. GERAL SECTION */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Info className="text-emerald-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Geral</h3>
                            <p className="text-sm text-neutral-400">Dados básicos da empresa</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-neutral-500 tracking-widest pl-1">Nome Fantasia</label>
                        <div className="bg-neutral-950/50 border border-neutral-800 px-5 py-3.5 rounded-2xl text-white font-semibold">
                            {tenant.name}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-black uppercase text-neutral-500 tracking-widest pl-1">CNPJ</label>
                        <div className="bg-neutral-950/50 border border-neutral-800 px-5 py-3.5 rounded-2xl text-neutral-300 font-mono">
                            {tenant.cnpj}
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. TOKENS SECTION */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Shield className="text-blue-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Configuração de Tokens</h3>
                            <p className="text-sm text-neutral-400">Gerencie chaves de API e integrações</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Token Memória RAG</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder="sk-proj-..."
                                    value={iaToken}
                                    onChange={(e) => setIaToken(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Token IA para consulta e chat</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                    placeholder="gsk-..."
                                    value={chatAiToken}
                                    onChange={(e) => setChatAiToken(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-400">Token ERP / Bearer</label>
                        <div className="relative group">
                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white placeholder-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                                placeholder="..."
                                value={erpToken}
                                onChange={(e) => setErpToken(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. BANCO DE DADOS SECTION */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Database className="text-amber-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Banco de Dados</h3>
                            <p className="text-sm text-neutral-400">Conexão direta com o sistema legado</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Servidor / IP</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                placeholder="192.168..."
                                value={dbIp}
                                onChange={(e) => setDbIp(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Nome da Base</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                placeholder="PROD_DB"
                                value={dbName}
                                onChange={(e) => setDbName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Tipo de Banco</label>
                            <select
                                className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none custom-select"
                                value={dbType}
                                onChange={(e) => setDbType(e.target.value)}
                            >
                                <option value="SQL Server">SQL Server</option>
                                <option value="Oracle">Oracle</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Usuário do Banco</label>
                            <input
                                type="text"
                                className="block w-full px-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                value={dbUser}
                                onChange={(e) => setDbUser(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Senha do Banco</label>
                            <div className="relative">
                                <input
                                    type={showDbPassword ? "text" : "password"}
                                    className="block w-full pr-14 pl-4 py-4 bg-neutral-950 border border-neutral-800 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    value={dbPassword}
                                    onChange={(e) => setDbPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowDbPassword(!showDbPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-amber-400 transition-colors"
                                >
                                    {showDbPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Global Save Button for Token & DB */}
                <div className="px-8 pb-8 flex flex-col items-center">
                    {msg.text && (
                        <div className={`mb-4 w-full p-4 rounded-2xl text-center text-sm font-bold border transition-all ${msg.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                            {msg.text}
                        </div>
                    )}
                    <button
                        onClick={saveSettings}
                        disabled={loading}
                        className="w-full sm:w-64 py-4 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-emerald-500/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? "Salvando..." : "Salvar Configurações"}
                    </button>
                </div>
            </section>

            {/* 4. USUÁRIOS SECTION */}
            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Users className="text-blue-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Usuários</h3>
                            <p className="text-sm text-neutral-400">Gerencie acessos de funcionários</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddUserOpen(true)}
                        className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                    >
                        <UserPlus className="h-4 w-4" />
                        Adicionar
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500 font-black">
                                <th className="px-8 py-4">Usuário</th>
                                <th className="px-8 py-4">Função</th>
                                <th className="px-8 py-4 text-center">Consultas</th>
                                <th className="px-8 py-4 text-center">Status</th>
                                <th className="px-8 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800/50">
                            {tenant.users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-neutral-800/20 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white">{user.email}</span>
                                            <span className="text-[10px] text-neutral-500 uppercase tracking-tight">{user.name || "N/A"}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg ${user.role.includes('ADMIN') ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-neutral-800 text-neutral-400'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <span className="text-sm font-mono text-neutral-300">{user.queryCount}</span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <div className="flex items-center justify-center">
                                            {user.isActive ? (
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => startEdit(user)}
                                            className="p-2.5 rounded-xl bg-neutral-800 text-neutral-500 hover:text-blue-400 hover:bg-neutral-700 transition-all border border-transparent hover:border-blue-400/20"
                                        >
                                            <Edit2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* OVERLAY CARD FOR ADDD/EDIT USER */}
                {isAddUserOpen && (
                    <div className="absolute inset-0 z-20 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-8">
                        <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between">
                                <h4 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                    <LayoutGrid className="text-blue-400 h-5 w-5" />
                                    {editingUserId ? "Editar Usuário" : "Novo Usuário"}
                                </h4>
                                <button onClick={cancelEdit} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors">
                                    <X className="h-5 w-5 text-neutral-500" />
                                </button>
                            </div>
                            <form onSubmit={editingUserId ? updateEditedUser : createUser} className="p-8 space-y-6">
                                {userMsg && (
                                    <div className={`p-4 rounded-2xl text-center text-sm font-bold border ${userMsg.includes("sucesso") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                        {userMsg}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Nome</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={editingUserId ? editName : name}
                                            onChange={(e) => editingUserId ? setEditName(e.target.value) : setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">E-mail de Acesso</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={editingUserId ? editEmail : email}
                                            onChange={(e) => editingUserId ? setEditEmail(e.target.value) : setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">
                                            {editingUserId ? "Alterar Senha (opcional)" : "Senha Inicial"}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={editingUserId ? (showPasswordEdit ? "text" : "password") : (showPasswordAdd ? "text" : "password")}
                                                required={!editingUserId}
                                                className="w-full pr-14 pl-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                value={editingUserId ? editPassword : password}
                                                onChange={(e) => editingUserId ? setEditPassword(e.target.value) : setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => editingUserId ? setShowPasswordEdit(!showPasswordEdit) : setShowPasswordAdd(!showPasswordAdd)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-blue-400 transition-colors"
                                            >
                                                {editingUserId ? (showPasswordEdit ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />) : (showPasswordAdd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />)}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Função / Perfil</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none custom-select"
                                            value={editingUserId ? editRole : role}
                                            onChange={(e) => editingUserId ? setEditRole(e.target.value) : setRole(e.target.value)}
                                        >
                                            <option value="TENANT_USER">Usuário Chat</option>
                                            <option value="TENANT_ADMIN">Administrador da Empresa</option>
                                        </select>
                                    </div>
                                    {editingUserId && (
                                        <div className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                                            <label className="flex items-center gap-2 text-sm font-bold text-neutral-300">
                                                <input
                                                    type="checkbox"
                                                    checked={editIsActive}
                                                    onChange={(e) => setEditIsActive(e.target.checked)}
                                                />
                                                Usuário ativo
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-300">
                                                {Object.entries({
                                                    hasPayableChatAccess: "Pagar - Chat",
                                                    hasPayableDashboardAccess: "Pagar - Dashboard",
                                                    hasReceivableChatAccess: "Receber - Chat",
                                                    hasReceivableDashboardAccess: "Receber - Dashboard",
                                                    hasBankingChatAccess: "Bancos - Chat",
                                                    hasBankingDashboardAccess: "Bancos - Dashboard",
                                                }).map(([key, label]) => (
                                                    <label key={key} className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={(editPermissions as any)[key]}
                                                            onChange={(e) => setEditPermissions((current) => ({ ...current, [key]: e.target.checked }))}
                                                        />
                                                        {label}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="pt-2 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={cancelEdit}
                                        className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        Descartar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={userLoading}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all disabled:opacity-50"
                                    >
                                        {userLoading ? "Processando..." : (editingUserId ? "Atualizar" : "Cadastrar")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
