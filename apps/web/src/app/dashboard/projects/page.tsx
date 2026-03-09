"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FolderOpen, Clock, Music, Loader2, Search, RefreshCcw } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { useProject } from "@/hooks/use-project";

interface ProjectSummary {
  id: string;
  title: string;
  artist: string;
  updated_at: string;
  stropheCount: number;
  verseCount: number;
}

export default function ProjectsDashboard() {
  const router = useRouter();
  const { userId: user, isLoaded } = useCurrentUser();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const updateProject = useProject((s) => s.update);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(
          (data.projects || []).map((p: any) => ({
            id: p.id,
            title: p.title || p.name || "Sem título",
            artist: p.artist || "",
            updated_at: p.updated_at,
            stropheCount: p.strophe_count || 0,
            verseCount: p.verse_count || 0,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isLoaded && user) {
      fetchProjects();
    } else if (isLoaded && !user) {
      setLoading(false);
    }
  }, [isLoaded, user, fetchProjects]);

  const handleOpenProject = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects?id=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.project) {
          // Hydrate Zustand store then navigate
          updateProject({
            id: projectId,
            ...data.project,
            updatedAt: new Date().toISOString(),
          });
          router.push("/obraeurudita");
        }
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Tem certeza que deseja apagar este projeto? Esta ação não pode ser desfeita.")) return;
    setDeleting(projectId);
    try {
      const res = await fetch(`/api/projects?id=${projectId}`, { method: "DELETE" });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(null);
    }
  };

  const handleNewProject = () => {
    // Reset store to a fresh project and navigate
    updateProject({
      id: `proj_${Date.now()}`,
      songInfo: { title: "", artist: "", producer: "", featuring: [] },
      strophes: [],
      currentStep: 0,
      updatedAt: new Date().toISOString(),
    });
    router.push("/obraeurudita");
  };

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return iso;
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <Music className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Projetos</h1>
        <p className="text-muted-foreground text-center max-w-md">
          Faça login para ver os seus projetos guardados na nuvem e aceder a partir de qualquer dispositivo.
        </p>
        <Button onClick={() => router.push("/sign-in")}>Entrar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Meus Projetos</h1>
            <p className="text-muted-foreground">
              {projects.length} {projects.length === 1 ? "projeto" : "projetos"} guardados na nuvem
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchProjects}>
              <RefreshCcw className="h-4 w-4 mr-1" /> Atualizar
            </Button>
            <Button onClick={handleNewProject} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Projeto
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Procurar projetos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchQuery ? "Nenhum projeto encontrado." : "Ainda não tem projetos. Crie o primeiro!"}
            </p>
            {!searchQuery && (
              <Button onClick={handleNewProject} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" /> Criar Projeto
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Card
                key={p.id}
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleOpenProject(p.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">{p.title}</CardTitle>
                      {p.artist && (
                        <CardDescription className="truncate">{p.artist}</CardDescription>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 shrink-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(p.id);
                      }}
                      disabled={deleting === p.id}
                    >
                      {deleting === p.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{p.stropheCount} estrofes</span>
                    <span>·</span>
                    <span>{p.verseCount} versos</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(p.updated_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
