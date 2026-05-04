import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import UserEditClient from "./UserEditClient";

export default async function SuperAdminTenantUserEditPage({
    params,
}: {
    params: Promise<{ tenantId: string; userId: string }>;
}) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/superadmin/login");
    }

    const resolvedParams = await params;
    const { tenantId, userId } = resolvedParams;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5217"}/api/superadmin/tenants`, {
        headers: { Authorization: `Bearer ${(session.user as any).accessToken}` },
        cache: "no-store",
    });

    const tenants = res.ok ? await res.json() : [];
    const tenant = tenants.find((item: any) => item.id === tenantId);
    const user = tenant?.users?.find((item: any) => item.id === userId);

    if (!tenant || !user) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <h1 className="text-2xl font-bold mb-4">Usuario nao encontrado</h1>
                <Link href={`/superadmin/tenants/${tenantId}`} className="text-emerald-400 hover:text-emerald-300 font-medium">
                    Voltar para o tenant
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
            <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center">
                        <Link
                            href={`/superadmin/tenants/${tenantId}`}
                            className="flex items-center text-neutral-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            <span>Voltar para {tenant.name}</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 font-black">Superadmin / Edicao de Usuario</p>
                    <h1 className="text-3xl font-bold tracking-tight text-white mt-2">{user.name || user.email}</h1>
                    <p className="text-neutral-400 mt-2">
                        Tenant: <span className="text-neutral-200">{tenant.name}</span>
                    </p>
                </div>

                <UserEditClient tenant={tenant} user={user} />
            </main>
        </div>
    );
}
