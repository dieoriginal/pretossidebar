"use client";

import React from "react";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";
import VideoVerseCard3 from "@/components/admin-panel/video/VideoVerseCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TShirtTextsDialog } from "@/components/library";

export default function Vestuario() {
  return (
    <ContentLayout title="Vídeo & Cinematografia">
      <div className="flex items-center gap-2">
        <TShirtTextsDialog />
      </div>
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
          <div className="mt-4">
            <div className="font-medium mb-2">Presets históricos e peças especiais</div>
            <TooltipProvider>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">Aketon (incl. variação Viking)</TooltipTrigger>
                    <TooltipContent className="max-w-xs">Jaqueta acolchoada medieval usada sob a cota de malha; versão viking com corte mais curto e liberdade de movimento.</TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">Coroas</TooltipTrigger>
                    <TooltipContent className="max-w-xs">Coroas leves (latão/bronze) para figurino; considerar conforto e fixação para performance.</TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">Batinas de seda</TooltipTrigger>
                    <TooltipContent className="max-w-xs">Túnicas/batinas de seda com bom caimento para palco e vídeo; combinações monocromáticas funcionam bem na câmera.</TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">Leather Arm Garter</TooltipTrigger>
                    <TooltipContent className="max-w-xs">Cinta de couro para braço/antebraço; reforço estético, pode segurar sleeves e micro bodypack.</TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">Arming Cotton Padded Gambeson – Doublet HEMA</TooltipTrigger>
                    <TooltipContent className="max-w-xs">Gibão acolchoado de treino HEMA; boa estrutura e linhas limpas para figurino histórico-contemporâneo.</TooltipContent>
                  </Tooltip>
                </li>
                <li>
                  <Tooltip>
                    <TooltipTrigger className="underline decoration-dotted">Gambeson menos volumoso</TooltipTrigger>
                    <TooltipContent className="max-w-xs">Versão slim/leve para liberdade em palco; manter silhueta sem excesso de volume sob luz.</TooltipContent>
                  </Tooltip>
                </li>
              </ul>
            </TooltipProvider>
          </div>
        </DialogContent>
      </Dialog>
      <div className="pt-4 gap-4">
        <VideoVerseCard3 />
      </div>
      
   
    </ContentLayout>
  );
}
