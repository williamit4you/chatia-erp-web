"use client";

import { useState } from "react";
import { adminService } from "@/services/admin.service";
import { Lock, Unlock, UserMinus, UserCheck, Calendar, X, Check } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is used, based on typical premium setups

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    queryCount: number;
    createdAt: string;
    isActive: boolean;
    isInactive: boolean;
    blockedUntil: string | null;
}

interface UserListProps {
    initialUsers: User[];
    accessToken: string;
}

export default function UserList({ initialUsers, accessToken }: UserListProps) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [blockingUser, setBlockingUser] = useState<User | null>(null);
    const [blockDate, setBlockDate] = useState("");

    const handleToggleInactivate = async (user: User) => {
        try {
            const newIsInactive = !user.isInactive;
            await adminService.updateUser(user.id, { isInactive: newIsInactive });
            
            setUsers(prev => prev.map(u => 
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
            
            setUsers(prev => prev.map(u => 
                u.id === blockingUser.id ? { ...u, blockedUntil: date.toISOString() } : u
            ));
            
            toast.success(`Usuário ${blockingUser.name} bloqueado até ${date.toLocaleDateString("pt-BR")}`);
            setBlockingUser(null);
            setBlockDate("");
        } catch (error) {
            toast.error("Erro ao bloquear usuário");
        }
    };

    const handleUnblockUser = async (user: User) => {
        try {
            await adminService.updateUser(user.id, { blockedUntil: null });
            
            setUsers(prev => prev.map(u => 
                u.id === user.id ? { ...u, blockedUntil: null } : u
            ));
            
            toast.success(`Usuário ${user.name} desbloqueado`);
        } catch (error) {
            toast.error("Erro ao desbloquear usuário");
        }
    };

    const isBlocked = (user: User) => {
        if (!user.blockedUntil) return false;
        return new Date(user.blockedUntil) > new Date();
    };

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome & Email</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                    {users.map((u: User) => (
                        <tr key={u.id} className="hover:bg-neutral-50 transition">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900">{u.name}</div>
                                <div className="text-sm text-neutral-500">{u.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                    <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit uppercase ${u.isInactive ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                                        {u.isInactive ? "Inativo" : "Ativo"}
                                    </span>
                                    {isBlocked(u) && (
                                        <span className="px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit uppercase bg-orange-100 text-orange-700">
                                            Bloqueado até {new Date(u.blockedUntil!).toLocaleDateString("pt-BR")}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleToggleInactivate(u)}
                                        className={`p-2 rounded-lg transition ${u.isInactive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`}
                                        title={u.isInactive ? "Ativar Usuário" : "Inativar Usuário"}
                                    >
                                        {u.isInactive ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                                    </button>

                                    {isBlocked(u) ? (
                                        <button 
                                            onClick={() => handleUnblockUser(u)}
                                            className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                                            title="Desbloquear Usuário"
                                        >
                                            <Unlock className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => setBlockingUser(u)}
                                            className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition"
                                            title="Bloquear Usuário"
                                        >
                                            <Lock className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal de Bloqueio */}
            {blockingUser && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-neutral-900">Bloquear Usuário</h3>
                            <button onClick={() => setBlockingUser(null)} className="text-neutral-400 hover:text-neutral-600 transition">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <p className="text-neutral-600 mb-6">
                            Selecione até quando o usuário <strong>{blockingUser.name}</strong> ficará bloqueado de efetuar consultas.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">Bloquear até:</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <input 
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                                        value={blockDate}
                                        onChange={(e) => setBlockDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    onClick={() => setBlockingUser(null)}
                                    className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-600 rounded-xl font-semibold hover:bg-neutral-50 transition"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    onClick={handleBlockUser}
                                    disabled={!blockDate}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Bloquear
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
