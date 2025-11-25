import { listProjects } from "@/lib/music-dashboard";

export type PublicSingleSnapshot = {
  id: string
  title: string
  artist?: string
  featured?: string[]
  producer?: string
  coverUrl?: string
}

export async function exportSinglesSnapshot() {
  if (typeof window === 'undefined') return { ok: false };
  const projects = listProjects().filter((p) => p.kind === 'Single' && p.name.trim());
  const payload: PublicSingleSnapshot[] = projects.map((p) => ({
    id: p.id,
    title: p.name,
    artist: p.artist,
    featured: p.featured,
    producer: p.producer,
    coverUrl: p.coverUrl,
  }));
  const res = await fetch('/api/public/singles', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ singles: payload })
  });
  return { ok: res.ok };
}

export async function fetchSinglesSnapshot() {
  const res = await fetch('/api/public/singles');
  if (!res.ok) return [] as PublicSingleSnapshot[];
  const json = await res.json();
  return (json?.singles ?? []) as PublicSingleSnapshot[];
}
