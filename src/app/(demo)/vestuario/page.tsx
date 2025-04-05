"use client";

import React, { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import VideoVerseCard3 from "@/components/admin-panel/video/VideoVerseCard";

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
      <div className="pt-4 gap-4">
        {verses.map((verseId, idx) => (
          <VideoVerseCard3 key={verseId} index={idx + 1} />
        ))}
      </div>
    </ContentLayout>
  );
}
