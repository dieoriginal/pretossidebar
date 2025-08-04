"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Lock,
  Music,
  Sliders,
  Rocket,
  Headphones,
  Wrench,
  MessageSquare,
  Instagram,
  Radio,
  Video,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Step = {
  id: string;
  label: string;
  completed: boolean;
  required?: boolean;
  link?: string;
  description?: string;
};

type Phase = {
  title: string;
  icon: JSX.Element;
  steps: Step[];
  locked: boolean;
};

export default function PromotionProcessPage() {
  const [phases, setPhases] = useState<Phase[]>([
    {
      title: "GUERRILLA",
      icon: <Rocket className="h-5 w-5 text-orange-400" />,
      locked: false,
      steps: [
        {
          id: "launch-1",
          label: "Design os Panfletos",
          completed: false,
          required: true,
        },
        {
          id: "launch-2",
          label: "Imprimir os Panfletos",
          completed: false,
          required: true,
        },
        {
          id: "launch-3",
          label: "Colar os Panfletos em zonas apropriadas",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "YOUTUBE",
      icon: <Music className="h-5 w-5 text-red-400" />,
      locked: true,
      steps: [
        {
          id: "youtube-1",
          label: "Carregar o Vídeo no Youtube com o Estilo Predefinido",
          completed: false,
          required: true,
        },
        {
          id: "youtube2-1",
          label: "Anúncio Youtube",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "Playlists do Spotify",
      icon: <Music className="h-5 w-5 text-green-400" />,
      locked: true,
      steps: [
        {
          id: "spotify-1",
          label: "Portugal Top Hits",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/1x3MiIk9ATgGkK60xyfb2",
          description: "Curator: Playsify | Followers: 25.1K",
        },
        {
          id: "spotify-2",
          label: "Portugal Best Of 2025",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/...",
          description: "Curator: Playsify | Followers: 8.43K",
        },
        {
          id: "spotify-3",
          label: "O RAP TUGA ESTÁ FRESH!",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/1x3Mik9ATgGkK60xyfb2",
          description: "Curator: tranqui-low | Followers: 1.68K",
        },
        {
          id: "spotify-25",
          label: "TRAP BRASIL +",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/...",
          description: "Followers: 21.2K",
        },
        {
          id: "spotify-26",
          label: "TRAPzera - As melhores",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/...",
          description: "Curator: Echo Brasil | Followers: 20.8K",
        },
        {
          id: "spotify-50",
          label: "SALÁRIO MINIMO",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/...",
          description: "Curator: Na Zona | Followers: N/A",
        },
        {
          id: "spotify-51",
          label: "RAP CAVIAR",
          completed: false,
          required: true,
          link: "https://open.spotify.com/playlist/...",
          description: "Curator: Rap Tuga Hits | Followers: N/A",
        },
      ],
    },
    {
      title: "DISCORD",
      icon: <MessageSquare className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "discord-1",
          label: "Diepretty Server",
          completed: false,
          required: true,
        },
        {
          id: "discord-2",
          label: "SERVERS PORTUGUESES",
          completed: false,
          required: true,
        },

      ],
    },
    {
      title: "IG PROMO PAGES",
      icon: <Instagram className="h-5 w-5 text-pink-400" />,
      locked: true,
      steps: [
        {
          id: "ig-1",
          label: "TRAPPWAVES",
          completed: false,
          required: true,
        },
        {
          id: "ig-1",
          label: "TRAPNEWSPORTUGAL",
          completed: false,
          required: true,
        },
        {
          id: "ig-1",
          label: "UNDERGROUNDBASEADO",
          completed: false,
          required: true,
        },
        {
          id: "tuga-rap",
          label: "TUGA RAP®\nCommunity\n🇵🇹TUGA RAP® | Collabs & Parcerias DM\n📨Tugarapcontacto@gmail.com\nwww.tugarap.pt",
          completed: false,
          required: true,
        },
        

      ],
    },
    {
      title: "RÁDIO PORTUGUESA",
      icon: <Radio className="h-5 w-5 text-purple-400" />,
      locked: true,
      steps: [
        {
          id: "radio-1",
          label: "RÁDIO COMERCIAL",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/4661a8e9f44af8395d546fb0831278cb.pdf",
          description: "Audiência: 25.2% (Fev 2025) | Formato: Pop, rock, sucessos nacionais e internacionais | Contato: [email protected] | +351 21 347 0500 | Proprietário: Bauer Media Audio Portugal",
        },
        {
          id: "radio-2",
          label: "RFM",
          completed: false,
          required: true,
          link: "https://rfm.pt/publicidade",
          description: "Audiência: 20.9% | Formato: Pop contemporâneo, sucessos nacionais e internacionais | Contato: sergio.machado@rmultimedia.pt | +351 21 318 1800 | Proprietário: Grupo Renascença | Diretor Publicidade: Sérgio Machado | Delegação Lisboa: Quinta do Bom Pastor, Estrada da Buraca 8-12, 1549-025 Lisboa | Telefone: 213814510 | Fax: 213239220 | Link: https://rfm.pt/publicidade",
        },
        {
          id: "radio-3",
          label: "M80 RADIO",
          completed: false,
          required: true,
          link: "https://m80.pt/publicidade",
          description: "Audiência: 10.7% | Formato: Sucessos dos anos 70, 80 e 90 | Contato: <a href='mailto:pedro.miranda@bauermedia.pt'>pedro.miranda@bauermedia.pt</a> | +351 21 347 0380 | Proprietário: Bauer Media Audio Portugal | Publicidade: Director Comercial Pedro Miranda, Coordenador de Vendas de Lisboa Sandra Camurça, Coordenador de Vendas do Porto Ana Gonçalves, Coordenador de Vendas Digitais Renata Caldas, Coordenador Marketing de Vendas Ana Elias | Endereço: Rua Sampaio e Pina, nº24, 1099-044 Lisboa | Telefone: 213 821 500 | Fax: 213 821 589 | Porto: Rua Tenente Valadim, 181, 4100-479 Porto | Telefone: 226 057 500 | Email: <a href='mailto:comerciais@bauermedia.pt'>comerciais@bauermedia.pt</a>",
        },
        {
          id: "radio-4",
          label: "RÁDIO RENASCENÇA",
          completed: false,
          required: true,
          link: "https://rr.pt/publicidade",
          description: "Audiência: 7.6% | Formato: Música, notícias, conteúdo religioso | Contato: Sérgio Machado | E-mail: sergio.machado@rmultimedia.pt | Telefones: +351 213 239 200 (Geral), +351 213 239 281 (Programação) | Fax: +351 21 323 9299 | E-mail geral: mail@rr.pt | Endereço: Quinta do Bom Pastor, Estrada da Buraca 8-12, 1549-025 Lisboa, Portugal",
        },
        {
          id: "radio-5",
          label: "CIDADE FM",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/3f757dbc51c789630aa600f330e5b83f%20(1).pdf",
          description: "Audiência: 3.5% | Formato: Rádio de hits contemporâneos direcionada para idades de 15 a 24 anos | Contato: [email protected] | +351 21 347 1400 | Proprietário: Bauer Media Audio Portugal",
        },
        {
          id: "radio-6",
          label: "MEGA HITS",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/4661a8e9f44af8395d546fb0831278cb.pdf",
          description: "Audiência: 2.2% | Formato: Sucessos internacionais e nacionais direcionados para idades de 15 a 24 anos | Contato: [email protected] | +351 21 790 5700 | Proprietário: Grupo Renascença",
        },
        {
          id: "radio-7",
          label: "SMOOTH FM",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/4661a8e9f44af8395d546fb0831278cb.pdf",
          description: "Audiência: 1.1% | Formato: Jazz, soul, bossa nova, blues direcionado para idades de 35 a 64 anos | Contato: [email protected] | +351 21 790 4000 | Proprietário: Bauer Media Audio Portugal",
        },
        {
          id: "radio-8",
          label: "ANTENA 3",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/4661a8e9f44af8395d546fb0831278cb.pdf",
          description: "Audiência: 1.7% | Formato: Pop alternativo e nova música portuguesa | Contato: [email protected] | +351 21 790 5700 | Proprietário: RTP",
        },
        {
          id: "radio-9",
          label: "RÁDIO NOVA ERA",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/4661a8e9f44af8395d546fb0831278cb.pdf",
          description: "Audiência: 0.5% | Formato: House, música eletrônica, hip hop, R&B | Contato: [email protected] | +351 22 938 3000 | Proprietário: Música no Coração",
        },
        {
          id: "radio-10",
          label: "HIPER FM",
          completed: false,
          required: true,
          link: "file:///C:/Users/BACC17/Downloads/Sounds%20and%20Kits%202025/4661a8e9f44af8395d546fb0831278cb.pdf",
          description: "Formato: Rádio de hits contemporâneos direcionada para idades de 15 a 30 anos | Contato: [email protected] | +351 243 320 000 | Proprietário: Não especificado",
        },
      ],
    },
    {
      title: "CANAIS DE MÚSICA",
      icon: <Music className="h-5 w-5 text-yellow-400" />,
      locked: true,
      steps: [
        {
          id: "music-1",
          label: "AFRO MUSIC PORTUGAL",
          completed: false,
          required: true,
        },
        {
          id: "music-1",
          label: "MTV Portugal",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "Anúncios nas Redes Sociais",
      icon: <Instagram className="h-5 w-5 text-pink-400" />,
      locked: true,
      steps: [
        {
          id: "insta-1",
          label: "INSTAGRAM AD",
          completed: false,
          required: true,
        },
        {
          id: "tiktok-1",
          label: "TIKTOK AD",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "SNIPPET PHASE",
      icon: <Video className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "snippet-1",
          label: "SNIPPET/REEL ESTILO TRILLER DO SOFAYGO",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "INSTAGRAM",
      icon: <Instagram className="h-5 w-5 text-pink-400" />,
      locked: true,
      steps: [
        {
          id: "insta-flex-1",
          label: "POSTAR CARROSEL DE MOTION (Livros, Looks, Health, Money, New Shit, Unreleased, Bad Bitch, Food, Car)",
          completed: false,
          required: true,
        },
        {
          id: "insta-flex-2",
          label: "DESCRIÇÃO SIMBÓLICA E HUMORÍSTICA",
          completed: false,
          required: true,
        },
      ],
    },
    {
      title: "SPOTIFY SMM PANEL",
      icon: <Sliders className="h-5 w-5 text-blue-400" />,
      locked: true,
      steps: [
        {
          id: "smm-1",
          label: "SMM RAPID - Portugal",
          completed: false,
          required: true,
          link: "https://smmrapid.com/services",
          description: "Spotify",
        },
        {
          id: "pacy-smm",
          label: "PacySMM - Portugal",
          completed: false,
          required: true,
          link: "https://pacysmm.com/services",
          description: "Visualizações no Youtube",
        },
        {
          id: "smm-raja",
          label: "SMM Raja - Portugal",
          completed: false,
          required: true,
          link: "https://www.smmraja.com/services",
          description: "Spotify, Twitter & Youtube",
        },
        {
          id: "sam-pak",
          label: "Sam Pak Channel",
          completed: false,
          required: true,
          link: "https://smmpakpanel.com/",
          description: "Comentário no YouTube",
        },
        {
          id: "boost-up",
          label: "Boost Up Panel - Portugal",
          completed: false,
          required: true,
          link: "https://boostuppanel.com/services/youtube-growth-service",
          description: "Youtube",
        },
        {
          id: "follow-mental",
          label: "Follow Mental - Portugal",
          completed: false,
          required: true,
          link: "https://followmental.com/services/",
          description: "Youtube Likes",
        },
      ],
    },
  ]);

  const totalSteps = phases.flatMap((p) => p.steps).length;
  const completedSteps = phases.flatMap((p) => p.steps).filter((s) => s.completed).length;
  const completionPercentage = Math.round((completedSteps / totalSteps) * 100);

  const handleStepToggle = (phaseIndex: number, stepIndex: number) => {
    const newPhases = [...phases];
    const step = newPhases[phaseIndex].steps[stepIndex];

    step.completed = !step.completed;

    // Unlock next phase if all required steps of current phase are completed
    if (phaseIndex < phases.length - 1) {
      const allRequiredCompleted = newPhases[phaseIndex].steps
        .filter((s) => s.required)
        .every((s) => s.completed);
      newPhases[phaseIndex + 1].locked = !allRequiredCompleted;
    }

    setPhases(newPhases);
  };

  const allRequiredCompleted = phases.every((phase) =>
    phase.steps.filter((s) => s.required).every((s) => s.completed)
  );

  return (
    <ContentLayout title="Workflow de Lançamento">
      <div className="space-y-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-300">
                  Progresso Total
                </h3>
                <p className="text-slate-400">
                  {completedSteps}/{totalSteps} etapas completas
                </p>
              </div>
              <Badge
                variant="outline"
                className="border-purple-400 text-purple-400 text-lg"
              >
                {completionPercentage}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-3 bg-slate-700" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          {phases.map((phase, phaseIndex) => (
            <Card
              key={phase.title}
              className={`bg-slate-800 border-2 ${
                phase.locked ? "border-red-500/30" : "border-slate-700"
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center space-x-3">
                  {phase.locked ? (
                    <Lock className="h-6 w-6 text-red-400" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                  <CardTitle className="text-xl font-semibold">
                    {phase.title}
                    {phase.locked && (
                      <span className="text-red-400 ml-2 text-sm">
                        (Desbloqueie completando a fase anterior)
                      </span>
                    )}
                  </CardTitle>
                </div>
                {phase.icon}
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {phase.steps.map((step, stepIndex) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-lg ${
                        step.completed
                          ? "bg-green-900/20 border border-green-400/30"
                          : "bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            id={step.id}
                            checked={step.completed}
                            onCheckedChange={() =>
                              handleStepToggle(phaseIndex, stepIndex)
                            }
                            disabled={phase.locked}
                          />
                          <Label
                            htmlFor={step.id}
                            className={`text-sm ${
                              step.completed
                                ? "text-green-400 line-through"
                                : "text-slate-300"
                            }`}
                          >
                            {step.label}
                            {step.required && (
                              <span className="text-red-400 ml-2">*</span>
                            )}
                          </Label>
                        </div>
                        {step.required && !step.completed && (
                          <Badge variant="destructive" className="animate-pulse">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                      {step.link && (
                        <div className="mt-2">
                          <a
                            href={step.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            Faço o procedimento mesmo.
                          </a>
                          <p className="mt-1 text-slate-300">{step.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator className="bg-slate-700" />

        <div className="flex justify-end space-x-4">
          <Button
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!allRequiredCompleted}
            onClick={() => {
              if (allRequiredCompleted) {
                window.location.href = "/next-step";
              }
            }}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Finalizar Promoção
          </Button>
        </div>

        {!allRequiredCompleted && (
          <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-400/50">
            <p className="text-red-400 animate-pulse">
              ⚠️ Complete todas as etapas obrigatórias para finalizar a promoção
            </p>
          </div>
        )}
      </div>
    </ContentLayout>
  );
}
