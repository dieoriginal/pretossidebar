"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Pause, Trash2, Download } from "lucide-react";

interface VerseAudioRecorderProps {
  /** Unique key to store this verse's recording (e.g. verse id) */
  verseId: string;
  /** Existing audio data URL (loaded from persisted state) */
  audioDataUrl?: string;
  /** Called when a recording is saved or deleted */
  onRecordingChange: (audioDataUrl: string | undefined) => void;
}

/** Returns the best supported mime type for MediaRecorder */
function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/wav",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "audio/webm";
}

export default function VerseAudioRecorder({
  verseId,
  audioDataUrl,
  onRecordingChange,
}: VerseAudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Clean up on unmount
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

  // When audioDataUrl changes externally, reset playback state
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    // Calculate duration from dataUrl
    if (audioDataUrl) {
      const audio = new Audio(audioDataUrl);
      audio.addEventListener("loadedmetadata", () => {
        // Some browsers return Infinity for webm blobs — use workaround
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
    } else {
      setDuration(0);
    }
  }, [audioDataUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Release microphone
        stream.getTracks().forEach((track) => track.stop());

        const recordingDuration = Date.now() - startTimeRef.current;
        if (recordingDuration < 300) {
          // Too short, ignore
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        // Convert blob to data URL for persistence
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          onRecordingChange(dataUrl);
          setDuration(Math.round(recordingDuration / 1000));
        };
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Live timer
      timerRef.current = setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Permissão do microfone necessária para gravar áudio.");
    }
  }, [onRecordingChange]);

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
    if (!audioDataUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const audio = new Audio(audioDataUrl);
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
  }, [audioDataUrl, isPlaying]);

  const deleteRecording = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    onRecordingChange(undefined);
  }, [onRecordingChange]);

  const downloadRecording = useCallback(() => {
    if (!audioDataUrl) return;
    const link = document.createElement("a");
    link.href = audioDataUrl;
    link.download = `verse-${verseId}-flow.webm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [audioDataUrl, verseId]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // No recording yet — show record button
  if (!audioDataUrl && !isRecording) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="gap-1 text-xs border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
        onClick={startRecording}
        title="Gravar flow do verso"
      >
        <Mic className="h-3.5 w-3.5" />
        Gravar Flow
      </Button>
    );
  }

  // Currently recording
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
          <Square className="h-3 w-3" />
          Parar
        </Button>
      </div>
    );
  }

  // Has recording — show playback controls
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
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-blue-500 hover:text-blue-700"
        onClick={downloadRecording}
        title="Descarregar áudio"
      >
        <Download className="h-3.5 w-3.5" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
        onClick={deleteRecording}
        title="Apagar gravação"
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
