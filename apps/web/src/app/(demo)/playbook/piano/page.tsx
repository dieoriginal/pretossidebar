"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Piano, Plus, Edit, Trash2, Play, Save } from "lucide-react";
import { getAllPianoVideos, savePianoVideo, deletePianoVideo } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type PianoVideo = PlaybookDB['pianoVideos']['value'];

const INITIAL_VIDEOS: Omit<PianoVideo, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: "Piano Lessons Playlist",
    url: "https://www.youtube.com/watch?v=TbDUsEmbsPw&list=PLQSUpDLv_07OsJ39SsB9cy-HU9nGUS62a",
    difficulty: 'intermediate',
    notes: 'Playlist completa de lições de piano',
    tags: ['lessons', 'playlist'],
  },
  {
    title: "Piano Tutorial Video 1",
    url: "https://youtu.be/DmsAqJ3UNPc?si=8tCiWpyrdFRBRTK8",
    difficulty: 'beginner',
    notes: 'Tutorial básico de piano',
    tags: ['tutorial', 'beginner'],
  },
  {
    title: "Piano Tutorial Video 2",
    url: "https://youtu.be/9qfhRu2A7pg?si=U8ohYhJmlIKtuzDZ",
    difficulty: 'advanced',
    notes: 'Tutorial avançado de piano',
    tags: ['tutorial', 'advanced'],
  },
];

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

export default function PianoVideosPage() {
  const [videos, setVideos] = useState<PianoVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<PianoVideo | null>(null);
  const [formData, setFormData] = useState<Omit<PianoVideo, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    url: '',
    difficulty: 'beginner',
    notes: '',
    tags: [],
  });

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const items = await getAllPianoVideos();
      if (items.length === 0) {
        // Initialize with default videos
        for (const video of INITIAL_VIDEOS) {
          await savePianoVideo(video);
        }
        const loaded = await getAllPianoVideos();
        setVideos(loaded);
      } else {
        setVideos(items);
      }
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingVideo) {
        await savePianoVideo({ ...formData, id: editingVideo.id });
      } else {
        await savePianoVideo(formData);
      }
      await loadVideos();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este vídeo?')) {
      try {
        await deletePianoVideo(id);
        await loadVideos();
      } catch (error) {
        console.error('Error deleting video:', error);
      }
    }
  };

  const handleEdit = (video: PianoVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      url: video.url,
      difficulty: video.difficulty || 'beginner',
      notes: video.notes || '',
      tags: video.tags || [],
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      url: '',
      difficulty: 'beginner',
      notes: '',
      tags: [],
    });
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar vídeos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Piano Videos</h1>
          <p className="text-muted-foreground">
            Gerir vídeos de lições de piano preferidos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Video
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVideo ? 'Editar' : 'Adicionar'} Video</DialogTitle>
              <DialogDescription>
                Adicione ou edite um vídeo de piano
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Piano Lessons - Beginner"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL do YouTube *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante</SelectItem>
                    <SelectItem value="intermediate">Intermediário</SelectItem>
                    <SelectItem value="advanced">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas sobre este vídeo..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => {
          const videoId = extractVideoId(video.url);
          return (
            <Card key={video.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg flex-1">{video.title}</CardTitle>
                  {video.difficulty && (
                    <Badge variant="outline">
                      {video.difficulty === 'beginner' ? 'Iniciante' : 
                       video.difficulty === 'intermediate' ? 'Intermediário' : 'Avançado'}
                    </Badge>
                  )}
                </div>
                {video.notes && (
                  <CardDescription>{video.notes}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {videoId && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-muted">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {video.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(video.url, '_blank')}
                    className="flex-1"
                  >
                    <Play className="w-3.5 h-3.5 mr-1.5" />
                    Abrir
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(video)}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(video.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}




