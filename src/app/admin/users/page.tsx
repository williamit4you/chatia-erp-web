import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";


export default async function UsersAdminPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login?callbackUrl=/admin/users");
    }

    const userRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (userRole !== "TENANT_ADMIN" && userRole !== "SUPER_ADMIN") {
        redirect("/chat");
    }

    const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/admin/users`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: 'no-store'
    });
    const users = usersRes.ok ? await usersRes.json() : [];

    return (
        <div className="container mx-auto py-10 px-4 max-w-5xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Usuários da Empresa</h1>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition">
                    Adicionar Usuário
                </button>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200">
                    <thead className="bg-neutral-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Nome & Email
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Função
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Consultas IA
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Data de Criação
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-neutral-200">
                        {users.map((u: any) => (
                            <tr key={u.id} className="hover:bg-neutral-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900">{u.name}</div>
                                    <div className="text-sm text-neutral-500">{u.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === "TENANT_ADMIN" ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800"}`}>
                                        {u.role === "TENANT_ADMIN" ? "Administrador" : "Usuário"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {u.queryCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="text-center py-10 text-neutral-500">
                        Nenhum usuário encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
