import { FinanceSummary } from "@/services/finance-analytics.service";
import { ArrowDownRight, ArrowUpRight, DollarSign, Wallet } from "lucide-react";

interface FinanceSummaryCardsProps {
    data: FinanceSummary | null;
    isLoading: boolean;
}

export default function FinanceSummaryCards({ data, isLoading }: FinanceSummaryCardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-neutral-100 shadow-sm animate-pulse h-28"></div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Contas a Pagar",
            value: data.totalContasPagarAberto,
            icon: ArrowDownRight,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            borderColor: "border-orange-200"
        },
        {
            title: "Contas a Receber",
            value: data.totalContasReceberAberto,
            icon: ArrowUpRight,
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            borderColor: "border-emerald-200"
        },
        {
            title: "Total Pago",
            value: data.totalPago,
            icon: Wallet,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
            borderColor: "border-orange-200"
        },
        {
            title: "Total Recebido",
            value: data.totalRecebido,
            icon: DollarSign,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            borderColor: "border-blue-200"
        },
        {
            title: "Saldo Projetado",
            value: data.saldoProjetado,
            icon: DollarSign,
            color: data.saldoProjetado >= 0 ? "text-emerald-600" : "text-red-600",
            bgColor: data.saldoProjetado >= 0 ? "bg-emerald-100" : "bg-red-100",
            borderColor: data.saldoProjetado >= 0 ? "border-emerald-200" : "border-red-200"
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 2xl:grid-cols-5 gap-4 mb-6">
            {cards.map((card, idx) => (
                <div
                    key={idx}
                    className={`bg-white p-4 rounded-xl border border-neutral-100 shadow-sm flex items-center justify-between gap-2 overflow-hidden
                        ${idx < 2 ? 'lg:col-span-3 2xl:col-span-1' : 'lg:col-span-2 2xl:col-span-1'}
                        sm:col-span-1
                    `}
                >
                    <div className="flex-col overflow-hidden w-full">
                        <p className="text-xs sm:text-sm text-neutral-500 font-medium mb-1 truncate" title={card.title}>{card.title}</p>
                        <h3 className={`text-base sm:text-lg lg:text-xl font-bold truncate ${card.color}`} title={formatCurrency(card.value)}>
                            {formatCurrency(card.value)}
                        </h3>
                    </div>
                    <div className={`p-2 lg:p-3 rounded-full shrink-0 ${card.bgColor} ${card.color}`}>
                        <card.icon className="w-5 h-5 2xl:w-6 2xl:h-6" />
                    </div>
                </div>
            ))}
        </div>
    );
}
