#!/usr/bin/env python3
"""Write the new VerseAudioRecorder.tsx with R2 support."""

import os

TARGET = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "apps", "web", "src", "components", "VerseAudioRecorder.tsx"
)

CONTENT = r'''"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2, Download, CloudOff, Cloud } from "lucide-react";

interface VerseAudioRecorderProps {
  verseId: string;
  projectId: string;
  audioRecording?: string;
  onRecordingChange: (value: string | undefined) => void;
  isSignedIn?: boolean;
}

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) return type;
  }
  return "audio/webm";
}

function isDataUrl(s?: string): boolean {
  return !!s && s.startsWith("data:");
}

function isStorageKey(s?: string): boolean {
  return !!s && !s.startsWith("data:") && !s.startsWith("http");
}

export default function VerseAudioRecorder({
  verseId,
  projectId,
  audioRecording,
  onRecordingChange,
  isSignedIn = false,
}: VerseAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Resolve playback URL whenever audioRecording changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (!audioRecording) {
      setPlaybackUrl(undefined);
      setDuration(0);
      return;
    }

    if (isDataUrl(audioRecording)) {
      setPlaybackUrl(audioRecording);
      loadAudioDuration(audioRecording);
    } else if (isStorageKey(audioRecording)) {
      // Fetch presigned URL from our files API
      fetch(`/api/files/${encodeURIComponent(audioRecording)}`)
        .then((res) => {
          if (res.redirected) {
            setPlaybackUrl(res.url);
            loadAudioDuration(res.url);
          } else if (res.ok) {
            return res.json().then((data: { url?: string }) => {
              if (data.url) {
                setPlaybackUrl(data.url);
                loadAudioDuration(data.url);
              }
            });
          }
        })
        .catch(() => {
          // Fallback: try direct URL
          setPlaybackUrl(`/api/files/${audioRecording}`);
        });
    } else {
      setPlaybackUrl(audioRecording);
      loadAudioDuration(audioRecording);
    }
  }, [audioRecording]);

  function loadAudioDuration(url: string) {
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration === Infinity) {
        audio.currentTime = 1e101;
        audio.addEventListener("timeupdate", function handler() {
          audio.removeEventListener("timeupdate", handler);
          setDuration(Math.round(audio.duration));
          audio.currentTime = 0;
        });
      } else {
        setDuration(Math.round(audio.duration));
      }
    });
  }

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const recordingDuration = Date.now() - startTimeRef.current;
        if (recordingDuration < 300) return; // Too short, discard

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setDuration(Math.round(recordingDuration / 1000));

        // Try R2 upload if signed in
        if (isSignedIn) {
          setIsUploading(true);
          try {
            const formData = new FormData();
            formData.append("file", audioBlob, `verse-${verseId}-flow.webm`);
            formData.append("projectId", projectId);
            formData.append("type", "audio");
            const res = await fetch("/api/upload", { method: "POST", body: formData });
            if (res.ok) {
              const { storageKey } = await res.json();
              onRecordingChange(storageKey);
              setIsUploading(false);
              return;
            }
          } catch (err) {
            console.error("R2 upload failed, falling back to base64:", err);
          }
          setIsUploading(false);
        }

        // Fallback: convert to base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => {
          onRecordingChange(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Permiss\u00e3o do microfone necess\u00e1ria para gravar \u00e1udio.");
    }
  }, [onRecordingChange, isSignedIn, projectId, verseId]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const togglePlayback = useCallback(() => {
    if (!playbackUrl) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    const audio = new Audio(playbackUrl);
    audioRef.current = audio;
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    audio.play();
    setIsPlaying(true);
    timerRef.current = setInterval(() => {
      setCurrentTime(Math.round(audio.currentTime));
    }, 200);
  }, [playbackUrl, isPlaying]);

  const deleteRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setPlaybackUrl(undefined);
    onRecordingChange(undefined);
  }, [onRecordingChange]);

  const downloadRecording = useCallback(() => {
    if (!playbackUrl) return;
    const link = document.createElement("a");
    link.href = playbackUrl;
    link.download = `verse-${verseId}-flow.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [playbackUrl, verseId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // --- Render ---

  if (isUploading) {
    return (
      <div className="flex items-center gap-2 text-xs text-blue-500">
        <Cloud className="h-3.5 w-3.5 animate-pulse" />
        A enviar para nuvem...
      </div>
    );
  }

  if (!audioRecording && !isRecording) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 text-xs border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={startRecording}
        title="Gravar flow do verso"
      >
        <Mic className="h-3.5 w-3.5" /> Gravar Flow
      </Button>
    );
  }

  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 border border-red-300 text-red-600 dark:text-red-400 text-xs animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          REC {formatTime(duration)}
        </div>
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="gap-1 h-7 text-xs"
          onClick={stopRecording}
        >
          <Square className="h-3 w-3" /> Parar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 h-7 text-xs"
        onClick={togglePlayback}
        title={isPlaying ? "Pausar" : "Ouvir flow"}
      >
        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
        {isPlaying ? formatTime(currentTime) : formatTime(duration)}
      </Button>
      {isStorageKey(audioRecording) && (
        <Cloud className="h-3 w-3 text-green-500" title="Na nuvem" />
      )}
      {isDataUrl(audioRecording) && (
        <CloudOff className="h-3 w-3 text-orange-400" title="Apenas local" />
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700"
        onClick={downloadRecording}
        title="Descarregar \u00e1udio"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
        onClick={deleteRecording}
        title="Apagar grava\u00e7\u00e3o"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 h-7 text-xs border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={startRecording}
        title="Regravar"
      >
        <Mic className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
'''

with open(TARGET, 'w') as f:
    f.write(CONTENT)

print(f"Written {len(CONTENT)} bytes to {TARGET}")
