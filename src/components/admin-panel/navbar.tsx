"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import Metronome from "./estrofes/metronome";
import { useState, useRef, useEffect } from "react";
import { useProject } from "@/hooks/use-project";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const updateProject = useProject((s) => s.update);
  const project = useProject((s) => s.project);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'audio/wav' || file.type === 'audio/mpeg')) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      updateProject({ audio: { name: file.name, type: file.type, size: file.size, lastModified: file.lastModified, hasBlob: true } });
      // Persist blob in IndexedDB alongside project entry
      (async () => {
        try {
          const { saveProjectToIndexedDB } = await import("@/lib/db");
          const current = useProject.getState().project;
          if (current) {
            // store blob inside project; IndexedDB supports Blob
            await saveProjectToIndexedDB({ ...current, audioBlob: file });
          }
        } catch {}
      })();
    }
  };

  useEffect(() => {
    // Hydrate audio URL from persisted blob if present
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
          updateProject({ audio: { ...(project?.audio || {}), position: el.currentTime, duration: el.duration || 0 } } as any);
          const curr = useProject.getState().project;
          if (curr) {
            const { saveProjectToIndexedDB } = await import("@/lib/db");
            await saveProjectToIndexedDB(curr as any);
          }
        } catch {}
      };
      const onLoadedMeta = () => {
        if (project?.audio && (project as any).audio?.position && !isNaN((project as any).audio.position)) {
          el.currentTime = (project as any).audio.position;
        }
      };
      el.addEventListener('timeupdate', onTime);
      el.addEventListener('loadedmetadata', onLoadedMeta);
      return () => {
        el.removeEventListener('timeupdate', onTime);
        el.removeEventListener('loadedmetadata', onLoadedMeta);
      };
    }
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  return (
    <header className="sticky top-0 z-10 h-[89px] w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Notas</span>
          </Link>
          <div id="borda-esquerda" className="border border-transparent h-[59px] w-[141px] rounded-lg">
            <div id="borda-titulo" className="border border-transparent h-[39px] w-[121px] rounded-lg ml-18 mt-2.5">
              <div className="items-center ml-8">
                <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">PRETOS
                  <h1 className="text-lg -mt-4 italic tracking-widest">MUSIC</h1>
                </h1>
              </div>
            </div>    
          </div>
        </div>

        <div className="flex items-center flex-1 justify-center">
          <div className="border h-[89px] w-full max-w-[1556px] rounded-lg flex">
            <div className="flex-1 p-4">
              <div className="flex items-center justify-center gap-4">
                {/* Audio Upload Section */}
                <div className="w-[120px] p-2 flex flex-col items-center justify-center rounded-lg bg-background/50 backdrop-blur">
                  <div className="relative w-full">
                    <input
                      type="file"
                      accept=".wav,.mp3"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      aria-label="Upload de áudio"
                      title="Upload de áudio"
                    />
                    <div className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center">
                      Upload
                    </div>
                  </div>
                </div>

                {/* Audio Player Section */}
                <div className="flex-1 min-w-[400px] mx-2 rounded-lg p-2 mt-2 bg-background/50 backdrop-blur">
                  <div className="flex flex-col gap-1 w-full">
                    {/* File Name Display */}
                    {audioFile && (
                      <div className="text-sm font-medium text-center truncate">
                        {audioFile.name}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 w-full">
                      <audio
                        ref={audioRef}
                        src={audioUrl || ''}
                        controls
                        className="w-full h-8"
                      />
                      <button
                        onClick={() => audioRef.current?.play()}
                        className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        ▶️
                      </button>
                      <button
                        onClick={() => audioRef.current?.pause()}
                        className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        ⏸️
                      </button>
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play();
                          }
                        }}
                        className="p-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        ⏮️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metronome Section */}
                <div className="w-[120px] p-2 rounded-lg bg-background/50 backdrop-blur">
                  <Metronome />
                </div>
              </div>
            </div>

          

          </div>
        </div>

        <div className="flex items-center">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
