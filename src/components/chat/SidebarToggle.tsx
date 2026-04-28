"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function SidebarToggle() {
    const { toggleSidebar, isOpen, isCollapsed } = useSidebar();

    return (
        <button
            onClick={toggleSidebar}
            className="rounded-xl border border-neutral-200 bg-white p-2 text-neutral-600 shadow-sm transition hover:text-neutral-900 focus:outline-none md:hidden"
            title={isOpen || !isCollapsed ? "Recolher menu" : "Expandir menu"}
        >
            <Menu className="h-5 w-5 md:hidden" />
            {isCollapsed ? (
                <PanelLeftOpen className="hidden h-5 w-5 md:block" />
            ) : (
                <PanelLeftClose className="hidden h-5 w-5 md:block" />
            )}
        </button>
    );
}
