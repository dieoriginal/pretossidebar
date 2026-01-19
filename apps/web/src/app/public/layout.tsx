import "@/app/globals.css";
import React from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PublicNavbar } from "@/components/public/navbar";
import { PublicFooter } from "@/components/public/footer";

export const metadata = {
  title: "Die Pretty — Work In Progress",
  description: "Acompanhe o progresso dos projetos em tempo real",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-background text-foreground relative flex flex-col">
            <PublicNavbar />
            <main className="container mx-auto px-4 py-8 flex-1">
              {children}
            </main>
            <PublicFooter />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
