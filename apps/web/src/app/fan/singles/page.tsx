"use client";

import { usePublicProjects } from "@/hooks/use-public-projects";
import { ProgressCard } from "@/components/public/ProgressCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Music } from "lucide-react";

export default function SinglesPage() {
  const { projects, loading } = usePublicProjects();

  const singles = projects.filter((p) => p.type === "single");

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Music className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-bold">Singles em Produção</h1>
        </div>
        <p className="text-muted-foreground">
          Acompanha o progresso dos singles em desenvolvimento
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : singles.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {singles.map((project) => (
            <ProgressCard key={project.id} project={project} type="single" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum single em produção no momento
          </CardContent>
        </Card>
      )}
    </div>
  );
}
