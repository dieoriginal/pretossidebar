"use client";

import React, { useState, useCallback } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Button } from "@/components/ui/button";
import { VerseCard } from "@/components/admin-panel/estrofes/VerseCard";
import OtherVerseCard from "@/components/admin-panel/estrofes/OtherVerseCard";
import VideoVerseCard2 from "@/components/admin-panel/video/VideoVerseCard2";
import { FormValues } from "@/types";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";

const initialPoeticParams: FormValues = {
  tipo: "Épica",
  forma: "Longa, narrativa, hexâmetro dactílico",
  tema: "Mitologia, heróis, guerra",
  arquétipo: "Prometeu",
  apolineo: 50,
  dionisíaco: 50,
  efeitoDesejado: [],
  tipoMetrica: "trocaico",
  silabasPorLinha: 12,
  posicaoCesura: 6,
  esquemaRima: "ABAB - ABBA - AABB",
  enjambement: 0.3,
  aliteracaoConsoante: "m",
  aliteracaoFrequencia: 3,
  assonanciaVogal: "ó",
  assonanciaPadrao: "cíclico",
  onomatopeias: ["estrondo", "rugir", "crepitar"],
  prologo: "Exposição do conflito",
  parodos: "Entrada do coro",
  episodios: [
    "Ascensão do herói",
    "Erro trágico (hamartia)",
    "Virada de fortuna (peripeteia)",
    "Queda (catástrofe)",
    "Reconhecimento (anagnórise)",
  ],
  exodo: "Lições do coro",
  dicionarioPoetico: [
    { termo: "Fogo", categoria: "Prometeico", significado: "Rebelião/Iluminação" },
    { termo: "Lâmina", categoria: "Sacrifício", significado: "Ruptura/Iniciação" },
    { termo: "Abismo", categoria: "Nietzschiano", significado: "Vazio/Criação" },
  ],
};

const PreviewModal = ({ verses }: { verses: string[] }) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" className="gap-2">
        <EyeIcon className="h-4 w-4" />
        Pré-visualizar
      </Button>
    </DialogTrigger>
    <DialogContent className="min-h-[90vh] max-w-[800px]">
      <DialogHeader>
        <DialogTitle className="text-center">Pré-visualização</DialogTitle>
      </DialogHeader>
      <div className="bg-white p-8 h-full">
        <div className="font-helvetica uppercase text-black text-center space-y-6 text-lg">
          {verses.map((verse, index) => (
            <p key={index} className="break-words">{verse}</p>
          ))}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

const exportToPDF = (verses: string[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const lineHeight = 10;
  let yPosition = 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(0);

  verses.forEach((verse) => {
    const lines = doc.splitTextToSize(verse.toUpperCase(), pageWidth - 20);
    
    lines.forEach((line: string) => {
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.text(line, 10, yPosition);
      yPosition += lineHeight;
    });
    
    yPosition += lineHeight;
  });

  doc.save("Diepretty1.pdf");
};

export default function DashboardPage() {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;
  const [globalParams] = useState<FormValues>(initialPoeticParams);
  const [cards, setCards] = useState<number[]>([Date.now()]);
  const [allVerses, setAllVerses] = useState<string[][]>([]);
  const [activeTab, setActiveTab] = useState("versos");

  const addNewCard = () => setCards((prev) => [...prev, Date.now()]);
  const removeCard = () => setCards((prev) => prev.slice(0, -1));

  const handleVersesUpdate = useCallback((index: number, verses: string[]) => {
    setAllVerses(prev => {
      const newVerses = [...prev];
      newVerses[index] = verses;
      return newVerses;
    });
  }, []);

  if (!sidebar) return <div>Carregando...</div>;

  const renderCards = () => {
    switch(activeTab) {
      case "versos":
        return cards.map((cardId, idx) => (
          <VerseCard 
            key={cardId} 
            index={idx} 
            formParams={globalParams} 
            className="shadow-lg hover:shadow-xl transition-shadow"
            onVersesChange={(verses) => handleVersesUpdate(idx, verses)}
          />
        ));
      case "pdf":
        return cards.map((cardId, idx) => (
          <OtherVerseCard 
            key={cardId} 
            index={idx} 
            formParams={globalParams} 
            className="shadow-lg hover:shadow-xl transition-shadow"
            onVersesChange={(verses) => handleVersesUpdate(idx, verses)}
          />
        ));
      case "cinematografia":
        return cards.map((cardId, idx) => (
          <VideoVerseCard2
            key={cardId}
            index={idx}
          />
        ));
      default:
        return null;
    }
  };

  return (
    <ContentLayout title="Dashboard">
      <AdminPanelLayout rightSidebar={<Sidebar />}>
        <Card className="mb-6 h-[36px] flex items-center justify-center">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="versos">Versificação</TabsTrigger>
                <TabsTrigger value="pdf">Documentação</TabsTrigger>
                <TabsTrigger value="cinematografia">Cinematografia</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {renderCards()}

          <Card className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardContent className="pt-6 flex justify-center gap-4 flex-wrap">
              <div className="flex gap-4">
                {activeTab !== "cinematografia" && (
                  <>
                    <Button onClick={addNewCard} variant="default" className="gap-2">
                      <PlusIcon className="h-4 w-4" />
                      Adicionar Estrofe
                    </Button>
                    <Button onClick={removeCard} variant="destructive" className="gap-2">
                      <TrashIcon className="h-4 w-4" />
                      Remover Estrofe
                    </Button>
                  </>
                )}
              </div>

              <div className="flex gap-4">
                {activeTab === "versos" && <PreviewModal verses={allVerses.flat()} />}

           

                {activeTab === "cinematografia" && (
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                  >
                    <VideoIcon className="h-4 w-4" />
                    Gerar Storyboard
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminPanelLayout>
    </ContentLayout>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z"/></svg>;
}

function TrashIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6zM19 4h-3.5l-1-1h-5l-1 1H5v2h14z"/></svg>;
}

function VideoIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11z"/></svg>;
}

function EyeIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5"/></svg>;
}

function FileTextIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path fill="currentColor" d="M14 2v6h6m-4 5H8m8 4H8m2-8H8"/></svg>;
}