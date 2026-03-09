import { GeistSans } from "geist/font/sans";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ProjectProvider } from "@/components/providers/project-provider";
import { ToastLiteProvider } from "@/components/ui/toast-lite";
import { ZoomControls } from "@/components/ZoomControls";
import { GlobalAudioPlayer } from "@/components/GlobalAudioPlayer";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt" suppressHydrationWarning>
        <body className={GeistSans.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <ProjectProvider>
              <ToastLiteProvider>
                <ServiceWorkerRegister />
                {children}
                <GlobalAudioPlayer />
                <ZoomControls />
              </ToastLiteProvider>
            </ProjectProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
