import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";


export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/login");
    }

    const userRole = (session.user as any).role;
    const tenantId = (session.user as any).tenantId;

    if (userRole !== "TENANT_ADMIN" && userRole !== "SUPER_ADMIN") {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-neutral-50">
                <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 max-w-lg text-center font-medium shadow-sm">
                    Acesso Restrito: Apenas administradores podem ver esta página.
                </div>
            </div>
        );
    }

    const dbRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5217'}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: 'no-store'
    });
    const data = dbRes.ok ? await dbRes.json() : { usersCount: 0, totalQueries: 0 };
    const usersCount = data.usersCount;
    const totalQueries = data.totalQueries;

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-8">Dashboard Administrativo</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card: Total Users */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-neutral-500">Total de Usuários</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-neutral-400"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-neutral-900">{usersCount}</div>
                </div>

                {/* Card: Total Queries */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-row items-center justify-between pb-2">
                        <h3 className="tracking-tight text-sm font-medium text-neutral-500">Consultas (Mês)</h3>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-neutral-400"
                        >
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <div className="text-3xl font-bold text-neutral-900">{totalQueries}</div>
                </div>
            </div>
        </div>
    );
}
