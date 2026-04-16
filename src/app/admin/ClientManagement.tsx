'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { adminService } from '@/services/admin.service';
import { toast } from 'sonner';
import { Key, Server, UserPlus, Users, Edit2, Eye, EyeOff, AlertTriangle, Database, Calendar, ChevronDown, ChevronUp, Search, BarChart3, TrendingUp, Clock, Lock, Unlock, UserMinus, UserCheck, X } from 'lucide-react';

export default function ClientManagement({ initialUsers, initialSettings, currentUser, isTenantAdmin }: any) {
    const [users, setUsers] = useState(initialUsers || []);
    const [settings, setSettings] = useState(initialSettings || { iaToken: '', erpToken: '', chatAiToken: '' });

    // User Modals State
    const [loading, setLoading] = useState(false);
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'TENANT_USER',
        hasPayableChatAccess: false,
        hasPayableDashboardAccess: false,
        hasReceivableChatAccess: false,
        hasReceivableDashboardAccess: false,
        hasBankingChatAccess: false,
        hasBankingDashboardAccess: false
    });

    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editPassword, setEditPassword] = useState('');

    // Tabs & SQL Logs state
    const [activeTab, setActiveTab] = useState<'users' | 'sql-logs' | 'usage-history'>('users');
    const [sqlLogs, setSqlLogs] = useState<any[]>([]);
    const [sqlLogsLoading, setSqlLogsLoading] = useState(false);
    
    // Usage History state
    const [usageHistory, setUsageHistory] = useState<{ monthlyUsage: any[], detailedUsage: any[] } | null>(null);
    const [usageLoading, setUsageLoading] = useState(false);
    const [usageFilterMonth, setUsageFilterMonth] = useState<number | ''>('');
    const [usageFilterYear, setUsageFilterYear] = useState<number | ''>('');
    const [sqlFilterUserId, setSqlFilterUserId] = useState('');
    const [sqlFilterStart, setSqlFilterStart] = useState('');
    const [sqlFilterEnd, setSqlFilterEnd] = useState('');
    const [selectedYearPreset, setSelectedYearPreset] = useState('none');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    // User Blocking State
    const [blockingUser, setBlockingUser] = useState<any>(null);
    const [blockDate, setBlockDate] = useState("");



    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/api/admin/users', newUserForm);
            const res = await apiClient.get('/api/admin/users');
            setUsers(res.data);
            setShowNewUserModal(false);
            setShowNewPassword(false);
            setNewUserForm({
                name: '',
                email: '',
                password: '',
                role: 'TENANT_USER',
                hasPayableChatAccess: false,
                hasPayableDashboardAccess: false,
                hasReceivableChatAccess: false,
                hasReceivableDashboardAccess: false,
                hasBankingChatAccess: false,
                hasBankingDashboardAccess: false
            });
            toast.success('Usuário criado com sucesso!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao criar usuário');
        } finally {
            setLoading(false);
        }
    };



    const handleOpenEditUser = (user: any) => {
        setEditingUser(user);
        setEditPassword('');
        setShowEditPassword(false);
        setShowEditUserModal(true);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.put(`/api/admin/users/${editingUser.id}`, {
                email: editingUser.email,
                name: editingUser.name,
                password: editPassword,
                role: editingUser.role,
                isActive: editingUser.isActive,
                hasPayableChatAccess: editingUser.hasPayableChatAccess,
                hasPayableDashboardAccess: editingUser.hasPayableDashboardAccess,
                hasReceivableChatAccess: editingUser.hasReceivableChatAccess,
                hasReceivableDashboardAccess: editingUser.hasReceivableDashboardAccess,
                hasBankingChatAccess: editingUser.hasBankingChatAccess,
                hasBankingDashboardAccess: editingUser.hasBankingDashboardAccess,
                isInactive: editingUser.isInactive
            });
            const res = await apiClient.get('/api/admin/users');
            setUsers(res.data);
            toast.success('Usuário atualizado com sucesso!');
            setShowEditUserModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao atualizar usuário.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleInactivate = async (user: any) => {
        try {
            const newIsInactive = !user.isInactive;
            await adminService.updateUser(user.id, { isInactive: newIsInactive });
            
            setUsers((prev: any[]) => prev.map((u: any) => 
                u.id === user.id ? { ...u, isInactive: newIsInactive } : u
            ));
            
            toast.success(newIsInactive ? `Usuário ${user.name} inativado` : `Usuário ${user.name} ativado`);
        } catch (error) {
            toast.error("Erro ao atualizar status do usuário");
        }
    };

    const handleBlockUser = async () => {
        if (!blockingUser || !blockDate) return;

        try {
            const date = new Date(blockDate);
            await adminService.updateUser(blockingUser.id, { blockedUntil: date.toISOString() });
            
            setUsers((prev: any[]) => prev.map((u: any) => 
                u.id === blockingUser.id ? { ...u, blockedUntil: date.toISOString() } : u
            ));
            
            toast.success(`Usuário ${blockingUser.name} bloqueado até ${date.toLocaleDateString("pt-BR")}`);
            setBlockingUser(null);
            setBlockDate("");
        } catch (error) {
            toast.error("Erro ao bloquear usuário");
        }
    };

    const handleUnblockUser = async (user: any) => {
        try {
            await adminService.updateUser(user.id, { unblock: true });
            
            setUsers((prev: any[]) => prev.map((u: any) => 
                u.id === user.id ? { ...u, blockedUntil: null } : u
            ));
            
            toast.success(`Usuário ${user.name} desbloqueado`);
        } catch (error) {
            toast.error("Erro ao desbloquear usuário");
        }
    };

    const isBlocked = (user: any) => {
        if (!user.blockedUntil) return false;
        return new Date(user.blockedUntil) > new Date();
    };

    const fetchUsageHistory = async (customStart?: string, customEnd?: string) => {
        setUsageLoading(true);
        try {
            const params: any = {};
            if (usageFilterMonth) params.month = usageFilterMonth;
            if (usageFilterYear) params.year = usageFilterYear;
            
            // Use provided dates or state values
            const startDate = customStart || sqlFilterStart;
            const endDate = customEnd || sqlFilterEnd;

            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const res = await adminService.getUsageHistory(params);
            setUsageHistory(res);
        } catch (error) {
            console.error('Erro ao buscar histórico de utilização:', error);
            toast.error('Erro ao buscar histórico de utilização.');
        } finally {
            setUsageLoading(false);
        }
    };

    const handleApplyPeriodPreset = (preset: string) => {
        setSelectedYearPreset(preset);
        if (preset === 'none') return;

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        
        let start = '';
        let end = '';

        if (preset === 'all') {
            start = '2025-01-01';
            end = todayStr;
        } else {
            start = `${preset}-01-01`;
            end = `${preset}-12-31`;
        }

        setSqlFilterStart(start);
        setSqlFilterEnd(end);
        fetchUsageHistory(start, end);
    };

    const fetchSqlLogs = async () => {
        setSqlLogsLoading(true);
        try {
            const params = new URLSearchParams();
            if (sqlFilterUserId) params.append('userId', sqlFilterUserId);
            if (sqlFilterStart) params.append('startDate', sqlFilterStart);
            if (sqlFilterEnd) params.append('endDate', sqlFilterEnd);
            const res = await apiClient.get(`/api/chat/sql-logs?${params.toString()}`);
            setSqlLogs(res.data);
        } catch (error) {
            console.error('Erro ao buscar logs SQL:', error);
            toast.error('Erro ao buscar logs de SQL.');
        } finally {
            setSqlLogsLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="IT4You Logo" className="h-16 w-auto" />
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Configurações do Agente</h1>
                </div>
                <a href="/chat" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-xl">
                    Voltar ao Chat
                </a>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-200 shadow-sm w-fit">
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Usuários
                </button>
                <button
                    onClick={() => {
                        setActiveTab('sql-logs');
                        if (sqlLogs.length === 0) fetchSqlLogs();
                    }}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sql-logs'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <Database className="w-4 h-4" />
                    Log de Consultas SQL
                </button>
                <button
                    onClick={() => {
                        setActiveTab('usage-history');
                        if (!usageHistory) fetchUsageHistory();
                    }}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'usage-history'
                        ? 'bg-white text-neutral-900 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                >
                    <BarChart3 className="w-4 h-4" />
                    Histórico de Utilização
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Tokens Section - Full Width */}
                <section className="bg-white border text-sm border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
                        <Server className="text-emerald-500 h-5 w-5" />
                        <h3 className="text-lg font-semibold text-neutral-900">Tokens da Empresa</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block font-medium text-neutral-700 mb-2">Token Memória RAG</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    readOnly
                                    className="pl-9 appearance-none block w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none"
                                    value={settings.iaToken || 'Nenhum token configurado'}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-neutral-700 mb-2">Token IA para Consulta e Chat</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-blue-400" />
                                <input
                                    type="text"
                                    readOnly
                                    className="pl-9 appearance-none block w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none"
                                    value={settings.chatAiToken || 'Nenhum token configurado'}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-medium text-neutral-700 mb-2">Token ERP / Bearer</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                                <input
                                    type="text"
                                    readOnly
                                    className="pl-9 appearance-none block w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-600 focus:outline-none"
                                    value={settings.erpToken || 'Nenhum token configurado'}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {activeTab === 'users' && (
                <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="text-emerald-600 h-5 w-5" />
                            <h3 className="text-lg font-semibold text-neutral-900">Gestão de Usuários</h3>
                        </div>
                        <button
                            onClick={() => setShowNewUserModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                            <UserPlus className="h-4 w-4" />
                            Novo Usuário
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-200 text-center">
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-left">Usuário</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-left">Email</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider">Perguntas</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider border-x border-neutral-200" colSpan={2}>Pagar</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider border-r border-neutral-200" colSpan={2}>Receber</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider" colSpan={2}>Bancário</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider">Ações</th>
                                </tr>
                                <tr className="bg-neutral-50/50 text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-200 text-center">
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th className="border-l border-neutral-200 py-1">Chat</th>
                                    <th className="border-r border-neutral-200 py-1">Dash</th>
                                    <th className="py-1">Chat</th>
                                    <th className="border-r border-neutral-200 py-1">Dash</th>
                                    <th className="py-1">Chat</th>
                                    <th className="py-1">Dash</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: any) => {
                                    const isAdmin = (user.role === 'TENANT_ADMIN' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN');
                                    
                                    const renderAccessCell = (access: boolean, borderL = false) => (
                                        <td className={`py-4 px-2 text-center ${borderL ? 'border-l border-neutral-100' : ''}`}>
                                            {isAdmin ? (
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 mx-auto" />
                                            ) : (
                                                <div className={`h-2 w-2 rounded-full mx-auto ${access ? 'bg-emerald-500' : 'bg-neutral-200'}`} />
                                            )}
                                        </td>
                                    );

                                    return (
                                        <tr key={user.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                                            <td className="py-4 px-6 text-neutral-900 font-medium text-sm">
                                                {user.name}
                                                {user.id === currentUser.id && <span className="ml-2 text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Você</span>}
                                            </td>
                                            <td className="py-4 px-6 text-neutral-500 text-sm">{user.email}</td>
                                            <td className="py-4 px-6 text-neutral-900 text-sm text-center font-medium">{user.queryCount}</td>
                                            
                                            {/* Pagar */}
                                            {renderAccessCell(user.hasPayableChatAccess, true)}
                                            {renderAccessCell(user.hasPayableDashboardAccess)}
                                            
                                            {/* Receber */}
                                            {renderAccessCell(user.hasReceivableChatAccess, true)}
                                            {renderAccessCell(user.hasReceivableDashboardAccess)}
                                            
                                            {/* Bancário */}
                                            {renderAccessCell(user.hasBankingChatAccess, true)}
                                            {renderAccessCell(user.hasBankingDashboardAccess)}

                                            <td className="py-4 px-6 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full border transition-colors ${user.isInactive
                                                        ? 'bg-red-50 text-red-700 border-red-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}>
                                                        {user.isInactive ? 'Inativo' : 'Ativo'}
                                                    </span>
                                                    {isBlocked(user) && (
                                                        <span className="px-2 py-1 text-[9px] uppercase font-bold rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                                                            Bloq. até {new Date(user.blockedUntil).toLocaleDateString("pt-BR")}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenEditUser(user)}
                                                        className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                        title="Editar Usuário"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleInactivate(user)}
                                                        className={`p-1.5 rounded-lg transition-colors ${user.isInactive ? "text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50" : "text-red-300 hover:text-red-600 hover:bg-red-50"}`}
                                                        title={user.isInactive ? "Ativar Usuário" : "Inativar Usuário"}
                                                    >
                                                        {user.isInactive ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                                    </button>

                                                    {isBlocked(user) ? (
                                                        <button 
                                                            onClick={() => handleUnblockUser(user)}
                                                            className="p-1.5 text-blue-400 rounded-lg hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Desbloquear Usuário"
                                                        >
                                                            <Unlock className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => setBlockingUser(user)}
                                                            className="p-1.5 text-orange-400 rounded-lg hover:text-orange-600 hover:bg-orange-50 transition-colors"
                                                            title="Bloquear Usuário"
                                                        >
                                                            <Lock className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

                {/* Log de Consultas SQL Tab */}
                {activeTab === 'sql-logs' && (
                    <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Database className="text-indigo-600 h-5 w-5" />
                                <h3 className="text-lg font-semibold text-neutral-900">Log de Consultas SQL da IA</h3>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="p-6 border-b border-neutral-100 flex flex-wrap items-end gap-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Usuário</label>
                                <select 
                                    value={sqlFilterUserId} 
                                    onChange={e => setSqlFilterUserId(e.target.value)}
                                    className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm w-48 outline-none focus:border-indigo-400"
                                >
                                    <option value="">Todos</option>
                                    {users.map((u: any) => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Data Início</label>
                                <input type="date" value={sqlFilterStart} onChange={e => setSqlFilterStart(e.target.value)} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Data Fim</label>
                                <input type="date" value={sqlFilterEnd} onChange={e => setSqlFilterEnd(e.target.value)} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-indigo-400" />
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

                        {/* Results */}
                        <div className="divide-y divide-neutral-100">
                            {sqlLogsLoading && (
                                <div className="p-12 text-center text-neutral-400 text-sm font-medium">Carregando logs...</div>
                            )}
                            {!sqlLogsLoading && sqlLogs.length === 0 && (
                                <div className="p-12 text-center text-neutral-400 text-sm font-medium">Nenhum log de SQL encontrado. As consultas SQL serão registradas a partir de agora.</div>
                            )}
                            {!sqlLogsLoading && sqlLogs.map((log: any) => {
                                const isExpanded = expandedLogId === log.messageId;
                                let queries: string[] = [];
                                try { queries = JSON.parse(log.sqlQueries); } catch { queries = [log.sqlQueries]; }

                                return (
                                    <div key={log.messageId} className="px-6 py-4 hover:bg-neutral-50 transition-colors">
                                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedLogId(isExpanded ? null : log.messageId)}>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-1">
                                                    <span className="text-[11px] text-neutral-400 font-mono">{new Date(log.date).toLocaleString('pt-BR')}</span>
                                                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{log.userName}</span>
                                                    <span className="text-[10px] text-neutral-300">{log.userEmail}</span>
                                                </div>
                                                <p className="text-sm font-medium text-neutral-800 truncate">{log.userQuestion}</p>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 shrink-0">
                                                <span className="text-[10px] font-bold text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">{queries.length} SQL</span>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                                                    <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Resposta da IA</h5>
                                                    <p className="text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed">{log.aiReply.length > 500 ? log.aiReply.substring(0, 500) + '...' : log.aiReply}</p>
                                                </div>
                                                <div>
                                                    <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2">Queries Executadas</h5>
                                                    <div className="space-y-2">
                                                        {queries.map((q: string, i: number) => (
                                                            <pre key={i} className="text-[11px] bg-neutral-900 text-green-400 p-3 rounded-xl overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all">{q}</pre>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Usage History Tab */}
                {activeTab === 'usage-history' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="text-emerald-600 h-5 w-5" />
                                <h3 className="text-lg font-semibold text-neutral-900">Resumo Mensal</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <div>
                                    <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">Ano / Período</label>
                                    <select 
                                        value={selectedYearPreset}
                                        onChange={(e) => handleApplyPeriodPreset(e.target.value)}
                                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-400 font-bold text-neutral-700"
                                    >
                                        <option value="none">Selecione...</option>
                                        <option value="all">Todo período (2025+)</option>
                                        <option value="2025">Ano 2025</option>
                                        <option value="2026">Ano 2026</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">Início</label>
                                    <input 
                                        type="date" 
                                        value={sqlFilterStart} 
                                        onChange={e => {
                                            setSqlFilterStart(e.target.value);
                                            setSelectedYearPreset('none');
                                        }} 
                                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-400" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[9px] font-bold text-neutral-400 uppercase mb-1">Fim</label>
                                    <input 
                                        type="date" 
                                        value={sqlFilterEnd} 
                                        onChange={e => {
                                            setSqlFilterEnd(e.target.value);
                                            setSelectedYearPreset('none');
                                        }} 
                                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-emerald-400" 
                                    />
                                </div>
                                <button 
                                    onClick={() => fetchUsageHistory()}
                                    disabled={usageLoading}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 disabled:opacity-50 mt-4"
                                >
                                    <Search className="w-3 h-3" />
                                    Filtrar
                                </button>
                            </div>
                        </div>

                        <div className="p-12 text-center">
                            {usageLoading && <div className="text-neutral-400 text-sm font-medium">Carregando dados...</div>}
                            {!usageLoading && (!usageHistory || usageHistory.monthlyUsage.length === 0) && (
                                <div className="text-neutral-400 text-sm font-medium">Nenhum dado encontrado para o período selecionado.</div>
                            )}
                            {!usageLoading && usageHistory && usageHistory.monthlyUsage.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {usageHistory.monthlyUsage.map((item: any, idx: number) => (
                                        <div key={idx} className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 flex flex-col gap-1 items-center justify-center hover:bg-white hover:shadow-md transition-all">
                                            <span className="text-[10px] uppercase font-black text-neutral-400 tracking-widest">{item.monthName || item.month} / {item.year}</span>
                                            <span className="text-3xl font-black text-emerald-600">{item.count || item.totalCount}</span>
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase">Consultas</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                    <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Users className="text-emerald-600 h-5 w-5" />
                                <h3 className="text-lg font-semibold text-neutral-900">Histórico por Usuário e Módulo</h3>
                            </div>
                            <div className="text-[10px] font-bold text-neutral-400 uppercase bg-neutral-100 px-3 py-1 rounded-full">
                                {usageHistory?.detailedUsage.length || 0} Registros
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                    <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider sticky left-0 bg-neutral-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Usuário</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center bg-emerald-50/50 text-emerald-700 font-black">Total</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Financeiro</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Estoque</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Vendas</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Produção</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Contrato</th>
                                        <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Projetos</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {!usageLoading && usageHistory?.detailedUsage.map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-neutral-50 transition-colors">
                                            <td className="py-4 px-6 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                                <div className="font-bold text-neutral-900 text-sm whitespace-nowrap">{row.userName}</div>
                                                <div className="text-[10px] text-neutral-400 tracking-tight whitespace-nowrap">{(users.find((u: any) => u.name === row.userName)?.email) || '---'}</div>
                                            </td>
                                            <td className="py-4 px-6 text-center bg-emerald-50/20">
                                                <span className="text-sm font-black text-emerald-600">{row.totalCount}</span>
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-medium text-neutral-600 border-l border-neutral-50">
                                                {row.moduleCounts?.Financeiro || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-medium text-neutral-600">
                                                {row.moduleCounts?.Estoque || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-medium text-neutral-600">
                                                {row.moduleCounts?.Vendas || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-medium text-neutral-600">
                                                {row.moduleCounts?.Produção || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-medium text-neutral-600">
                                                {row.moduleCounts?.Contrato || 0}
                                            </td>
                                            <td className="py-4 px-6 text-center text-sm font-medium text-neutral-600">
                                                {row.moduleCounts?.Projetos || 0}
                                            </td>
                                        </tr>
                                    ))}
                                    {!usageLoading && (!usageHistory || usageHistory.detailedUsage.length === 0) && (
                                        <tr>
                                            <td colSpan={8} className="py-12 text-center text-neutral-400 text-sm font-medium">Nenhum detalhe disponível.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
            </div> {/* Grid Close */}

            {/* Modal Novo Usuário */}
            {showNewUserModal && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">Criar Novo Usuário</h2>
                        <p className="text-sm text-neutral-500 mb-5">Adicione um novo colaborador para acessar o chat.</p>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                                    <input required type="text" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                                    <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
                                </div>
                            </div>
                            
                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Senha (Provisória)</label>
                                <input
                                    required
                                    type={showNewPassword ? "text" : "password"}
                                    value={newUserForm.password}
                                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-[32px] text-neutral-400 hover:text-emerald-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Rights Matrix */}
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mt-6">
                                <div className="bg-neutral-100/50 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Matriz de Direitos</span>
                                    <div className="flex gap-4 text-[10px] uppercase font-bold text-neutral-400">
                                        <span className="w-12 text-center">Chat</span>
                                        <span className="w-12 text-center">Dash</span>
                                    </div>
                                </div>
                                
                                {[
                                    { label: 'Pagar', chat: 'hasPayableChatAccess', dash: 'hasPayableDashboardAccess' },
                                    { label: 'Receber', chat: 'hasReceivableChatAccess', dash: 'hasReceivableDashboardAccess' },
                                    { label: 'Bancário', chat: 'hasBankingChatAccess', dash: 'hasBankingDashboardAccess' }
                                ].map((row) => (
                                    <div key={row.label} className="px-4 py-3 flex justify-between items-center border-b border-neutral-100 last:border-0">
                                        <span className="text-sm font-medium text-neutral-700">{row.label}</span>
                                        <div className="flex gap-4">
                                            <input
                                                type="checkbox"
                                                checked={(newUserForm as any)[row.chat]}
                                                onChange={e => setNewUserForm({ ...newUserForm, [row.chat]: e.target.checked })}
                                                className="h-5 w-5 text-emerald-600 rounded-lg border-neutral-300 focus:ring-emerald-500"
                                            />
                                            <input
                                                type="checkbox"
                                                checked={(newUserForm as any)[row.dash]}
                                                onChange={e => {
                                                    const checked = e.target.checked;
                                                    setNewUserForm({ 
                                                        ...newUserForm, 
                                                        [row.dash]: checked,
                                                        // Se selecionar Dashboard, Chat deve ser selecionado automaticamente
                                                        [row.chat]: checked ? true : (newUserForm as any)[row.chat]
                                                    });
                                                }}
                                                className="h-5 w-5 text-emerald-600 rounded-lg border-neutral-300 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowNewUserModal(false)} className="px-5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                                    {loading ? 'Salvando...' : 'Salvar Novo Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Usuário */}
            {showEditUserModal && editingUser && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">Editar Usuário</h2>
                        <p className="text-sm text-neutral-500 mb-5">Atualize as informações de <strong>{editingUser.email}</strong>.</p>

                        <form onSubmit={handleUpdateUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                                    <input
                                        required
                                        type="text"
                                        value={editingUser.name}
                                        onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                        className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center gap-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200">
                                        <input
                                            type="checkbox"
                                            id="editIsActive"
                                            checked={!editingUser.isInactive}
                                            disabled={editingUser.id === currentUser.id}
                                            onChange={e => setEditingUser({ ...editingUser, isInactive: !e.target.checked })}
                                            className="h-4 w-4 text-emerald-600 border-neutral-300 rounded"
                                        />
                                        <label htmlFor="editIsActive" className="text-xs font-semibold text-neutral-700 cursor-pointer">
                                            Status Ativo
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Nova Senha (Deixe em branco para manter)</label>
                                <input
                                    type={showEditPassword ? "text" : "password"}
                                    value={editPassword}
                                    onChange={e => setEditPassword(e.target.value)}
                                    className="w-full border border-neutral-200 rounded-xl px-4 py-2 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-4 top-[32px] text-neutral-400 hover:text-emerald-600"
                                >
                                    {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Rights Matrix */}
                            <div className="bg-neutral-50 rounded-2xl border border-neutral-200 overflow-hidden mt-6">
                                <div className="bg-neutral-100/50 px-4 py-2 border-b border-neutral-200 flex justify-between items-center">
                                    <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Matriz de Direitos</span>
                                    <div className="flex gap-4 text-[10px] uppercase font-bold text-neutral-400">
                                        <span className="w-12 text-center">Chat</span>
                                        <span className="w-12 text-center">Dash</span>
                                    </div>
                                </div>
                                
                                {[
                                    { label: 'Pagar', chat: 'hasPayableChatAccess', dash: 'hasPayableDashboardAccess' },
                                    { label: 'Receber', chat: 'hasReceivableChatAccess', dash: 'hasReceivableDashboardAccess' },
                                    { label: 'Bancário', chat: 'hasBankingChatAccess', dash: 'hasBankingDashboardAccess' }
                                ].map((row) => {
                                    const isAdmin = (editingUser.role === 'TENANT_ADMIN' || editingUser.role === 'SUPER_ADMIN' || editingUser.role === 'ADMIN');
                                    return (
                                        <div key={row.label} className="px-4 py-3 flex justify-between items-center border-b border-neutral-100 last:border-0">
                                            <span className="text-sm font-medium text-neutral-700">{row.label}</span>
                                            <div className="flex gap-4">
                                                <input
                                                    type="checkbox"
                                                    checked={isAdmin ? true : (editingUser[row.chat] || false)}
                                                    disabled={isAdmin}
                                                    onChange={e => setEditingUser({ ...editingUser, [row.chat]: e.target.checked })}
                                                    className="h-5 w-5 text-emerald-600 rounded-lg border-neutral-300 focus:ring-emerald-500 disabled:opacity-50"
                                                />
                                                <input
                                                    type="checkbox"
                                                    checked={isAdmin ? true : (editingUser[row.dash] || false)}
                                                    disabled={isAdmin}
                                                    onChange={e => {
                                                        const checked = e.target.checked;
                                                        setEditingUser({ 
                                                            ...editingUser, 
                                                            [row.dash]: checked,
                                                            [row.chat]: checked ? true : editingUser[row.chat]
                                                        });
                                                    }}
                                                    className="h-5 w-5 text-emerald-600 rounded-lg border-neutral-300 focus:ring-emerald-500 disabled:opacity-50"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button type="button" onClick={() => setShowEditUserModal(false)} className="px-5 py-2 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                                    {loading ? 'Atualizando...' : 'Concluir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Bloqueio */}
            {blockingUser && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200 border border-neutral-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-neutral-900">Bloquear Usuário</h3>
                            <button onClick={() => setBlockingUser(null)} className="text-neutral-400 hover:text-neutral-600 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
                            Selecione até quando o usuário <strong>{blockingUser.name}</strong> ficará bloqueado de efetuar consultas no chat.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1.5">Bloquear até:</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input 
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition outline-none text-sm"
                                        value={blockDate}
                                        onChange={(e) => setBlockDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setBlockingUser(null)}
                                    className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-600 rounded-xl text-sm font-bold hover:bg-neutral-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleBlockUser}
                                    disabled={!blockDate}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                >
                                    Bloquear Agora
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
