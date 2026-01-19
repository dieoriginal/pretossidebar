"use client";

export function FloatingFooter() {
  return (
    <footer className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto">
      <div className="px-4 py-2 rounded-full bg-background/95 backdrop-blur-md border shadow-lg supports-[backdrop-filter]:bg-background/60">
        <p className="text-xs text-muted-foreground whitespace-nowrap">
          © PRETOS MUSIC 2025
        </p>
      </div>
    </footer>
  );
}




