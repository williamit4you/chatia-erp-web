import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, Receipt, PlusCircle, LogOut } from "lucide-react";
import SignOutButton from "./SignOutButton";

import TestDbButton from "./TestDbButton";

const prisma = new PrismaClient();

export default async function SuperAdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== "SUPER_ADMIN") {
        redirect("/superadmin/login");
    }

    // Fetch all tenants
    const tenants = await prisma.tenant.findMany({
        include: {
            users: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
            {/* Navbar */}
            <nav className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                                <Building2 className="h-6 w-6 text-emerald-400" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">IT4You <span className="text-emerald-500 font-light">Director</span></span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-neutral-400">
                                Logged in as <span className="text-emerald-400 font-medium">{session.user?.email}</span>
                            </div>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white">Empresas Cadastradas</h1>
                        <p className="text-neutral-400 mt-1">Gerencie os inquilinos e seus tokens do ERP.</p>
                    </div>
                    <div>
                        <Link
                            href="/superadmin/tenants/new"
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-600/20 border border-emerald-500"
                        >
                            <PlusCircle className="h-5 w-5" />
                            Nova Empresa
                        </Link>
                    </div>
                </div>

                {/* Botão de Teste de Banco de Dados */}
                <TestDbButton />

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-neutral-400">Total de Empresas</p>
                                <p className="text-4xl font-bold text-white mt-2">{tenants.length}</p>
                            </div>
                            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                                <Building2 className="h-6 w-6 text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-neutral-400">Total de Usuários</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {tenants.reduce((acc, t) => acc + t.users.length, 0)}
                                </p>
                            </div>
                            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20">
                                <Users className="h-6 w-6 text-blue-400" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-neutral-400">Consultas Feitas</p>
                                <p className="text-4xl font-bold text-white mt-2">
                                    {tenants.reduce((acc, t) => acc + t.users.reduce((uAcc, u) => uAcc + u.queryCount, 0), 0)}
                                </p>
                            </div>
                            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                                <Receipt className="h-6 w-6 text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tenants List */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="px-6 py-5 border-b border-neutral-800">
                        <h3 className="text-lg font-semibold text-white">Lista de Inquilinos</h3>
                    </div>

                    {tenants.length === 0 ? (
                        <div className="p-12 text-center">
                            <Building2 className="h-12 w-12 text-neutral-700 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-neutral-300">Nenhuma empresa encontrada</h3>
                            <p className="text-neutral-500 mt-1">Comece adicionando a primeira empresa no sistema.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-neutral-950/50 text-neutral-400 uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Empresa</th>
                                        <th className="px-6 py-4 font-semibold">CNPJ</th>
                                        <th className="px-6 py-4 font-semibold">Usuários</th>
                                        <th className="px-6 py-4 font-semibold">Status Tokens</th>
                                        <th className="px-6 py-4 font-semibold text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-800">
                                    {tenants.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-neutral-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{tenant.name}</div>
                                                <div className="text-neutral-500 text-xs mt-0.5">Criada em {tenant.createdAt.toLocaleDateString("pt-BR")}</div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-300 font-mono text-xs">
                                                {tenant.cnpj}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-neutral-500" />
                                                    <span className="text-neutral-300">{tenant.users.length}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tenant.iaToken ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        IA Token
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${tenant.erpToken ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                                        ERP Token
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/superadmin/tenants/${tenant.id}`}
                                                    className="inline-flex items-center text-emerald-500 hover:text-emerald-400 text-sm font-medium transition-colors"
                                                >
                                                    Detalhes & Usuários
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
