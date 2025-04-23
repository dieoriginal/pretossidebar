"use client"

import { ModeToggle } from "@/components/mode-toggle";
import { UserNav } from "@/components/admin-panel/user-nav";
import { SheetMenu } from "@/components/admin-panel/sheet-menu";
import ControlRoomSidebar from "../control-room-sider";
import Metronome from "./estrofes/metronome";
import { useState, useRef } from "react";

interface NavbarProps {
  title: string;
}

export function Navbar({ title }: NavbarProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'audio/wav' || file.type === 'audio/mpeg')) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  return (
    <header className="sticky top-0 z-10 h-[89px] w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center justify-between">
        <div id="borda-esquerda" className="border border-transparent h-[59px] w-[141px] rounded-lg">
          <div id="borda-titulo" className="border border-transparent h-[39px] w-[121px] rounded-lg ml-18 mt-2.5">
            <div className="items-center ml-8">
              <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">PRETOS
                <h1 className="text-lg -mt-4 italic tracking-widest">MUSIC</h1>
              </h1>
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
