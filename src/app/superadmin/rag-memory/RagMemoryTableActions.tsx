"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PencilLine, Trash2, Power, PowerOff } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function RagMemoryTableActions({ memoryId, isActive }: { memoryId: string, isActive: boolean }) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        if (!confirm(`Deseja realmente ${isActive ? 'inativar' : 'ativar'} esta regra na IA?`)) return;
        setIsToggling(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/superadmin/agent-memory/${memoryId}/toggle`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${(session?.user as any)?.accessToken}` }
            });
            if (res.ok) {
                router.refresh();
            } else {
                const err = await res.json();
                alert('Erro: ' + err.message);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao alterar o status.");
        }
        setIsToggling(false);
    };

    const handleDelete = async () => {
        if (!confirm("Tem certeza que deseja apagar essa regra definitivamente do banco vetorial? Essa ação não pode ser desfeita.")) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/superadmin/agent-memory/${memoryId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${(session?.user as any)?.accessToken}` }
            });
            if (res.ok) {
                router.refresh();
            } else {
                const err = await res.json();
                alert('Erro: ' + err.message);
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir.");
        }
        setIsDeleting(false);
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleToggle}
                disabled={isToggling}
                title={isActive ? "Desativar regra" : "Ativar regra"}
                className={`p-2 rounded-lg transition-colors border ${isActive 
                    ? 'hover:bg-neutral-800 text-neutral-400 border-neutral-700/50' 
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'}`}
            >
                {isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            </button>
            <Link
                href={`/superadmin/rag-memory/${memoryId}`}
                className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-colors border border-neutral-700/50"
                title="Editar regra"
            >
                <PencilLine className="h-4 w-4" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                title="Excluir do vetor"
                className="p-2 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors border border-transparent hover:border-red-500/20"
            >
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}
