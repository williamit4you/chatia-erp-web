"use client";

import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function buildSalesBudgetChartHref(chartId: string, returnTo?: string | null) {
  const params = new URLSearchParams();
  if (returnTo) {
    params.set("returnTo", returnTo);
  }

  const query = params.toString();
  return `/chat/sales-budget-analytics/${chartId}${query ? `?${query}` : ""}`;
}

export function getSafeSalesBudgetReturnPath(returnTo?: string | null) {
  if (!returnTo || !returnTo.startsWith("/chat/sales-budget-analytics")) {
    return "/chat/sales-budget-analytics";
  }

  return returnTo;
}

export function useSalesBudgetDashboardReturnTo() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useMemo(() => {
    const query = searchParams?.toString() ?? "";
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);
}
