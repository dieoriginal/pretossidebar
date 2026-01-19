"use client";

import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { useEffect } from 'react';
import { ProjectProvider } from "@/components/providers/project-provider";
import { ToastLiteProvider } from "@/components/ui/toast-lite";
import { initSentry } from "@/lib/sentry";
import { FloatingNavbar } from "@/components/global/floating-navbar";
import { FloatingFooter } from "@/components/global/floating-footer";
import { ViewportSelector } from "@/components/global/viewport-selector";

// Initialize Sentry
if (typeof window !== 'undefined') {
  initSentry();
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured =
    typeof clerkPublishableKey === "string" &&
    /^pk_(test|live)_[A-Za-z0-9]+$/.test(clerkPublishableKey) &&
    !clerkPublishableKey.includes("XXXX") &&
    !clerkPublishableKey.includes("xxxx");

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => console.log('SW Registered'))
        .catch(console.error);
    }
  }, []);

  const content = (
    <html lang="pt" suppressHydrationWarning>
      <body className={`${GeistSans.className} app-zoom-80`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ProjectProvider>
            <ToastLiteProvider>
              <FloatingNavbar />
              {children}
              <FloatingFooter />
              <ViewportSelector />
            </ToastLiteProvider>
          </ProjectProvider>
        </ThemeProvider>
      </body>
    </html>
  );

  // Se a key for inválida/placeholder, não inicializa Clerk (evita crash no build).
  if (!isClerkConfigured) return content;

  return <ClerkProvider publishableKey={clerkPublishableKey}>{content}</ClerkProvider>;
}
