"use client";

import Link from "next/link";
import { PanelsTopLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Progress } from "@/components/ui/progress";
import { useProject } from "@/hooks/use-project";
import { getAllProjectsFromIndexedDB, saveProjectToIndexedDB, deleteProjectFromIndexedDB } from "@/lib/db";
import { TOTAL_STEPS, steps } from "@/lib/steps";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProjectState } from "@/hooks/use-project";
import { createEmptyProject } from "@/hooks/use-project";
import { Sidebar } from "@/components/admin-panel/sidebar";

type ProjectSummary = ProjectState & { progress: number };

function computeProgress(p: ProjectState): number {
  // Progresso = (passo atual + 1) / total
  const current = typeof p.currentStep === 'number' ? p.currentStep : 0;
  const total = TOTAL_STEPS;
  const progress = Math.round(((current + 1) / total) * 100);
  return progress;
}

export default function HomePage() {
  const router = useRouter();
  const setProject = useProject((s) => s.setProject);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [sortBy, setSortBy] = useState<'updated' | 'progress' | 'title'>('updated');
  const [filterAudio, setFilterAudio] = useState<'all' | 'with' | 'without'>('all');
  const [toast, setToast] = useState<{ msg: string; kind?: "success" | "error" } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const list = (await getAllProjectsFromIndexedDB()) as ProjectState[];
        const withProgress = (list ?? []).map((p) => ({ ...p, progress: computeProgress(p) }));
        setProjects(withProgress);
      } catch (e) {
        setProjects([]);
      }
    })();
  }, []);

  const createNewSingle = async () => {
    const id = `single-${Date.now()}`;
    const fresh = createEmptyProject(id);
    fresh.id = id;
    fresh.totalSteps = TOTAL_STEPS;
    await saveProjectToIndexedDB(fresh);
    setProject(fresh);
    setToast({ msg: "Novo single criado", kind: "success" });
    router.push(`/obraeurudita`);
  };

  const duplicateSingle = async (p: ProjectState) => {
    const copy: ProjectState = { ...p, id: `single-${Date.now()}`, updatedAt: new Date().toISOString() };
    await saveProjectToIndexedDB(copy);
    setProjects((prev) => [{ ...copy, progress: computeProgress(copy) }, ...prev]);
    setToast({ msg: "Projeto duplicado", kind: "success" });
  };

  const deleteSingle = async (id: string) => {
    await deleteProjectFromIndexedDB(id);
    setProjects((prev) => prev.filter((x) => x.id !== id));
    setToast({ msg: "Projeto eliminado", kind: "success" });
  };
  return (
    <div className="flex flex-col min-h-screen lg:pl-96 pl-[90px]">
      {/* Sidebar only on Dashboard */}
      <Sidebar />
      <header className="z-[50] sticky top-0 w-full bg-background/95 border-b backdrop-blur-sm dark:bg-black/[0.6] border-border/40">
        
        <div className="container h-14 flex items-center">
          
          <Link
            href="/"
            className="flex justify-start items-center hover:opacity-85 transition-opacity duration-300"
          >
            <PanelsTopLeft className="w-6 h-6 mr-3" />
            <span className="font-bold">PRETOS MUSIC</span>
   
          </Link>




          <nav className="ml-auto flex items-center gap-2">
            <Button onClick={createNewSingle} className="mr-2">Novo Single</Button>
            <ModeToggle />
          </nav>
        </div>
      </header>



      <main className="min-h-[calc(100vh-57px-97px)] flex-1">
        <div className="container py-8">
          <h2 className="text-2xl font-bold mb-4">BACKLOG</h2>

          {/* Process Manager Integration */}
          <div className="mb-8">
            
            
          </div>
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <label className="text-sm">Ordenar por:</label>
            <select className="border rounded px-2 py-1" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} title="Ordenar por">
              <option value="updated">Atualizado recentemente</option>
              <option value="progress">Progresso</option>
              <option value="title">Título</option>
            </select>
            <label className="text-sm ml-4">Filtro:</label>
            <select className="border rounded px-2 py-1" value={filterAudio} onChange={(e) => setFilterAudio(e.target.value as any)} title="Filtro de áudio">
              <option value="all">Todos</option>
              <option value="with">Com áudio</option>
              <option value="without">Sem áudio</option>
            </select>
          </div>
          {projects.length === 0 ? (
            <div className="text-sm opacity-70">Ainda não há singles. Clique em &quot;Novo Single&quot; para começar.</div>
          ) : (
            <div className="space-y-8">
              {steps.map((s, sectionIdx) => {
                let items = projects.filter((p) => (p.currentStep ?? 0) === sectionIdx);
                if (filterAudio === 'with') items = items.filter((p: any) => p.audio?.hasBlob);
                if (filterAudio === 'without') items = items.filter((p: any) => !p.audio?.hasBlob);
                if (sortBy === 'updated') items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                if (sortBy === 'progress') items.sort((a, b) => b.progress - a.progress);
                if (sortBy === 'title') items.sort((a, b) => (a.songInfo?.title || '').localeCompare(b.songInfo?.title || ''));
                if (items.length === 0) return null;
                return (
                  <div key={sectionIdx}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold">{s.name}</h3>
                      <span className="text-xs opacity-70">{items.length} projeto(s)</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((p) => (
                <div key={p.id} className="border rounded-lg p-4 hover:shadow-sm transition">
                  <div className="flex items-center justify-between mb-2">
                    <InlineTitle project={p} onSaved={(np) => setProjects((prev) => prev.map((x) => x.id === np.id ? { ...np, progress: computeProgress(np) } : x))} />
                    <div className="text-xs opacity-60">{new Date(p.updatedAt).toLocaleDateString()}</div>
                  </div>
                  <InlineArtist project={p} onSaved={(np) => setProjects((prev) => prev.map((x) => x.id === np.id ? { ...np, progress: computeProgress(np) } : x))} />
                  <div className="text-xs opacity-70 mb-3">Passo atual: {(p.currentStep ?? 0) + 1} de {TOTAL_STEPS} • Concluídos: {(p.currentStep ?? 0)} • Faltam: {Math.max(0, TOTAL_STEPS - ((p.currentStep ?? 0) + 1))}</div>
                  <Progress value={p.progress} />
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setProject(p);
                        router.push(`/obraeurudita`);
                      }}
                    >
                      Abrir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => duplicateSingle(p)}>Duplicar</Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteSingle(p.id)}>Eliminar</Button>
                  </div>
                </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      {toast && (
        <div className={`fixed bottom-4 right-4 px-3 py-2 rounded text-white shadow ${toast.kind === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.msg}
        </div>
      )}
    
    </div>
  );
}
 
function InlineTitle({ project, onSaved }: { project: ProjectState; onSaved: (p: ProjectState) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(project.songInfo?.title || "");
  const setProject = useProject((s) => s.setProject);
  const save = async () => {
    const updated: ProjectState = { ...project, songInfo: { ...project.songInfo, title: value }, updatedAt: new Date().toISOString() } as any;
    await saveProjectToIndexedDB(updated);
    onSaved(updated);
    const curr = useProject.getState().project;
    if (curr?.id === updated.id) setProject(updated);
    setEditing(false);
  };
  return editing ? (
    <input
      className="font-semibold truncate max-w-[70%] border rounded px-2 py-1"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === 'Enter' && save()}
      placeholder="Título"
      title="Editar título"
      autoFocus
    />
  ) : (
    <button className="font-semibold truncate max-w-[70%] text-left" onClick={() => setEditing(true)} title="Editar título">
      {project.songInfo?.title || "Sem título"}
    </button>
  );
}

function InlineArtist({ project, onSaved }: { project: ProjectState; onSaved: (p: ProjectState) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(project.songInfo?.artist || "");
  const setProject = useProject((s) => s.setProject);
  const save = async () => {
    const updated: ProjectState = { ...project, songInfo: { ...project.songInfo, artist: value }, updatedAt: new Date().toISOString() } as any;
    await saveProjectToIndexedDB(updated);
    onSaved(updated);
    const curr = useProject.getState().project;
    if (curr?.id === updated.id) setProject(updated);
    setEditing(false);
  };
  return (
    <div className="text-xs opacity-70 mb-2">
      {editing ? (
        <input
          className="border rounded px-2 py-1 text-xs"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="Artista"
          title="Editar artista"
          autoFocus
        />
      ) : (
        <button className="underline-offset-2 hover:underline" onClick={() => setEditing(true)} title="Editar artista">
          {project.songInfo?.artist || "Artista"} • {project.songInfo?.producer || "Produtor"}
        </button>
      )}
    </div>
  );
}
