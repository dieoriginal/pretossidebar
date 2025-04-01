// pages/videoform.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
      <Breadcrumb>
        <BreadcrumbList>
        
    
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/instrumental">Instrumental</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/contextualizacao">Contextualização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/versificacao">Versificação</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/gravacao">Recording</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cinematografia">Cinematografia</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/orcamento">Orçamentalização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/filmagem">Filmagens</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/contratualizacao">Contratualização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/direitosautorais">Direitos Autorais</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
     


          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/lançamendo">Lançamento</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="pt-4 gap-4">
        {verses.map((verseId, idx) => (
          <VideoVerseCard2 key={verseId} index={idx + 1} />
        ))}
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={addNewVerse} className="bg-blue-500 text-white">
            Adicionar Verso
          </Button>
          <Button onClick={removeVerse} className="bg-red-500 text-white">
           Remover Verso
          </Button>
          <Button
            onClick={() => (window.location.href = "/orcamento")}
            className="bg-green-500 text-white"
          >
            Pronto para Orçamentalizar
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
