"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Save, Video } from "lucide-react";
import { getInterviewGuide, saveInterviewGuide } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type InterviewGuide = PlaybookDB["interviewGuides"]["value"];

const GUIDE_ID = "interviews-main";
const DEFAULT_VIDEO_URL = "https://www.youtube.com/watch?v=sIfVt-Cl_OM";

const DEFAULT_CONTENT = `## Objetivo
- Qual é a *história* que a entrevista tem de contar?
- Que transformação queremos que o público sinta no fim?

## Tom / Energia
- Direto, humano, sem enrolação.
- Ritmo: respostas curtas + follow-ups certeiros.

## Estrutura (rápida e repetível)
1) Contexto (quem és + onde estás agora)
2) Virada (o que mudou / o que aprendeste)
3) Método (como fazes, passo a passo)
4) Futuro (o que vem a seguir + call-to-action)

## Regras de ouro
- Uma pergunta = uma ideia (não empilhar)
- Silêncio é ferramenta (não preencher)
- Pedir exemplos concretos (datas, lugares, pessoas, números)

## Anti-padrões
- Perguntas vagas (“e aí, como foi?”)
- Interromper o punchline
- Deixar o entrevistado fugir sem voltar ao ponto`;

function toYouTubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=ID
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      // youtube.com/embed/ID
      const parts = u.pathname.split("/").filter(Boolean);
      const embedIdx = parts.indexOf("embed");
      if (embedIdx >= 0 && parts[embedIdx + 1]) return `https://www.youtube.com/embed/${parts[embedIdx + 1]}`;
    }
    // youtu.be/ID
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

export default function InterviewsPlaybookPage() {
  const [loading, setLoading] = useState(true);
  const [guide, setGuide] = useState<InterviewGuide | null>(null);
  const [title, setTitle] = useState("Entrevistas — Guia de Estilo");
  const [videoUrl, setVideoUrl] = useState(DEFAULT_VIDEO_URL);
  const [content, setContent] = useState(DEFAULT_CONTENT);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const existing = await getInterviewGuide(GUIDE_ID);
        if (!existing) {
          const created = await saveInterviewGuide({
            id: GUIDE_ID,
            title,
            videoUrl,
            content,
          });
          setGuide(created);
          return;
        }
        setGuide(existing);
        setTitle(existing.title);
        setVideoUrl(existing.videoUrl || DEFAULT_VIDEO_URL);
        setContent(existing.content);
      } catch (e) {
        console.error("Erro ao carregar Interview Guide:", e);
      } finally {
        setLoading(false);
      }
    };
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const embedUrl = useMemo(() => toYouTubeEmbedUrl(videoUrl), [videoUrl]);

  const handleSave = async () => {
    try {
      const saved = await saveInterviewGuide({
        id: GUIDE_ID,
        title: title.trim() || "Entrevistas — Guia de Estilo",
        videoUrl: videoUrl.trim(),
        content,
      });
      setGuide(saved);
      alert("Guia de entrevistas guardado localmente.");
    } catch (e) {
      console.error("Erro ao guardar Interview Guide:", e);
      alert("Falha ao guardar. Vê o console para detalhes.");
    }
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-sky-500/10">
              <Video className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </span>
            Entrevistas
          </h1>
          <p className="text-muted-foreground">
            Bucket para definir <strong>como queres que as entrevistas sejam</strong> — com vídeo de referência e notas guardadas localmente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary">Local</Badge>
          <Link href="/playbook">
            <Button variant="outline">Voltar ao Playbook</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vídeo de referência</CardTitle>
          <CardDescription>Embutido diretamente aqui (YouTube).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="videoUrl">URL do vídeo</Label>
            <div className="flex gap-2">
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <Button asChild variant="outline">
                <a href={videoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Abrir
                </a>
              </Button>
            </div>
          </div>

          {embedUrl ? (
            <div className="relative w-full overflow-hidden rounded-lg border bg-muted" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full"
                src={embedUrl}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Não consegui gerar o embed a partir desta URL. Usa um link do tipo <code>youtube.com/watch?v=...</code> ou{" "}
              <code>youtu.be/...</code>.
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Guia: como as entrevistas devem ser</CardTitle>
          <CardDescription>
            Edita livremente (markdown/nota). Isto fica guardado localmente no teu browser (IndexedDB), não vai para servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={18}
              className="font-mono"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              {loading ? "A carregar..." : guide ? `Última atualização: ${new Date(guide.updatedAt).toLocaleString()}` : "Sem dados."}
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}















