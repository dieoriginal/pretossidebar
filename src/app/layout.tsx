"use client";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useEffect } from 'react';

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
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
