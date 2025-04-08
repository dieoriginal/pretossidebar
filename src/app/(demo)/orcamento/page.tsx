// pages/videoform.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import FilmingBudgetPage from "@/components/admin-panel/video/VideoVerseCard4";

import { Button } from "@/components/ui/button";
import VideoVerseCard from "@/components/admin-panel/video/VideoVerseCard";

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
      
      <FilmingBudgetPage/>
       
      </div>
    </ContentLayout>
  );
}
