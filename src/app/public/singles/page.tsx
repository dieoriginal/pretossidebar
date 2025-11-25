"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listProjects, DashboardProject } from "@/lib/music-dashboard";
import { exportSinglesSnapshot } from "@/lib/public-sync";
import { fetchPublicSingles } from "@/lib/firebase";

type SingleView = {
  id: string;
  title: string;
  artist: string;
  featured: string[];
  producer?: string;
  coverUrl?: string;
  tasksTotal: number;
  tasksDone: number;
  percent: number;
};

export default function SinglesPage() {
  const [singles, setSingles] = useState<SingleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudCount, setCloudCount] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const projects: DashboardProject[] = listProjects();
        const filtered = projects.filter(
          (p) => p.kind === "Single" && p.name && p.name.trim().length > 0
        );
        let view = filtered.map((p) => {
          const tasksTotal = p.tasks.length;
          const tasksDone = p.tasks.filter((t) => t.status === "done").length;
          const percent = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);
          return {
            id: p.id,
            title: p.name,
            artist: p.artist ?? "Die Pretty",
            featured: p.featured ?? [],
            producer: p.producer ?? undefined,
            coverUrl: p.coverUrl ?? undefined,
            tasksTotal,
            tasksDone,
            percent,
          } as SingleView;
        });
        // Merge with cloud snapshot (publicSingles) to include cross-device items
        try {
          const cloud = await fetchPublicSingles();
          if (!cancelled) setCloudCount(cloud.length);
          const localIds = new Set(view.map((v) => v.id));
          const merged = [
            ...view,
            ...cloud
              .filter((c) => !localIds.has(c.id))
              .map(
                (c) =>
                  ({
                    id: c.id,
                    title: c.title,
                    artist: c.artist || "Die Pretty",
                    featured: c.featured || [],
                    producer: c.producer,
                    coverUrl: c.coverUrl,
                    tasksTotal: 0,
                    tasksDone: 0,
                    percent: 0,
                  } as SingleView)
              ),
          ];
          view = merged;
        } catch {}
        if (!cancelled) setSingles(view);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Singles</h1>
        <p className="text-muted-foreground">Ligado ao back office: apenas singles com título aparecem.</p>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const { ok } = await exportSinglesSnapshot();
              alert(ok ? 'Snapshot público sincronizado' : 'Falha ao sincronizar');
            }}
          >
            Sincronizar snapshot público
          </Button>
          <span className="text-xs text-muted-foreground">Cloud: {cloudCount} singles</span>
        </div>
      </header>
      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
      ) : singles.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum single com título encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {singles.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="relative h-20 w-20 rounded bg-muted flex-shrink-0 overflow-hidden">
                  {s.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.coverUrl} alt={s.title} className="h-full w-full object-cover" />
                  ) : null}
                </div>
                <div className="space-y-1">
                  <CardTitle className="text-xl">{s.title}</CardTitle>
                  <CardDescription>
                    {s.artist}
                    {s.featured.length ? ` • ${s.featured.join(", ")}` : ""}
                    {s.producer ? ` • ${s.producer}` : ""}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {s.tasksDone}/{s.tasksTotal} tarefas • {s.percent}%
                </div>
                <Button asChild size="sm" variant="outline">
                  <a href={`/public/singles/${s.id}`}>Ver</a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
