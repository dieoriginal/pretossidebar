"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Play,
    Pause,
    Search,
    Plus,
    X,
    Loader2,
    Download,
    Music,
    AlertCircle,
    RefreshCw,
    Trash2,
    Volume2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Beat {
    id: string;
    messageId: string;
    filename: string;
    url: string;
    size: number;
    contentType: string | null;
    author: string;
    authorAvatar: string | null;
    message: string | null;
    timestamp: string;
}

interface SavedChannel {
    id: string;
    label: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimestamp(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-PT", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function cleanFilename(filename: string): string {
    // Remove extension and clean up common patterns
    return filename
        .replace(/\.(mp3|wav|flac|ogg|aac|m4a|aiff|wma)$/i, "")
        .replace(/[-_]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ─── Saved Channels (localStorage) ──────────────────────────────────────────

const CHANNELS_KEY = "discord-beats-channels";

function getSavedChannels(): SavedChannel[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(CHANNELS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveChannels(channels: SavedChannel[]) {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function DiscordBeatsPage() {
    // Channel state
    const [channelInput, setChannelInput] = useState("");
    const [channelLabel, setChannelLabel] = useState("");
    const [savedChannels, setSavedChannels] = useState<SavedChannel[]>([]);
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

    // Beats state
    const [beats, setBeats] = useState<Beat[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cursor, setCursor] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);

    // Search/filter
    const [searchQuery, setSearchQuery] = useState("");

    // Audio player
    const [playingId, setPlayingId] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Load saved channels on mount
    useEffect(() => {
        setSavedChannels(getSavedChannels());
    }, []);

    // ─── Fetch beats ────────────────────────────────────────────────────────

    const fetchBeats = useCallback(
        async (channelId: string, loadMore = false) => {
            setLoading(true);
            setError(null);

            try {
                let url = `/api/discord/beats?channelId=${channelId}&limit=50`;
                if (loadMore && cursor) {
                    url += `&before=${cursor}`;
                }

                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || `Error ${res.status}`);
                    return;
                }

                if (loadMore) {
                    setBeats((prev) => [...prev, ...data.beats]);
                } else {
                    setBeats(data.beats);
                }

                setCursor(data.cursor);
                setHasMore(data.hasMore);
            } catch (err) {
                setError("Failed to connect to API");
            } finally {
                setLoading(false);
            }
        },
        [cursor]
    );

    // ─── Channel actions ───────────────────────────────────────────────────

    const loadChannel = (channelId: string) => {
        setActiveChannelId(channelId);
        setBeats([]);
        setCursor(null);
        setHasMore(false);
        setSearchQuery("");
        stopAudio();
        fetchBeats(channelId);
    };

    const addChannel = () => {
        const id = channelInput.trim();
        if (!id) return;

        const label = channelLabel.trim() || `Channel ${id.slice(-4)}`;
        const existing = savedChannels.find((c) => c.id === id);

        if (!existing) {
            const updated = [...savedChannels, { id, label }];
            setSavedChannels(updated);
            saveChannels(updated);
        }

        setChannelInput("");
        setChannelLabel("");
        loadChannel(id);
    };

    const removeChannel = (channelId: string) => {
        const updated = savedChannels.filter((c) => c.id !== channelId);
        setSavedChannels(updated);
        saveChannels(updated);

        if (activeChannelId === channelId) {
            setActiveChannelId(null);
            setBeats([]);
        }
    };

    // ─── Audio player ─────────────────────────────────────────────────────

    const playBeat = (beat: Beat) => {
        if (playingId === beat.id) {
            stopAudio();
            return;
        }

        stopAudio();

        const audio = new Audio(beat.url);
        audio.addEventListener("ended", () => setPlayingId(null));
        audio.addEventListener("error", () => {
            setPlayingId(null);
            setError("Audio failed to load — URL may have expired. Try refreshing.");
        });
        audio.play();
        audioRef.current = audio;
        setPlayingId(beat.id);
    };

    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setPlayingId(null);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // ─── Filtered beats ───────────────────────────────────────────────────

    const filteredBeats = beats.filter((b) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            b.filename.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            (b.message && b.message.toLowerCase().includes(q))
        );
    });

    // ─── Render ───────────────────────────────────────────────────────────

    return (
        <AppShell title="Discord Beats" showSidebar={false} contained={false}>
            <div className="max-w-3xl mx-auto space-y-4">
                {/* ── Header ─────────────────────────────────────────────── */}
                <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        Discord Beats
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Browse beats from your Discord channels — works inside FL Studio
                    </p>
                </div>

                {/* ── Saved Channels ─────────────────────────────────────── */}
                {savedChannels.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {savedChannels.map((ch) => (
                            <div key={ch.id} className="flex items-center gap-1">
                                <Button
                                    variant={activeChannelId === ch.id ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => loadChannel(ch.id)}
                                    className="text-xs"
                                >
                                    <Volume2 className="w-3 h-3 mr-1" />
                                    {ch.label}
                                </Button>
                                <button
                                    onClick={() => removeChannel(ch.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors p-0.5"
                                    aria-label={`Remove ${ch.label}`}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Add Channel ────────────────────────────────────────── */}
                <div className="flex gap-2">
                    <Input
                        placeholder="Channel ID"
                        value={channelInput}
                        onChange={(e) => setChannelInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addChannel()}
                        className="flex-1 font-mono text-sm"
                    />
                    <Input
                        placeholder="Label (optional)"
                        value={channelLabel}
                        onChange={(e) => setChannelLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addChannel()}
                        className="w-36 text-sm"
                    />
                    <Button onClick={addChannel} size="sm" disabled={!channelInput.trim()}>
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                {/* ── Error ──────────────────────────────────────────────── */}
                {error && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                            <p className="font-medium">{error}</p>
                            {error.includes("not configured") && (
                                <p className="text-xs mt-1 opacity-80">
                                    Add <code className="px-1 py-0.5 rounded bg-destructive/10">DISCORD_BOT_TOKEN</code> to your{" "}
                                    <code className="px-1 py-0.5 rounded bg-destructive/10">.env.local</code>
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Search ─────────────────────────────────────────────── */}
                {beats.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search beats by name or producer..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>
                )}

                {/* ── Stats bar ──────────────────────────────────────────── */}
                {activeChannelId && beats.length > 0 && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                            {filteredBeats.length} beat{filteredBeats.length !== 1 ? "s" : ""}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadChannel(activeChannelId)}
                            className="text-xs h-7"
                        >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Refresh
                        </Button>
                    </div>
                )}

                {/* ── Beat List ──────────────────────────────────────────── */}
                {loading && beats.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="w-8 h-8 animate-spin mb-3" />
                        <p className="text-sm">Loading beats...</p>
                    </div>
                ) : !activeChannelId ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Music className="w-12 h-12 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No channel selected</p>
                        <p className="text-xs mt-1">
                            Paste a Discord channel ID above and hit{" "}
                            <kbd className="px-1.5 py-0.5 rounded border text-[10px] font-mono">+</kbd>
                        </p>
                    </div>
                ) : beats.length === 0 && !loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Music className="w-12 h-12 mb-3 opacity-40" />
                        <p className="text-sm font-medium">No audio files found</p>
                        <p className="text-xs mt-1">
                            This channel has no .mp3, .wav, .flac, or .ogg attachments
                        </p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {filteredBeats.map((beat) => (
                            <div
                                key={beat.id}
                                className={`
                  group flex items-center gap-3 p-3 rounded-lg border transition-all
                  ${playingId === beat.id
                                        ? "bg-primary/10 border-primary/30 shadow-sm"
                                        : "bg-card hover:bg-accent/50 border-transparent hover:border-border"
                                    }
                `}
                            >
                                {/* Play/Pause button */}
                                <button
                                    onClick={() => playBeat(beat)}
                                    className={`
                    shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all
                    ${playingId === beat.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                        }
                  `}
                                    aria-label={playingId === beat.id ? "Pause" : "Play"}
                                >
                                    {playingId === beat.id ? (
                                        <Pause className="w-4 h-4" />
                                    ) : (
                                        <Play className="w-4 h-4 ml-0.5" />
                                    )}
                                </button>

                                {/* Beat info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {cleanFilename(beat.filename)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-muted-foreground truncate">
                                            {beat.author}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground/50">
                                            {formatTimestamp(beat.timestamp)}
                                        </span>
                                    </div>
                                    {beat.message && (
                                        <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                                            {beat.message}
                                        </p>
                                    )}
                                </div>

                                {/* Meta */}
                                <div className="shrink-0 flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] font-mono">
                                        {beat.filename.split(".").pop()?.toUpperCase()}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground hidden sm:inline">
                                        {formatFileSize(beat.size)}
                                    </span>
                                    <a
                                        href={beat.url}
                                        download={beat.filename}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                                        aria-label={`Download ${beat.filename}`}
                                    >
                                        <Download className="w-4 h-4 text-muted-foreground" />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Load More ──────────────────────────────────────────── */}
                {hasMore && activeChannelId && (
                    <div className="flex justify-center pt-2 pb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchBeats(activeChannelId, true)}
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Plus className="w-4 h-4 mr-2" />
                            )}
                            Load More
                        </Button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
