"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";

import { ContentLayout } from "@/components/admin-panel/content-layout";

import PlaceholderContentUpload from "@/components/demo/placeholder-contentupload";

// Import your Player component and its Track type.
import Player, { Track } from "../../../components/madzadev/Player";

const defaultTracks: Track[] = [
  {
    url: "https://audioplayer.madza.dev/Madza-Chords_of_Life.mp3",
    title: "Madza - Chords of Life",
  },
  {
    url: "https://audioplayer.madza.dev/Madza-Late_Night_Drive.mp3",
    title: "Madza - Late Night Drive",
  },
  {
    url: "https://audioplayer.madza.dev/Madza-Persistence.mp3",
    title: "Madza - Persistence",
  },
];

export default function TagsPage() {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const trackUrl = URL.createObjectURL(file);
      const trackTitle = file.name;
      setTracks((prevTracks) => [...prevTracks, { url: trackUrl, title: trackTitle }]);
    }
  };

  return (
    <ContentLayout title="Tags">
   

      


    

      <PlaceholderContentUpload />
    </ContentLayout>
  );
}
