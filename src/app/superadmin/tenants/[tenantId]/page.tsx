import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TenantDetailsClient from "./TenantDetailsClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

const prisma = new PrismaClient();

export default async function TenantDetailsPage({ params }: { params: Promise<{ tenantId: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/superadmin/login");
    }

    const resolvedParams = await params;
    const tenantId = resolvedParams.tenantId;

    const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        include: {
            users: {
                orderBy: {
                    createdAt: "desc"
                }
            }
        }
    });

    if (!tenant) {
        return (
            <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
                <h1 className="text-2xl font-bold mb-4">Empresa não encontrada</h1>
                <Link href="/superadmin" className="text-emerald-500 hover:text-emerald-400 font-medium">Voltar ao painel</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
            {/* Navbar */}
            <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center">
                        <Link href="/superadmin" className="flex items-center text-neutral-400 hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5 mr-1" />
                            <span>Voltar para Empresas</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">{tenant.name}</h1>
                    <p className="text-neutral-400 font-mono text-sm">CNPJ: {tenant.cnpj}</p>
                </div>

                {/* Client component for the forms to mutate state smoothly */}
                <TenantDetailsClient tenant={tenant} />
            </main>
        </div>
    );
}
