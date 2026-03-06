"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { superAdminService } from "@/services/superadmin.service";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        cnpj: "",
        companyName: "",
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await superAdminService.createTenant(formData);

            if (data) {
                toast.success("Cadastro efetuado com sucesso! Redirecionando...");
                setFormData({ cnpj: "", companyName: "", name: "", email: "", password: "" });
                setTimeout(() => {
                    router.push("/superadmin?registered=true");
                }, 2000);
            }
        } catch (err: any) {
            console.error("Registration error:", err);
            let msg = "Failed to register";
            if (err.response?.data?.message) {
                msg = err.response.data.message;
            } else if (err.response?.data) {
                msg = typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data);
            } else if (err.message) {
                msg = err.message;
            }
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 tracking-tight">
                    Crie a conta da sua Empresa
                </h2>
                <p className="mt-2 text-center text-sm text-neutral-600">
                    <Link href="/superadmin" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors duration-200">
                        &larr; Voltar para o Painel Administrativo
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-neutral-200/50 sm:rounded-2xl sm:px-10 border border-neutral-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700">CNPJ</label>
                            <div className="mt-1">
                                <input
                                    name="cnpj"
                                    type="text"
                                    required
                                    placeholder="00.000.000/0000-00"
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    value={formData.cnpj}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700">Nome da Empresa</label>
                            <div className="mt-1">
                                <input
                                    name="companyName"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="border-t border-neutral-100 pt-6 mt-6">
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">Dados do Administrador</h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">Seu Nome</label>
                                    <div className="mt-1">
                                        <input
                                            name="name"
                                            type="text"
                                            required
                                            className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">Email Corporativo</label>
                                    <div className="mt-1">
                                        <input
                                            name="email"
                                            type="email"
                                            required
                                            className="appearance-none block w-full px-4 py-3 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700">Senha</label>
                                    <div className="mt-1 relative">
                                        <input
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            className="appearance-none block w-full px-4 py-3 pr-12 border border-neutral-200 rounded-xl shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-emerald-500 transition-colors"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" aria-hidden="true" />
                                            ) : (
                                                <Eye className="h-5 w-5" aria-hidden="true" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                            >
                                {loading ? "Cadastrando..." : "Cadastrar Empresa"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
