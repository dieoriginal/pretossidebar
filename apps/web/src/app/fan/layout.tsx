"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { FeatButton } from "@/components/public/FeatButton";

export default function FanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Music className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">PRETOS MUSIC</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/fan/singles">
              <Button variant="ghost">Singles</Button>
            </Link>
            <Link href="/fan/events">
              <Button variant="ghost">Eventos</Button>
            </Link>
            <Link href="/fan/merch">
              <Button variant="ghost">Merch</Button>
            </Link>
            <FeatButton />
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-auto">
        <div className="container py-8">
          <div className="text-center text-sm text-muted-foreground">
            © 2025 PRETOS MUSIC. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
