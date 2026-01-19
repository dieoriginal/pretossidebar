"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Music, Download, ExternalLink, Loader2 } from "lucide-react";

export default function NFCRedirectPage({
  params,
}: {
  params: { tagId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTag() {
      try {
        setLoading(true);
        
        // Registrar scan da tag
        const scanResponse = await apiClient.scanNFCTag(params.tagId);
        setTag(scanResponse.tag);
        
        // Redirecionar automaticamente após 2 segundos
        setTimeout(() => {
          if (scanResponse.tag.redirectUrl) {
            window.location.href = scanResponse.tag.redirectUrl;
          }
        }, 2000);
      } catch (err: any) {
        setError(err.message || "Tag não encontrada");
      } finally {
        setLoading(false);
      }
    }

    loadTag();
  }, [params.tagId]);

  if (loading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !tag) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-destructive mb-4">{error || "Tag não encontrada"}</p>
            <Button onClick={() => router.push("/")}>Voltar ao início</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <Music className="w-16 h-16 text-primary mx-auto mb-4" />
          <CardTitle className="text-2xl">{tag.title}</CardTitle>
          <p className="text-muted-foreground mt-2">{tag.artist}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Redirecionando automaticamente...
            </p>
            <div className="flex gap-4 justify-center">
              {tag.redirectUrl && (
                <Button
                  onClick={() => (window.location.href = tag.redirectUrl)}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir Conteúdo
                </Button>
              )}
              {tag.contentUrl && (
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = tag.contentUrl)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
