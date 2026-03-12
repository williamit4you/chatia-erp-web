import { TopAccount } from "@/services/finance-analytics.service";
import { AlertCircle, Target } from "lucide-react";

interface TopAccountsListProps {
    data: TopAccount[];
    isLoading: boolean;
    title: string;
    iconColor?: string;
    valueColor?: string;
}

export default function TopAccountsList({ data, isLoading, title, iconColor = "text-red-500", valueColor = "text-red-600" }: TopAccountsListProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 animate-pulse min-h-[300px]">
                <div className="h-6 w-1/3 bg-neutral-200 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="h-10 bg-neutral-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 pb-3">
                <Target className={`w-5 h-5 ${iconColor}`} />
                <h3 className="text-lg font-bold text-neutral-800">{title}</h3>
            </div>

            {data.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm py-10">
                    Nenhum registro encontrado.
                </div>
            ) : (
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-neutral-600">
                        <thead className="bg-neutral-50 text-neutral-700">
                            <tr>
                                <th className="px-4 py-2 font-medium rounded-l-lg">Documento / Beneficiário</th>
                                <th className="px-4 py-2 font-medium text-right rounded-r-lg">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((acc, idx) => (
                                <tr key={idx} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-neutral-800 truncate max-w-[150px]">{acc.documento}</td>
                                    <td className={`px-4 py-3 text-right font-bold ${valueColor}`}>{formatCurrency(acc.valor)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
