import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import UserList from "./UserList";

export default async function UsersAdminPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login?callbackUrl=/admin/users");
    }

    const userRole = (session.user as any).role;
    const accessToken = (session.user as any).accessToken;

    if (userRole !== "TENANT_ADMIN" && userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        redirect("/chat");
    }

    const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: 'no-store'
    });

    const users = usersRes.ok ? await usersRes.json() : [];

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Gestão de Usuários</h1>
                    <p className="text-neutral-500 text-sm">Gerencie acessos, bloqueios e status dos usuários da sua organização.</p>
                </div>
                <button className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-sm hover:shadow-md flex items-center gap-2">
                    Adicionar Usuário
                </button>
            </div>

            <UserList initialUsers={users} accessToken={accessToken} />
        </div>
    );
}
