import Link from "next/link";
import { Bot, MessageSquare, Database, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-200">
      {/* Navigation */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-500 rounded p-1.5 shadow-sm">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-neutral-900">IT4You</span>
              <span className="font-light text-neutral-500">AI ERP</span>
            </div>
            <div className="flex gap-4 items-center">
              <Link href="/login" className="text-sm font-medium text-neutral-600 hover:text-emerald-600 transition-colors">
                Login Colaborador
              </Link>
              <Link href="/login?callbackUrl=/admin" className="text-sm font-medium bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
                Gestão da Empresa
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-neutral-900 mb-6 leading-tight">
            Seu ERP, agora <span className="text-emerald-600">inteligente</span> e <span className="text-emerald-600">conversacional</span>.
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-10 leading-relaxed">
            O IT4You AI ERP Assistant integra de forma nativa a inteligência artificial do Google Gemini às suas operações empresariais. Converse com os seus dados, descubra faturamentos e preveja resultados como se estivesse batendo um papo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full font-semibold transition-all shadow-lg shadow-emerald-600/20"
            >
              Acessar Meu ERP <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 hover:-translate-y-1 transition-transform">
            <div className="bg-blue-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900">Pergunte o que quiser</h3>
            <p className="text-neutral-600 leading-relaxed">
              &quot;Qual foi o lucro de hoje?&quot; ou &quot;Temos peças X no estoque?&quot;. A IA interpreta a pergunta, busca a informação e te responde naturalmente.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 hover:-translate-y-1 transition-transform">
            <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Database className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900">Integração Transparente</h3>
            <p className="text-neutral-600 leading-relaxed">
              Cada empresa (tenant) conecta o seu próprio motor do banco de dados (ERP Token) e utiliza sua cota da API (Model Token) de forma separada.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 hover:-translate-y-1 transition-transform">
            <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-neutral-900">Isolamento Seguro</h3>
            <p className="text-neutral-600 leading-relaxed">
              Sistema multi-inquilino avançado que garante que os dados de uma empresa jamais interajam com a base de conhecimento de outra.
            </p>
          </div>
        </div>

        {/* Try it out / Footer simulation */}
        <div className="mt-32 pb-10 text-center border-t border-neutral-200 pt-10">
          <p className="text-neutral-500 text-sm flex items-center justify-center gap-1">
            <Zap className="h-4 w-4 text-emerald-500" /> Powered by Gemini & Next.js 14
          </p>
        </div>
      </main>
    </div>
  );
}
