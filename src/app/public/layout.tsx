import "@/app/globals.css";
import React from "react";

export const metadata = {
  title: "Die Pretty — Work In Progress",
  description: "Acompanhe o progresso dos projetos em tempo real",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body>
        <div className="min-h-screen bg-background text-foreground">
          <header className="border-b">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <a href="/public" className="text-lg font-semibold">Diepretty Mercédes</a>
              <nav className="text-sm text-muted-foreground flex gap-4">
                <a className="hover:underline" href="/public">Progresso</a>
                <a className="hover:underline" href="/public/singles">Singles</a>
                <a className="hover:underline" href="/public/concerts">Concertos</a>
                <a className="hover:underline" href="/public/merch">Merch</a>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
          <footer className="border-t">
            <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">
              © {new Date().getFullYear()} PRETOS MUSIC
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
