"use client";

import React, { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import VideoVerseCard3 from "@/components/admin-panel/video/VideoVerseCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Vestuario() {
  const [verses, setVerses] = useState<number[]>([Date.now()]);

  const addNewVerse = () => {
    setVerses((prev) => [...prev, Date.now()]);
  };

  const removeVerse = () => {
    setVerses((prev) => (prev.length ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <ContentLayout title="Vídeo & Cinematografia">
       <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">Ver Medidas de Vestuário</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Medidas de Vestuário</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>Cabeça: [medida]</div>
            <div>Cintura: [medida]</div>
            <div>Parte Superior: [medida]</div>
            <div>Calça: [medida]</div>
            <div>Sapato: 43</div>
            <div>Pulso: [medida]</div>
            <div>Tamanho do Anel: [medida]</div>
            <div>Medidas da Corrente: [medida]</div>
            <div>Comprimento da Gravata de Seda: [medida]</div>
            <div>Graduação: [medida]</div>
          </div>
        </DialogContent>
      </Dialog>
      <div className="pt-4 gap-4">
        {verses.map((verseId, idx) => (
          <VideoVerseCard3 key={verseId} index={idx + 1} />
        ))}
      </div>
      
   
    </ContentLayout>
  );
}
