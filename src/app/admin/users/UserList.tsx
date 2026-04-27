"use client";

import { useState } from "react";
import { adminService } from "@/services/admin.service";
import { Lock, Unlock, UserMinus, UserCheck, Calendar, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

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

export default function UserList({ initialUsers }: UserListProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [blockingUser, setBlockingUser] = useState<User | null>(null);
  const [blockDate, setBlockDate] = useState("");

  const handleToggleInactivate = async (user: User) => {
    try {
      const newIsInactive = !user.isInactive;
      await adminService.updateUser(user.id, { isInactive: newIsInactive });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isInactive: newIsInactive } : u)));
      toast.success(newIsInactive ? `Usuário ${user.name} inativado` : `Usuário ${user.name} ativado`);
    } catch {
      toast.error("Erro ao atualizar status do usuário");
    }
  };

  const handleBlockUser = async () => {
    if (!blockingUser || !blockDate) return;

    try {
      const date = new Date(blockDate);
      await adminService.updateUser(blockingUser.id, { blockedUntil: date.toISOString() });
      setUsers((prev) => prev.map((u) => (u.id === blockingUser.id ? { ...u, blockedUntil: date.toISOString() } : u)));
      toast.success(`Usuário ${blockingUser.name} bloqueado até ${date.toLocaleDateString("pt-BR")}`);
      setBlockingUser(null);
      setBlockDate("");
    } catch {
      toast.error("Erro ao bloquear usuário");
    }
  };

  const handleUnblockUser = async (user: User) => {
    try {
      await adminService.updateUser(user.id, { unblock: true, blockedUntil: null });
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, blockedUntil: null } : u)));
      toast.success(`Usuário ${user.name} desbloqueado`);
    } catch {
      toast.error("Erro ao desbloquear usuário");
    }
  };

  const isBlocked = (user: User) => Boolean(user.blockedUntil && new Date(user.blockedUntil) > new Date());
  const isAdmin = (user: User) => user.role === "TENANT_ADMIN" || user.role === "ADMIN";

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      <table className="min-w-full divide-y divide-neutral-200">
        <thead className="bg-neutral-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Nome & Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Perfil</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-neutral-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-neutral-50 transition">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-neutral-900">{user.name}</div>
                <div className="text-sm text-neutral-500">{user.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isAdmin(user) ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Administrador
                  </span>
                ) : (
                  <span className="inline-flex px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600 text-xs font-bold">
                    Usuário
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <span className={`px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit uppercase ${user.isInactive ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {user.isInactive ? "Inativo" : "Ativo"}
                  </span>
                  {isBlocked(user) && (
                    <span className="px-2 py-1 inline-flex text-[10px] leading-4 font-bold rounded-full w-fit uppercase bg-orange-100 text-orange-700">
                      Bloqueado até {new Date(user.blockedUntil!).toLocaleDateString("pt-BR")}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex gap-2">
                  <button onClick={() => handleToggleInactivate(user)} className={`p-2 rounded-lg transition ${user.isInactive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"}`} title={user.isInactive ? "Ativar usuário" : "Inativar usuário"}>
                    {user.isInactive ? <UserCheck className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
                  </button>

                  {isBlocked(user) ? (
                    <button onClick={() => handleUnblockUser(user)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition" title="Desbloquear usuário">
                      <Unlock className="w-4 h-4" />
                    </button>
                  ) : (
                    <button onClick={() => setBlockingUser(user)} className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition" title="Bloquear usuário">
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {blockingUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-neutral-900">Bloquear usuário</h3>
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
                  <input type="date" className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setBlockingUser(null)} className="flex-1 px-4 py-3 border border-neutral-200 text-neutral-600 rounded-xl font-semibold hover:bg-neutral-50 transition">
                  Cancelar
                </button>
                <button onClick={handleBlockUser} disabled={!blockDate} className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
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

