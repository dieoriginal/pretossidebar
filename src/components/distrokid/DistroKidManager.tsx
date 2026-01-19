/**
 * Componente para gerenciar integração com DistroKid
 */

"use client";

import { useState } from 'react';
import { useDistroKid } from '@/hooks/use-distrokid';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Music, Video, Disc, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Release, Track, Video } from '@/lib/distrokid/types';

interface DistroKidManagerProps {
  initialBearerToken?: string;
  onTokenChange?: (token: string) => void;
}

export default function DistroKidManager({
  initialBearerToken = '',
  onTokenChange,
}: DistroKidManagerProps) {
  const [bearerToken, setBearerToken] = useState(initialBearerToken);
  const [videoIds, setVideoIds] = useState('');
  
  const {
    releases,
    tracks,
    videos,
    loading,
    error,
    fetchReleases,
    fetchTracks,
    fetchVideos,
    clearError,
  } = useDistroKid({ bearerToken: bearerToken || undefined });

  const handleTokenChange = (value: string) => {
    setBearerToken(value);
    onTokenChange?.(value);
  };

  const handleFetchVideos = () => {
    const ids = videoIds
      .split(',')
      .map((id) => id.trim())
      .filter((id) => id.length > 0);
    
    if (ids.length > 0) {
      fetchVideos(ids);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>DistroKid API</CardTitle>
          <CardDescription>
            Wrapper não oficial para a API do DistroKid. Configure seu token para acessar releases e tracks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bearer-token">Bearer Token</Label>
            <Input
              id="bearer-token"
              type="password"
              placeholder="Seu bearer token do DistroKid"
              value={bearerToken}
              onChange={(e) => handleTokenChange(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Você pode obter o token inspecionando as requisições da aplicação iOS do DistroKid.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message}
                {error.code && ` (Código: ${error.code})`}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={fetchReleases}
              disabled={!bearerToken || loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Disc className="mr-2 h-4 w-4" />
                  Buscar Releases
                </>
              )}
            </Button>
            <Button
              onClick={fetchTracks}
              disabled={!bearerToken || loading}
              variant="outline"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Buscar Tracks
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="releases" className="w-full">
        <TabsList>
          <TabsTrigger value="releases">
            Releases ({releases.length})
          </TabsTrigger>
          <TabsTrigger value="tracks">
            Tracks ({tracks.length})
          </TabsTrigger>
          <TabsTrigger value="videos">
            Vídeos ({videos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="releases" className="space-y-4">
          {releases.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhum release encontrado. Configure o token e clique em "Buscar Releases".
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {releases.map((release) => (
                <ReleaseCard key={release.id} release={release} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tracks" className="space-y-4">
          {tracks.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Nenhuma track encontrada. Configure o token e clique em "Buscar Tracks".
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Buscar Vídeos</CardTitle>
              <CardDescription>
                A API de vídeos não requer token. Insira os IDs dos vídeos separados por vírgula.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="video-ids">IDs dos Vídeos</Label>
                <Input
                  id="video-ids"
                  placeholder="Rc92Mqy6SWr, mv-K0ye9T6Xv, dv-5yW2dTd8N"
                  value={videoIds}
                  onChange={(e) => setVideoIds(e.target.value)}
                />
              </div>
              <Button
                onClick={handleFetchVideos}
                disabled={loading || !videoIds.trim()}
                variant="outline"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Buscar Vídeos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {videos.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReleaseCard({ release }: { release: Release }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{release.title}</CardTitle>
        <CardDescription>{release.artist}</CardDescription>
      </CardHeader>
      <CardContent>
        {release.releaseDate && (
          <Badge variant="secondary" className="mb-2">
            {new Date(release.releaseDate).toLocaleDateString('pt-PT')}
          </Badge>
        )}
        {release.coverArt && (
          <img
            src={release.coverArt}
            alt={release.title}
            className="mt-2 h-32 w-full rounded object-cover"
          />
        )}
      </CardContent>
    </Card>
  );
}

function TrackCard({ track }: { track: Track }) {
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold">{track.title}</h3>
            <p className="text-sm text-muted-foreground">{track.artist}</p>
            <div className="flex gap-2 mt-2">
              {track.duration && (
                <Badge variant="outline">{formatDuration(track.duration)}</Badge>
              )}
              {track.isrc && (
                <Badge variant="outline">ISRC: {track.isrc}</Badge>
              )}
              {track.playCount !== undefined && (
                <Badge variant="secondary">{track.playCount} plays</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoCard({ video }: { video: Video }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{video.title}</CardTitle>
        <CardDescription>{video.artist}</CardDescription>
      </CardHeader>
      <CardContent>
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="mb-2 h-32 w-full rounded object-cover"
          />
        )}
        <div className="space-y-2">
          {video.views !== undefined && (
            <Badge variant="secondary">{video.views.toLocaleString()} visualizações</Badge>
          )}
          {video.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}



