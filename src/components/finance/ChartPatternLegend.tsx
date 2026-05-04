import {
    BarChart3,
    CheckCircle2,
    CircleGauge,
    Info,
    LineChart,
    Map,
    PieChart,
} from "lucide-react";

const colors = [
    { label: "Entradas / Receitas (Positivo)", className: "bg-green-500" },
    { label: "Despesas / Pagamentos (Negativo)", className: "bg-orange-500" },
    { label: "Saldo / Liquido / Neutro", className: "bg-slate-500" },
    { label: "Atencao / Risco / Atrasos", className: "bg-yellow-500" },
    { label: "Informacao / Comparacao", className: "bg-blue-500" },
];

const chartTypes = [
    { icon: LineChart, text: "Linha: evolucao temporal (fluxo, saldo, evolucao)" },
    { icon: BarChart3, text: "Coluna/Barra: comparacoes entre categorias" },
    { icon: BarChart3, text: "Barra horizontal: rankings (top 10, fornecedor/cliente)" },
    { icon: PieChart, text: "Pizza/Doughnut: participacao no total, com poucas fatias" },
    { icon: Map, text: "Mapa: distribuicao geografica (UF)" },
    { icon: CircleGauge, text: "Gauge/Indicador: KPIs com meta ou faixa de desempenho" },
];

const practices = [
    "Evite pizza com muitas fatias (+6).",
    "Use barras ordenadas quando comparar valores.",
    "Destaque valores negativos em vermelho/laranja.",
    "Mostre variacoes sempre que possivel.",
    "Permita filtros por periodo, empresa, cliente e fornecedor.",
];

export default function ChartPatternLegend() {
    return (
        <section className="rounded-xl border border-neutral-200 bg-white shadow-sm">
            <div className="border-b border-neutral-100 px-4 py-3">
                <h2 className="text-sm font-black uppercase tracking-tight text-blue-950">
                    Padrao de cores e tipos de grafico
                </h2>
            </div>
            <div className="grid gap-0 divide-y divide-neutral-100 lg:grid-cols-[1fr_1.7fr_1.7fr] lg:divide-x lg:divide-y-0">
                <div className="p-4">
                    <h3 className="mb-3 text-xs font-black uppercase text-blue-950">Cores</h3>
                    <div className="space-y-2">
                        {colors.map((item) => (
                            <div key={item.label} className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                                <span className={`h-4 w-4 rounded-full ${item.className}`} />
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="mb-3 text-xs font-black uppercase text-blue-950">Tipos recomendados</h3>
                    <div className="space-y-2">
                        {chartTypes.map((item) => (
                            <div key={item.text} className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                                <item.icon className="h-4 w-4 shrink-0 text-blue-600" />
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    <h3 className="mb-3 text-xs font-black uppercase text-blue-950">Boas praticas</h3>
                    <div className="space-y-2">
                        {practices.map((item) => (
                            <div key={item} className="flex items-center gap-2 text-xs font-bold text-neutral-700">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                                <span>{item}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-800">
                        <Info className="h-4 w-4 shrink-0" />
                        Todos os graficos devem permitir analise, comparacao e leitura por modulo financeiro.
                    </div>
                </div>
            </div>
        </section>
    );
}

