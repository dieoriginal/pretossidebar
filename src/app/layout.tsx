"use client";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
// Clerk: wrap the app with ClerkProvider (requires @clerk/nextjs)
import { ClerkProvider } from "@clerk/nextjs";
import { useEffect } from 'react';
import { ProjectProvider } from "@/components/providers/project-provider";
import { ToastLiteProvider } from "@/components/ui/toast-lite";
import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('SW Registered'))
        .catch(console.error);
    }
  }, []);

  return (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${GeistSans.className} app-zoom-80`}>
        <ClerkProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ProjectProvider>
              <ToastLiteProvider>
                {children}
                {/* Global Return to Projetos button */}
                <Link
                  href="/"
                  className="fixed bottom-4 left-4 z-[60] inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground shadow hover:opacity-90"
                  aria-label="Voltar aos Projetos"
                  title="Voltar aos Projetos"
                >
                  <PanelsTopLeft className="w-4 h-4" />
                  <span className="text-sm">Projetos</span>
                </Link>
              </ToastLiteProvider>
            </ProjectProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
