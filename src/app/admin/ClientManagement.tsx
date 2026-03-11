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
                hasBankingDashboardAccess: editingUser.hasBankingDashboardAccess
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

            <div className="grid grid-cols-1 gap-8">
                {/* Tokens Section - Full Width */}
                <section className="bg-white border text-sm border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3">
                        <Server className="text-emerald-500 h-5 w-5" />
                        <h3 className="text-lg font-semibold text-neutral-900">Tokens da Empresa</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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

                {/* Users List Section - Full Width */}
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
                                                <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full border transition-colors ${user.isActive
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                    }`}>
                                                    {user.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button
                                                    onClick={() => handleOpenEditUser(user)}
                                                    className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                                    title="Editar Usuário"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
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

            {/* Modal Editar Senha Usuário */}
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
                                            checked={editingUser.isActive}
                                            disabled={editingUser.id === currentUser.id}
                                            onChange={e => setEditingUser({ ...editingUser, isActive: e.target.checked })}
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


        </div>
    );
}
