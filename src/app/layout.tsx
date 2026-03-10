import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
          <SessionModal />
        </AuthProvider>
      </body>
    </html>
  );
}
