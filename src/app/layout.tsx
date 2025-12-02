"use client";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useEffect } from 'react';
import { ProjectProvider } from "@/components/providers/project-provider";
import { ToastLiteProvider } from "@/components/ui/toast-lite";
import Link from "next/link";
import { PanelsTopLeft, Calendar } from "lucide-react";
import { initSentry } from "@/lib/sentry";

// Initialize Sentry
if (typeof window !== 'undefined') {
  initSentry();
}

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProjectProvider>
            <ToastLiteProvider>
              {children}
              {/* Global Return to Projetos and Events buttons */}
              <div className="fixed bottom-4 left-4 z-[60] flex items-center gap-2">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground shadow hover:opacity-90"
                  aria-label="Voltar aos Projetos"
                  title="Voltar aos Projetos"
                >
                  <PanelsTopLeft className="w-4 h-4" />
                  <span className="text-sm">Projetos</span>
                </Link>
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground shadow hover:opacity-90"
                  aria-label="Ver Eventos"
                  title="Ver Eventos"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Eventos</span>
                </Link>
              </div>
            </ToastLiteProvider>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
