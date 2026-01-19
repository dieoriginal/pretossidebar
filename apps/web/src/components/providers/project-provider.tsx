"use client";

import { useEffect, useRef } from "react";
import { useProject } from "@/hooks/use-project";
import { saveProjectToIndexedDB } from "@/lib/db";
import { getCurrentUserId } from "@/lib/firebase";

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const project = useProject((s) => s.project);
  const setProject = useProject((s) => s.setProject);
  const loadLocal = useProject((s) => s.loadLocal);
  const hasUnsavedChangesRef = useRef(false);

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

  // Proteção beforeunload - força salvamento antes de fechar
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (!project || !hasUnsavedChangesRef.current) return;

      // Forçar salvamento síncrono no localStorage (última linha de defesa)
      try {
        const projectData = {
          ...project,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('projetoAtual_backup', JSON.stringify(projectData));
        
        // Tentar salvar no IndexedDB (pode ser assíncrono, mas tentamos)
        try {
          await saveProjectToIndexedDB(projectData);
        } catch (err) {
          // Se falhar, localStorage já tem backup
          console.warn('Erro ao salvar no IndexedDB antes de fechar:', err);
        }
      } catch (err) {
        console.error('Erro ao salvar backup antes de fechar:', err);
      }

      // Alguns navegadores ignoram mensagens customizadas, mas ainda mostram alerta
      e.preventDefault();
      e.returnValue = 'Tens alterações não guardadas. Desejas realmente sair?';
      return e.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [project]);

  // Monitorar mudanças no projeto para marcar como não salvo
  useEffect(() => {
    if (project) {
      hasUnsavedChangesRef.current = true;
      
      // Reset após um tempo (assumindo que auto-save já salvou)
      const timeout = setTimeout(() => {
        hasUnsavedChangesRef.current = false;
      }, 3000); // 3 segundos após última mudança

      return () => clearTimeout(timeout);
    }
  }, [project]);

  // Salvar quando a página perder foco (visibilitychange)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = async () => {
      if (document.hidden && project && hasUnsavedChangesRef.current) {
        try {
          // Salvar imediatamente quando a página perde foco
          await saveProjectToIndexedDB(project);
          
          // Tentar sincronizar com nuvem se usuário autenticado
          const userId = getCurrentUserId();
          if (userId) {
            // Importação dinâmica para evitar circular dependency
            const { syncProjectToCloud } = await import('@/lib/supabase');
            try {
              await syncProjectToCloud(userId, project);
            } catch (err) {
              // Falha silenciosa - IndexedDB já tem os dados
              console.warn('Erro ao sincronizar com nuvem:', err);
            }
          }
          
          hasUnsavedChangesRef.current = false;
        } catch (err) {
          console.error('Erro ao salvar quando página perdeu foco:', err);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [project]);

  return <>{children}</>;
}
