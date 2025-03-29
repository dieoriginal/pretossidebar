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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Button } from "@/components/ui/button";
import { VerseCard } from "@/components/admin-panel/estrofes/VerseCard"; // Adjust the path as necessary
import { FormValues } from "@/types";

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

export default function DashboardPage() {
  const sidebar = useSidebar();
  if (!sidebar) return <div>Loading...</div>;
  const { settings, setSettings } = sidebar;
  const [globalParams] = useState<FormValues>(initialPoeticParams);
  const [cards, setCards] = useState<number[]>([Date.now()]);

  const addNewCard = () => {
    setCards((prev) => [...prev, Date.now()]);
  };

  const removeCard = () => {
    setCards((prev) => (prev.length ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <ContentLayout title="Dashboard">
      <AdminPanelLayout rightSidebar={<Sidebar />}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
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
              <Link href="/cinematografia">Cinematografia</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/orcamento">Orçamento</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/filmagem">Filmagem</Link>
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
              <Link href="/monetizacao">Monetização</Link>
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
        <TooltipProvider>
          <div className="flex gap-6 mt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-hover-open"
                    onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                    checked={settings.isHoverOpen}
                  />
                  <Label htmlFor="is-hover-open">Abertura Subtíl</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Quando encostares o Mouse à esquerda, a barra de lado mostrar-se-á.
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="disable-sidebar"
                    onCheckedChange={(x) => setSettings({ disabled: x })}
                    checked={settings.disabled}
                  />
                  <Label htmlFor="disable-sidebar">Desativar Sidebar</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esconder a sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="pt-4 gap-4">
          {cards.map((cardId, idx) => (
            <VerseCard key={cardId} index={idx + 1} formParams={globalParams} />
          ))}
          <div className="flex justify-center gap-4">
            <Button onClick={addNewCard} className="bg-blue-500 text-white">
              Add New Estrofe
            </Button>
            <Button onClick={removeCard} className="bg-red-500 text-white">
              Remove Last Estrofe
            </Button>
            <Button 
              onClick={() => window.location.href = "http://localhost:3000/cinematografia"} 
              className="bg-green-500 text-white"
            >
              Ir para Cinematografia
            </Button>
          </div>
        </div>
      </AdminPanelLayout>
    </ContentLayout>
  );
}
