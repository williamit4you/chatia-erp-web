"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface SidebarContextType {
    isOpen: boolean;
    isCollapsed: boolean;
    isDesktop: boolean;
    setIsOpen: (open: boolean) => void;
    setIsCollapsed: (collapsed: boolean) => void;
    toggleSidebar: () => void;
    closeSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isOpen: false,
    isCollapsed: true,
    isDesktop: false,
    setIsOpen: () => { },
    setIsCollapsed: () => { },
    toggleSidebar: () => { },
    closeSidebar: () => { },
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [isDesktop, setIsDesktop] = useState(false);

    useEffect(() => {
        const syncViewport = () => {
            setIsDesktop(window.innerWidth >= 768);
        };

        syncViewport();
        window.addEventListener("resize", syncViewport);
        return () => window.removeEventListener("resize", syncViewport);
    }, []);

    const toggleSidebar = () => {
        if (isDesktop) {
            setIsCollapsed((previous) => !previous);
            return;
        }

        setIsOpen((previous) => !previous);
    };

    const closeSidebar = () => {
        if (!isDesktop) {
            setIsOpen(false);
        }
    };

    return (
        <SidebarContext.Provider
            value={{
                isOpen,
                isCollapsed,
                isDesktop,
                setIsOpen,
                setIsCollapsed,
                toggleSidebar,
                closeSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export const useSidebar = () => useContext(SidebarContext);
