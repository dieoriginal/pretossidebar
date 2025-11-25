"use client";

import { useEffect } from "react";
import { useProject } from "@/hooks/use-project";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const project = useProject((s) => s.project);
  const setProject = useProject((s) => s.setProject);
  const loadLocal = useProject((s) => s.loadLocal);

  // Estado do projeto já é rehidratado pelo persist do zustand (localStorage).
  // Evita chamar IndexedDB com um ID inválido.

  // Broadcast to other tabs (so state is shared cross-routes/tabs)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = (e: StorageEvent) => {
      if (e.key === "projetoAtual" && e.newValue) {
        // Don't override the current project while actively editing on /obraeurudita in this tab
        try {
          if (document.hasFocus() && window.location.pathname.startsWith("/obraeurudita")) {
            return;
          }
        } catch {}
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed?.state?.project) {
            setProject(parsed.state.project);
          } else if (parsed?.project) {
            setProject(parsed.project);
          } else {
            // accept legacy shape: assume object is a ProjectState
            setProject(parsed);
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, [setProject]);

  return <>{children}</>;
}
