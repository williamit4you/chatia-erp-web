import Link from "next/link";
import { ArrowRight, BarChart3, Database, MessageSquareText, ShieldCheck } from "lucide-react";

const previewCards = [
  {
    question: "Qual o lucro do mês?",
    title: "Financeiro overview",
    leftValue: "R$ 820.400",
    rightValue: "R$ 260.400",
    detail: "+ 18%",
    bars: [52, 68, 86],
    footer: ["Receita", "Custos", "Lucro"],
  },
  {
    question: "Quais clientes inadimplentes?",
    title: "Clientes inadimplentes",
    leftValue: "Cliente A",
    rightValue: "R$ 95.210",
    detail: "Total R$ 233.530",
    bars: [40, 72, 28, 84, 56, 62, 48, 74],
    footer: ["Cliente A", "Cliente B", "Cliente C"],
  },
  {
    question: "Quais produtos têm mais saída?",
    title: "Produtos com mais saída",
    leftValue: "R$ 120.430",
    rightValue: "R$ 89.120",
    detail: "R$ 60.320",
    bars: [72, 24, 18, 50],
    footer: ["Produto A", "Produto B", "Produto C"],
  },
];

const valueProps = [
  {
    icon: MessageSquareText,
    title: "Pergunte o que quiser",
    description:
      'Faça perguntas como "Qual foi o lucro de ontem?" ou "Temos peças X em estoque?" e receba respostas instantâneas com contexto.',
  },
  {
    icon: Database,
    title: "Conectado ao seu ERP",
    description:
      "Acesse dados em tempo real sem planilhas paralelas ou integrações complexas. A IA trabalha direto sobre a base do seu ERP.",
  },
  {
    icon: ShieldCheck,
    title: "Confiável e seguro",
    description:
      "Cada empresa enxerga apenas os próprios dados, com isolamento entre ambientes e governança adequada para uso corporativo.",
  },
];

function PreviewCard({
  question,
  title,
  leftValue,
  rightValue,
  detail,
  bars,
  footer,
}: (typeof previewCards)[number]) {
  return (
    <div className="rounded-[30px] border border-white/70 bg-white/75 p-4 shadow-[0_25px_70px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl">
      <div className="mb-4 inline-flex w-full items-center gap-2 rounded-2xl bg-slate-50/90 px-4 py-3 text-sm font-semibold text-slate-700">
        <MessageSquareText className="h-4 w-4 text-sky-600" />
        {question}
      </div>

      <div className="rounded-[24px] bg-[linear-gradient(180deg,#243552,#1c2741)] p-4 text-white shadow-inner">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-white/75">{title}</div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{leftValue}</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-emerald-300">{rightValue}</div>
            <div className="mt-2 text-sm font-medium text-emerald-200">{detail}</div>
          </div>
        </div>

        <div className="mt-5 flex h-28 items-end gap-2">
          {bars.map((bar, index) => (
            <div
              key={`${title}-${index}`}
              className="flex-1 rounded-t-xl bg-gradient-to-t from-sky-500 via-cyan-400 to-emerald-300 shadow-[0_0_20px_rgba(45,212,191,0.2)]"
              style={{ height: `${bar}%` }}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-between gap-2 text-xs font-medium text-white/70">
          {footer.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,rgba(245,214,170,0.35),transparent_24%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.18),transparent_18%),linear-gradient(180deg,#faf8f3_0%,#edf4fb_55%,#f8fbfd_100%)] text-slate-900">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.95),transparent_26%)]" />

      <header className="sticky top-0 z-40 border-b border-white/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/it4you-landing-logo.jpeg"
              alt="IT4You"
              className="h-12 w-auto rounded-md object-contain sm:h-14"
            />
          </div>

          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-2xl border border-teal-100 bg-[linear-gradient(135deg,#effcf9,#dff6f2)] px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition hover:border-teal-200 hover:bg-[linear-gradient(135deg,#e5fbf6,#d1f4ec)]"
          >
            Login
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-7xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <section className="relative overflow-hidden rounded-[38px] border border-white/70 bg-white/40 px-6 py-10 shadow-[0_30px_120px_-65px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_38%),linear-gradient(90deg,rgba(255,255,255,0.35),rgba(255,255,255,0.1))]" />

          <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,480px)] lg:items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-700 shadow-sm">
                <BarChart3 className="h-3.5 w-3.5" />
                Analista conversacional do ERP
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-5xl lg:text-[4.15rem]">
                Converse com seu <span className="bg-[linear-gradient(135deg,#264a91,#3c74c9)] bg-clip-text text-transparent">analista de IA</span> e descubra
                <span className="bg-[linear-gradient(135deg,#0f766e,#1d9c92)] bg-clip-text text-transparent"> insights do seu ERP</span> em segundos.
              </h1>

              <p className="mx-auto mt-6 max-w-4xl text-lg leading-8 text-slate-600 sm:text-xl lg:mx-0 lg:max-w-3xl">
                Pergunte como “qual o lucro do mês?” ou “quais clientes ainda estão devendo?” e receba respostas instantâneas com visão executiva, gráficos claros e contexto de negócio.
              </p>

              <div className="mt-8">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-[linear-gradient(135deg,#0e6f74,#178f88)] px-8 py-4 text-lg font-bold text-white shadow-[0_22px_40px_-18px_rgba(15,118,110,0.7)] transition hover:translate-y-[-1px] hover:shadow-[0_26px_50px_-18px_rgba(15,118,110,0.78)]"
                >
                  Login
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[430px]">
              <div className="absolute inset-x-6 top-8 h-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.26),rgba(255,255,255,0)_72%)] blur-2xl" />
              <div className="relative overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(236,246,255,0.52))] p-4 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)]">
                <img
                  src="/mia-avatar.jpeg"
                  alt="MIA"
                  className="mx-auto aspect-[4/5] w-full rounded-[28px] object-cover object-top"
                />

                <div className="absolute bottom-8 left-1/2 w-[82%] -translate-x-1/2 rounded-[24px] border border-cyan-300/45 bg-[linear-gradient(180deg,rgba(13,25,45,0.92),rgba(20,43,79,0.86))] p-4 text-white shadow-[0_18px_45px_-20px_rgba(34,211,238,0.45)]">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">IT4You AI</span>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-cyan-100">Live</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[72, 46, 84, 58].map((bar, index) => (
                      <div key={index} className="flex h-20 items-end rounded-xl bg-white/5 p-1.5">
                        <div
                          className="w-full rounded-lg bg-gradient-to-t from-cyan-400 to-emerald-300"
                          style={{ height: `${bar}%` }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-white/70">Saldo previsto</span>
                    <span className="font-bold text-emerald-300">R$ 820.400</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-12 grid gap-5 xl:grid-cols-3">
            {previewCards.map((card) => (
              <PreviewCard key={card.title} {...card} />
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {valueProps.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[30px] border border-white/70 bg-white/65 p-7 shadow-[0_25px_80px_-55px_rgba(15,23,42,0.45)] backdrop-blur-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#eef8ff,#eafbf5)] text-sky-700 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900">{item.title}</h2>
                <p className="mt-4 text-lg leading-8 text-slate-600">{item.description}</p>
              </article>
            );
          })}
        </section>
      </main>
    </div>
  );
}
