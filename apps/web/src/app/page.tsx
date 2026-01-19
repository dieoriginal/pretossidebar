"use client";

import Link from "next/link";
import { 
  PanelsTopLeft, 
  Music, 
  Calendar, 
  ArrowUpDown, 
  Filter,
  Copy,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
        console.log(`[BACKLOG] Carregados ${list?.length || 0} projetos do IndexedDB`);
        const withProgress = (list ?? []).map((p) => ({ ...p, progress: computeProgress(p) }));
        setProjects(withProgress);
        console.log(`[BACKLOG] ${withProgress.length} projetos processados e exibidos`);
      } catch (e) {
        console.error('[BACKLOG] Erro ao carregar projetos:', e);
        setProjects([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const createNewSingle = async () => {
    const id = `single-${Date.now()}`;
    const fresh = createEmptyProject(id);
    fresh.id = id;
    fresh.totalSteps = TOTAL_STEPS;
    await saveProjectToIndexedDB(fresh);
    setProject(fresh);
    setToast({ msg: "Novo single criado com sucesso", kind: "success" });
    router.push(`/obraeurudita`);
  };

  const duplicateSingle = async (p: ProjectState) => {
    const copy: ProjectState = { ...p, id: `single-${Date.now()}`, updatedAt: new Date().toISOString() };
    await saveProjectToIndexedDB(copy);
    setProjects((prev) => [{ ...copy, progress: computeProgress(copy) }, ...prev]);
    setToast({ msg: "Projeto duplicado com sucesso", kind: "success" });
  };

  const deleteSingle = async (id: string) => {
    await deleteProjectFromIndexedDB(id);
    setProjects((prev) => prev.filter((x) => x.id !== id));
    setToast({ msg: "Projeto eliminado", kind: "success" });
  };
  return (
    <div className="flex flex-col min-h-screen lg:pl-96 pl-[90px] bg-gradient-to-br from-background via-background to-muted/20">
      <Sidebar />



      <main className="min-h-[calc(100vh-57px-97px)] flex-1 pt-14">
        <div className="container py-8 px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">BACKLOG</h2>
              <p className="text-sm text-muted-foreground">
                Gerir e acompanhar todos os seus projetos musicais
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-sm px-3 py-1.5">
                <Music className="w-3 h-3 mr-1.5" />
                {projects.length} projeto{projects.length !== 1 ? 's' : ''}
              </Badge>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  console.log('[BACKLOG DEBUG] Todos os projetos:', projects);
                  console.log('[BACKLOG DEBUG] Distribuição por etapa:', 
                    steps.map((s, idx) => ({
                      etapa: s.name,
                      count: projects.filter(p => (p.currentStep ?? 0) === idx).length
                    }))
                  );
                  const orphanCount = projects.filter(p => {
                    const step = p.currentStep ?? 0;
                    return step < 0 || step >= TOTAL_STEPS;
                  }).length;
                  console.log('[BACKLOG DEBUG] Projetos órfãos (etapa inválida):', orphanCount);
                }}
              >
                🔍 Debug
              </Button>
            </div>
          </div>

          {/* Filtros melhorados */}
          <Card className="mb-6 border-border/50 shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Ordenar por:</label>
                  <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="updated">Atualizado recentemente</SelectItem>
                      <SelectItem value="progress">Progresso</SelectItem>
                      <SelectItem value="title">Título</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <label className="text-sm font-medium">Filtro:</label>
                  <Select value={filterAudio} onValueChange={(v: any) => setFilterAudio(v)}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="with">Com áudio</SelectItem>
                      <SelectItem value="without">Sem áudio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          {projects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Music className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ainda não há singles</h3>
                <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                  Comece criando o seu primeiro projeto musical clicando no botão acima
                </p>
                <Button onClick={createNewSingle} variant="outline">
                  <Music className="w-4 h-4 mr-2" />
                  Criar Primeiro Single
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-10">
              {steps.map((s, sectionIdx) => {
                let items = projects.filter((p) => {
                  const currentStep = p.currentStep ?? 0;
                  return currentStep === sectionIdx;
                });
                if (filterAudio === 'with') items = items.filter((p: any) => p.audio?.hasBlob);
                if (filterAudio === 'without') items = items.filter((p: any) => !p.audio?.hasBlob);
                if (sortBy === 'updated') items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                if (sortBy === 'progress') items.sort((a, b) => b.progress - a.progress);
                if (sortBy === 'title') items.sort((a, b) => (a.songInfo?.title || '').localeCompare(b.songInfo?.title || ''));
                if (items.length === 0) return null;
                return (
                  <div key={sectionIdx} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Music className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">{s.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            {items.length} projeto{items.length !== 1 ? 's' : ''} nesta etapa
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {items.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((p) => (
                        <Card 
                          key={p.id} 
                          className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/50 cursor-pointer overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <CardHeader className="relative pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <InlineTitle project={p} onSaved={(np) => setProjects((prev) => prev.map((x) => x.id === np.id ? { ...np, progress: computeProgress(np) } : x))} />
                              </div>
                              <Badge 
                                variant={p.progress === 100 ? "default" : "secondary"} 
                                className="ml-2 shrink-0"
                              >
                                {p.progress}%
                              </Badge>
                            </div>
                            <InlineArtist project={p} onSaved={(np) => setProjects((prev) => prev.map((x) => x.id === np.id ? { ...np, progress: computeProgress(np) } : x))} />
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(p.updatedAt).toLocaleDateString('pt-PT')}</span>
                            </div>
                          </CardHeader>
                          <CardContent className="relative space-y-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Progresso</span>
                                <span className="font-medium">
                                  {(p.currentStep ?? 0) + 1} / {TOTAL_STEPS}
                                </span>
                              </div>
                              <Progress value={p.progress} className="h-2" />
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>{(p.currentStep ?? 0)} concluídos</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{Math.max(0, TOTAL_STEPS - ((p.currentStep ?? 0) + 1))} faltam</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter className="relative pt-0 flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              className="flex-1"
                              onClick={() => {
                                setProject(p);
                                router.push(`/obraeurudita`);
                              }}
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                              Abrir
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => duplicateSingle(p)}
                              className="px-3"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteSingle(p.id)}
                              className="px-3"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {/* Seção para projetos órfãos */}
              {(() => {
                const orphanProjects = projects.filter((p) => {
                  const currentStep = p.currentStep ?? 0;
                  return currentStep < 0 || currentStep >= TOTAL_STEPS;
                });
                
                if (orphanProjects.length === 0) return null;
                
                let items = [...orphanProjects];
                if (filterAudio === 'with') items = items.filter((p: any) => p.audio?.hasBlob);
                if (filterAudio === 'without') items = items.filter((p: any) => !p.audio?.hasBlob);
                if (sortBy === 'updated') items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
                if (sortBy === 'progress') items.sort((a, b) => b.progress - a.progress);
                if (sortBy === 'title') items.sort((a, b) => (a.songInfo?.title || '').localeCompare(b.songInfo?.title || ''));
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-orange-600 dark:text-orange-400">
                            Outros / Etapa Inválida
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {items.length} projeto{items.length !== 1 ? 's' : ''} com etapa inválida
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 dark:text-orange-400">
                        {items.length}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {items.map((p) => (
                        <Card 
                          key={p.id} 
                          className="border-orange-300 dark:border-orange-700 bg-orange-50/30 dark:bg-orange-900/10 hover:shadow-lg transition-all duration-300"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <InlineTitle project={p} onSaved={(np) => setProjects((prev) => prev.map((x) => x.id === np.id ? { ...np, progress: computeProgress(np) } : x))} />
                              </div>
                              <Badge variant="outline" className="ml-2 shrink-0 border-orange-300 text-orange-600 dark:text-orange-400">
                                {p.progress}%
                              </Badge>
                            </div>
                            <InlineArtist project={p} onSaved={(np) => setProjects((prev) => prev.map((x) => x.id === np.id ? { ...np, progress: computeProgress(np) } : x))} />
                            <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400 mt-2">
                              <AlertCircle className="w-3 h-3" />
                              <span>Passo: {p.currentStep ?? 'undefined'} (inválido)</span>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <Progress value={p.progress} className="h-2" />
                          </CardContent>
                          <CardFooter className="pt-0 flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="flex-1"
                              onClick={() => {
                                setProject(p);
                                router.push(`/obraeurudita`);
                              }}
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                              Abrir
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => duplicateSingle(p)}
                              className="px-3"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => deleteSingle(p.id)}
                              className="px-3"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </main>
      {/* Toast melhorado */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-[9999] animate-in slide-in-from-bottom-2 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm ${
          toast.kind === 'error' 
            ? 'bg-destructive text-destructive-foreground border-destructive/50' 
            : 'bg-green-600 text-white border-green-500/50'
        }`}>
          <div className="flex items-center gap-2">
            {toast.kind === 'error' ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
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
    <Input
      className="font-semibold text-base h-8"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === 'Enter' && save()}
      placeholder="Título"
      title="Editar título"
      autoFocus
    />
  ) : (
    <button 
      className="font-semibold text-base text-left hover:text-primary transition-colors truncate block w-full" 
      onClick={() => setEditing(true)} 
      title="Editar título"
    >
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
    <div className="text-sm text-muted-foreground">
      {editing ? (
        <Input
          className="h-7 text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && save()}
          placeholder="Artista"
          title="Editar artista"
          autoFocus
        />
      ) : (
        <button 
          className="hover:text-foreground transition-colors underline-offset-2 hover:underline" 
          onClick={() => setEditing(true)} 
          title="Editar artista"
        >
          {project.songInfo?.artist || "Artista"} • {project.songInfo?.producer || "Produtor"}
        </button>
      )}
    </div>
  );
}
