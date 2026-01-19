"use client";

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { listProjects, deleteProject, duplicateProject, loadProject, saveProject, type SavedProject } from '@/lib/project-save-manager';
import { useProject } from '@/hooks/use-project';
import { Trash2, Copy, FolderOpen, Plus, Cloud, CloudOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ProjectList() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState<string | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  
  const { setProject } = useProject();
  const router = useRouter();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const allProjects = await listProjects();
      setProjects(allProjects);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleOpenProject = async (projectId: string) => {
    try {
      const project = await loadProject(projectId);
      if (project) {
        setProject(project);
        router.push('/obraeurudita');
      }
    } catch (error) {
      console.error('Erro ao abrir projeto:', error);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      await loadProjects();
      setDeleteDialogOpen(null);
    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
    }
  };

  const handleDuplicate = async (projectId: string) => {
    try {
      const newId = await duplicateProject(projectId, newProjectName || undefined);
      await loadProjects();
      setDuplicateDialogOpen(null);
      setNewProjectName('');
      // Abrir projeto duplicado
      await handleOpenProject(newId);
    } catch (error) {
      console.error('Erro ao duplicar projeto:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">A carregar projetos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projetos Salvos</h2>
          <p className="text-sm text-muted-foreground">
            Gerencia todos os teus projetos
          </p>
        </div>
        <Button onClick={loadProjects} variant="outline">
          Atualizar
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Ainda não tens projetos guardados.</p>
            <Button className="mt-4" onClick={() => router.push('/obraeurudita')}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Projeto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {project.title || 'Sem título'}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {project.artist && (
                        <div>Artista: {project.artist}</div>
                      )}
                      {project.producer && (
                        <div>Produtor: {project.producer}</div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    {project.hasCloudSync ? (
                      <Cloud className="w-4 h-4 text-green-600" title="Sincronizado" />
                    ) : (
                      <CloudOff className="w-4 h-4 text-muted-foreground" title="Não sincronizado" />
                    )}
                    <Badge variant="outline" className="ml-1">
                      {project.type || 'single'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-xs text-muted-foreground">
                  Atualizado: {new Date(project.updatedAt).toLocaleDateString('pt-PT', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  size="sm"
                  variant="default"
                  className="flex-1"
                  onClick={() => handleOpenProject(project.id)}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Abrir
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDuplicateDialogOpen(project.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de deletar */}
      <Dialog open={deleteDialogOpen !== null} onOpenChange={(open) => !open && setDeleteDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminação</DialogTitle>
            <DialogDescription>
              Tens a certeza que queres eliminar este projeto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialogOpen && handleDelete(deleteDialogOpen)}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de duplicar */}
      <Dialog open={duplicateDialogOpen !== null} onOpenChange={(open) => !open && setDuplicateDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicar Projeto</DialogTitle>
            <DialogDescription>
              Cria uma cópia deste projeto. Podes escolher um novo nome.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Nome do novo projeto (opcional)</Label>
              <Input
                id="new-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Deixa em branco para usar o nome original + (cópia)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDuplicateDialogOpen(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => duplicateDialogOpen && handleDuplicate(duplicateDialogOpen)}
            >
              Duplicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}












