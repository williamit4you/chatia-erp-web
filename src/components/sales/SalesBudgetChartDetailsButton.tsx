"use client";

import { BookOpenText } from "lucide-react";

export default function SalesBudgetChartDetailsButton({
  onClick,
  title = "Entender este gráfico",
}: {
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
      title={title}
    >
      <BookOpenText className="h-4 w-4" />
    </button>
  );
}
