"use client";
import React, { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { listProjects, DashboardProject } from "@/lib/music-dashboard";
import { steps } from "@/lib/steps";

type TaskView = { id: string; title: string; status: string };
type SingleDetail = {
  id: string;
  title: string;
  artist: string;
  featured: string[];
  producer?: string;
  tasks: TaskView[];
  percent: number;
};

export default function SingleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug as string;
  const [data, setData] = useState<SingleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    try {
      const project = listProjects().find(
        (p) => p.id === slug && p.kind === "Single" && !!p.name?.trim()
      );
      if (!project) {
        if (!cancelled) setData(null);
        return;
      }
      const tasksTotal = project.tasks.length;
      const tasksDone = project.tasks.filter((t) => t.status === "done").length;
      const percent = tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100);
      const detail: SingleDetail = {
        id: project.id,
        title: project.name,
        artist: (project as any).artist ?? "Die Pretty",
        featured: (project as any).featured ?? [],
        producer: (project as any).producer ?? undefined,
        tasks: project.tasks.map((t: any) => ({ id: t.id, title: t.title, status: t.status })),
        percent,
      };
      if (!cancelled) setData(detail);
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="space-y-6">
      <div>
        <a href="/public/singles" className="text-sm text-muted-foreground hover:underline">← Voltar</a>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar…</p>
      ) : data ? (
        <>
          <header className="flex items-start gap-4">
            <div className="relative h-28 w-28 rounded bg-muted overflow-hidden" />
            <div className="space-y-1">
              <h1 className="text-3xl font-bold">{data.title}</h1>
              <p className="text-muted-foreground">
                {data.artist}
                {data.featured.length ? ` • ${data.featured.join(", ")}` : ""}
                {data.producer ? ` • ${data.producer}` : ""}
              </p>
            </div>
          </header>
          <Card>
            <CardHeader>
              <CardTitle>Progresso Geral</CardTitle>
              <CardDescription>{data.percent}% concluído</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Tarefas completas</span>
                <span>{data.percent}%</span>
              </div>
              <Progress value={data.percent} />
            </CardContent>
          </Card>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Progresso por Etapa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {steps.map((st) => {
                const sslug = st.link.replace(/^\//, "");
                const relevant = (data.tasks as any[]).filter((t) => (t.stepSlug ?? '').includes(sslug) || t.title.toLowerCase().includes(sslug));
                const total = relevant.length;
                const done = relevant.filter((t) => t.status === 'done').length;
                const pct = total === 0 ? 0 : Math.round((done / total) * 100);
                return (
                  <Card key={sslug}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{st.name}</span>
                        <span className="text-xs font-medium rounded bg-muted px-2 py-0.5 text-muted-foreground">{st.timeframe}</span>
                      </CardTitle>
                      <CardDescription>{pct}%</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Progress value={pct} />
                      <div className="text-xs text-muted-foreground">{done}/{total} tarefas</div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Tarefas</h2>
            <div className="space-y-2">
              {data.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem tarefas definidas.</p>
              ) : (
                data.tasks.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between rounded border px-3 py-2 text-sm"
                  >
                    <span>{t.title}</span>
                    <span className="capitalize text-muted-foreground text-xs">{t.status}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
