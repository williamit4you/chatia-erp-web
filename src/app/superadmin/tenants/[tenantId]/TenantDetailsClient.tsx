"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronDown,
    ChevronUp,
    Database,
    Edit2,
    Eye,
    EyeOff,
    Info,
    Key,
    Save,
    Search,
    Shield,
    UserPlus,
    Users,
    X,
} from "lucide-react";
import { superAdminService } from "@/services/superadmin.service";

const permissionLabels = {
    hasPayableChatAccess: "Pagar - Chat",
    hasPayableDashboardAccess: "Pagar - Dashboard",
    hasReceivableChatAccess: "Receber - Chat",
    hasReceivableDashboardAccess: "Receber - Dashboard",
    hasBankingChatAccess: "Bancos - Chat",
    hasBankingDashboardAccess: "Bancos - Dashboard",
};

export default function TenantDetailsClient({ tenant }: { tenant: any }) {
    const router = useRouter();
    const users = tenant.users ?? [];

    const [activeTab, setActiveTab] = useState<"users" | "sql-logs">("users");

    const [iaToken, setIaToken] = useState(tenant.iaToken || "");
    const [chatAiToken, setChatAiToken] = useState(tenant.chatAiToken || "");
    const [erpToken, setErpToken] = useState(tenant.erpToken || "");
    const [dbIp, setDbIp] = useState(tenant.dbIp || "");
    const [dbName, setDbName] = useState(tenant.dbName || "");
    const [dbType, setDbType] = useState(tenant.dbType || "SQL Server");
    const [dbUser, setDbUser] = useState(tenant.dbUser || "");
    const [dbPassword, setDbPassword] = useState(tenant.dbPassword || "");
    const [showChartDetails, setShowChartDetails] = useState(Boolean(tenant.showChartDetails));
    const [showDbPassword, setShowDbPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ text: "", type: "success" });

    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("TENANT_USER");
    const [userLoading, setUserLoading] = useState(false);
    const [userMsg, setUserMsg] = useState("");
    const [showPasswordAdd, setShowPasswordAdd] = useState(false);

    const [sqlLogs, setSqlLogs] = useState<any[]>([]);
    const [sqlLogsLoading, setSqlLogsLoading] = useState(false);
    const [sqlFilterUserId, setSqlFilterUserId] = useState("");
    const [sqlFilterStart, setSqlFilterStart] = useState("");
    const [sqlFilterEnd, setSqlFilterEnd] = useState("");
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const resetCreateForm = () => {
        setEmail("");
        setName("");
        setPassword("");
        setRole("TENANT_USER");
        setUserMsg("");
        setShowPasswordAdd(false);
    };

    const closeCreateUserModal = () => {
        setIsAddUserOpen(false);
        resetCreateForm();
    };

    const saveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ text: "", type: "" });

        try {
            await superAdminService.updateTenant(tenant.id, {
                iaToken,
                erpToken,
                chatAiToken,
                dbIp,
                dbName,
                dbType,
                dbUser,
                dbPassword,
                showChartDetails,
            });
            setMsg({ text: "Configuracoes atualizadas com sucesso!", type: "success" });
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
            setUserMsg("Usuario adicionado com sucesso!");
            setTimeout(() => {
                closeCreateUserModal();
                router.refresh();
            }, 1200);
        } catch (error: any) {
            setUserMsg(error.response?.data?.message || error.message);
        } finally {
            setUserLoading(false);
        }
    };

    const fetchSqlLogs = async () => {
        setSqlLogsLoading(true);

        try {
            const data = await superAdminService.getTenantSqlLogs(tenant.id, {
                userId: sqlFilterUserId || undefined,
                startDate: sqlFilterStart || undefined,
                endDate: sqlFilterEnd || undefined,
            });
            setSqlLogs(data);
        } catch (error) {
            console.error("Erro ao buscar logs SQL no superadmin:", error);
        } finally {
            setSqlLogsLoading(false);
        }
    };

    const handleOpenSqlLogs = async () => {
        setActiveTab("sql-logs");
        if (sqlLogs.length === 0 && !sqlLogsLoading) {
            await fetchSqlLogs();
        }
    };

    return (
        <div className="flex flex-col gap-10 pb-20">
            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Info className="text-emerald-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Geral</h3>
                            <p className="text-sm text-neutral-400">Dados basicos da empresa</p>
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

            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Shield className="text-blue-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Configuracao de Tokens</h3>
                            <p className="text-sm text-neutral-400">Gerencie chaves de API e integracoes</p>
                        </div>
                    </div>
                </div>
                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400">Token Memoria RAG</label>
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

            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex items-center gap-4">
                        <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                            <Database className="text-amber-400 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Banco de Dados</h3>
                            <p className="text-sm text-neutral-400">Conexao direta com o sistema legado</p>
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
                            <label className="text-xs font-bold text-neutral-400">Usuario do Banco</label>
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
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-black uppercase tracking-widest text-neutral-500">Flag de visualizacao</p>
                                <h4 className="text-sm font-bold text-white">Exibir detalhes dos graficos</h4>
                                <p className="text-sm text-neutral-400">
                                    Libera, somente para usuarios com perfil <span className="font-bold text-white">TENANT_ADMIN</span>, o painel explicando calculo, origem e leitura dos graficos.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowChartDetails((current) => !current)}
                                className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                                    showChartDetails
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                                }`}
                            >
                                <span
                                    className={`relative h-6 w-11 rounded-full transition-colors ${
                                        showChartDetails ? "bg-emerald-500" : "bg-neutral-700"
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                                            showChartDetails ? "translate-x-5" : "translate-x-0.5"
                                        }`}
                                    />
                                </span>
                                {showChartDetails ? "Habilitado" : "Desabilitado"}
                            </button>
                        </div>
                    </div>
                </div>

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
                        {loading ? "Salvando..." : "Salvar Configuracoes"}
                    </button>
                </div>
            </section>

            <section className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl relative">
                <div className="px-8 py-6 border-b border-neutral-800 bg-gradient-to-r from-neutral-900 to-neutral-800/50">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-neutral-800 p-2.5 rounded-xl border border-neutral-700">
                                {activeTab === "users" ? <Users className="text-blue-400 h-6 w-6" /> : <Database className="text-indigo-400 h-6 w-6" />}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Operacao do Inquilino</h3>
                                <p className="text-sm text-neutral-400">Usuarios, consultas e visibilidade do tenant</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => setActiveTab("users")}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${activeTab === "users" ? "bg-blue-600 text-white border-blue-500" : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white"}`}
                            >
                                Usuarios
                            </button>
                            <button
                                onClick={handleOpenSqlLogs}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${activeTab === "sql-logs" ? "bg-indigo-600 text-white border-indigo-500" : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white"}`}
                            >
                                Log SQL
                            </button>
                            {activeTab === "users" && (
                                <button
                                    onClick={() => setIsAddUserOpen(true)}
                                    className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-600/20 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95"
                                >
                                    <UserPlus className="h-4 w-4" />
                                    Adicionar
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {activeTab === "users" && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-neutral-800 text-[10px] uppercase tracking-wider text-neutral-500 font-black">
                                    <th className="px-8 py-4">Usuario</th>
                                    <th className="px-8 py-4">Funcao</th>
                                    <th className="px-8 py-4 text-center">Consultas</th>
                                    <th className="px-8 py-4 text-center">Status</th>
                                    <th className="px-8 py-4 text-right">Acoes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800/50">
                                {users.map((user: any) => (
                                    <tr key={user.id} className="hover:bg-neutral-800/20 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-white">{user.email}</span>
                                                <span className="text-[10px] text-neutral-500 uppercase tracking-tight">{user.name || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-lg ${user.role.includes("ADMIN") ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" : "bg-neutral-800 text-neutral-400"}`}>
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
                                            <Link
                                                href={`/superadmin/tenants/${tenant.id}/users/${user.id}`}
                                                className="inline-flex p-2.5 rounded-xl bg-neutral-800 text-neutral-500 hover:text-blue-400 hover:bg-neutral-700 transition-all border border-transparent hover:border-blue-400/20"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === "sql-logs" && (
                    <div>
                        <div className="p-6 border-b border-neutral-800 flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Usuario</label>
                                <select
                                    value={sqlFilterUserId}
                                    onChange={(e) => setSqlFilterUserId(e.target.value)}
                                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm w-56 text-white outline-none focus:border-indigo-400"
                                >
                                    <option value="">Todos</option>
                                    {users.map((user: any) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name || user.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Data Inicio</label>
                                <input
                                    type="date"
                                    value={sqlFilterStart}
                                    onChange={(e) => setSqlFilterStart(e.target.value)}
                                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Data Fim</label>
                                <input
                                    type="date"
                                    value={sqlFilterEnd}
                                    onChange={(e) => setSqlFilterEnd(e.target.value)}
                                    className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-indigo-400"
                                />
                            </div>
                            <button
                                onClick={fetchSqlLogs}
                                disabled={sqlLogsLoading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                                <Search className="w-4 h-4" />
                                Buscar
                            </button>
                        </div>

                        <div className="divide-y divide-neutral-800">
                            {sqlLogsLoading && (
                                <div className="p-12 text-center text-neutral-400 text-sm font-medium">Carregando logs...</div>
                            )}

                            {!sqlLogsLoading && sqlLogs.length === 0 && (
                                <div className="p-12 text-center text-neutral-400 text-sm font-medium">
                                    Nenhum log SQL encontrado para este tenant.
                                </div>
                            )}

                            {!sqlLogsLoading && sqlLogs.map((log: any) => {
                                const isExpanded = expandedLogId === log.messageId;
                                let queries: string[] = [];

                                try {
                                    queries = JSON.parse(log.sqlQueries);
                                } catch {
                                    queries = [log.sqlQueries];
                                }

                                return (
                                    <div key={log.messageId} className="px-6 py-4 hover:bg-neutral-900/60 transition-colors">
                                        <button
                                            type="button"
                                            onClick={() => setExpandedLogId(isExpanded ? null : log.messageId)}
                                            className="w-full text-left flex items-center justify-between gap-4"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3 mb-1">
                                                    <span className="text-[11px] text-neutral-400 font-mono">
                                                        {new Date(log.date).toLocaleString("pt-BR")}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                        {log.userName}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-500">{log.userEmail}</span>
                                                </div>
                                                <p className="text-sm font-medium text-neutral-100 truncate">{log.userQuestion}</p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-[10px] font-bold text-neutral-300 bg-neutral-800 px-2 py-1 rounded-lg">
                                                    {queries.length} SQL
                                                </span>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                                            </div>
                                        </button>

                                        {isExpanded && (
                                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                                                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Resposta da IA</h5>
                                                    <p className="text-sm text-neutral-200 whitespace-pre-wrap leading-relaxed">
                                                        {log.aiReply.length > 500 ? `${log.aiReply.substring(0, 500)}...` : log.aiReply}
                                                    </p>
                                                </div>
                                                <div>
                                                    <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-2">Queries Executadas</h5>
                                                    <div className="space-y-2">
                                                        {queries.map((query: string, index: number) => (
                                                            <pre
                                                                key={`${log.messageId}-${index}`}
                                                                className="text-[11px] bg-black text-green-400 p-3 rounded-xl overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all"
                                                            >
                                                                {query}
                                                            </pre>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {isAddUserOpen && (
                    <div className="absolute inset-0 z-20 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-8">
                        <div className="bg-neutral-900 border border-neutral-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="px-8 py-6 border-b border-neutral-800 flex items-center justify-between">
                                <h4 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-3">
                                    <Users className="text-blue-400 h-5 w-5" />
                                    Novo Usuario
                                </h4>
                                <button onClick={closeCreateUserModal} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors">
                                    <X className="h-5 w-5 text-neutral-500" />
                                </button>
                            </div>
                            <form onSubmit={createUser} className="p-8 space-y-6">
                                {userMsg && (
                                    <div className={`p-4 rounded-2xl text-center text-sm font-bold border ${userMsg.toLowerCase().includes("sucesso") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                        {userMsg}
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Nome</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">E-mail de Acesso</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Senha Inicial</label>
                                        <div className="relative">
                                            <input
                                                type={showPasswordAdd ? "text" : "password"}
                                                required
                                                className="w-full pr-14 pl-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswordAdd(!showPasswordAdd)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-blue-400 transition-colors"
                                            >
                                                {showPasswordAdd ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-neutral-500 tracking-widest pl-1">Funcao / Perfil</label>
                                        <select
                                            className="w-full px-5 py-3.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none custom-select"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="TENANT_USER">Usuario Chat</option>
                                            <option value="TENANT_ADMIN">Administrador da Empresa</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-2 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={closeCreateUserModal}
                                        className="flex-1 py-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={userLoading}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/10 transition-all disabled:opacity-50"
                                    >
                                        {userLoading ? "Processando..." : "Cadastrar"}
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
