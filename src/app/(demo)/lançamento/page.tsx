// pages/videoform.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { Button } from "@/components/ui/button";
import VideoVerseCard2 from "@/components/admin-panel/video/VideoVerseCard2";

export default function VideoFormPage() {
  const [verses, setVerses] = useState<number[]>([Date.now()]);

  const addNewVerse = () => {
    setVerses((prev) => [...prev, Date.now()]);
  };

  const removeVerse = () => {
    setVerses((prev) => (prev.length ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <ContentLayout title="Vídeo & Cinematografia">
   
      <div className="pt-4 gap-4">
       
       
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={addNewVerse} className="bg-blue-500 text-white">
            Add New Verse
          </Button>
          <Button onClick={removeVerse} className="bg-red-500 text-white">
            Remove Last Verse
          </Button>
          <Button
            onClick={() => (window.location.href = "/directorstreatment")}
            className="bg-green-500 text-white"
          >
            Salvar e Repetir
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
