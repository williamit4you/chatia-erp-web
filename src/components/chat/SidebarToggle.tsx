"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./SidebarContext";

export default function SidebarToggle() {
    const { setIsOpen, isOpen } = useSidebar();

    return (
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 -ml-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
            title="Abrir Menu"
        >
            <Menu className="h-6 w-6" />
        </button>
    );
}
