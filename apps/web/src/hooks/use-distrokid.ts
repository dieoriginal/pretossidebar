/**
 * Hook React para usar o wrapper DistroKid
 */

import { useState, useCallback, useEffect } from 'react';
import { createDistroKidClient, getVideos, getVideo } from '@/lib/distrokid';
import type { Release, Track, Video, DistroKidError } from '@/lib/distrokid/types';

interface UseDistroKidOptions {
  bearerToken?: string;
  autoFetch?: boolean;
}

interface UseDistroKidReturn {
  // Estado
  releases: Release[];
  tracks: Track[];
  videos: Video[];
  loading: boolean;
  error: DistroKidError | null;
  
  // Métodos
  fetchReleases: () => Promise<void>;
  fetchTracks: () => Promise<void>;
  fetchVideos: (videoIds: string[]) => Promise<void>;
  fetchVideo: (videoId: string) => Promise<void>;
  clearError: () => void;
  
  // Cliente
  client: ReturnType<typeof createDistroKidClient> | null;
}

export function useDistroKid(options: UseDistroKidOptions = {}): UseDistroKidReturn {
  const { bearerToken, autoFetch = false } = options;
  
  const [releases, setReleases] = useState<Release[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<DistroKidError | null>(null);
  
  const client = bearerToken ? createDistroKidClient(bearerToken) : null;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchReleases = useCallback(async () => {
    if (!client) {
      setError({ message: 'Token de autenticação não fornecido' });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await client.getReleases();
      setReleases(data);
    } catch (err: any) {
      const distroKidError: DistroKidError = {
        message: err.message || 'Erro ao buscar releases',
        code: err.code,
        status: err.status,
      };
      setError(distroKidError);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const fetchTracks = useCallback(async () => {
    if (!client) {
      setError({ message: 'Token de autenticação não fornecido' });
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await client.getTracks();
      setTracks(data);
    } catch (err: any) {
      const distroKidError: DistroKidError = {
        message: err.message || 'Erro ao buscar tracks',
        code: err.code,
        status: err.status,
      };
      setError(distroKidError);
    } finally {
      setLoading(false);
    }
  }, [client]);

  const fetchVideos = useCallback(async (videoIds: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getVideos(videoIds);
      setVideos(data);
    } catch (err: any) {
      const distroKidError: DistroKidError = {
        message: err.message || 'Erro ao buscar vídeos',
        code: err.code,
        status: err.status,
      };
      setError(distroKidError);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchVideo = useCallback(async (videoId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const video = await getVideo(videoId);
      setVideos((prev) => {
        // Evita duplicatas
        const exists = prev.find((v) => v.id === videoId);
        if (exists) {
          return prev.map((v) => (v.id === videoId ? video : v));
        }
        return [...prev, video];
      });
    } catch (err: any) {
      const distroKidError: DistroKidError = {
        message: err.message || 'Erro ao buscar vídeo',
        code: err.code,
        status: err.status,
      };
      setError(distroKidError);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch se solicitado
  useEffect(() => {
    if (autoFetch && client) {
      fetchReleases();
      fetchTracks();
    }
  }, [autoFetch, client, fetchReleases, fetchTracks]);

  return {
    releases,
    tracks,
    videos,
    loading,
    error,
    fetchReleases,
    fetchTracks,
    fetchVideos,
    fetchVideo,
    clearError,
    client,
  };
}



