"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import Metronome from "./estrofes/metronome";
import { useState, useRef, useEffect } from "react";
import { useProject } from "@/hooks/use-project";
import { 
  ArrowLeft, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  Music2, 
  FileAudio, 
  Volume2, 
  Clock,
  Loader2,
  CheckCircle2,
  X,
  SkipBack,
  SkipForward
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const updateProject = useProject((s) => s.update);
  const project = useProject((s) => s.project);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validação mais flexível: verifica tipo MIME ou extensão do arquivo
    const isValidAudioType = (fileType: string, fileName: string): boolean => {
      // Verifica tipos MIME comuns de áudio
      const audioMimeTypes = [
        'audio/wav', 'audio/wave', 'audio/x-wav', 'audio/vnd.wave',
        'audio/mpeg', 'audio/mp3', 'audio/x-mpeg', 'audio/mpeg3',
        'audio/ogg', 'audio/vorbis', 'audio/opus',
        'audio/aac', 'audio/mp4', 'audio/x-m4a',
        'audio/flac', 'audio/webm'
      ];
      
      // Verifica extensões de arquivo
      const audioExtensions = ['.wav', '.mp3', '.ogg', '.aac', '.m4a', '.flac', '.webm', '.wma'];
      
      const lowerType = fileType.toLowerCase();
      const lowerName = fileName.toLowerCase();
      
      // Verifica se o tipo MIME começa com "audio/" ou está na lista
      if (lowerType.startsWith('audio/') || audioMimeTypes.includes(lowerType)) {
        return true;
      }
      
      // Verifica extensão do arquivo
      if (audioExtensions.some(ext => lowerName.endsWith(ext))) {
        return true;
      }
      
      return false;
    };
    
    if (isValidAudioType(file.type || '', file.name)) {
      setIsLoading(true);
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      updateProject({ audio: { name: file.name, type: file.type || 'audio/*', size: file.size, lastModified: file.lastModified, hasBlob: true } });
      (async () => {
        try {
          const { saveProjectToIndexedDB } = await import("@/lib/db");
          const current = useProject.getState().project;
          if (current) {
            await saveProjectToIndexedDB({ ...current, audioBlob: file });
          }
          setIsLoading(false);
        } catch {
          setIsLoading(false);
        }
      })();
    } else {
      // Mostrar erro se o arquivo não for válido
      console.warn('Tipo de arquivo não suportado:', file.type, file.name);
    }
  };

  // Update audio src when audioUrl changes
  useEffect(() => {
    const el = audioRef.current;
    if (el && audioUrl) {
      el.src = audioUrl;
      el.load(); // Reload the audio element
    }
  }, [audioUrl]);

  useEffect(() => {
    const load = async () => {
      const p: any = project;
      if (p && p.audioBlob instanceof Blob) {
        try {
          const url = URL.createObjectURL(p.audioBlob);
          setAudioUrl(url);
          setAudioFile(new File([p.audioBlob], p.audio?.name || 'audio', { type: p.audio?.type || p.audioBlob.type }));
        } catch {}
      }
    };
    load();
    const el = audioRef.current;
    if (el) {
      const onTime = async () => {
        try {
          setCurrentTime(el.currentTime);
          setDuration(el.duration || 0);
          updateProject({ audio: { ...(project?.audio || {}), position: el.currentTime, duration: el.duration || 0 } } as any);
          const curr = useProject.getState().project;
          if (curr) {
            const { saveProjectToIndexedDB } = await import("@/lib/db");
            await saveProjectToIndexedDB(curr as any);
          }
        } catch {}
      };
      const onLoadedMeta = () => {
        setDuration(el.duration || 0);
        if (project?.audio && (project as any).audio?.position && !isNaN((project as any).audio.position)) {
          el.currentTime = (project as any).audio.position;
        }
      };
      const onPlay = () => setIsPlaying(true);
      const onPause = () => setIsPlaying(false);
      const onEnded = () => setIsPlaying(false);
      
      el.addEventListener('timeupdate', onTime);
      el.addEventListener('loadedmetadata', onLoadedMeta);
      el.addEventListener('play', onPlay);
      el.addEventListener('pause', onPause);
      el.addEventListener('ended', onEnded);
      
      return () => {
        el.removeEventListener('timeupdate', onTime);
        el.removeEventListener('loadedmetadata', onLoadedMeta);
        el.removeEventListener('play', onPlay);
        el.removeEventListener('pause', onPause);
        el.removeEventListener('ended', onEnded);
      };
    }
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlay = () => {
    audioRef.current?.play();
  };

  const handlePause = () => {
    audioRef.current?.pause();
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const fileSize = audioFile ? (audioFile.size / 1024 / 1024).toFixed(2) : 0;

  return (
    <TooltipProvider>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-6">
            {/* Left Section - Brand & Navigation */}
            <div className="flex items-center gap-4 min-w-0 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-9 w-9 shrink-0"
                  >
                    <Link href="/">
                      <ArrowLeft className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voltar aos projetos</TooltipContent>
              </Tooltip>

              <Separator orientation="vertical" className="h-8" />

              <div className="flex items-center gap-3 min-w-0">
                <div className="flex flex-col leading-none">
                  <h1 className="text-xl font-bold tracking-tight text-foreground">PRETOS</h1>
                  <h2 className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">MUSIC</h2>
                </div>
                {title && (
                  <>
                    <Separator orientation="vertical" className="h-6" />
                    <div className="hidden sm:block min-w-0">
                      <p className="text-sm font-medium text-muted-foreground truncate max-w-[200px]">{title}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Center Section - Audio Player */}
            <div className="flex-1 flex items-center justify-center max-w-4xl mx-4 min-w-0">
              <Card className="w-full border-2 bg-card/80 backdrop-blur-sm shadow-sm">
                <div className="p-4 space-y-4">
                  {/* Upload Section */}
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <input
                        type="file"
                        accept=".wav,.mp3,audio/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        aria-label="Upload de áudio"
                        id="audio-upload"
                        disabled={isLoading}
                      />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={audioFile ? "secondary" : "default"}
                            size="sm"
                            className="gap-2 cursor-pointer min-w-[100px]"
                            disabled={isLoading}
                            asChild
                          >
                            <label htmlFor="audio-upload" className="cursor-pointer">
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              <span>{isLoading ? "Carregando..." : "Upload"}</span>
                            </label>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Carregar ficheiro de áudio (WAV, MP3)</TooltipContent>
                      </Tooltip>
                    </div>

                    {audioFile && (
                      <>
                        <Separator orientation="vertical" className="h-6" />
                        <div className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <FileAudio className="h-4 w-4 shrink-0 text-primary" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate" title={audioFile.name}>
                                {audioFile.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {audioFile.type.split('/')[1]?.toUpperCase() || 'AUDIO'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {fileSize} MB
                                </span>
                              </div>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => {
                                  setAudioFile(null);
                                  setAudioUrl(null);
                                  setCurrentTime(0);
                                  setDuration(0);
                                  setIsPlaying(false);
                                  if (audioRef.current) {
                                    audioRef.current.pause();
                                    audioRef.current.src = '';
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remover áudio</TooltipContent>
                          </Tooltip>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Audio Player Controls */}
                  {audioFile && (
                    <div className="space-y-3">
                      {/* Progress Bar with Time */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0 w-12 text-right">
                            {formatTime(currentTime)}
                          </span>
                          <div className="flex-1 relative group">
                            <input
                              type="range"
                              min="0"
                              max={duration || 0}
                              value={currentTime}
                              onChange={handleSeek}
                              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--secondary)) ${progress}%, hsl(var(--secondary)) 100%)`
                              }}
                            />
                          </div>
                          <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0 w-12">
                            {formatTime(duration)}
                          </span>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleSkip(-10)}
                                className="h-9 w-9"
                                disabled={!audioFile}
                              >
                                <SkipBack className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Retroceder 10s</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="default"
                                size="icon"
                                onClick={isPlaying ? handlePause : handlePlay}
                                className="h-10 w-10"
                                disabled={!audioFile}
                              >
                                {isPlaying ? (
                                  <Pause className="h-5 w-5" />
                                ) : (
                                  <Play className="h-5 w-5 ml-0.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{isPlaying ? "Pausar" : "Reproduzir"}</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleSkip(10)}
                                className="h-9 w-9"
                                disabled={!audioFile}
                              >
                                <SkipForward className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Avançar 10s</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={handleRestart}
                                className="h-9 w-9"
                                disabled={!audioFile}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reiniciar</TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Volume Control */}
                        <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                          <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume * 100}%, hsl(var(--secondary)) ${volume * 100}%, hsl(var(--secondary)) 100%)`
                            }}
                          />
                          <span className="text-xs font-mono tabular-nums text-muted-foreground w-8 shrink-0 text-right">
                            {Math.round(volume * 100)}%
                          </span>
                        </div>

                        {/* Metronome */}
                        <div className="shrink-0">
                          <Separator orientation="vertical" className="h-6 mx-2" />
                        </div>
                        <div className="shrink-0">
                          <Metronome />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!audioFile && !isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className="p-4 rounded-full bg-muted/50">
                          <Music2 className="h-8 w-8 text-muted-foreground/50" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-muted-foreground">Nenhum áudio carregado</p>
                          <p className="text-xs text-muted-foreground/70">Faça upload de um ficheiro para começar</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Hidden Audio Element */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                preload="metadata"
                style={{ display: 'none' }}
              />
            )}

            {/* Right Section - Theme & User */}
            <div className="flex items-center gap-2 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ModeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent>Tema</TooltipContent>
              </Tooltip>
              <UserNav />
            </div>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
