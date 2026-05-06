"use client";

import { createContext, useContext } from "react";
import type { ChartSelection } from "@/services/finance-analytics.service";

type DrilldownSelectHandler = (selection: ChartSelection) => void;

const DrilldownContext = createContext<DrilldownSelectHandler | null>(null);

export function DrilldownProvider({ value, children }: { value: DrilldownSelectHandler; children: React.ReactNode }) {
    return <DrilldownContext.Provider value={value}>{children}</DrilldownContext.Provider>;
}

export function useDrilldownSelect() {
    return useContext(DrilldownContext);
}

