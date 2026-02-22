"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useProject } from "@/hooks/use-project";
import {
    Upload,
    Play,
    Pause,
    RotateCcw,
    Music2,
    FileAudio,
    Volume2,
    Loader2,
    X,
    SkipBack,
    SkipForward,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * GlobalAudioPlayer — a persistent floating audio player that stays
 * mounted across page navigations. Lives in root layout.
 */
export function GlobalAudioPlayer() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isExpanded, setIsExpanded] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const updateProject = useProject((s) => s.update);
    const project = useProject((s) => s.project);

    // --- File handling ---
    const handleFileChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            const audioMimeTypes = [
                "audio/wav", "audio/wave", "audio/x-wav",
                "audio/mpeg", "audio/mp3", "audio/ogg",
                "audio/aac", "audio/mp4", "audio/x-m4a",
                "audio/flac", "audio/webm",
            ];
            const audioExts = [".wav", ".mp3", ".ogg", ".aac", ".m4a", ".flac", ".webm"];
            const lowerType = (file.type || "").toLowerCase();
            const lowerName = file.name.toLowerCase();
            const isValid =
                lowerType.startsWith("audio/") ||
                audioMimeTypes.includes(lowerType) ||
                audioExts.some((ext) => lowerName.endsWith(ext));

            if (!isValid) {
                console.warn("Tipo de arquivo nao suportado:", file.type, file.name);
                return;
            }

            setIsLoading(true);
            setAudioFile(file);
            const url = URL.createObjectURL(file);
            setAudioUrl(url);
            setIsExpanded(true);
            updateProject({
                audio: {
                    name: file.name,
                    type: file.type || "audio/*",
                    size: file.size,
                    lastModified: file.lastModified,
                    hasBlob: true,
                },
            });
            (async () => {
                try {
                    const { saveProjectToIndexedDB } = await import("@/lib/db");
                    const current = useProject.getState().project;
                    if (current) {
                        await saveProjectToIndexedDB({ ...current, audioBlob: file });
                    }
                } catch {
                    // noop
                } finally {
                    setIsLoading(false);
                }
            })();
        },
        [updateProject]
    );

    // --- Restore audio from IndexedDB ---
    useEffect(() => {
        const load = async () => {
            const p: any = project;
            if (p && p.audioBlob instanceof Blob) {
                try {
                    const url = URL.createObjectURL(p.audioBlob);
                    setAudioUrl(url);
                    setAudioFile(
                        new File([p.audioBlob], p.audio?.name || "audio", {
                            type: p.audio?.type || p.audioBlob.type,
                        })
                    );
                } catch {
                    // noop
                }
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [project?.id]);

    // --- Audio element events ---
    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;
        if (audioUrl) {
            el.src = audioUrl;
            el.load();
        }

        const onTime = () => {
            setCurrentTime(el.currentTime);
            setDuration(el.duration || 0);
        };
        const onLoadedMeta = () => {
            setDuration(el.duration || 0);
            const pos = (project as any)?.audio?.position;
            if (pos && !isNaN(pos)) el.currentTime = pos;
        };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        el.addEventListener("timeupdate", onTime);
        el.addEventListener("loadedmetadata", onLoadedMeta);
        el.addEventListener("play", onPlay);
        el.addEventListener("pause", onPause);
        el.addEventListener("ended", onEnded);

        return () => {
            el.removeEventListener("timeupdate", onTime);
            el.removeEventListener("loadedmetadata", onLoadedMeta);
            el.removeEventListener("play", onPlay);
            el.removeEventListener("pause", onPause);
            el.removeEventListener("ended", onEnded);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioUrl]);

    // --- Persist position periodically ---
    useEffect(() => {
        if (!audioFile || !audioRef.current) return;
        const interval = setInterval(async () => {
            const el = audioRef.current;
            if (!el) return;
            try {
                updateProject({
                    audio: {
                        ...(project?.audio || ({} as any)),
                        position: el.currentTime,
                        duration: el.duration || 0,
                    },
                } as any);
            } catch {
                // noop
            }
        }, 5000);
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioFile]);

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const handlePlay = () => audioRef.current?.play();
    const handlePause = () => audioRef.current?.pause();
    const handleRestart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
        }
    };
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const t = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = t;
            setCurrentTime(t);
        }
    };
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        if (audioRef.current) audioRef.current.volume = v;
    };
    const handleSkip = (seconds: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(
                0,
                Math.min(duration, audioRef.current.currentTime + seconds)
            );
        }
    };
    const handleRemove = () => {
        setAudioFile(null);
        setAudioUrl(null);
        setCurrentTime(0);
        setDuration(0);
        setIsPlaying(false);
        setIsExpanded(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
        }
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Don't render anything if no audio and not loading
    if (!audioFile && !isLoading) {
        return (
            <div className="fixed bottom-3 left-3 z-[9998]">
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".wav,.mp3,audio/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    aria-label="Upload de audio"
                                    id="global-audio-upload"
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm"
                                    asChild
                                >
                                    <label htmlFor="global-audio-upload" className="cursor-pointer">
                                        <Music2 className="h-5 w-5 text-muted-foreground" />
                                    </label>
                                </Button>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">Upload de audio (WAV, MP3)</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            {/* Hidden audio element */}
            <audio ref={audioRef} preload="metadata" style={{ display: "none" }} />

            {/* Floating player bar */}
            <div
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-[9998] bg-background/95 backdrop-blur-xl border-t shadow-2xl transition-all duration-300",
                    isExpanded ? "pb-2" : ""
                )}
            >
                {/* Mini bar — always visible */}
                <div className="flex items-center gap-2 px-3 py-1.5">
                    {/* Play/Pause */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={isPlaying ? handlePause : handlePlay}
                        disabled={!audioFile || isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isPlaying ? (
                            <Pause className="h-4 w-4" />
                        ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                        )}
                    </Button>

                    {/* File info */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <FileAudio className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-xs font-medium truncate">
                            {audioFile?.name || "Carregando..."}
                        </span>
                    </div>

                    {/* Time */}
                    <span className="text-[10px] font-mono tabular-nums text-muted-foreground shrink-0">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Progress bar — mini */}
                    <div className="flex-1 max-w-[200px] hidden sm:block">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleSeek}
                            className="w-full h-1 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                            style={{
                                background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--secondary)) ${progress}%, hsl(var(--secondary)) 100%)`,
                            }}
                        />
                    </div>

                    {/* Expand/Collapse */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 shrink-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5" />
                        ) : (
                            <ChevronUp className="h-3.5 w-3.5" />
                        )}
                    </Button>

                    {/* Close */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0"
                                onClick={handleRemove}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Remover audio</TooltipContent>
                    </Tooltip>
                </div>

                {/* Expanded controls */}
                {isExpanded && (
                    <div className="px-3 pb-1 space-y-2">
                        {/* Full seek bar */}
                        <div className="flex items-center gap-2 sm:hidden">
                            <span className="text-[10px] font-mono text-muted-foreground w-9 text-right">
                                {formatTime(currentTime)}
                            </span>
                            <input
                                type="range"
                                min="0"
                                max={duration || 0}
                                value={currentTime}
                                onChange={handleSeek}
                                className="flex-1 h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--secondary)) ${progress}%, hsl(var(--secondary)) 100%)`,
                                }}
                            />
                            <span className="text-[10px] font-mono text-muted-foreground w-9">
                                {formatTime(duration)}
                            </span>
                        </div>

                        {/* Transport + Volume + Upload */}
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleSkip(-10)}>
                                    <SkipBack className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={handleRestart}>
                                    <RotateCcw className="h-3 w-3" />
                                </Button>
                                <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => handleSkip(10)}>
                                    <SkipForward className="h-3 w-3" />
                                </Button>
                            </div>

                            {/* Volume */}
                            <div className="flex items-center gap-1.5 max-w-[140px]">
                                <Volume2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={volume}
                                    onChange={handleVolumeChange}
                                    className="flex-1 h-1 bg-secondary rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${volume * 100}%, hsl(var(--secondary)) ${volume * 100}%, hsl(var(--secondary)) 100%)`,
                                    }}
                                />
                                <span className="text-[10px] font-mono text-muted-foreground w-6 text-right">
                                    {Math.round(volume * 100)}
                                </span>
                            </div>

                            {/* Upload new */}
                            <div className="relative shrink-0">
                                <input
                                    type="file"
                                    accept=".wav,.mp3,audio/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    aria-label="Upload de audio"
                                    id="global-audio-upload-expanded"
                                />
                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5" asChild>
                                    <label htmlFor="global-audio-upload-expanded" className="cursor-pointer">
                                        <Upload className="h-3 w-3" />
                                        Trocar
                                    </label>
                                </Button>
                            </div>

                            {/* File info badge */}
                            {audioFile && (
                                <Badge variant="outline" className="text-[10px] shrink-0 hidden sm:inline-flex">
                                    {audioFile.type.split("/")[1]?.toUpperCase() || "AUDIO"} · {(audioFile.size / 1024 / 1024).toFixed(1)}MB
                                </Badge>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </TooltipProvider>
    );
}
