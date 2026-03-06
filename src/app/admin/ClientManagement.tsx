'use client';

import { useState } from 'react';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Key, Server, UserPlus, Users, Edit2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function ClientManagement({ initialUsers, initialSettings, currentUser, isTenantAdmin }: any) {
    const [users, setUsers] = useState(initialUsers || []);
    const [settings, setSettings] = useState(initialSettings || { iaToken: '', erpToken: '' });

    // User Modals State
    const [loading, setLoading] = useState(false);
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ name: '', email: '', password: '', role: 'TENANT_USER' });

    const [showEditUserModal, setShowEditUserModal] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editPassword, setEditPassword] = useState('');

    // Confirmation Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ userId: string, currentStatus: boolean } | null>(null);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/api/admin/users', newUserForm);
            const res = await apiClient.get('/api/admin/users');
            setUsers(res.data);
            setShowNewUserModal(false);
            setShowNewPassword(false);
            setNewUserForm({ name: '', email: '', password: '', role: 'TENANT_USER' });
            toast.success('Usuário criado com sucesso!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao criar usuário');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatusRequest = (userId: string, currentStatus: boolean) => {
        if (userId === currentUser.id) {
            toast.warning('Você não pode inativar a si mesmo.');
            return;
        }
        setConfirmAction({ userId, currentStatus });
        setShowConfirmModal(true);
    };

    const handleToggleStatusConfirm = async () => {
        if (!confirmAction) return;
        const { userId, currentStatus } = confirmAction;
        setLoading(true);
        try {
            await apiClient.put(`/api/Users/${userId}/status`, { isActive: !currentStatus });
            setUsers(users.map((u: any) => u.id === userId ? { ...u, isActive: !currentStatus } : u));
            toast.success('Status atualizado com sucesso!');
            setShowConfirmModal(false);
        } catch (error) {
            toast.error('Erro ao alterar status do usuário');
        } finally {
            setLoading(false);
            setConfirmAction(null);
        }
    };

    const handleOpenEditUser = (user: any) => {
        setEditingUser(user);
        setEditPassword('');
        setShowEditPassword(false);
        setShowEditUserModal(true);
    };

    const handleUpdateUserPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editPassword) {
            toast.warning("Digite a nova senha.");
            return;
        }

        setLoading(true);
        try {
            await apiClient.put(`/api/admin/users/${editingUser.id}`, { email: editingUser.email, password: editPassword, role: editingUser.role });
            toast.success('Senha atualizada com sucesso!');
            setShowEditUserModal(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao atualizar senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="IT4You Logo" className="h-10 w-auto" />
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Configurações do Agente</h1>
                </div>
                <a href="/chat" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors bg-emerald-50 px-4 py-2 rounded-xl">
                    Voltar ao Chat
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tokens Section */}
                <section className="bg-white border text-sm border-neutral-200 rounded-2xl overflow-hidden shadow-sm self-start lg:col-span-1">
                    <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
                        <Server className="text-emerald-500 h-5 w-5" />
                        <h3 className="text-lg font-semibold text-neutral-900">Tokens Atuais</h3>
                    </div>
                    <div className="p-6 space-y-5">
                        <p className="text-neutral-500 text-xs mb-4">
                            Você pode visualizar os tokens da sua empresa. Para atualizá-los, contate o Super Administrador.
                        </p>
                        <div>
                            <label className="block font-medium text-neutral-700 mb-2">Token de Inteligência Artificial</label>
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

                {/* Users List Section */}
                <section className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden lg:col-span-2">
                    <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Users className="text-emerald-600 h-5 w-5" />
                            <h3 className="text-lg font-semibold text-neutral-900">Usuários da Empresa</h3>
                        </div>
                        <button
                            onClick={() => setShowNewUserModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-sm rounded-lg font-medium transition-colors inline-flex items-center gap-1.5"
                        >
                            <UserPlus className="h-4 w-4" />
                            Novo Usuário
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 text-neutral-500 border-b border-neutral-200">
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider">Nome</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider">Email</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Consultas</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Status</th>
                                    <th className="py-3 px-6 font-medium text-xs uppercase tracking-wider text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: any) => (
                                    <tr key={user.id} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/50">
                                        <td className="py-4 px-6 text-neutral-900 font-medium text-sm">
                                            {user.name}
                                            {user.id === currentUser.id && <span className="ml-2 text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Você</span>}
                                        </td>
                                        <td className="py-4 px-6 text-neutral-500 text-sm">{user.email}</td>
                                        <td className="py-4 px-6 text-neutral-900 text-sm text-center font-medium">{user.queryCount}</td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleToggleStatusRequest(user.id, user.isActive)}
                                                disabled={user.id === currentUser.id}
                                                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${user.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                                                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200'
                                                    } ${user.id === currentUser.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {user.isActive ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="py-4 px-6 text-center">
                                            <button
                                                onClick={() => handleOpenEditUser(user)}
                                                className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                title="Trocar Senha"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-neutral-500 text-sm">Nenhum usuário cadastrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {/* Modal Novo Usuário */}
            {showNewUserModal && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">Criar Novo Usuário</h2>
                        <p className="text-sm text-neutral-500 mb-5">Adicione um novo colaborador para acessar o chat.</p>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                                <input required type="text" value={newUserForm.name} onChange={e => setNewUserForm({ ...newUserForm, name: e.target.value })} className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                                <input required type="email" value={newUserForm.email} onChange={e => setNewUserForm({ ...newUserForm, email: e.target.value })} className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all" />
                            </div>
                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Senha (Provisória)</label>
                                <input
                                    required
                                    type={showNewPassword ? "text" : "password"}
                                    value={newUserForm.password}
                                    onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-[34px] text-neutral-400 hover:text-emerald-600 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowNewUserModal(false)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                                    {loading ? 'Salvando...' : 'Salvar Novo Usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Editar Senha Usuário */}
            {showEditUserModal && editingUser && (
                <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-neutral-100">
                        <h2 className="text-xl font-bold text-neutral-900 mb-1">Trocar Senha</h2>
                        <p className="text-sm text-neutral-500 mb-5">Atualize a senha de acesso para <strong>{editingUser.email}</strong>.</p>

                        <form onSubmit={handleUpdateUserPassword} className="space-y-4">
                            <div className="relative">
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Nova Senha</label>
                                <input
                                    required
                                    type={showEditPassword ? "text" : "password"}
                                    value={editPassword}
                                    onChange={e => setEditPassword(e.target.value)}
                                    className="w-full border border-neutral-300 rounded-xl px-4 py-2.5 text-neutral-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEditPassword(!showEditPassword)}
                                    className="absolute right-4 top-[34px] text-neutral-400 hover:text-emerald-600 transition-colors"
                                >
                                    {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            <div className="flex justify-end space-x-3 pt-2">
                                <button type="button" onClick={() => setShowEditUserModal(false)} className="px-5 py-2.5 text-neutral-600 hover:bg-neutral-100 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={loading} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                                    {loading ? 'Atualizando...' : 'Concluir'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação Profissional */}
            {showConfirmModal && confirmAction && (
                <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-neutral-100 text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-100">
                            <AlertTriangle className="text-amber-500 h-8 w-8" />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900 mb-2">Confirmar Alteração</h3>
                        <p className="text-neutral-500 mb-6 px-2">
                            Deseja realmente {confirmAction.currentStatus ? 'inativar' : 'ativar'} o acesso deste usuário ao sistema?
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={handleToggleStatusConfirm}
                                disabled={loading}
                                className={`w-full py-3 rounded-xl font-bold transition-all ${confirmAction.currentStatus
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    }`}
                            >
                                {loading ? 'Processando...' : `Sim, ${confirmAction.currentStatus ? 'Inativar' : 'Ativar'}`}
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    setConfirmAction(null);
                                }}
                                className="w-full py-3 text-neutral-500 hover:bg-neutral-50 rounded-xl font-medium transition-colors"
                            >
                                Não, Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
