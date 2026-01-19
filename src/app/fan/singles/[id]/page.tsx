"use client";

import { usePublicProject } from "@/hooks/use-public-projects";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, User, Users, FileText } from "lucide-react";
import { ProjectTimeline } from "@/components/public/ProjectTimeline";

export default function SingleDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { project, loading, error } = usePublicProject(params.id);

  if (loading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-4" />
        <Skeleton className="h-6 w-48 mb-8" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive">
              {error || "Projeto não encontrado"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{project.title}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{project.artist}</span>
          </div>
          {project.featuring && project.featuring.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>ft. {project.featuring.join(", ")}</span>
            </div>
          )}
          {project.producer && (
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4" />
              <span>Prod: {project.producer}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{project.progress}%</span>
                <Badge variant={project.progress === 100 ? "default" : "secondary"}>
                  {project.progress === 100 ? "Concluído" : "Em produção"}
                </Badge>
              </div>
              <Progress value={project.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Etapa {project.currentStep + 1} de {project.totalSteps}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-primary" />
              <span className="font-medium capitalize">{project.type}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {new Date(project.updatedAt).toLocaleDateString("pt-PT", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      </div>

      {project.synopsis && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Sinopse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.synopsis}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Timeline do Projeto</CardTitle>
          <CardDescription>
            Acompanha o progresso através das etapas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectTimeline
            currentStep={project.currentStep}
            totalSteps={project.totalSteps}
          />
        </CardContent>
      </Card>
    </div>
  );
}
