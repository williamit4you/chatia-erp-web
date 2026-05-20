import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT4You AI ERP",
  description: "Intelligent ERP Assistant",
  icons: {
    icon: [
      { url: '/logo.png?v=5', type: 'image/png' },
      { url: '/vercel.svg?v=5', type: 'image/svg+xml' },
    ],
    shortcut: '/logo.png?v=5',
    apple: '/logo.png?v=5',
  },
};

import { Toaster } from 'sonner';
import SessionModal from "@/components/SessionModal";
import AuthProvider from "@/components/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
          <SessionModal />
        </AuthProvider>
      </body>
    </html>
  );
}
