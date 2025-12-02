"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useEvents } from "@/hooks/use-events";
import { loadEventFromIndexedDB } from "@/lib/events-db";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// addVenue is used for inline venue creation in the Venues step
import { addVenue, getAllVenues, Venue } from "@/lib/venuesDb";
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  Settings,
  BarChart3,
  MapPin,
  Ticket,
  Megaphone,
  Plus,
  X,
  Info,
  Mail,
  Clock,
  Building,
  User,
  Phone,
  Shirt,
  Music,
  CalendarClock
} from "lucide-react";
import jsPDF from "jspdf";
import Image from "next/image";
import { ProfitDashboard } from "@/components/events/ProfitDashboard";
import { MultiVenueSelector } from "@/components/events/MultiVenueSelector";

interface Step {
  name: string;
  link: string;
  timeframe: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  icon: React.ReactNode;
}

interface Production {
  sound: string;
  lighting: string;
  stage: string;
  crew: Array<{ role: string; name: string; contact: string; gear?: string; deal?: string }>;
  // ... resto do código
}

interface EventData {
  id?: string;
  overview: {
    eventName: string;
    eventType: string;
    date: string;
    venue: string;
    city?: string;
    capacity: number;
    description: string;
    organizerName: string;
    organizerContact: string;
  };
  venues?: {
    primary: Venue | null;
    backups: Venue[];
    requiredCapacity: number;
  };
  venueContact?: {
    name: string;
    email: string;
    phone: string;
    emailSent?: boolean;
    emailSentDate?: string | null;
    confirmed?: boolean;
    confirmedDate?: string | null;
  };
  finance: {
    budget: number;
    ticketPrice: number;
    sponsorship: number;
    expenses: Array<{ name: string; amount: number }>;
    venueSplit: number; // 70-30 split
    cachetPago?: number; // Para third party events
    expectedAttendance?: number;
    merchPerPerson?: number;
    estimatedProfit?: number;
  };
  lineup: {
    artists: Array<{ name: string; time: string; fee: number; contact: string; instagram: string; spotify: string }>;
    soundcheck: string;
    curfew: string;
    schedule?: Array<any>;
  };
  production: {
    sound: string;
    lighting: string;
    stage: string;
    crew: Array<{ role: string; name: string; contact: string; gear?: string; deal?: string }>;
    technicalRider?: string;
    technicalRiderConfirmed?: boolean;
    team?: Array<any>;
    estimatedCost?: number;
  };
  logistics: {
    address: string;
    parking: string;
    loadIn: string;
    loadOut: string;
    catering: string;
    material: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>; // Material que vai levar
    travelOutfit: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>; // Roupa que vai vestir até chegar no local
    estimatedCost?: number;
    transport?: string;
    accommodation?: string;
  };
  tickets: {
    totalTickets: number;
    soldTickets: number;
    priceTiers: Array<{ name: string; price: number; quantity: number }>;
    policy?: string;
    prices?: Record<string, any>;
  };
  marketing: {
    socialMedia: Array<{ platform: string; content: string; scheduled: string }>;
    pressRelease: string;
    influencers: Array<{ name: string; reach: number; fee: number }>;
    strategy?: string;
    assets?: string;
    budget?: number;
  };
  month?: number;
  year?: number;
  week?: number;
  template?: boolean;
  templates: {
    artistConfirmation: string;
    venueProposal: string;
  };
  wardrobe: {
    selectedHairstyles: string[];
    selectedGlasses: string[];
    selectedHeadWear: string[];
    selectedSuperior: string[];
    selectedPants: string[];
    selectedShoes: string[];
    selectedNeckAccessories: string[];
    selectedBracelets: string[];
    selectedWatch: string[];
    selectedBelt: string[];
    customItems: { name: string; category: string; price: number }[];
    totalPrice: number;
  };
  setlist: {
    songs: Array<{ name: string; autotuneNote: string; order: number; time: string }>;
    autotuneSetting: string;
    voiceType: "auto-tenor" | "low-male" | "";
  };
  rehearsalNotes: {
    decisions: Array<{ song: string; decision: string; notes: string }>;
    breathingIssues: Array<{ song: string; part: string; notes: string; timestamp?: string }>;
    generalNotes: string;
  };
  dayItinerary: {
    date: string;
    location: string;
    travelDetails: Array<{ id: string; type: string; time: string; details: string; notes: string }>;
    accommodation: string;
    clothingStores: Array<{ id: string; name: string; address: string; time: string; notes: string }>;
    meals: Array<{ id: string; date: string; time: string; location: string; whatToEat: string; price: number }>;
    soundcheckTime: string;
    venueOpenTime: string;
    studioVisits: Array<{ id: string; studio: string; artist: string; time: string; purpose: string; notes: string }>;
    voicePractice: Array<{ id: string; type: string; time: string; duration: string; notes: string }>;
    hydrationReminders: Array<{ id: string; time: string; completed: boolean; tip?: string }>;
    audienceReminders: Array<{ id: string; time: string; completed: boolean; tip: string }>;
    otherNotes: string;
  };
}

interface Venue {
  id: string;
  name: string;
  city: string;
  capacity: string;
  address: string;
  responsible: string;
  phone: string;
  email: string;
  website: string;
  equipment: string;
  agreement: string;
  notes: string;
  source: string;
}

const MultiStepper: React.FC<{
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}> = ({ steps, currentStep, onStepClick }) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4 w-full overflow-x-auto">
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
     
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className="flex items-center w-full">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                className="flex items-center w-full focus:outline-none"
              >
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium transition-colors duration-300 ${
                        index <= currentStep
                          ? "bg-primary text-white border-primary shadow-lg"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {step.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              </button>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-1 border-t-2 ${
                    index < currentStep ? "bg-primary border-primary" : "bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
                  } mx-2`}
                ></div>
              )}
            </div>
            <span className="mt-2 text-xs text-center font-medium">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Event type descriptions database
const EVENT_TYPE_DESCRIPTIONS: Record<string, string> = {
  "diepretty-world": `Uma Noite com Diepretty Mercédes — Concertos & Eventos Ao Vivo (festival / tours / showcases / parties)

CAE principais:
90010 — Atividades das artes do espetáculo (Festas e Concertos)
90020 — Serviços de apoio às artes do espetáculo (som, luz, montagem, aluguer de equipamento)

Conceito global (resumido)
Uma marca-evento centrada em Diepretty Mercédes que combina: concerto principal intimista/club, festa hip-hop para Gen Z, transmissões pay-per-view (híbrido/metaverse), mini-digressão universitária e pop-ups em clubes/warehouses. O formato é flexível: pode ser uma noite única com várias experiências simultâneas (palco principal + club takeover + stream) ou uma série curta (mini-tour / secret shows + festa after-hours).

Formatos incluídos (cada um com conceito, receitas e 3 passos)
1) Concerto Principal + Festas de Hip-Hop (Gen Z)
Conceito: Vários atos curtos + DJ sets; vibe de festa jovem com Diepretty como headliner. Receitas: bilhetes (tiered), merch, patrocínios lifestyle, F&B, venda de stands. 3 passos: 1) fechar line-up e local; 2) vender early bird + procurar sponsors; 3) produzir som/luz, segurança e bilhética.

2) Evento Híbrido — Metaverse / PPV
Conceito: Concerto ao vivo com transmissão pay-per-view e experiência digital (camadas exclusivas para espectadores remotos). Público presencial 30–200 pax por sala (intimista). Receitas: bilhetes presenciais, PPV/streaming, patrocínios digitais, VOD pós-evento. 3 passos: 1) preparar infraestrutura de transmissão profissional; 2) vender combos presencial+stream; 3) entregar VOD e analytics pós-evento.

3) Mini-digressão Universitária / Espetáculos Secretos
Conceito: Tour curta por espaços intimistas (campus, salas secretas). Aposta em exclusividade e boca-a-boca. Receitas: bilhetes acessíveis por volume, merch, parcerias académicas. 3 passos: 1) fechar locais e calendário; 2) promoção segmentada (campus ambassadors); 3) vender ingressos limitados e maximizar merch.

4) Invasão de Clube / Festa em Armazém (Warehouse Party)
Conceito: Takeover underground com estética rave/warehouse. After-hours e experiência imersiva. Receitas: bilhetes, bar, merch, patrocínios locais. 3 passos: 1) fechar venue e promoter; 2) anunciar line com urgência (drop marketing); 3) operar som/segurança/produção.

5) Festa de Lançamento / Show de Apresentação (com VIP)
Conceito: Evento de lançamento de single/álbum com área VIP, meet & greet e bundles exclusivos. Receitas: bilhetes VIP/GA, bundles (álbum+merch+acesso exclusivo), subscrições de fã-club. 3 passos: 1) definir oferta VIP e bundles; 2) presale exclusiva para superfãs; 3) executar show e ativar upsells no local.

Público-alvo
Fãs Gen Z e Millennials (hip-hop / RnB / urban culture)
Gatekeepers: promotores, bookers, programadores de clubes
Marca lifestyle e parceiros de tecnologia para streaming
Comunidades de campus e scenes locais underground

Estrutura proposta para "one-night" (evento-hub com várias experiências)
Palco Principal (Concerto): 60–90 min headliner + 2–3 suportes
Club Room / Warehouse (After): festa até tarde com DJs e takeover
Streaming Booth / Studio: equipa de transmissão + câmeras multicam para PPV
Merch & Bundles Pop-up: vendas direct-to-fan + presales fan-club
Área VIP / Meet & Greet: acesso pago limitado
Backstage / Production Hub: catering, rider, descanso para artistas
Bilheteira & Credenciação: entradas separadas para salas presenciais/PPV check-in

Agenda exemplo (one-night)
19:00 — Doors (merch & catering abrem)
20:00 — Warm-up DJ + primeira atração (showcase)
21:00 — Mini-sets de suporte (2 artistas)
22:15 — Diepretty Mercédes — Show principal (45–60 min) + interação VIP
23:30 — After-party (warehouse / club takeover) com DJs até 03:00
Transmissão PPV ativa durante o concerto principal; VOD disponível 24h após o evento.


Checklist operacional essencial
Contratos: artista, venue, fornecedores (som, luz, streaming).
Rider e logística artística (transportes, alojamento se necessário).
Licenças: música, ocupação, venda de bebidas/comida.
Segurança & seguros (event insurance, crowd management).
Infra streaming: uplink dedicado, encoders, redundância de internet.
Bilhética: sistema ticketing com verificações (RFID/barcode), controle de entradas para áreas VIP.
Equipa: production manager, stage manager, audio techs, lighting techs, FOH engineer, monitor engineer, deck crew, security, front-of-house, merch & box office.
Promoção: press kit, drops em redes sociais, parcerias campus, influencers locais.
Pós-evento: upload VOD, analytics report, follow-up com patrocinadores e promoters.

Risco & Mitigações rápidas
Falha de stream → uplink de backup + fluxo de redundância; informar clientes e oferecer VOD gratuito se problema.
Problemas de som → soundcheck rigoroso, técnico FOH experiente, backline de reserva.
Overcapacity / segurança → plano de contingência com venue + segurança treinada.
Baixas vendas early-bird → promo targeted (campus, playlists, influencers), bundle com merch.`,

  "diepretty-beat-battles": `DIEPRETTY BEAT BATTLES - Batalha de Beats / Encontro de Produtores

Conceito: Competição de beats + workshops técnicos.
Receitas: inscrições/pagamento de participantes, patrocínios de marcas de equipamento, venda de conteúdos gravados.
3 passos: estruturar formato e prémios → vender vagas + procurar sponsors tech → realizar competição e gravar conteúdo.`,

  "industry-day": `Industry Day — Conferência & Dia de Networking (com Festival Urbano integrado)

Conceito (resumido): Um evento de um dia que mistura conferência profissional para managers, selos, promoters e produtores com elementos de cultura urbana abertos ao público: showcases curtos, feira de streetwear/arte/comida, pop-up do selo e áreas de ativação (graffiti, skate, break). Objetivo: gerar negócios B2B, expor artistas e marcas, e criar networking orgânico entre indústria e público.

Receitas
Bilhetes (profissional — acesso à conferência / público geral — acesso às áreas urbanas e showcases).
Stands de mercado urbano (taxas por vendor).
Patrocínios (tiers B2B + lifestyle).
Workshops pagos (masterclasses especializadas).
Vendas de merch / % sobre vendas de artistas e marcas (rev-share).
Bundles / presale do selo (álbum + merch + entrada VIP).

Público-alvo
Profissionais: managers, selos, bookers, promotores, produtores, agências.
Público urbano: fãs, colecionadores, praticantes de skate/dance, marcas de streetwear.
Parceiros: marcas lifestyle, plataformas de streaming, médias.

3 passos para executar (integrado)
Mapear e confirmar parceiros & conteúdo — speakers, selos, artistas para showcases, vendors de streetwear, marcas de lifestyle, workshops e jurados para jam.
Comercializar & vender espaços — pacotes de patrocínio (B2B e lifestyle), stands do mercado, bilhetes (profissional + público), bundles do selo; lançar presale.
Produzir o dia & operacionalizar matchmaking — montar áreas (auditório, jam, mercado, pop-up do selo), gerir credenciação, agenda de reuniões B2B e sistema de matchmaking (app ou sala dedicada).

Estrutura / Áreas (essenciais)
Auditório / Palco Conferência — keynotes, painéis, pitching sessions.
Sala de Networking / Matchmaking Lounge — mesas por sector, área de speed-meetings.
Jam Area (graffiti / break / skate demo) — programação contínua, ativação de marcas.
Showcase Stage — sets de 15–25 min para artistas/selos.
Mercado Urbano (vendors) — streetwear, food trucks, arte.
Pop-up do Selo — bundles, presales, assinatura de fã-club.
Workshops / Masterclasses (salas pequenas) — vendas separadas.
Credenciação & Backstage — para delegados e artistas.

Agenda exemplo (one-day)
09:00 — Credenciação & café de boas-vindas (networking leve)
10:00 — Abertura: keynote indústria + apresentação do formato do dia
11:00 — Painéis: A&R & desenvolvimento de artistas / Revenue streams para selos
12:30 — Almoço + Mercado urbano abre ao público
13:30 — Masterclasses (paralelas) + speed-meetings B2B (matchmaking)
15:00 — Showcase block A (artistas / selo) + pop-up activation
16:30 — Painel: Marketing de rua e parcerias de lifestyle
18:00 — Jam session (graffiti / break) + demos skate
19:00 — Showcase block B + venda de bundles / meet & greet (limitado)
21:00 — After-hours networking (DJ set / chill area)
22:30 — Encerramento

Pacotes de patrocínio (sugestão rápida)
Title Sponsor (1) — naming rights, palco principal, 10 VIP passes, conteúdo branded no auditório.
Gold (2–3) — stand premium, slot de 5 min no auditório, 5 passes VIP.
Silver — stand + menção em materiais.
Lifestyle Partners — ativações na jam/mercado, product placement.
Media Partner — cobertura, bilhetes press.

Credenciação & Matchmaking
Vender bilhetes "Profissional (Conference Pass)" com acesso a painel + sala de networking.
Criar formulário pré-evento para mapear interesses e agendar reuniões (ou usar app simples).
Sessões de speed-meeting (10–12 min) coordenadas por tópico (bookers, selos, sync/licensing).

KPI's a medir
Nº de bilhetes vendidos (profissional / público).
Nº de leads B2B gerados / reuniões agendadas.
Receita por fonte (patrocínios, stands, bilhetes, workshops).
Nº de negócios fechados pós-evento (follow-up 30/60 dias).
Engajamento social e footfall por área.

Checklist operacional essencial (resumido)
Local com 4 zonas distintas (auditório, showcase, jam, mercado).
Som/iluminação para palco e jam.
Segurança e seguros (event insurance).
Licenças (som, venda de comida, ocupação).
Staffing: produção, credenciação, stage managers, floor managers, segurança.
Plano de promoção (digital + PR + parcerias locais).
Logística para artistas (camarins, rider simples, transporte se preciso).`,
  "third-party-event": `Third Party Event — Evento contratado por terceiros.
  
Conceito: Festa ou evento onde foste contratado como artista ou produtor. Foco em logística pessoal, cachet pago e requisitos específicos do contratante.`
};

const VENUES_DATABASE: Venue[] = [
  {
    id: "1",
    name: "Galeria Zé dos Bois (ZDB)",
    city: "Lisboa",
    capacity: "30-80 (confirmar)",
    address: "Rua da Barroca nº59, 1200-047 Lisboa",
    responsible: "",
    phone: "+351 21 343 02 05",
    email: "reservas@zedosbois.org",
    website: "https://zedosbois.org/",
    equipment: "PA disponível (confirmar rider)",
    agreement: "A negociar (bilheteira / bar split)",
    notes: "Espaço cultural com programação regular; confirmar capacidade da sala específica.",
    source: "cite"
  },
  {
    id: "2",
    name: "Camones - Artes Bar",
    city: "Lisboa (Graça)",
    capacity: "30-60 (confirmar)",
    address: "Graça, Lisboa (ver site/IG)",
    responsible: "",
    phone: "(reservas via Instagram / FB)",
    email: "(ver Instagram/Facebook)",
    website: "https://www.instagram.com/camonesartesbar/",
    equipment: "PA / som house (confirmar)",
    agreement: "Normalmente bar split / bilheteira local (confirmar)",
    notes: "Local intimista com programação regular de concertos e open-mic.",
    source: "cite"
  },
  {
    id: "3",
    name: "B.O.T.A (Base Organizada da Toca das Artes)",
    city: "Lisboa (Anjos)",
    capacity: "30-70 (confirmar)",
    address: "Largo de Santa Bárbara, 3D, 1150-287 Lisboa",
    responsible: "",
    phone: "913 450 743",
    email: "(ver site/contactos)",
    website: "https://www.botaanjos.com/",
    equipment: "PA / infra cultural (confirmar rider)",
    agreement: "A negociar (frequentemente bilheteira / consumo)",
    notes: "Espaço multidisciplinar, boa opção para shows intimistas.",
    source: "cite"
  },
  {
    id: "4",
    name: "RCA Club",
    city: "Lisboa (Alvalade)",
    capacity: "30-100 (confirmar)",
    address: "Rua João Saraiva, nº18, Alvalade, Lisboa",
    responsible: "",
    phone: "(ver Facebook)",
    email: "(ver Facebook/contactos)",
    website: "https://www.rcaclub.com/",
    equipment: "PA e backline (club) - confirmar rider",
    agreement: "Club split / bilheteira (negociável)",
    notes: "Clube de rock com programação de concertos; boa opção para público alternativo.",
    source: "cite"
  },
  {
    id: "5",
    name: "DAMAS - Bar & Sala de Concertos",
    city: "Lisboa (Graça)",
    capacity: "30-70 (confirmar)",
    address: "Rua da Voz do Operário 60, Graça, Lisboa",
    responsible: "",
    phone: "351 912 162 249",
    email: "damasreservas@gmail.com",
    website: "https://www.instagram.com/damas.lisboa/",
    equipment: "PA / setup para bandas e showcases (confirmar)",
    agreement: "Consumo + bilheteira / bar split habitual",
    notes: "Restaurante-bar com palco; ideal para shows intimistas e público 30-50.",
    source: "cite"
  },
  {
    id: "6",
    name: "Maus Hábitos",
    city: "Porto",
    capacity: "40-120 (confirmar sala específica)",
    address: "Rua Passos Manuel 178, 4º, 4000-382 Porto",
    responsible: "",
    phone: "351 937 202 918",
    email: "geral@maushabitos.com / viciosdemesa@maushabitos.com",
    website: "https://www.maushabitos.com/",
    equipment: "Infra para concertos; PA disponível (confirmar rider)",
    agreement: "Bilheteira / contrato por evento (negociável)",
    notes: "Espaço cultural com historial de concertos; ideal para shows independentes.",
    source: "cite"
  },
  {
    id: "7",
    name: "Hot Five Jazz & Blues Club",
    city: "Porto",
    capacity: "30-60 (confirmar)",
    address: "Rua Guerra Junqueiro, nº495, 4150-098 Porto",
    responsible: "",
    phone: "(ver site)",
    email: "(ver site/contactos)",
    website: "https://hotfive.pt/",
    equipment: "PA adequado para jazz/blues - confirmar rider",
    agreement: "Bilheteira / consumação (negociável)",
    notes: "Clube especialista em jazz/blues, sessões regulares e jam nights.",
    source: "cite"
  },
  {
    id: "8",
    name: "M.Ou.Co (Hotel & música)",
    city: "Porto (Bonfim)",
    capacity: "30-80 (confirmar)",
    address: "Rua de Frei Heitor Pinto 67, Porto",
    responsible: "",
    phone: "(ver site)",
    email: "(ver site)",
    website: "(hotel / espaços privados)",
    equipment: "Espaço com infra para música (confirmar)",
    agreement: "Eventos privados / programações do hotel (negociável)",
    notes: "Hotel temático de música — opções de salas intimistas para showcases.",
    source: "cite"
  },
  {
    id: "9",
    name: "TEXAS Club Leiria",
    city: "Leiria (Barreiros/Amor)",
    capacity: "40-200 (confirmar sala)",
    address: "R. Padre Margalhau / R. Padre Joaquim G. Margalhau nº 1390, Amor/Barreiros, Leiria",
    responsible: "",
    phone: "(ver Facebook / Instagram / site)",
    email: "(ver redes sociais)",
    website: "https://www.facebook.com/texasleiria/",
    equipment: "Sala de espetáculos; PA (confirmar rider)",
    agreement: "Venda de bilhetes / promotoria local (negociável)",
    notes: "Histórico de concertos desde 1992; boa opção regional.",
    source: "cite"
  },
  {
    id: "10",
    name: "Mulligan's Irish Bar",
    city: "Leiria (Centro)",
    capacity: "30-80 (confirmar)",
    address: "Largo Alexandre Herculano, 2, 2410-083 Leiria",
    responsible: "",
    phone: "351 244 204 741",
    email: "(ver Facebook/site)",
    website: "http://www.mulligans.pt/ (FB/IG)",
    equipment: "PA pequeno possível; ambiente pub com música ao vivo",
    agreement: "Bar split / entrada (negociável)",
    notes: "Pub com tradição de música ao vivo — bom para shows intimistas.",
    source: "cite"
  },
  {
    id: "11",
    name: "Á Capella (Fado de Coimbra)",
    city: "Coimbra",
    capacity: "30-60 (confirmar)",
    address: "Rua Corpo de Deus - Largo da Vitória, Coimbra",
    responsible: "",
    phone: "351 239 833 985",
    email: "mail.acapella@gmail.com",
    website: "https://coimbramusica.com/ / Facebook aCapella",
    equipment: "Som e palco pequeno (confirmar)",
    agreement: "Bilheteira / jantares com espetáculo (negociável)",
    notes: "Capela convertida em espaço musical — acústica favorável para intimista.",
    source: "cite"
  },
  {
    id: "12",
    name: "Teatro Lethes",
    city: "Faro (extra city)",
    capacity: "50-200 (confirmar - teatro)",
    address: "Rua de Portugal 58, 8000-281 Faro",
    responsible: "",
    phone: "351 289 878 908",
    email: "geral@actateatro.org.pt",
    website: "https://teatrolethes.com/",
    equipment: "Infra teatral completa; PA a confirmar",
    agreement: "Venda bilhetes via teatro (negociável)",
    notes: "Teatro municipal histórico — possível para noites acústicas, confirmar capacidade mínima.",
    source: "cite"
  },
  {
    id: "13",
    name: "Salpoente (Aveiro)",
    city: "Aveiro (extra city)",
    capacity: "30-80 (confirmar)",
    address: "Canal de São Roque, nº 82/83, 3800-256 Aveiro",
    responsible: "",
    phone: "+351 234 382 674, +351 915 138 619",
    email: "salpoente@salpoente.pt",
    website: "https://salpoente.pt/",
    equipment: "Espaço restaurante com possibilidade de música ao vivo (confirmar PA)",
    agreement: "Eventos privados / jantar + bilheteira (negociável)",
    notes: "Restaurante com espaço histórico — bom para showcases íntimos com jantar.",
    source: "cite"
  },
  {
    id: "14",
    name: "Teatro Viriato",
    city: "Viseu (extra city)",
    capacity: "(teatro - confirmar sala pequena para 30-50)",
    address: "L. Mouzinho de Albuquerque, Viriato / Teatro Municipal Viriato, Viseu",
    responsible: "",
    phone: "351 232 480 110",
    email: "(ver site)",
    website: "https://www.teatroviriato.com/",
    equipment: "Infra completa (teatro) - confirmar sala pequena e PA",
    agreement: "Venda bilhetes via bilheteira (negociável)",
    notes: "Teatro municipal com várias salas — confirmar qual aluga para shows de 30-50 pessoas.",
    source: "cite"
  },
  {
    id: "15",
    name: "Barreirinha Bar Café",
    city: "Funchal (extra city)",
    capacity: "30-80 (confirmar)",
    address: "Largo do Socorro, nº1, 9060-305 Funchal, Madeira",
    responsible: "",
    phone: "(ver Facebook/IG)",
    email: "(ver redes sociais)",
    website: "https://www.instagram.com/barreirinhabarcafe/",
    equipment: "PA pequeno possível; esplanada para música ao vivo",
    agreement: "Bar split / consumo (negociável)",
    notes: "Bar com programação musical noturna; boa visibilidade turística.",
    source: "cite"
  },
  {
    id: "16",
    name: "Teatro Micaelense",
    city: "Ponta Delgada (extra city)",
    capacity: "(teatro - verificar sala pequena)",
    address: "Largo de São João, 9500-106 Ponta Delgada, S. Miguel, Açores",
    responsible: "",
    phone: "351 296 308 340",
    email: "info@teatromicaelense.pt / bilheteira@teatromicaelense.pt",
    website: "https://www.teatromicaelense.pt/",
    equipment: "Infra completa; bilheteira e técnica do teatro",
    agreement: "Venda através da bilheteira; negociar split com teatro",
    notes: "Centro cultural principal nos Açores — bom para datas específicas; confirmar sala adequada para 30-50.",
    source: "cite"
  },
  {
    id: "17",
    name: "Titanic Sur Mer",
    city: "Lisboa (Cais do Sodré)",
    capacity: "(confirmar)",
    address: "Cais da Ribeira Nova, Armazém B, Cais do Sodré, Lisboa, Portugal",
    responsible: "",
    phone: "",
    email: "info.titanicsurmer@gmail.com",
    website: "",
    equipment: "PA / palco (confirmar)",
    agreement: "A negociar (bilheteira/bar split — confirmar)",
    notes: "Sala de eventos no Cais do Sodré; horário a confirmar.",
    source: "user"
  },
  {
    id: "18",
    name: "Tokyo Lisboa",
    city: "Lisboa (Cais do Sodré)",
    capacity: "265 (lotação máxima)",
    address: "Cais Gás 1, 1200-109 Lisboa",
    responsible: "",
    phone: "213 462 265",
    email: "tokyo@tokyo.com.pt",
    website: "",
    equipment: "Club; PA (confirmar rider)",
    agreement: "A negociar (confirmar política)",
    notes: "Horário: Quarta à Sábado, 22h–06h. SPA: €87,00 (lucro por show — a confirmar).",
    source: "user"
  },
  {
    id: "19",
    name: "Music Box",
    city: "Lisboa (Pink Street, Cais do Sodré)",
    capacity: "280 (lotação máxima)",
    address: "R. Nova do Carvalho 24, 1200-019 Lisboa",
    responsible: "Cultural Trend Lisbon",
    phone: "213 430 107",
    email: "office@musicboxlisboa.com",
    website: "",
    equipment: "Sala de concertos; PA e luz (confirmar)",
    agreement: "A negociar (contrato/bilheteira)",
    notes: "NIF: 507 589 939. SPA: €87,00 (lucro por show — a confirmar).",
    source: "user"
  },
  {
    id: "20",
    name: "Palácio do Grillo",
    city: "(Lisboa — a confirmar)",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "palaciogriloeventos@gmail.com",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Espaço histórico para eventos; detalhes a confirmar.",
    source: "user"
  },
  {
    id: "21",
    name: "Cargo 111",
    city: "(Lisboa — a confirmar)",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "Cargo111ba@gmail.com",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Bar/sala de eventos; detalhes a confirmar.",
    source: "user"
  },
  {
    id: "22",
    name: "Teatro Sá de Miranda",
    city: "Viana do Castelo",
    capacity: "(teatro - confirmar sala pequena para 30-80)",
    address: "Rua Sá de Miranda, 4900-529 Viana do Castelo",
    responsible: "",
    phone: "(ver site)",
    email: "(ver site/contactos)",
    website: "",
    equipment: "Infra teatral completa; PA a confirmar",
    agreement: "Venda bilhetes via teatro / parceria institucional",
    notes: "Teatro histórico da cidade — espaço ideal para datas culturais e circuitos alternativos.",
    source: "CAE90040"
  },
  {
    id: "23",
    name: "Teatro Aveirense",
    city: "Aveiro",
    capacity: "(teatro - confirmar sala alternativa para showcases)",
    address: "Rua Belém Pará, 3810-066 Aveiro",
    responsible: "",
    phone: "(ver site)",
    email: "(ver site/contactos)",
    website: "https://www.teatroaveirense.pt/",
    equipment: "Infra completa (som/luz), staff técnico",
    agreement: "Venda bilheteira via teatro; contratual / parceria",
    notes: "Equipamento municipal — ideal para programação estruturada.",
    source: "CAE90040"
  },
  {
    id: "24",
    name: "Pavilhão do Arade",
    city: "Lagoa (Algarve)",
    capacity: "(multiusos - confirmar sala pequena para showcases)",
    address: "Urb. Passagem, 8400-611 Parchal",
    responsible: "",
    phone: "(ver site)",
    email: "(ver site)",
    website: "",
    equipment: "Infraestrutura para congressos e espetáculos",
    agreement: "A negociar (contrato de espaço / bilheteira)",
    notes: "Centro de congressos e espetáculos regional — boa alternativa no Algarve.",
    source: "CAE90040"
  },
  {
    id: "25",
    name: "Centro de Bridge de Lisboa S.A",
    city: "Lisboa",
    capacity: "(confirmar salas para eventos culturais)",
    address: "Av. António Augusto de Aguiar, 163, 4ºE, 1050-014 Lisboa",
    responsible: "",
    phone: "(ver site)",
    email: "(ver site)",
    website: "",
    equipment: "A confirmar",
    agreement: "A negociar",
    notes: "Operador registado em CAE 90040 — possível espaço multiusos em Lisboa.",
    source: "CAE90040"
  },
  {
    id: "26",
    name: "Praça das Flores - Produção de Espectáculos, Lda.",
    city: "Lisboa",
    capacity: "(operador — confirmar espaços próprios ou gestão de salas)",
    address: "Rua Imprensa Nacional 36, 1250-126 Lisboa",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Produtora com CAE 90040 — possível parceira para co-produções ou aluguer de salas.",
    source: "CAE90040"
  },
  {
    id: "27",
    name: "Smart Events - Produção de Espectáculos e Organização de Eventos, Lda.",
    city: "Lisboa",
    capacity: "(operador — confirmar salas próprias ou eventos itinerantes)",
    address: "Av. Infante D. Henrique 333, 5º - 62, 1800-282 Lisboa",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Empresa especializada em eventos e espetáculos; potencial para parcerias e datas em circuito.",
    source: "CAE90040"
  },
  {
    id: "28",
    name: "Empresa Artística S.A",
    city: "Porto",
    capacity: "(confirmar espaços próprios ou gestão de salas)",
    address: "Rua Gonçalo Sampaio, Nº39, 6º, 4150-366 Porto",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Empresa de espetáculos sediada no Porto com CAE 90040 — possível contacto para produções.",
    source: "CAE90040"
  },
  {
    id: "29",
    name: "Casino Fundanense S.A",
    city: "Fundão",
    capacity: "(confirmar sala de espetáculos)",
    address: "Praça do Município, 6230-338 Fundão",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "A confirmar",
    agreement: "A negociar",
    notes: "Operador regional com CAE 90040 — potencial para circuitos no interior.",
    source: "CAE90040"
  },
  {
    id: "30",
    name: "Cul.tur - Empresa Municipal de Cultura e Turismo de Santarém, Eem",
    city: "Marvila, Santarém",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Empresa municipal de cultura e turismo — possível espaço/gestão de eventos.",
    source: "CAE90040/NIF:509477755"
  },
  {
    id: "31",
    name: "Agência Roque - Produções e Agenciamento de Espectáculos, Lda",
    city: "Portela, Loures",
    capacity: "(operador)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Produtora e agenciamento de espetáculos — possível parceria para tours e eventos.",
    source: "NIF:502953713"
  },
  {
    id: "32",
    name: "Jovens Cantores de Lisboa - Animação Cultural, Crl",
    city: "Lisboa",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Associação cultural de animação musical — potencial para colaborações educativas e concertos.",
    source: "NIF:502918942"
  },
  {
    id: "33",
    name: "Promodel, Lda",
    city: "Alcabideche, Cascais",
    capacity: "(operador)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Empresa de produção e eventos — possível parceiro para shows e logística.",
    source: "NIF:508915287"
  },
  {
    id: "34",
    name: "Eurobowling Imobiliária e Técnica, Lda",
    city: "São João de Lourosa, Viseu",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Empresa técnica com experiência em eventos — verificar disponibilidade de espaço e infra.",
    source: "NIF:502215780"
  },
  {
    id: "35",
    name: "Share Your Views Lda",
    city: "Lovelhe, Vila Nova de Cerveira",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Produtora/empresa de eventos — potencial para showcases ou eventos corporativos.",
    source: "NIF:508991889"
  },
  {
    id: "36",
    name: "Chaves Viva - Associação Promotora Para O Ensino e Divulgação das Artes e Ofícios da Região Flaviense",
    city: "Chaves, Vila Real",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Associação cultural — ideal para concertos educativos e atividades de difusão artística.",
    source: "NIF:509013740"
  },
  {
    id: "37",
    name: "Cinema Em Conversa - Cineclube da Maia",
    city: "Maia, Porto",
    capacity: "(sala de cinema / espaço cultural)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "PA e projeção audiovisual (confirmar)",
    agreement: "(negociável)",
    notes: "Cineclube com programação cultural — possível para eventos híbridos ou showcases.",
    source: "NIF:509295401"
  },
  {
    id: "38",
    name: "Coniorquestra - Sociedade Musical, Lda",
    city: "Caldelas, Guimarães",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Sociedade musical — possível parceria para concertos e ensaios abertos.",
    source: "NIF:501484647"
  },
  {
    id: "39",
    name: "Jorge Miguel Rodrigues, Unipessoal Lda",
    city: "Pombeiro da Beira, Arganil",
    capacity: "(confirmar)",
    address: "",
    responsible: "",
    phone: "",
    email: "",
    website: "",
    equipment: "(confirmar)",
    agreement: "(confirmar)",
    notes: "Produtor/empresa de eventos locais — verificar capacidade para shows intimistas.",
    source: "NIF:509767060"
  }


];

const CREW_TEMPLATES = {
  technical: [
    {
      role: "Deejay e SFX",
      name: "Xando",
      contact: "",
      gear: "Roland SP, Headphones, 2x CDJ",
      deal: "20€ por hora",
      category: "DJ"
    },
    {
      role: "Técnico de Autotune & Ecrã",
      name: "Luís Brás",
      contact: "964858863",
      gear: "MIDI Autotune, Ecrã (VFX)",
      deal: "20€",
      category: "Áudio"
    },
    {
      role: "Touch Design Expert (VFX)",
      name: "Deox",
      contact: "964858863 | diogo.viegas888@gmail.com",
      gear: "Touch Design",
      deal: "40€",
      category: "Visual"
    },
    {
      role: "Técnico de Luz",
      name: "XXXX",
      contact: "",
      gear: "",
      deal: "20€",
      category: "Iluminação"
    },
    {
      role: "Técnico de Vídeo",
      name: "Adilson Tavares",
      contact: "",
      gear: "",
      deal: "20€",
      category: "Vídeo"
    }
  ],
  artistic: [
    {
      role: "Duo Coral - Menina 1",
      name: "",
      contact: "",
      gear: "",
      deal: "20€",
      category: "Vocal"
    },
    {
      role: "Duo Coral - Menina 2",
      name: "",
      contact: "",
      gear: "",
      deal: "20€",
      category: "Vocal"
    },
    {
      role: "Teatro e Dança - Menina 1",
      name: "",
      contact: "",
      gear: "",
      deal: "20€",
      category: "Performance"
    },
    {
      role: "Teatro e Dança - Menina 2",
      name: "",
      contact: "",
      gear: "",
      deal: "20€",
      category: "Performance"
    }
  ],
  creative: [
    {
      role: "ARV",
      name: "Leugim",
      contact: "",
      gear: "",
      deal: "",
      category: "Direção Criativa"
    },
    {
      role: "Fotógrafo",
      name: "Gonçalo Tavares",
      contact: "https://www.instagram.com/goncalomdcastro/",
      gear: "",
      deal: "20€",
      category: "Fotografia"
    }
  ]
};

const TemplateCard = ({ template, onAdd }: { template: any; onAdd: () => void }) => (
  <div className="flex items-center justify-between p-3 border-2 border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-sm">{template.name || template.role}</span>
        {template.deal && (
          <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900">
            {template.deal}
          </Badge>
        )}
      </div>
      <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
        <div>{template.role}</div>
        {template.gear && <div>🛠️ {template.gear}</div>}
        {template.contact && <div>📞 {template.contact}</div>}
      </div>
    </div>
    <Button
      size="sm"
      onClick={onAdd}
      className="bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-600"
    >
      <Plus className="w-4 h-4" />
    </Button>
  </div>
);

// Crew Member Card Component
const CrewMemberCard = ({ member, index, onUpdate, onRemove }: {
  member: any;
  index: number;
  onUpdate: (member: any) => void;
  onRemove: () => void;
}) => (
  <div className="grid grid-cols-12 gap-3 items-start p-4 border-2 border-slate-200 dark:border-slate-700 rounded-lg">
    <div className="col-span-3">
      <Label className="text-xs">Função</Label>
      <Input
        value={member.role}
        onChange={(e) => onUpdate({ ...member, role: e.target.value })}
        placeholder="Ex: Deejay, Técnico"
        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
      />
    </div>
   
    <div className="col-span-2">
      <Label className="text-xs">Nome</Label>
      <Input
        value={member.name}
        onChange={(e) => onUpdate({ ...member, name: e.target.value })}
        placeholder="Nome"
        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
      />
    </div>
   
    <div className="col-span-3">
      <Label className="text-xs">Contacto</Label>
      <Input
        value={member.contact}
        onChange={(e) => onUpdate({ ...member, contact: e.target.value })}
        placeholder="Telefone/Email/Instagram"
        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
      />
    </div>
   
    <div className="col-span-2">
      <Label className="text-xs">Equipamento</Label>
      <Input
        value={member.gear || ""}
        onChange={(e) => onUpdate({ ...member, gear: e.target.value })}
        placeholder="Gear trazido"
        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
      />
    </div>
   
    <div className="col-span-1">
      <Label className="text-xs">Deal</Label>
      <Input
        value={member.deal || ""}
        onChange={(e) => onUpdate({ ...member, deal: e.target.value })}
        placeholder="20€"
        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-sm"
      />
    </div>
   
    <div className="col-span-1 flex justify-end pt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRemove}
        className="border-2 border-red-200 dark:border-red-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

export default function EventPage({ params }: { params: { id: string } }) {
  const { updateEvent, setCurrentEvent } = useEvents();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Component for paste songs dialog
  const PasteSongsDialog = ({ onPaste }: { onPaste: (songs: string[]) => void }) => {
    const [open, setOpen] = useState(false);
    const [pasteText, setPasteText] = useState("");

    const handlePaste = () => {
      // Split by empty lines or newlines
      const lines = pasteText.split(/\n\s*\n|\n/).filter(line => line.trim() !== "");
      onPaste(lines);
      setPasteText("");
      setOpen(false);
    };

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Colar Lista
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Colar Lista de Músicas</DialogTitle>
            <DialogDescription>
              Cola a lista de músicas (uma por linha). O sistema irá separar automaticamente cada música por linha vazia.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Música 1&#10;Música 2&#10;&#10;Música 3&#10;&#10;Cada música numa linha separada..."
              rows={10}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              className="font-mono text-sm"
            />
            <Button
              onClick={handlePaste}
              className="w-full"
              disabled={!pasteText.trim()}
            >
              Adicionar Músicas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  const [requirementsDialogOpen, setRequirementsDialogOpen] = useState(false);
  const [requirementsVenue, setRequirementsVenue] = useState<Venue | null>(null);
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [requirementsForm, setRequirementsForm] = useState({
    remunerationModel: "", // flat, bar split, bilheteira %, mínimo garantido
    hasSoundTech: false,
    hasLightTech: false,
    hasBoxOffice: false,
    techCosts: "",
    openHours: "",
    curfewRules: "",
    capacityConfirmed: "",
    loadInWindow: "",
    loadOutWindow: "",
    backlineProvided: "",
    riderRequired: false,
    invoiceNif: "",
    responsibleEntity: "",
    musicalDirector: "",
    spaRegistryNumber: "",
    emailForAssets: "",
    phoneForOps: "",
    paymentMethod: "", // transferência, numerário, outro
    paymentDeadline: "", // antes/depois do show, 30 dias, etc.
  });

  // Venues: quick add dialog state (inline, no separate page)
  const [addVenueOpen, setAddVenueOpen] = useState(false);
  const [savingVenue, setSavingVenue] = useState(false);
  const [venuesQuery, setVenuesQuery] = useState("");
  const [localVenues, setLocalVenues] = useState<Venue[]>([]);
  const [vName, setVName] = useState("");
  const [vCity, setVCity] = useState("");
  const [vCountry, setVCountry] = useState("");
  const [vCapacity, setVCapacity] = useState("");
  const [vContactName, setVContactName] = useState("");
  const [vContactEmail, setVContactEmail] = useState("");
  const [vContactPhone, setVContactPhone] = useState("");
  const [vUrl, setVUrl] = useState("");
  const [vPhotoUrl, setVPhotoUrl] = useState("");
  const [vNotes, setVNotes] = useState("");

  const canSaveVenue = vName.trim().length > 0;

  const resetVenueForm = () => {
    setVName("");
    setVCity("");
    setVCountry("");
    setVCapacity("");
    setVContactName("");
    setVContactEmail("");
    setVContactPhone("");
    setVUrl("");
    setVPhotoUrl("");
    setVNotes("");
  };

  const lookupVenuePhoto = async () => {
    const query = [vName, vCity, vCountry].filter(Boolean).join(" ");
    if (!query.trim()) return;
    try {
      const r = await fetch(`/api/venue-photo?query=${encodeURIComponent(query)}`);
      const j = await r.json();
      if (j?.url) setVPhotoUrl(j.url);
    } catch {}
  };

  const handleSaveVenue = async () => {
    if (!canSaveVenue) return;
    setSavingVenue(true);
    try {
      await addVenue({
        name: vName,
        city: vCity,
        country: vCountry,
        capacity: vCapacity ? Number(vCapacity) : undefined,
        contactName: vContactName,
        contactEmail: vContactEmail,
        contactPhone: vContactPhone,
        url: vUrl,
        photoUrl: vPhotoUrl,
        notes: vNotes,
      });
      // Add to local list for immediate selection in this step
      setLocalVenues(prev => [
        {
          id: `local-${Date.now()}`,
          name: vName,
          city: vCity || "",
          capacity: vCapacity || "(confirmar)",
          address: "",
          responsible: vContactName || "",
          phone: vContactPhone || "",
          email: vContactEmail || "",
          website: vUrl || "",
          equipment: "",
          agreement: "",
          notes: vNotes || "",
          source: "local",
        },
        ...prev,
      ]);
      // Preencher imediatamente o campo 'Local' com o novo venue
      setEventData(prev => ({
        ...prev,
        overview: { ...prev.overview, venue: vName }
      }));
      setAddVenueOpen(false);
      resetVenueForm();
    } finally {
      setSavingVenue(false);
    }
  };

  const resetRequirementsForm = () => {
    setRequirementsForm({
      remunerationModel: "",
      hasSoundTech: false,
      hasLightTech: false,
      hasBoxOffice: false,
      techCosts: "",
      openHours: "",
      curfewRules: "",
      capacityConfirmed: "",
      loadInWindow: "",
      loadOutWindow: "",
      backlineProvided: "",
      riderRequired: false,
      invoiceNif: "",
      responsibleEntity: "",
      musicalDirector: "",
      spaRegistryNumber: "",
      emailForAssets: "",
      phoneForOps: "",
      paymentMethod: "",
      paymentDeadline: "",
    });
  };

  const generateMissingQuestions = () => {
    const questions: string[] = [];
    if (!requirementsForm.remunerationModel) questions.push("Qual o modelo de remuneração (flat / % bilheteira / bar split / mínimo garantido)?");
    if (!requirementsForm.capacityConfirmed) questions.push("Qual a lotação máxima confirmada da sala?");
    if (!requirementsForm.openHours) questions.push("Quais os horários de abertura/fecho?");
    if (!requirementsForm.curfewRules) questions.push("Há curfew/regras de ruído/licenciamento a cumprir? Qual o horário limite?");
    if (!requirementsForm.loadInWindow) questions.push("Janela de load-in (entrada de material) e acesso (carrinha/elevador)?");
    if (!requirementsForm.loadOutWindow) questions.push("Janela de load-out (saída de material)?");
    if (!requirementsForm.backlineProvided) questions.push("Há backline/PA/monição fornecidos? Podem enviar ficha técnica?");
    if (!requirementsForm.hasSoundTech) questions.push("Há técnico de som? Custos incluídos?");
    if (!requirementsForm.hasLightTech) questions.push("Há técnico de luz? Custos incluídos?");
    if (!requirementsForm.hasBoxOffice) questions.push("Há equipa de bilheteira/door? Custos?");
    if (!requirementsForm.techCosts) questions.push("Custos técnicos adicionais (som/luz/bilheteira)?");
    if (!requirementsForm.riderRequired) questions.push("Exigem rider técnico/avançado? Para onde enviar?");
    if (!requirementsForm.responsibleEntity) questions.push("Entidade responsável pelo contrato/faturação?");
    if (!requirementsForm.invoiceNif) questions.push("NIF para faturação?");
    if (!requirementsForm.musicalDirector) questions.push("Director musical / responsável operacional no dia?");
    if (!requirementsForm.spaRegistryNumber) questions.push("Nº de registo SPA (se aplicável) e política de report?");
    if (!requirementsForm.emailForAssets) questions.push("Email para envio de press-kit/assets?");
    if (!requirementsForm.phoneForOps) questions.push("Contacto telefónico para operações no dia?");
    if (!requirementsForm.paymentMethod) questions.push("Método de pagamento (transferência, numerário, outro)?");
    if (!requirementsForm.paymentDeadline) questions.push("Prazo de pagamento (antes/depois do show, 30 dias, etc.)?");
    return questions.join("\n• ");
  };
  const [eventData, setEventData] = useState<EventData>({
    overview: {
      eventName: "",
      eventType: "",
      date: "",
      venue: "",
      capacity: 0,
      description: "",
      organizerName: "",
      organizerContact: "",
    },
    finance: {
      budget: 0,
      ticketPrice: 0,
      sponsorship: 0,
      expenses: [
        { name: "Som", amount: 0 },
        { name: "Iluminação", amount: 0 },
        { name: "Palco", amount: 0 },
        { name: "Técnicos", amount: 0 },
        { name: "Catering", amount: 0 },
        { name: "Segurança", amount: 0 },
        { name: "Bilheteira", amount: 0 },
        { name: "Seguros", amount: 0 },
        { name: "Licenças (SPA)", amount: 87 },
        { name: "Marketing", amount: 0 },
        { name: "Transporte", amount: 0 },
        { name: "Alojamento", amount: 0 },
        { name: "Equipamento adicional", amount: 0 },
        { name: "Streaming / Transmissão", amount: 0 },
        { name: "Merch produção", amount: 0 },
      ],
      venueSplit: 30, // 30% para venue, 70% para organizador
      cachetPago: 0,
    },
    lineup: {
      artists: [],
      soundcheck: "",
      curfew: "",
    },
    production: {
      sound: "",
      lighting: "",
      stage: "",
      crew: [],
    },
    logistics: {
      address: "",
      parking: "",
      loadIn: "",
      loadOut: "",
      catering: "",
      material: [],
      travelOutfit: [],
    },
    tickets: {
      totalTickets: 0,
      soldTickets: 0,
      priceTiers: [],
    },
    marketing: {
      socialMedia: [],
      pressRelease: "",
      influencers: [],
    },
    templates: {
      artistConfirmation: "",
      venueProposal: "",
    },
    wardrobe: {
      selectedHairstyles: [],
      selectedGlasses: [],
      selectedHeadWear: [],
      selectedSuperior: [],
      selectedPants: [],
      selectedShoes: [],
      selectedNeckAccessories: [],
      selectedBracelets: [],
      selectedWatch: [],
      selectedBelt: [],
      customItems: [],
      totalPrice: 0,
    },
    setlist: {
      songs: [],
      autotuneSetting: "",
      voiceType: "",
    },
    rehearsalNotes: {
      decisions: [],
      breathingIssues: [],
      generalNotes: "",
    },
    dayItinerary: {
      date: "",
      location: "",
      travelDetails: [],
      accommodation: "",
      meals: [],
      soundcheckTime: "",
      venueOpenTime: "",
      clothingStores: [],
      studioVisits: [],
      voicePractice: [],
      hydrationReminders: [],
      audienceReminders: [],
      otherNotes: "",
    },
  });

  // Load event from database if ID exists and is not "new"
  useEffect(() => {
    // Function to normalize event data (ensure all new fields exist)
    const normalizeEventData = (data: any): EventData => {
      return {
        ...data,
        // Ensure finance exists with all required fields
        finance: {
          budget: data.finance?.budget || 0,
          ticketPrice: data.finance?.ticketPrice || 0,
          sponsorship: data.finance?.sponsorship || 0,
          expenses: data.finance?.expenses || [],
          venueSplit: data.finance?.venueSplit || 70,
          cachetPago: data.finance?.cachetPago || 0,
          expectedAttendance: data.finance?.expectedAttendance || 70,
          merchPerPerson: data.finance?.merchPerPerson || 5,
          estimatedProfit: data.finance?.estimatedProfit || 0,
        },
        // Ensure venues exists
        venues: data.venues || {
          primary: null,
          backups: [],
          requiredCapacity: data.overview?.capacity || 0,
        },
        // Ensure overview has city
        overview: {
          ...data.overview,
          city: data.overview?.city || "",
        },
        // Ensure lineup has schedule
        lineup: {
          ...data.lineup,
          artists: data.lineup?.artists || [],
          soundcheck: data.lineup?.soundcheck || "",
          curfew: data.lineup?.curfew || "",
          schedule: data.lineup?.schedule || [],
        },
        // Ensure production has required fields
        production: {
          ...data.production,
          sound: data.production?.sound || "",
          lighting: data.production?.lighting || "",
          stage: data.production?.stage || "",
          crew: data.production?.crew || [],
          technicalRider: data.production?.technicalRider || "",
          technicalRiderConfirmed: data.production?.technicalRiderConfirmed || false,
          team: data.production?.team || [],
          estimatedCost: data.production?.estimatedCost || 0,
        },
        // Ensure tickets has required fields
        tickets: {
          ...data.tickets,
          totalTickets: data.tickets?.totalTickets || 0,
          soldTickets: data.tickets?.soldTickets || 0,
          priceTiers: data.tickets?.priceTiers || [],
          policy: data.tickets?.policy || "",
          prices: data.tickets?.prices || {},
        },
        // Ensure logistics has required fields
        logistics: {
          ...data.logistics,
          address: data.logistics?.address || "",
          parking: data.logistics?.parking || "",
          loadIn: data.logistics?.loadIn || "",
          loadOut: data.logistics?.loadOut || "",
          catering: data.logistics?.catering || "",
          material: data.logistics?.material || [],
          travelOutfit: data.logistics?.travelOutfit || [],
          estimatedCost: data.logistics?.estimatedCost || 0,
          transport: data.logistics?.transport || "",
          accommodation: data.logistics?.accommodation || "",
        },
        // Ensure marketing has required fields
        marketing: {
          ...data.marketing,
          socialMedia: data.marketing?.socialMedia || [],
          pressRelease: data.marketing?.pressRelease || "",
          influencers: data.marketing?.influencers || [],
          strategy: data.marketing?.strategy || "",
          assets: data.marketing?.assets || "",
          budget: data.marketing?.budget || 0,
        },
        // Ensure rehearsalNotes exists
        rehearsalNotes: data.rehearsalNotes || {
          decisions: [],
          breathingIssues: [],
          generalNotes: "",
        },
        // Ensure setlist songs have time field
        setlist: {
          ...data.setlist,
          songs: (data.setlist?.songs || []).map((song: any) => ({
            ...song,
            time: song.time || "",
          })),
        },
        // Ensure logistics material and travelOutfit are arrays
        logistics: {
          ...data.logistics,
          material: Array.isArray(data.logistics?.material)
            ? data.logistics.material
            : data.logistics?.material
            ? [{ 
                id: `material-${Date.now()}`,
                name: data.logistics.material,
                category: "Outros",
                checked: false,
                returned: false,
              }]
            : [],
          travelOutfit: Array.isArray(data.logistics?.travelOutfit)
            ? data.logistics.travelOutfit
            : data.logistics?.travelOutfit
            ? [{ 
                id: `outfit-${Date.now()}`,
                name: data.logistics.travelOutfit,
                category: "Outros",
                checked: false,
                returned: false,
              }]
            : [],
        },
        // Ensure dayItinerary arrays exist
        dayItinerary: {
          ...data.dayItinerary,
          travelDetails: Array.isArray(data.dayItinerary?.travelDetails)
            ? data.dayItinerary.travelDetails
            : data.dayItinerary?.travelDetails
            ? [{ 
                id: `travel-${Date.now()}`,
                type: "Transporte",
                time: "",
                details: data.dayItinerary.travelDetails,
                notes: "",
              }]
            : [],
          clothingStores: Array.isArray(data.dayItinerary?.clothingStores)
            ? data.dayItinerary.clothingStores
            : data.dayItinerary?.clothingStores
            ? [{ 
                id: `store-${Date.now()}`,
                name: data.dayItinerary.clothingStores,
                address: "",
                time: "",
                notes: "",
              }]
            : [],
          studioVisits: Array.isArray(data.dayItinerary?.studioVisits)
            ? data.dayItinerary.studioVisits
            : data.dayItinerary?.studioVisits
            ? [{ 
                id: `studio-${Date.now()}`,
                studio: "",
                artist: "",
                time: "",
                purpose: "",
                notes: data.dayItinerary.studioVisits,
              }]
            : [],
          voicePractice: Array.isArray(data.dayItinerary?.voicePractice)
            ? data.dayItinerary.voicePractice
            : data.dayItinerary?.voicePractice
            ? [{ 
                id: `voice-${Date.now()}`,
                type: "",
                time: "",
                duration: "",
                notes: data.dayItinerary.voicePractice,
              }]
            : [],
          hydrationReminders: Array.isArray(data.dayItinerary?.hydrationReminders)
            ? data.dayItinerary.hydrationReminders
            : data.dayItinerary?.hydrationReminders
            ? [{ 
                id: `hydration-${Date.now()}`,
                time: "",
                completed: false,
              }]
            : [],
          audienceReminders: Array.isArray(data.dayItinerary?.audienceReminders)
            ? data.dayItinerary.audienceReminders
            : [],
          meals: Array.isArray(data.dayItinerary?.meals)
            ? data.dayItinerary.meals
            : (typeof data.dayItinerary?.meals === 'string' && (data.dayItinerary.meals as string).trim() !== ''
              ? [{
                  id: `meal-${Date.now()}`,
                  date: data.dayItinerary?.date || "",
                  time: "",
                  location: "",
                  whatToEat: data.dayItinerary.meals as string,
                  price: 0,
                }]
              : []),
        },
      };
    };

    const loadEvent = async () => {
      if (params.id && params.id !== "new") {
        try {
          setIsLoading(true);
          const loadedEvent = await loadEventFromIndexedDB(params.id);
          if (loadedEvent) {
            const normalizedEvent = normalizeEventData(loadedEvent);
            setEventData(normalizedEvent);
            setCurrentEvent(normalizedEvent);
            setLastSaved(new Date());
          }
        } catch (error) {
          console.error('Error loading event:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // New event - initialize with ID
        const newEventData = { ...eventData, id: `evento-${Date.now()}` };
        setEventData(newEventData);
        setIsLoading(false);
      }
    };
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  // Ensure meals is always an array
  useEffect(() => {
    if (eventData && !Array.isArray(eventData.dayItinerary?.meals)) {
      setEventData(prev => {
        const mealsValue = prev.dayItinerary?.meals;
        const normalizedMeals = typeof mealsValue === 'string' && (mealsValue as string).trim() !== ''
          ? [{
              id: `meal-${Date.now()}`,
              date: prev.dayItinerary?.date || "",
              time: "",
              location: "",
              whatToEat: mealsValue,
              price: 0,
            }]
          : (Array.isArray(mealsValue) ? mealsValue : []);
        
        return {
          ...prev,
          dayItinerary: {
            ...prev.dayItinerary,
            meals: normalizedMeals
          }
        };
      });
    }
  }, [eventData?.dayItinerary?.meals]);

  // Auto-save when eventData changes (debounced)
  useEffect(() => {
    if (!isLoading && eventData) {
      const timer = setTimeout(() => {
        const eventToSave: EventData & { id: string } = { ...eventData, id: eventData.id || params.id || `evento-${Date.now()}` };
        updateEvent(eventToSave);
        setLastSaved(new Date());
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData, isLoading, params.id]);

  const handleManualSave = () => {
    const eventToSave: EventData & { id: string } = { ...eventData, id: eventData.id || params.id || `evento-${Date.now()}` };
    setCurrentEvent(eventToSave);
    setLastSaved(new Date());
  };

  const steps: Step[] = [
    {
      name: "Visão Geral",
      link: "/overview",
      timeframe: "Fase 1",
      description: "Informações básicas do evento",
      status: "completed",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      name: "Financeiro",
      link: "/finance",
      timeframe: "Fase 1",
      description: "Orçamento e controlo financeiro",
      status: "current",
      icon: <DollarSign className="w-4 h-4" />,
    },
    {
      name: "Line-up",
      link: "/lineup",
      timeframe: "Fase 2",
      description: "Artistas e horários",
      status: "upcoming",
      icon: <Users className="w-4 h-4" />,
    },
    {
      name: "SETLIST",
      link: "/setlist",
      timeframe: "Fase 2",
      description: "Músicas e configurações de autotune",
      status: "upcoming",
      icon: <Music className="w-4 h-4" />,
    },
    {
      name: "Notas de Ensaio",
      link: "/rehearsal-notes",
      timeframe: "Fase 2",
      description: "Decisões e anotações de ensaio",
      status: "upcoming",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      name: "Equipa",
      link: "/production",
      timeframe: "Fase 2",
      description: "Definição de equipamentos e técnicos",
      status: "upcoming",
      icon: <Settings className="w-4 h-4" />,
    },
    {
      name: "Vestuário",
      link: "/wardrobe",
      timeframe: "Fase 2",
      description: "Seleção de vestuário para o evento",
      status: "upcoming",
      icon: <Shirt className="w-4 h-4" />,
    },
    {
      name: "Logística",
      link: "/logistics",
      timeframe: "Fase 2",
      description: "Local e infraestrutura",
      status: "upcoming",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      name: "Bilheteira",
      link: "/tickets",
      timeframe: "Fase 2",
      description: "Vendas e preços",
      status: "upcoming",
      icon: <Ticket className="w-4 h-4" />,
    },
    {
      name: "Marketing",
      link: "/marketing",
      timeframe: "Fase 2",
      description: "Promoção e comunicação",
      status: "upcoming",
      icon: <Megaphone className="w-4 h-4" />,
    },
    {
      name: "Venues",
      link: "/venues",
      timeframe: "Fase 1",
      description: "Base de dados de locais",
      status: "upcoming",
      icon: <Building className="w-4 h-4" />,
    },
    {
      name: "Templates",
      link: "/templates",
      timeframe: "Fase 3",
      description: "Emails e documentos",
      status: "upcoming",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      name: "Itinerário do Dia do Show",
      link: "/day-itinerary",
      timeframe: "Fase 3",
      description: "Planeamento completo do dia do evento",
      status: "upcoming",
      icon: <CalendarClock className="w-4 h-4" />,
    },
  ];

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  // Função para gerar email de confirmação para artistas
  const generateArtistConfirmationEmail = () => {
    const { eventName, date, organizerName, organizerContact } = eventData.overview;
    const formattedDate = new Date(date).toLocaleDateString("pt-PT");

    return `Assunto: CONFIRMAÇÃO: ${eventName} — ${formattedDate}

Olá [Nome do Artista],

Confirmamos a tua participação no ${eventName} no dia ${formattedDate}. Por favor envia:

• Rider técnico
• Bio + foto(s) em alta resolução
• Quanto tempo precisas para soundcheck?
• Horário preferido para atuação (se tiveres restrições)

Vamos enviar o timetable oficial assim que estiver fechado.

Abraço,
${organizerName}
${organizerContact}`;
  };

  // Função para gerar proposta para venue
  const generateVenueProposalEmail = () => {
    const { eventName, date, description, organizerName, organizerContact } = eventData.overview;
    const formattedDate = new Date(date).toLocaleDateString("pt-PT");
    const alternativeDate = new Date(new Date(date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-PT");
    const month = new Date(date).toLocaleDateString("pt-PT", { month: "long" });

    const artistList = eventData.lineup.artists.map(artist =>
      `• ${artist.name} — ${artist.instagram || 'N/A'}`
    ).join("\n");

    return `Assunto: Proposta de evento — ${eventName} — Data preferida: ${formattedDate} (alternativas: ${alternativeDate})

Olá [Nome / Equipa],

Chamo-me ${organizerName} e estou a planear um evento chamado ${eventName}. O conceito é ${description}.

Datas: Preferimos ${formattedDate}. Caso não seja possível, temos disponibilidade também em ${alternativeDate} ou idealmente uma sexta/sábado no mês de ${month}.

Line-up (proposta):
${artistList}

Perguntas:
• Qual o modelo de remuneração que a venue prefere (flat / percentagem da bilheteira)?
• Têm técnico de som e luz e pessoal na bilheteira? Em caso afirmativo, há custos associados?
• Quais os horários de abertura/fecho do espaço?
• Para onde envio riders técnicos e conteúdos para promo (bio + fotos)?

Agradeço se nos puderem confirmar disponibilidade e eventuais condições. Posso enviar um press-kit e mais detalhes sobre o projecto.

Cumprimentos,
${organizerName} — ${organizerContact}`;
  };

  // Função para exportar o itinerário completo em PDF
  const exportFullItineraryPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Helper to check if new page is needed
    const checkNewPage = (requiredSpace: number = 20) => {
      if (yPosition + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Title page
    yPosition = margin;
    doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
    doc.setTextColor(75, 85, 99); // slate-600
    doc.text("ITINERÁRIO COMPLETO", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(eventData.overview.eventName || "Evento", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Helper function for section titles with background
    const addSectionTitle = (title: string, color: number[] = [59, 130, 246]) => {
      checkNewPage(25);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(margin, yPosition - 5, contentWidth, 10, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin + 5, yPosition + 2);
      yPosition += 12;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
    };

    // Helper for key-value pairs with nice formatting
    const addKeyValue = (key: string, value: string | number, indent: number = 0) => {
      checkNewPage(8);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text(`${key}:`, margin + indent, yPosition);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      const valueStr = String(value);
      const lines = doc.splitTextToSize(valueStr, contentWidth - indent - 40);
      doc.text(lines, margin + indent + 35, yPosition);
      yPosition += lines.length * 5 + 2;
    };

    // Helper for lists with bullets
    const addList = (label: string, items: any[], formatter?: (item: any) => string) => {
      if (!items || items.length === 0) return;
      checkNewPage(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text(`${label}:`, margin, yPosition);
      yPosition += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      items.forEach((item, idx) => {
        checkNewPage(6);
        const text = formatter ? formatter(item) : (typeof item === 'object' ? JSON.stringify(item) : String(item));
        const lines = doc.splitTextToSize(`  • ${text}`, contentWidth - 10);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 1;
      });
      yPosition += 3;
    };

    // Helper for divider line
    const addDivider = () => {
      checkNewPage(5);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 5;
    };

    // Overview Section
    addSectionTitle("VISAO GERAL", [59, 130, 246]); // blue
    addKeyValue("Nome do Evento", eventData.overview.eventName || "N/A");
    addKeyValue("Tipo", eventData.overview.eventType || "N/A");
    if (eventData.overview.date) {
      addKeyValue("Data", new Date(eventData.overview.date).toLocaleDateString("pt-PT"));
    }
    addKeyValue("Local", eventData.overview.venue || "N/A");
    if (eventData.logistics.address) {
      addKeyValue("Endereço", eventData.logistics.address);
    }
    addKeyValue("Capacidade", eventData.overview.capacity || 0);
    if (eventData.overview.description) {
      addKeyValue("Descrição", eventData.overview.description);
    }
    if (eventData.overview.organizerName) {
      addKeyValue("Organizador", `${eventData.overview.organizerName}${eventData.overview.organizerContact ? ` - ${eventData.overview.organizerContact}` : ""}`);
    }
    addDivider();

    // Financeiro Section
    addSectionTitle("FINANCEIRO", [34, 197, 94]); // green
    addKeyValue("Orcamento Total", `EUR ${(eventData.finance.budget || 0).toLocaleString('pt-PT')}`);
    addKeyValue("Preco do Bilhete", `EUR ${(eventData.finance.ticketPrice || 0).toLocaleString('pt-PT')}`);
    addKeyValue("Patrocinios", `EUR ${(eventData.finance.sponsorship || 0).toLocaleString('pt-PT')}`);
    addKeyValue("Divisão com Venue", `${eventData.finance.venueSplit || 0}% venue / ${100 - (eventData.finance.venueSplit || 0)}% organizador`);
    if (eventData.overview.eventType === "third-party-event" && eventData.finance.cachetPago) {
      addKeyValue("Cachet Pago", `EUR ${(eventData.finance.cachetPago || 0).toLocaleString('pt-PT')}`);
    }
    if (eventData.finance.expenses && eventData.finance.expenses.length > 0) {
      checkNewPage(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text("Despesas:", margin, yPosition);
    yPosition += 5;
      eventData.finance.expenses.forEach(exp => {
        checkNewPage(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`  - ${exp.name}: EUR ${exp.amount.toLocaleString('pt-PT')}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }
    addDivider();

    // Line-up Section
    addSectionTitle("LINE-UP", [168, 85, 247]); // purple
    if (eventData.lineup.soundcheck) {
      addKeyValue("Soundcheck", eventData.lineup.soundcheck);
    }
    if (eventData.lineup.curfew) {
      addKeyValue("Curfew", eventData.lineup.curfew);
    }
    if (eventData.lineup.artists && eventData.lineup.artists.length > 0) {
      addList("Artistas", eventData.lineup.artists, (artist) => {
        return `${artist.name}${artist.time ? ` (${artist.time})` : ""}${artist.fee ? ` - EUR ${artist.fee.toLocaleString('pt-PT')}` : ""}`;
      });
    }
    addDivider();

    // Setlist Section
    if (eventData.setlist && eventData.setlist.songs && eventData.setlist.songs.length > 0) {
      addSectionTitle("SETLIST", [236, 72, 153]); // pink
      if (eventData.setlist.autotuneSetting) {
        addKeyValue("Autotune Setting", eventData.setlist.autotuneSetting);
      }
      if (eventData.setlist.voiceType) {
        addKeyValue("Tipo de Voz", eventData.setlist.voiceType);
      }
      checkNewPage(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text("Músicas:", margin, yPosition);
    yPosition += 5;
      eventData.setlist.songs.sort((a, b) => a.order - b.order).forEach((song, idx) => {
        checkNewPage(6);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const songText = `${idx + 1}. ${song.name || "Música sem nome"}${song.time ? ` [${song.time}]` : ""}${song.autotuneNote ? ` (${song.autotuneNote})` : ""}`;
        const lines = doc.splitTextToSize(`  ${songText}`, contentWidth - 10);
        doc.text(lines, margin + 5, yPosition);
        yPosition += lines.length * 5 + 1;
      });
      yPosition += 3;
      addDivider();
    }

    // Equipa Section
    addSectionTitle("EQUIPA", [251, 146, 60]); // orange
    if (eventData.production.sound) {
      addKeyValue("Som", eventData.production.sound);
    }
    if (eventData.production.lighting) {
      addKeyValue("Iluminação", eventData.production.lighting);
    }
    if (eventData.production.stage) {
      addKeyValue("Palco", eventData.production.stage);
    }
    if (eventData.production.crew && eventData.production.crew.length > 0) {
      addList("Crew", eventData.production.crew, (member) => {
        return `${member.role}: ${member.name}${member.contact ? ` (${member.contact})` : ""}`;
      });
    }
    addDivider();

    // Vestuário Section
    addSectionTitle("VESTUARIO", [239, 68, 68]); // red
    
    // Mapeamento de IDs para nomes legíveis e preços
    const wardrobeItemMap: Record<string, { label: string; price: number }> = {
      // Óculos
      "sem_oculos": { label: "Sem Óculos", price: 0 },
      "com_oculos": { label: "Com Óculos Estilosos", price: 15 },
      // Head Wear
      "gorro_personalizado": { label: "Gorro Personalizado", price: 5 },
      "gorro": { label: "Gorro", price: 3 },
      "babushka": { label: "Babushka", price: 4 },
      "russian_headwear": { label: "Russian Headwear", price: 6 },
      "militar_camoflage": { label: "Militar Camoflage", price: 7 },
      // Parte Superior
      "dtf": { label: "Let's Copy DTF", price: 11 },
      "brincos": { label: "Tshirt Vazia", price: 9 },
      "balmacan": { label: "Balmacan Personalizada", price: 5 },
      "colete": { label: "Colete", price: 15 },
      "cravat": { label: "Cravat de Seda", price: 4 },
      "chainspersonalizados": { label: "Chains Personalizado", price: 560 },
      "gravata_ascot": { label: "Gravata Ascot", price: 10 },
      // Pants
      "custom_pants": { label: "Custom Pants", price: 20 },
      "zara_pants": { label: "Zara Pants", price: 25 },
      "pants_chain": { label: "Pants Chain", price: 10 },
      // Shoes
      "zara_boots": { label: "Zara Boots", price: 40 },
      "bershka_boots": { label: "Bershka Boots", price: 35 },
      // Neck Accessories
      "nenhum": { label: "Nenhum", price: 0 },
      "correntes": { label: "Correntes", price: 130 },
      // Bracelets
      "glitter_bracelet": { label: "Glitter Bracelet", price: 3.5 },
      "personalized_bracelet": { label: "Personalized Bracelet", price: 15 },
      // Watch
      "watch": { label: "Watch", price: 20 },
      // Belt
      "triparte_belt": { label: "TRIPARTE BELT", price: 30 },
    };
    
    const getWardrobeItemName = (id: string): string => {
      return wardrobeItemMap[id]?.label || id;
    };
    
    const getWardrobeItemPrice = (id: string): number => {
      return wardrobeItemMap[id]?.price || 0;
    };
    
    const wardrobeSections = [
      { label: "Cabelo", items: eventData.wardrobe.selectedHairstyles },
      { label: "Óculos", items: eventData.wardrobe.selectedGlasses },
      { label: "Head Wear", items: eventData.wardrobe.selectedHeadWear },
      { label: "Parte Superior", items: eventData.wardrobe.selectedSuperior },
      { label: "Pants", items: eventData.wardrobe.selectedPants },
      { label: "Shoes", items: eventData.wardrobe.selectedShoes },
      { label: "Neck Accessories", items: eventData.wardrobe.selectedNeckAccessories },
      { label: "Bracelets", items: eventData.wardrobe.selectedBracelets },
      { label: "Watch", items: eventData.wardrobe.selectedWatch },
      { label: "Belt", items: eventData.wardrobe.selectedBelt },
    ];
    
    wardrobeSections.forEach(({ label, items }) => {
      if (items && items.length > 0) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text(`${label}:`, margin, yPosition);
    yPosition += 5;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        items.forEach((itemId) => {
          checkNewPage(6);
          const itemName = getWardrobeItemName(itemId);
          const itemPrice = getWardrobeItemPrice(itemId);
          const priceText = itemPrice > 0 ? ` - EUR ${itemPrice.toFixed(2)}` : "";
          doc.text(`  - ${itemName}${priceText}`, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }
    });
    
    if (eventData.wardrobe.customItems && eventData.wardrobe.customItems.length > 0) {
      checkNewPage(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text("Itens Personalizados:", margin, yPosition);
    yPosition += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      eventData.wardrobe.customItems.forEach((item) => {
        checkNewPage(6);
        doc.text(`  - ${item.name} (${item.category}) - EUR ${item.price.toFixed(2)}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }
    if (eventData.wardrobe.totalPrice > 0) {
      checkNewPage(8);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(`Total Vestuario: EUR ${eventData.wardrobe.totalPrice.toLocaleString('pt-PT')}`, margin, yPosition);
      yPosition += 8;
    }
    addDivider();

    // Logística Section
    addSectionTitle("LOGISTICA", [14, 165, 233]); // cyan
    if (eventData.logistics.address) {
      addKeyValue("Endereço Completo", eventData.logistics.address);
    }
    if (eventData.logistics.parking) {
      addKeyValue("Estacionamento", eventData.logistics.parking);
    }
    if (eventData.logistics.loadIn) {
      addKeyValue("Load-In", eventData.logistics.loadIn);
    }
    if (eventData.logistics.loadOut) {
      addKeyValue("Load-Out", eventData.logistics.loadOut);
    }
    if (eventData.logistics.catering) {
      addKeyValue("Catering", eventData.logistics.catering);
    }
    if (eventData.logistics.material && eventData.logistics.material.length > 0) {
      checkNewPage(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text("Material a Levar:", margin, yPosition);
    yPosition += 5;
      eventData.logistics.material.forEach((item) => {
        checkNewPage(6);
        const status = item.checked ? "[LEVADO]" : "[NAO LEVADO]";
        const returned = item.returned ? " [DEVOLVIDO]" : "";
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`  ${status} ${item.category}: ${item.name}${returned}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }
    if (eventData.logistics.travelOutfit && eventData.logistics.travelOutfit.length > 0) {
      checkNewPage(15);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(75, 85, 99);
      doc.text("Roupa até Chegar no Local:", margin, yPosition);
      yPosition += 5;
      eventData.logistics.travelOutfit.forEach((item) => {
        checkNewPage(6);
        const status = item.checked ? "[LEVADO]" : "[NAO LEVADO]";
        const returned = item.returned ? " [DEVOLVIDO]" : "";
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        doc.text(`  ${status} ${item.category}: ${item.name}${returned}`, margin + 5, yPosition);
        yPosition += 5;
      });
      yPosition += 3;
    }
    addDivider();

    // Bilheteira Section
    addSectionTitle("BILHETEIRA", [245, 158, 11]); // yellow
    addKeyValue("Total Bilhetes", eventData.tickets.totalTickets || 0);
    addKeyValue("Vendidos", eventData.tickets.soldTickets || 0);
    if (eventData.tickets.priceTiers && eventData.tickets.priceTiers.length > 0) {
      addList("Preços por Categoria", eventData.tickets.priceTiers, (tier) => {
        return `${tier.name}: EUR ${tier.price.toLocaleString('pt-PT')} (${tier.quantity} bilhetes)`;
      });
    }
    addDivider();

    // Marketing Section
    addSectionTitle("MARKETING", [139, 92, 246]); // violet
    if (eventData.marketing.pressRelease) {
      addKeyValue("Press Release", eventData.marketing.pressRelease);
    }
    if (eventData.marketing.socialMedia && eventData.marketing.socialMedia.length > 0) {
      addList("Redes Sociais", eventData.marketing.socialMedia, (sm) => {
        return `${sm.platform}: ${sm.content}${sm.scheduled ? ` (${sm.scheduled})` : ""}`;
      });
    }
    if (eventData.marketing.influencers && eventData.marketing.influencers.length > 0) {
      addList("Influencers", eventData.marketing.influencers, (inf) => {
        return `${inf.name} - Reach: ${inf.reach.toLocaleString('pt-PT')}${inf.fee ? ` (EUR ${inf.fee.toLocaleString('pt-PT')})` : ""}`;
      });
    }
    addDivider();

    // Day Itinerary Section
    if (eventData.dayItinerary && (eventData.dayItinerary.date || eventData.dayItinerary.location)) {
      addSectionTitle("ITINERARIO DO DIA DO SHOW", [59, 130, 246]); // blue
      if (eventData.dayItinerary.date) {
        addKeyValue("Data", new Date(eventData.dayItinerary.date).toLocaleDateString("pt-PT"));
      }
      if (eventData.dayItinerary.location) {
        addKeyValue("Localização", eventData.dayItinerary.location);
      }
      if (eventData.dayItinerary.accommodation) {
        addKeyValue("Alojamento", eventData.dayItinerary.accommodation);
      }
      if (eventData.dayItinerary.meals && eventData.dayItinerary.meals.length > 0) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text("Refeicoes:", margin, yPosition);
    yPosition += 5;
        let totalMeals = 0;
        eventData.dayItinerary.meals.forEach((item) => {
          checkNewPage(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const dateStr = item.date ? new Date(item.date).toLocaleDateString("pt-PT") : "";
          const timeStr = item.time || "";
          const locationStr = item.location || "";
          const whatStr = item.whatToEat || "";
          const priceStr = item.price ? `EUR ${item.price.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
          const text = `${dateStr} ${timeStr} - ${locationStr}${whatStr ? `: ${whatStr}` : ""}${priceStr ? ` (${priceStr})` : ""}`;
          const lines = doc.splitTextToSize(`  - ${text}`, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5 + 1;
          totalMeals += item.price || 0;
        });
        if (totalMeals > 0) {
          checkNewPage(8);
          doc.setFont("helvetica", "bold");
          doc.text(`  Total Refeicoes: EUR ${totalMeals.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
          yPosition += 8;
        }
        yPosition += 3;
      }
      if (eventData.dayItinerary.soundcheckTime) {
        addKeyValue("Horário Soundcheck", eventData.dayItinerary.soundcheckTime);
      }
      if (eventData.dayItinerary.venueOpenTime) {
        addKeyValue("Abertura do Venue", eventData.dayItinerary.venueOpenTime);
      }
      
      // Travel Details
      if (eventData.dayItinerary.travelDetails && eventData.dayItinerary.travelDetails.length > 0) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text("Detalhes de Viagem:", margin, yPosition);
    yPosition += 5;
        eventData.dayItinerary.travelDetails.forEach((item) => {
          checkNewPage(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const text = `${item.time || "Sem horário"} - ${item.type}: ${item.details}${item.notes ? ` (${item.notes})` : ""}`;
          const lines = doc.splitTextToSize(`  - ${text}`, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5 + 1;
        });
        yPosition += 3;
      }

      // Clothing Stores
      if (eventData.dayItinerary.clothingStores && eventData.dayItinerary.clothingStores.length > 0) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text("Lojas de Roupa:", margin, yPosition);
    yPosition += 5;
        eventData.dayItinerary.clothingStores.forEach((item) => {
          checkNewPage(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const text = `${item.time || "Sem horário"} - ${item.name}${item.address ? ` (${item.address})` : ""}${item.notes ? ` - ${item.notes}` : ""}`;
          const lines = doc.splitTextToSize(`  - ${text}`, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5 + 1;
        });
        yPosition += 3;
      }

      // Studio Visits
      if (eventData.dayItinerary.studioVisits && eventData.dayItinerary.studioVisits.length > 0) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text("Visitas a Estúdios:", margin, yPosition);
    yPosition += 5;
        eventData.dayItinerary.studioVisits.forEach((item) => {
          checkNewPage(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const text = `${item.time || "Sem horário"} - ${item.studio}${item.artist ? ` com ${item.artist}` : ""}${item.purpose ? ` (${item.purpose})` : ""}`;
          const lines = doc.splitTextToSize(`  - ${text}`, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5 + 1;
        });
        yPosition += 3;
      }

      // Voice Practice
      if (eventData.dayItinerary.voicePractice && eventData.dayItinerary.voicePractice.length > 0) {
        checkNewPage(15);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(75, 85, 99);
        doc.text("Práticas de Voz:", margin, yPosition);
    yPosition += 5;
        eventData.dayItinerary.voicePractice.forEach((item) => {
          checkNewPage(6);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          const text = `${item.time || "Sem horário"} - ${item.type || "Prática"}${item.duration ? ` (${item.duration})` : ""}${item.notes ? `: ${item.notes}` : ""}`;
          const lines = doc.splitTextToSize(`  - ${text}`, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5 + 1;
        });
        yPosition += 3;
      }

      // Hydration Reminders
      if (eventData.dayItinerary.hydrationReminders && eventData.dayItinerary.hydrationReminders.length > 0) {
        checkNewPage(15);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246); // blue
        doc.text("LEMBRETES DE HIDRATACAO", margin, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        eventData.dayItinerary.hydrationReminders.forEach((item) => {
          checkNewPage(6);
          const status = item.completed ? "[FEITO]" : "[PENDENTE]";
          doc.text(`  - ${item.time || "Sem horario"} - ${status}`, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }

      // Audience Reminders
      if (eventData.dayItinerary.audienceReminders && eventData.dayItinerary.audienceReminders.length > 0) {
        checkNewPage(15);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(139, 92, 246); // purple
        doc.text("O QUE A AUDIENCIA REALMENTE QUER VER", margin, yPosition);
        yPosition += 6;
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        eventData.dayItinerary.audienceReminders.forEach((item) => {
          checkNewPage(6);
          const status = item.completed ? "[FEITO]" : "[PENDENTE]";
          const text = `${item.time || "Sem horario"} - ${status} - ${item.tip || ""}`;
          const lines = doc.splitTextToSize(`  - ${text}`, contentWidth - 10);
          doc.text(lines, margin + 5, yPosition);
          yPosition += lines.length * 5 + 1;
        });
        yPosition += 3;
      }

      if (eventData.dayItinerary.otherNotes) {
        addKeyValue("Outras Notas", eventData.dayItinerary.otherNotes);
      }
    }

    // Save PDF
    doc.save(`${eventData.overview.eventName || "evento"}_itinerario_completo.pdf`);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Overview
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eventName">Nome do Evento</Label>
                <Input
                  id="eventName"
                  value={eventData.overview.eventName}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    overview: { ...prev.overview, eventName: e.target.value }
                  }))}
                  placeholder="Ex: DAY DREAM II Underworld"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="eventType">Tipo de Evento</Label>
                <Select
                  value={eventData.overview.eventType}
                  onValueChange={(value) => {
                    setEventData(prev => ({
                      ...prev,
                      overview: {
                        ...prev.overview,
                        eventType: value,
                        description: EVENT_TYPE_DESCRIPTIONS[value] || prev.overview.description
                      }
                    }));
                  }}
                >
                  <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diepretty-world">Diepretty World</SelectItem>
                    <SelectItem value="diepretty-beat-battles">Die808s Batalha de Beats</SelectItem>
                    <SelectItem value="industry-day">Industry Day</SelectItem>
                    <SelectItem value="concerto">Concerto</SelectItem>
                    <SelectItem value="festival">Festival</SelectItem>
                    <SelectItem value="conferencia">Conferência</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="third-party-event">Third Party Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Data do Evento</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventData.overview.date}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    overview: { ...prev.overview, date: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div className="col-span-2">
                <Label>Seleção de Venues (Principal + Backups)</Label>
                <MultiVenueSelector
                  requiredCapacity={eventData?.venues?.requiredCapacity || eventData?.overview?.capacity || 0}
                  city={eventData?.overview?.city}
                  primaryVenue={eventData?.venues?.primary || null}
                  backupVenues={eventData?.venues?.backups || []}
                  onPrimaryChange={(venue) => {
                    setEventData(prev => ({
                      ...prev,
                      venues: {
                        ...prev.venues,
                        primary: venue,
                        backups: prev.venues?.backups || [],
                        requiredCapacity: prev.venues?.requiredCapacity || 0,
                      },
                      overview: {
                        ...prev.overview,
                        venue: venue?.name || prev.overview?.venue || "",
                        capacity: venue?.capacity || prev.overview?.capacity || 0,
                        city: venue?.city || prev.overview?.city || "",
                      },
                      logistics: {
                        ...prev.logistics,
                        address: venue?.address || prev.logistics?.address || "",
                      },
                    }));
                  }}
                  onBackupsChange={(venues) => {
                    setEventData(prev => ({
                      ...prev,
                      venues: {
                        ...prev.venues,
                        primary: prev.venues?.primary || null,
                        backups: venues,
                        requiredCapacity: prev.venues?.requiredCapacity || 0,
                      },
                    }));
                  }}
                  onCapacityChange={(capacity) => {
                    setEventData(prev => ({
                      ...prev,
                      venues: {
                        ...prev.venues,
                        primary: prev.venues?.primary || null,
                        backups: prev.venues?.backups || [],
                        requiredCapacity: capacity,
                      },
                      overview: {
                        ...prev.overview,
                        capacity: capacity,
                      },
                    }));
                  }}
                  onCityChange={(city) => {
                    setEventData(prev => ({
                      ...prev,
                      overview: {
                        ...prev.overview,
                        city: city,
                      },
                    }));
                  }}
                />
              </div>
              <div>
                <Label htmlFor="organizerName">Nome do Organizador</Label>
                <Input
                  id="organizerName"
                  value={eventData.overview.organizerName}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    overview: { ...prev.overview, organizerName: e.target.value }
                  }))}
                  placeholder="Ex: João Silva"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizerContact">Contacto do Organizador</Label>
                <Input
                  id="organizerContact"
                  value={eventData.overview.organizerContact}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    overview: { ...prev.overview, organizerContact: e.target.value }
                  }))}
                  placeholder="Ex: joao@email.com / +351 123 456 789"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição do Evento</Label>
              <Textarea
                id="description"
                value={eventData.overview.description}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  overview: { ...prev.overview, description: e.target.value }
                }))}
                placeholder="Descreva o conceito e objetivos do evento..."
                rows={4}
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          </div>
        );

      case 1: // Financeiro
        return (
          <div className="space-y-6">
            {/* Profit Dashboard */}
            <ProfitDashboard 
              eventData={eventData}
              onUpdate={(updates) => {
                setEventData(prev => ({
                  ...prev,
                  finance: {
                    ...prev.finance,
                    ...updates,
                  },
                  venues: {
                    ...prev.venues,
                    requiredCapacity: updates.capacity || prev.venues?.requiredCapacity || 0,
                  },
                }));
              }}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Orçamento Total (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={eventData?.finance?.budget || 0}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { 
                      ...prev.finance, 
                      budget: parseInt(e.target.value) || 0,
                      expenses: prev.finance?.expenses || [],
                      venueSplit: prev.finance?.venueSplit || 70,
                    }
                  }))}
                  placeholder="50000"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="ticketPrice">Preço do Bilhete (€)</Label>
                <Input
                  id="ticketPrice"
                  type="number"
                  value={eventData?.finance?.ticketPrice || 0}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { 
                      ...prev.finance, 
                      ticketPrice: parseInt(e.target.value) || 0,
                      expenses: prev.finance?.expenses || [],
                      venueSplit: prev.finance?.venueSplit || 70,
                    }
                  }))}
                  placeholder="25"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="sponsorship">Patrocínios (€)</Label>
                <Input
                  id="sponsorship"
                  type="number"
                  value={eventData?.finance?.sponsorship || 0}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { 
                      ...prev.finance, 
                      sponsorship: parseInt(e.target.value) || 0,
                      expenses: prev.finance?.expenses || [],
                      venueSplit: prev.finance?.venueSplit || 70,
                    }
                  }))}
                  placeholder="10000"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="venueSplit">Divisão Percentual com aVenue (%)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentagem que a venue recebe (ex: 30% = venue, 70% = organizador)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="venueSplit"
                  type="number"
                  value={eventData.finance.venueSplit}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { ...prev.finance, venueSplit: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="30"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Venue: {eventData.finance.venueSplit}% | Organizador: {100 - eventData.finance.venueSplit}%
                </p>
              </div>
              {eventData.overview.eventType === "third-party-event" && (
                <div>
                  <Label htmlFor="cachetPago">Cachet Pago (€)</Label>
                  <Input
                    id="cachetPago"
                    type="number"
                    value={eventData.finance.cachetPago}
                    onChange={(e) => setEventData(prev => ({
                      ...prev,
                      finance: { ...prev.finance, cachetPago: parseInt(e.target.value) || 0 }
                    }))}
                    placeholder="500"
                    className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
              )}
            </div>
            <div>
              <Label>Despesas</Label>
              <div className="space-y-2">
                {eventData.finance.expenses.map((expense, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={expense.name}
                      onChange={(e) => {
                        const newExpenses = [...eventData.finance.expenses];
                        newExpenses[index].name = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          finance: { ...prev.finance, expenses: newExpenses }
                        }));
                      }}
                      placeholder="Nome da despesa"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="number"
                      value={expense.amount}
                      onChange={(e) => {
                        const newExpenses = [...eventData.finance.expenses];
                        newExpenses[index].amount = parseInt(e.target.value) || 0;
                        setEventData(prev => ({
                          ...prev,
                          finance: { ...prev.finance, expenses: newExpenses }
                        }));
                      }}
                      placeholder="Valor"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newExpenses = eventData.finance.expenses.filter((_, i) => i !== index);
                        setEventData(prev => ({
                          ...prev,
                          finance: { ...prev.finance, expenses: newExpenses }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEventData(prev => ({
                    ...prev,
                    finance: {
                      ...prev.finance,
                      expenses: [...prev.finance.expenses, { name: "", amount: 0 }]
                    }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Despesa
                </Button>
              </div>
            </div>
          </div>
        );

      case 2: // Line-up
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="soundcheck">Soundcheck</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Horário para os artistas testarem o som e equipamentos antes do evento</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="soundcheck"
                  type="time"
                  value={eventData.lineup.soundcheck}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    lineup: { ...prev.lineup, soundcheck: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="curfew">Curfew</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Horário limite para terminar o evento (imposto pelo local ou licenças)</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="curfew"
                  type="time"
                  value={eventData.lineup.curfew}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    lineup: { ...prev.lineup, curfew: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <Label>Artistas</Label>
              <div className="space-y-2">
                {eventData.lineup.artists.map((artist, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2">
                    <Input
                      value={artist.name}
                      onChange={(e) => {
                        const newArtists = [...eventData.lineup.artists];
                        newArtists[index].name = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          lineup: { ...prev.lineup, artists: newArtists }
                        }));
                      }}
                      placeholder="Nome do artista"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="time"
                      value={artist.time}
                      onChange={(e) => {
                        const newArtists = [...eventData.lineup.artists];
                        newArtists[index].time = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          lineup: { ...prev.lineup, artists: newArtists }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="number"
                      value={artist.fee}
                      onChange={(e) => {
                        const newArtists = [...eventData.lineup.artists];
                        newArtists[index].fee = parseInt(e.target.value) || 0;
                        setEventData(prev => ({
                          ...prev,
                          lineup: { ...prev.lineup, artists: newArtists }
                        }));
                      }}
                      placeholder="Cachet (€)"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      value={artist.contact}
                      onChange={(e) => {
                        const newArtists = [...eventData.lineup.artists];
                        newArtists[index].contact = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          lineup: { ...prev.lineup, artists: newArtists }
                        }));
                      }}
                      placeholder="Contacto"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      value={artist.instagram}
                      onChange={(e) => {
                        const newArtists = [...eventData.lineup.artists];
                        newArtists[index].instagram = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          lineup: { ...prev.lineup, artists: newArtists }
                        }));
                      }}
                      placeholder="@instagram"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newArtists = eventData.lineup.artists.filter((_, i) => i !== index);
                        setEventData(prev => ({
                          ...prev,
                          lineup: { ...prev.lineup, artists: newArtists }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEventData(prev => ({
                    ...prev,
                    lineup: {
                      ...prev.lineup,
                      artists: [...prev.lineup.artists, { name: "", time: "", fee: 0, contact: "", instagram: "", spotify: "" }]
                    }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Artista
                </Button>
              </div>
            </div>
          </div>
        );

      case 3: // SETLIST
        return (
          <div className="space-y-6">
            {/* Autotune Settings Section - On Top */}
            <div className="border rounded-lg p-6 bg-slate-50 dark:bg-slate-900">
              <h3 className="text-xl font-bold mb-4">Configurações de Autotune</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="autotuneSetting">Autotune Setting</Label>
                  <Input
                    id="autotuneSetting"
                    value={eventData.setlist.autotuneSetting}
                    onChange={(e) => setEventData(prev => ({
                      ...prev,
                      setlist: { ...prev.setlist, autotuneSetting: e.target.value }
                    }))}
                    placeholder="Ex: +3, 0, -2, etc."
                    className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                </div>
                <div>
                  <Label htmlFor="voiceType">Tipo de Voz</Label>
                  <Select
                    value={eventData.setlist.voiceType}
                    onValueChange={(value: "auto-tenor" | "low-male" | "") => {
                      setEventData(prev => ({
                        ...prev,
                        setlist: { ...prev.setlist, voiceType: value }
                      }));
                    }}
                  >
                    <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400">
                      <SelectValue placeholder="Selecionar tipo de voz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto-tenor">Auto Tenor</SelectItem>
                      <SelectItem value="low-male">Low Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Event Info Display */}
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <h3 className="text-lg font-semibold mb-2">Informações do Show</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Evento:</span> {eventData.overview.eventName || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Data:</span> {eventData.overview.date ? new Date(eventData.overview.date).toLocaleDateString("pt-PT") : "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Local:</span> {eventData.overview.venue || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Organizador:</span> {eventData.overview.organizerName || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Soundcheck:</span> {eventData.lineup.soundcheck || "N/A"}
                </div>
                <div>
                  <span className="font-semibold">Curfew:</span> {eventData.lineup.curfew || "N/A"}
                </div>
              </div>
            </div>

            {/* Songs List */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Setlist - Músicas</Label>
                <PasteSongsDialog
                  onPaste={(songs) => {
                    const maxOrder = eventData.setlist.songs.length > 0 
                      ? Math.max(...eventData.setlist.songs.map(s => s.order)) 
                      : 0;
                    
                    const newSongs = songs.map((name, idx) => ({
                      name: name.trim(),
                      autotuneNote: "",
                      order: maxOrder + idx + 1,
                      time: "",
                    }));
                    
                    setEventData(prev => ({
                      ...prev,
                      setlist: {
                        ...prev.setlist,
                        songs: [...prev.setlist.songs, ...newSongs]
                      }
                    }));
                  }}
                />
              </div>
              <div className="space-y-3 mt-2">
                {eventData.setlist.songs
                  .sort((a, b) => a.order - b.order)
                  .map((song, index) => {
                    const actualIndex = eventData.setlist.songs.findIndex(s => s === song);
                    return (
                      <div key={actualIndex} className="grid grid-cols-12 gap-2 items-center border rounded p-3">
                        <div className="col-span-1 text-center font-semibold">
                          #{song.order}
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="time"
                            value={song.time || ""}
                            onChange={(e) => {
                              const newSongs = [...eventData.setlist.songs];
                              newSongs[actualIndex].time = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                setlist: { ...prev.setlist, songs: newSongs }
                              }));
                            }}
                            placeholder="Hora"
                            className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 text-xs"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            value={song.name}
                            onChange={(e) => {
                              const newSongs = [...eventData.setlist.songs];
                              newSongs[actualIndex].name = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                setlist: { ...prev.setlist, songs: newSongs }
                              }));
                            }}
                            placeholder="Nome da música"
                            className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={song.autotuneNote}
                            onChange={(e) => {
                              const newSongs = [...eventData.setlist.songs];
                              newSongs[actualIndex].autotuneNote = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                setlist: { ...prev.setlist, songs: newSongs }
                              }));
                            }}
                            placeholder="Nota autotune (ex: +3, 0, -2)"
                            className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newSongs = eventData.setlist.songs.filter((_, i) => i !== actualIndex);
                              setEventData(prev => ({
                                ...prev,
                                setlist: { ...prev.setlist, songs: newSongs }
                              }));
                            }}
                            className="border-2 border-slate-200 dark:border-slate-700 w-full"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                <Button
                  variant="outline"
                  onClick={() => {
                    const maxOrder = eventData.setlist.songs.length > 0 
                      ? Math.max(...eventData.setlist.songs.map(s => s.order)) 
                      : 0;
                    setEventData(prev => ({
                      ...prev,
                      setlist: {
                        ...prev.setlist,
                        songs: [
                          ...prev.setlist.songs,
                          { name: "", autotuneNote: "", order: maxOrder + 1, time: "" }
                        ]
                      }
                    }));
                  }}
                  className="border-2 border-slate-200 dark:border-slate-700 w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Música
                </Button>
              </div>
            </div>
          </div>
        );

      case 4: // Cenário/Notas de Ensaio
        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20 mb-4">
              <h3 className="text-lg font-semibold mb-2">Notas de Ensaio e Decisões</h3>
              <p className="text-sm text-muted-foreground">
                Anota decisões importantes, partes das músicas onde vais perder fôlego, e outras notas de ensaio.
              </p>
            </div>

            {/* Decisões */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Decisões Importantes</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEventData(prev => ({
                      ...prev,
                      rehearsalNotes: {
                        ...prev.rehearsalNotes,
                        decisions: [
                          ...prev.rehearsalNotes.decisions,
                          { song: "", decision: "", notes: "" }
                        ]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Decisão
                </Button>
              </div>
              <div className="space-y-3">
                {eventData.rehearsalNotes.decisions.map((decision, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <Label>Música</Label>
                        <Select
                          value={decision.song}
                          onValueChange={(value) => {
                            const newDecisions = [...eventData.rehearsalNotes.decisions];
                            newDecisions[index].song = value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, decisions: newDecisions }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar música" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventData.setlist.songs.map((song) => (
                              <SelectItem key={song.order} value={song.name}>
                                {song.name || `Música ${song.order}`}
                              </SelectItem>
                            ))}
                            <SelectItem value="geral">Geral</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-8">
                        <Label>Decisão</Label>
                        <Input
                          value={decision.decision}
                          onChange={(e) => {
                            const newDecisions = [...eventData.rehearsalNotes.decisions];
                            newDecisions[index].decision = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, decisions: newDecisions }
                            }));
                          }}
                          placeholder="Ex: Fazer acapella em vez de playback"
                          className="mt-2"
                        />
                      </div>
                      <div className="col-span-12">
                        <Label>Notas</Label>
                        <Textarea
                          value={decision.notes}
                          onChange={(e) => {
                            const newDecisions = [...eventData.rehearsalNotes.decisions];
                            newDecisions[index].notes = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, decisions: newDecisions }
                            }));
                          }}
                          placeholder="Detalhes adicionais sobre esta decisão..."
                          rows={2}
                          className="mt-2"
                        />
                      </div>
                      <div className="col-span-12 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newDecisions = eventData.rehearsalNotes.decisions.filter((_, i) => i !== index);
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, decisions: newDecisions }
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Problemas de Fôlego */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-semibold">Partes com Problemas de Fôlego</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEventData(prev => ({
                      ...prev,
                      rehearsalNotes: {
                        ...prev.rehearsalNotes,
                        breathingIssues: [
                          ...prev.rehearsalNotes.breathingIssues,
                          { song: "", part: "", notes: "", timestamp: "" }
                        ]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Problema
                </Button>
              </div>
              <div className="space-y-3">
                {eventData.rehearsalNotes.breathingIssues.map((issue, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-12 gap-3">
                      <div className="col-span-4">
                        <Label>Música</Label>
                        <Select
                          value={issue.song}
                          onValueChange={(value) => {
                            const newIssues = [...eventData.rehearsalNotes.breathingIssues];
                            newIssues[index].song = value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, breathingIssues: newIssues }
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar música" />
                          </SelectTrigger>
                          <SelectContent>
                            {eventData.setlist.songs.map((song) => (
                              <SelectItem key={song.order} value={song.name}>
                                {song.name || `Música ${song.order}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-3">
                        <Label>Timestamp (opcional)</Label>
                        <Input
                          value={issue.timestamp || ""}
                          onChange={(e) => {
                            const newIssues = [...eventData.rehearsalNotes.breathingIssues];
                            newIssues[index].timestamp = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, breathingIssues: newIssues }
                            }));
                          }}
                          placeholder="Ex: 1:23"
                          className="mt-2"
                        />
                      </div>
                      <div className="col-span-5">
                        <Label>Parte da Música</Label>
                        <Input
                          value={issue.part}
                          onChange={(e) => {
                            const newIssues = [...eventData.rehearsalNotes.breathingIssues];
                            newIssues[index].part = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, breathingIssues: newIssues }
                            }));
                          }}
                          placeholder="Ex: Refrão, Ponte, Verso 2..."
                          className="mt-2"
                        />
                      </div>
                      <div className="col-span-12">
                        <Label>Notas / Solução</Label>
                        <Textarea
                          value={issue.notes}
                          onChange={(e) => {
                            const newIssues = [...eventData.rehearsalNotes.breathingIssues];
                            newIssues[index].notes = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, breathingIssues: newIssues }
                            }));
                          }}
                          placeholder="Ex: Cortar 2 linhas, fazer pausa mais longa, respirar antes desta parte..."
                          rows={2}
                          className="mt-2"
                        />
                      </div>
                      <div className="col-span-12 flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newIssues = eventData.rehearsalNotes.breathingIssues.filter((_, i) => i !== index);
                            setEventData(prev => ({
                              ...prev,
                              rehearsalNotes: { ...prev.rehearsalNotes, breathingIssues: newIssues }
                            }));
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Notas Gerais */}
            <div>
              <Label className="text-lg font-semibold mb-2 block">Notas Gerais de Ensaio</Label>
              <Textarea
                value={eventData.rehearsalNotes.generalNotes}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  rehearsalNotes: { ...prev.rehearsalNotes, generalNotes: e.target.value }
                }))}
                placeholder="Outras notas importantes sobre o ensaio, performance, etc..."
                rows={6}
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          </div>
        );

      case 5: // Equipa
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="sound">Som</Label>
                <Input
                  id="sound"
                  value={eventData.production.sound}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    production: { ...prev.production, sound: e.target.value }
                  }))}
                  placeholder="Ex: Sistema de som profissional"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="lighting">Iluminação</Label>
                <Input
                  id="lighting"
                  value={eventData.production.lighting}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    production: { ...prev.production, lighting: e.target.value }
                  }))}
                  placeholder="Ex: LED RGB + spots"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="stage">Palco</Label>
                <Input
                  id="stage"
                  value={eventData.production.stage}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    production: { ...prev.production, stage: e.target.value }
                  }))}
                  placeholder="Ex: Palco 6x4m"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
           
 {/* Seção de Templates */}
 <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">🚀 Templates de Equipa</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Pessoas e profissionais que já confias - adiciona com um clique
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="border-2 border-slate-200 dark:border-slate-700"
                  >
                    {showTemplates ? "Ocultar Templates" : "Mostrar Templates"}
                  </Button>
                </div>
              </CardHeader>
             
              {showTemplates && (
                <CardContent className="space-y-6">
                  {/* Técnicos */}
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">🎛️ Equipa Técnica</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CREW_TEMPLATES.technical.map((template, index) => (
                        <TemplateCard
                          key={`tech-${index}`}
                          template={template}
                          onAdd={() => {
                            setEventData(prev => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                crew: [...prev.production.crew, { ...template }]
                              }
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Artísticos */}
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">🎭 Performance Artística</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CREW_TEMPLATES.artistic.map((template, index) => (
                        <TemplateCard
                          key={`art-${index}`}
                          template={template}
                          onAdd={() => {
                            setEventData(prev => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                crew: [...prev.production.crew, { ...template }]
                              }
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Criativos */}
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">🎨 Equipa Criativa</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CREW_TEMPLATES.creative.map((template, index) => (
                        <TemplateCard
                          key={`creative-${index}`}
                          template={template}
                          onAdd={() => {
                            setEventData(prev => ({
                              ...prev,
                              production: {
                                ...prev.production,
                                crew: [...prev.production.crew, { ...template }]
                              }
                            }));
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Ação Rápida - Adicionar Todos */}
                  <div className="flex gap-2 justify-center pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const allTemplates = [
                          ...CREW_TEMPLATES.technical,
                          ...CREW_TEMPLATES.artistic,
                          ...CREW_TEMPLATES.creative
                        ];
                        setEventData(prev => ({
                          ...prev,
                          production: {
                            ...prev.production,
                            crew: [...prev.production.crew, ...allTemplates]
                          }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Toda a Equipa
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Gestão da Equipa Atual */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">👥 Equipa Atual do Evento</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {eventData.production.crew.length} membros • Total: {
                        eventData.production.crew.reduce((total, member) => {
                          const dealValue = member.deal ? parseInt(member.deal.replace(/[^\d]/g, '')) || 0 : 0;
                          return total + dealValue;
                        }, 0)
                      }€
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEventData(prev => ({
                        ...prev,
                        production: {
                          ...prev.production,
                          crew: [...prev.production.crew, {
                            role: "",
                            name: "",
                            contact: "",
                            gear: "",
                            deal: "",
                            category: ""
                          }]
                        }
                      }));
                    }}
                    className="border-2 border-slate-200 dark:border-slate-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Membro Personalizado
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventData.production.crew.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhum membro adicionado ainda.</p>
                      <p className="text-sm">Use os templates acima ou adicione um membro personalizado.</p>
                    </div>
                  ) : (
                    eventData.production.crew.map((member, index) => (
                      <CrewMemberCard
                        key={index}
                        member={member}
                        index={index}
                        onUpdate={(updatedMember) => {
                          const newCrew = [...eventData.production.crew];
                          newCrew[index] = updatedMember;
                          setEventData(prev => ({
                            ...prev,
                            production: { ...prev.production, crew: newCrew }
                          }));
                        }}
                        onRemove={() => {
                          const newCrew = eventData.production.crew.filter((_, i) => i !== index);
                          setEventData(prev => ({
                            ...prev,
                            production: { ...prev.production, crew: newCrew }
                          }));
                        }}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 6: // Vestuário
        return (
          <div className="space-y-6">
            <WardrobePlanningPageContent eventData={eventData} setEventData={setEventData} />
          </div>
        );

      case 7: // Logística
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                value={eventData.logistics.address}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  logistics: { ...prev.logistics, address: e.target.value }
                }))}
                placeholder="Rua, número, cidade, código postal"
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="loadIn">Load-in</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Horário para entrada e montagem de equipamentos no local</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="loadIn"
                  type="datetime-local"
                  value={eventData.logistics.loadIn}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, loadIn: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="loadOut">Load-out</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-4 h-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Horário para desmontagem e saída de equipamentos do local</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  id="loadOut"
                  type="datetime-local"
                  value={eventData.logistics.loadOut}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, loadOut: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parking">Estacionamento</Label>
                <Textarea
                  id="parking"
                  value={eventData.logistics.parking}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, parking: e.target.value }
                  }))}
                  placeholder="Informações sobre estacionamento..."
                  rows={3}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="catering">Catering</Label>
                <Textarea
                  id="catering"
                  value={eventData.logistics.catering}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, catering: e.target.value }
                  }))}
                  placeholder="Informações sobre catering..."
                  rows={3}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Material que Vou Levar - Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Material que Vou Levar</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: `material-${Date.now()}-${Math.random()}`,
                        name: "",
                        category: "Outros",
                        checked: false,
                        returned: false,
                      };
                      setEventData(prev => ({
                        ...prev,
                        logistics: {
                          ...prev.logistics,
                          material: [...prev.logistics.material, newItem]
                        }
                      }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {eventData.logistics.material.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum item adicionado. Clica em "Adicionar Item" para começar.
                  </p>
                ) : (
                  eventData.logistics.material.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) => {
                          const newMaterial = [...eventData.logistics.material];
                          newMaterial[index].checked = checked as boolean;
                          setEventData(prev => ({
                            ...prev,
                            logistics: { ...prev.logistics, material: newMaterial }
                          }));
                        }}
                      />
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <Select
                            value={item.category}
                            onValueChange={(value) => {
                              const newMaterial = [...eventData.logistics.material];
                              newMaterial[index].category = value;
                              setEventData(prev => ({
                                ...prev,
                                logistics: { ...prev.logistics, material: newMaterial }
                              }));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Eletrónica">Eletrónica</SelectItem>
                              <SelectItem value="Áudio">Áudio</SelectItem>
                              <SelectItem value="Cabos">Cabos</SelectItem>
                              <SelectItem value="Documentos">Documentos</SelectItem>
                              <SelectItem value="Higiene">Higiene</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-7">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newMaterial = [...eventData.logistics.material];
                              newMaterial[index].name = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                logistics: { ...prev.logistics, material: newMaterial }
                              }));
                            }}
                            placeholder="Nome do item..."
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1 flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Checkbox
                                checked={item.returned}
                                onCheckedChange={(checked) => {
                                  const newMaterial = [...eventData.logistics.material];
                                  newMaterial[index].returned = checked as boolean;
                                  setEventData(prev => ({
                                    ...prev,
                                    logistics: { ...prev.logistics, material: newMaterial }
                                  }));
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como devolvido</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-xs text-muted-foreground">✓</span>
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newMaterial = eventData.logistics.material.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                logistics: { ...prev.logistics, material: newMaterial }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {eventData.logistics.material.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                  <span>
                    Total: {eventData.logistics.material.length} | 
                    Levados: {eventData.logistics.material.filter(i => i.checked).length} | 
                    Devolvidos: {eventData.logistics.material.filter(i => i.returned).length}
                  </span>
                </div>
              )}
            </div>

            {/* Roupa até Chegar no Local - Checklist */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Roupa até Chegar no Local</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: `outfit-${Date.now()}-${Math.random()}`,
                        name: "",
                        category: "Outros",
                        checked: false,
                        returned: false,
                      };
                      setEventData(prev => ({
                        ...prev,
                        logistics: {
                          ...prev.logistics,
                          travelOutfit: [...prev.logistics.travelOutfit, newItem]
                        }
                      }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {eventData.logistics.travelOutfit.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum item adicionado. Clica em "Adicionar Item" para começar.
                  </p>
                ) : (
                  eventData.logistics.travelOutfit.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 border rounded hover:bg-muted/50">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={(checked) => {
                          const newOutfit = [...eventData.logistics.travelOutfit];
                          newOutfit[index].checked = checked as boolean;
                          setEventData(prev => ({
                            ...prev,
                            logistics: { ...prev.logistics, travelOutfit: newOutfit }
                          }));
                        }}
                      />
                      <div className="flex-1 grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-3">
                          <Select
                            value={item.category}
                            onValueChange={(value) => {
                              const newOutfit = [...eventData.logistics.travelOutfit];
                              newOutfit[index].category = value;
                              setEventData(prev => ({
                                ...prev,
                                logistics: { ...prev.logistics, travelOutfit: newOutfit }
                              }));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Parte Superior">Parte Superior</SelectItem>
                              <SelectItem value="Parte Inferior">Parte Inferior</SelectItem>
                              <SelectItem value="Calçado">Calçado</SelectItem>
                              <SelectItem value="Acessórios">Acessórios</SelectItem>
                              <SelectItem value="Casaco">Casaco</SelectItem>
                              <SelectItem value="Outros">Outros</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-7">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newOutfit = [...eventData.logistics.travelOutfit];
                              newOutfit[index].name = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                logistics: { ...prev.logistics, travelOutfit: newOutfit }
                              }));
                            }}
                            placeholder="Nome do item..."
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1 flex items-center gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Checkbox
                                checked={item.returned}
                                onCheckedChange={(checked) => {
                                  const newOutfit = [...eventData.logistics.travelOutfit];
                                  newOutfit[index].returned = checked as boolean;
                                  setEventData(prev => ({
                                    ...prev,
                                    logistics: { ...prev.logistics, travelOutfit: newOutfit }
                                  }));
                                }}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Marcar como devolvido</p>
                            </TooltipContent>
                          </Tooltip>
                          <span className="text-xs text-muted-foreground">✓</span>
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newOutfit = eventData.logistics.travelOutfit.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                logistics: { ...prev.logistics, travelOutfit: newOutfit }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {eventData.logistics.travelOutfit.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground flex gap-4">
                  <span>
                    Total: {eventData.logistics.travelOutfit.length} | 
                    Levados: {eventData.logistics.travelOutfit.filter(i => i.checked).length} | 
                    Devolvidos: {eventData.logistics.travelOutfit.filter(i => i.returned).length}
                  </span>
                </div>
              )}
            </div>
          </div>
        );

      case 8: // Bilheteira
        // Calculate revenue and profit
        const totalRevenue = eventData.tickets.priceTiers.reduce((sum, tier) => {
          return sum + (tier.price * tier.quantity);
        }, 0);
        const totalSoldFromTiers = eventData.tickets.priceTiers.reduce((sum, tier) => {
          return sum + tier.quantity;
        }, 0);
        const occupancyRate = eventData.tickets.totalTickets > 0 
          ? ((totalSoldFromTiers / eventData.tickets.totalTickets) * 100).toFixed(1)
          : 0;
        const remainingTickets = eventData.tickets.totalTickets - totalSoldFromTiers;
        
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalTickets">Total de Bilhetes (Cap. Total)</Label>
                <Input
                  id="totalTickets"
                  type="number"
                  value={eventData.tickets.totalTickets}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    tickets: { ...prev.tickets, totalTickets: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="350"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="soldTickets">Bilhetes Vendidos</Label>
                <Input
                  id="soldTickets"
                  type="number"
                  value={eventData.tickets.soldTickets}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    tickets: { ...prev.tickets, soldTickets: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="280"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>
            <div>
              <Label>Preços por Categoria</Label>
              <div className="space-y-2">
                {eventData.tickets.priceTiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input
                      value={tier.name}
                      onChange={(e) => {
                        const newTiers = [...eventData.tickets.priceTiers];
                        newTiers[index].name = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          tickets: { ...prev.tickets, priceTiers: newTiers }
                        }));
                      }}
                      placeholder="Nome da categoria"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => {
                        const newTiers = [...eventData.tickets.priceTiers];
                        newTiers[index].price = parseInt(e.target.value) || 0;
                        setEventData(prev => ({
                          ...prev,
                          tickets: { ...prev.tickets, priceTiers: newTiers }
                        }));
                      }}
                      placeholder="Preço (€)"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => {
                        const newTiers = [...eventData.tickets.priceTiers];
                        newTiers[index].quantity = parseInt(e.target.value) || 0;
                        setEventData(prev => ({
                          ...prev,
                          tickets: { ...prev.tickets, priceTiers: newTiers }
                        }));
                      }}
                      placeholder="Quantidade"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newTiers = eventData.tickets.priceTiers.filter((_, i) => i !== index);
                        setEventData(prev => ({
                          ...prev,
                          tickets: { ...prev.tickets, priceTiers: newTiers }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEventData(prev => ({
                    ...prev,
                    tickets: {
                      ...prev.tickets,
                      priceTiers: [...prev.tickets.priceTiers, { name: "", price: 0, quantity: 0 }]
                    }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Categoria
                </Button>
              </div>
            </div>
            
            {/* Calculadora de Lucro */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Calculadora de Lucro Estimado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Receita Total Estimada</Label>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      EUR {totalRevenue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Taxa de Ocupação</Label>
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {occupancyRate}%
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Bilhetes Vendidos (Categorias)</Label>
                    <div className="text-lg font-semibold">
                      {totalSoldFromTiers} / {eventData.tickets.totalTickets || 0}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Bilhetes Restantes</Label>
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {remainingTickets}
                    </div>
                  </div>
                </div>
                {eventData.tickets.priceTiers.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <Label className="text-sm font-semibold">Detalhamento por Categoria</Label>
                    <div className="space-y-1">
                      {eventData.tickets.priceTiers.map((tier, index) => {
                        const tierRevenue = tier.price * tier.quantity;
                        return (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              {tier.name || `Categoria ${index + 1}`}: {tier.quantity} × EUR {tier.price.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span className="font-semibold">
                              EUR {tierRevenue.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 9: // Marketing
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="pressRelease">Press Release</Label>
              <Textarea
                id="pressRelease"
                value={eventData.marketing.pressRelease}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  marketing: { ...prev.marketing, pressRelease: e.target.value }
                }))}
                placeholder="Escreva o press release do evento..."
                rows={6}
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <Label>Redes Sociais</Label>
              <div className="space-y-2">
                {eventData.marketing.socialMedia.map((post, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Select
                      value={post.platform}
                      onValueChange={(value) => {
                        const newPosts = [...eventData.marketing.socialMedia];
                        newPosts[index].platform = value;
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, socialMedia: newPosts }
                        }));
                      }}
                    >
                      <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400">
                        <SelectValue placeholder="Plataforma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="twitter">Twitter</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={post.content}
                      onChange={(e) => {
                        const newPosts = [...eventData.marketing.socialMedia];
                        newPosts[index].content = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, socialMedia: newPosts }
                        }));
                      }}
                      placeholder="Conteúdo"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="datetime-local"
                      value={post.scheduled}
                      onChange={(e) => {
                        const newPosts = [...eventData.marketing.socialMedia];
                        newPosts[index].scheduled = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, socialMedia: newPosts }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newPosts = eventData.marketing.socialMedia.filter((_, i) => i !== index);
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, socialMedia: newPosts }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEventData(prev => ({
                    ...prev,
                    marketing: {
                      ...prev.marketing,
                      socialMedia: [...prev.marketing.socialMedia, { platform: "", content: "", scheduled: "" }]
                    }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Post
                </Button>
              </div>
            </div>
            <div>
              <Label>Influencers</Label>
              <div className="space-y-2">
                {eventData.marketing.influencers.map((influencer, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input
                      value={influencer.name}
                      onChange={(e) => {
                        const newInfluencers = [...eventData.marketing.influencers];
                        newInfluencers[index].name = e.target.value;
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, influencers: newInfluencers }
                        }));
                      }}
                      placeholder="Nome do influencer"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="number"
                      value={influencer.reach}
                      onChange={(e) => {
                        const newInfluencers = [...eventData.marketing.influencers];
                        newInfluencers[index].reach = parseInt(e.target.value) || 0;
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, influencers: newInfluencers }
                        }));
                      }}
                      placeholder="Alcance"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Input
                      type="number"
                      value={influencer.fee}
                      onChange={(e) => {
                        const newInfluencers = [...eventData.marketing.influencers];
                        newInfluencers[index].fee = parseInt(e.target.value) || 0;
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, influencers: newInfluencers }
                        }));
                      }}
                      placeholder="Taxa (€)"
                      className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newInfluencers = eventData.marketing.influencers.filter((_, i) => i !== index);
                        setEventData(prev => ({
                          ...prev,
                          marketing: { ...prev.marketing, influencers: newInfluencers }
                        }));
                      }}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => setEventData(prev => ({
                    ...prev,
                    marketing: {
                      ...prev.marketing,
                      influencers: [...prev.marketing.influencers, { name: "", reach: 0, fee: 0 }]
                    }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Influencer
                </Button>
              </div>
            </div>
          </div>
        );

      case 10: // Venues
        return (
          <div className="space-y-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-2">
                <h3 className="text-lg font-semibold">Highlights — Checklist para chamadas</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Use esta lista quando ligar às venues:</p>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="list-disc pl-5 text-sm space-y-1 text-slate-700 dark:text-slate-300">
                  <li>Modelo de remuneração: flat, % bilheteira, bar split, mínimo garantido</li>
                  <li>Capacidade confirmada da sala e configuração (plateia/mesas)</li>
                  <li>Horários: abertura/fecho e curfew/licenças</li>
                  <li>Janela de load-in/load-out e acessos (carrinha, elevador)</li>
                  <li>Infra técnica: PA/monição, backline, iluminação; disponibilidade de técnicos e custos</li>
                  <li>Bilheteira/door staff e custos</li>
                  <li>Rider técnico/avançado: exigências e contacto para envio</li>
                  <li>Entidade responsável, NIF, e condições de faturação</li>
                  <li>Método e prazo de pagamento</li>
                  <li>Nº de registo SPA/política de report (se aplicável)</li>
                  <li>Contacto operativo (telefone) e email para press-kit/assets</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200 dark:border-slate-700">
<CardHeader className="pb-2">
<h3 className="text-lg font-semibold">📎 Na prática</h3>
<p className="text-sm text-slate-600 dark:text-slate-400">Resumo rápido sobre CAEs e modelos de acordo com o tipo de venue</p>
</CardHeader>


<CardContent className="pt-0">
<ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
<li className="flex items-start gap-3">
<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white text-xs">🟢</span>
<div>
<div className="font-medium"> <a href="https://www.racius.com/exploracao-de-salas-de-espectaculos-e-actividades-conexas/em-atividade/#:~:text=A%C3%A7ores%20,3" target="_blank" rel="noopener noreferrer">CAEs 90040 - Exploração de salas de espetáculos e atividades conexas</a> e <a href="https://www.sapo.pt/cnae/93290-exploracao-de-espacos-turisticos" target="_blank" rel="noopener noreferrer">93290 - Exploração de espaços turísticos</a></div>
<div className="text-slate-600 dark:text-slate-400">são os mais “promoter-friendly” — ideais para pedir splits 70–30 (ou até 80–20 se a tua equipa tratar de tudo: booking, promoção, staff, etc.).</div>
</div>
</li>


<li className="flex items-start gap-3">
<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-black text-xs">🟡</span>
<div>
<div className="font-medium">CAEs de bares / restauração (ex. <span className="font-mono"> <a href="https://codigopostal.ciberforma.pt/cae/codigo/cae-56302-bares/" target="_blank" rel="noopener noreferrer">56302</a></span>)</div>
<div className="text-slate-600 dark:text-slate-400">normalmente preferem aluguer fixo da sala ou consumo mínimo — dificilmente aceitam splits.</div>
</div>
</li>


<li className="flex items-start gap-3">
<span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 text-black text-xs">🟡</span>
<div>
<div className="font-medium">CAEs turísticos (ex. <span className="font-mono">93293</span>)</div>
<div className="text-slate-600 dark:text-slate-400">podem aceitar splits, mas geralmente pedem contrapartidas em promoção ou animação (ex.: divulgação, acts adicionais, pacotes turísticos).</div>
</div>
</li>
</ul>


<div className="pt-4 text-xs text-slate-500 dark:text-slate-400">
<em>Nota:</em> estes são padrões práticos — sempre confirma durante a chamada (modelo de remuneração, responsabilidades de promoção e custos técnicos).
</div>
</CardContent>
</Card>

<div className="overflow-x-auto border-2 border-slate-200 dark:border-slate-700 p-4 rounded">
  <div className="mb-3">
    <h3 className="text-lg font-semibold">CAEs — Tabela rápida</h3>
    <p className="text-sm text-slate-600 dark:text-slate-400">
      Resumo por CAE: descrição, típicos de uso e probabilidade de acordo 70–30
    </p>
  </div>

  <table className="w-full text-sm table-auto">
    <thead className="text-left text-xs text-slate-600 dark:text-slate-400">
      <tr>
        <th className="pr-4">CAE</th>
        <th className="pr-4">Descrição</th>
        <th className="pr-4">Típico para</th>
        <th>Possibilidade de 70–30</th>
      </tr>
    </thead>
    <tbody className="text-slate-700 dark:text-slate-300">
      <tr>
        <td className="py-2 font-medium">93210</td>
        <td>Atividades de parques de diversão e temáticos</td>
        <td>Espaços culturais híbridos, coletivos, open-air</td>
        <td>🟡 Depende (menos comum, mas possível em espaços independentes)</td>
      </tr>
      <tr>
        <td className="py-2 font-medium">93290</td>
        <td>Outras atividades de diversão e recreativas, n.e.</td>
        <td>Salas polivalentes, espaços culturais independentes, venues alternativas</td>
        <td>🟢 Muito comum — usado por muitas venues urbanas / underground</td>
      </tr>
      <tr>
        <td className="py-2 font-medium">90040</td>
        <td>Exploração de salas de espetáculos e atividades conexas</td>
        <td>Teatros, auditórios, venues licenciadas para espetáculos ao vivo</td>
        <td>🟢 Sim — aqui é muito normal negociar percentagens (ex. 70–30, 80–20)</td>
      </tr>
      <tr>
        <td className="py-2 font-medium">90010</td>
        <td>Atividades de produção de espetáculos</td>
        <td>Promotores ou venues que produzem os seus próprios eventos</td>
        <td>🟡 Depende da estrutura — mais usado por produtores</td>
      </tr>
      <tr>
        <td className="py-2 font-medium">56302</td>
        <td>Bares com espaço de dança</td>
        <td>Bares e clubes que fazem eventos ocasionais</td>
        <td>🟡 Negociação mais difícil — muitas vezes querem aluguer fixo</td>
      </tr>
      <tr>
        <td className="py-2 font-medium">93293</td>
        <td>Organização de atividades de animação turística</td>
        <td>Espaços/eventos temporários, festivais de verão, sunset spots</td>
        <td>🟡 Possível, mas depende muito da natureza do evento</td>
      </tr>
    </tbody>
  </table>

  <div className="pt-4 flex items-center justify-between">
  <div className="text-xs text-slate-500">Clique em &quot;Detalhes&quot; para ações rápidas (copiar / exportar).</div>
    <div className="flex gap-2">
      <button className="px-3 py-1 border-2 border-slate-200 dark:border-slate-700 rounded text-sm">
        Detalhes
      </button>
    </div>
  </div>
</div>


            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Base de Dados de Venues</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Pesquisar venue..."
                  value={venuesQuery}
                  onChange={(e) => setVenuesQuery(e.target.value)}
                  className="w-64 border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setAddVenueOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Venue
                </Button>
              </div>
            </div>

            {/* Dialogo para adicionar novo venue (inline) */}
            <Dialog open={addVenueOpen} onOpenChange={setAddVenueOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Novo Venue</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="vname">Nome</Label>
                    <Input id="vname" value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Ex.: Casa da Música" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vcity">Cidade</Label>
                    <Input id="vcity" value={vCity} onChange={(e) => setVCity(e.target.value)} placeholder="Ex.: Porto" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vcountry">País</Label>
                    <Input id="vcountry" value={vCountry} onChange={(e) => setVCountry(e.target.value)} placeholder="Ex.: Portugal" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vcapacity">Capacidade (aprox.)</Label>
                    <Input id="vcapacity" type="number" value={vCapacity} onChange={(e) => setVCapacity(e.target.value)} placeholder="Ex.: 280" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vurl">Website</Label>
                    <Input id="vurl" value={vUrl} onChange={(e) => setVUrl(e.target.value)} placeholder="https://…" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vcontact">Contacto</Label>
                    <Input id="vcontact" value={vContactName} onChange={(e) => setVContactName(e.target.value)} placeholder="Nome do responsável" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vemail">Email</Label>
                    <Input id="vemail" type="email" value={vContactEmail} onChange={(e) => setVContactEmail(e.target.value)} placeholder="nome@dominio.com" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div>
                    <Label htmlFor="vphone">Telefone</Label>
                    <Input id="vphone" value={vContactPhone} onChange={(e) => setVContactPhone(e.target.value)} placeholder="+351 …" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                  <div className="md:col-span-2">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Label htmlFor="vphoto">Foto (URL)</Label>
                        <Input id="vphoto" value={vPhotoUrl} onChange={(e) => setVPhotoUrl(e.target.value)} placeholder="https://…" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                      </div>
                      <Button variant="outline" className="border-2 border-slate-200 dark:border-slate-700" onClick={lookupVenuePhoto}>Procurar foto</Button>
                    </div>
                    {vPhotoUrl && (
                      <div className="mt-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={vPhotoUrl} alt="Foto do venue" className="w-full max-h-56 object-cover rounded border" />
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="vnotes">Notas</Label>
                    <Input id="vnotes" value={vNotes} onChange={(e) => setVNotes(e.target.value)} placeholder="Observações, logística, contactos internos…" className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" className="border-2 border-slate-200 dark:border-slate-700" onClick={() => setAddVenueOpen(false)}>Cancelar</Button>
                  <Button disabled={!canSaveVenue || savingVenue} onClick={handleSaveVenue} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    {savingVenue ? "A guardar…" : "Guardar venue"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...localVenues, ...VENUES_DATABASE]
                .filter(venue => {
                  const s = venuesQuery.toLowerCase().trim();
                  if (!s) return true;
                  return (
                    (venue.name || "").toLowerCase().includes(s) ||
                    (venue.city || "").toLowerCase().includes(s) ||
                    (venue.address || "").toLowerCase().includes(s) ||
                    (venue.equipment || "").toLowerCase().includes(s)
                  );
                })
                .map((venue) => (
                <Card key={venue.id} className="border-2 border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{venue.name}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{venue.city}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {venue.capacity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600 dark:text-slate-400">{venue.address}</span>
                      </div>
                      {venue.phone && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">📞</span>
                          <span className="text-slate-600 dark:text-slate-400">{venue.phone}</span>
                        </div>
                      )}
                      {venue.email && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">✉️</span>
                          <span className="text-slate-600 dark:text-slate-400 text-xs">{venue.email}</span>
                        </div>
                      )}
                      {venue.website && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">🌐</span>
                          <a
                            href={venue.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-600 dark:text-indigo-400 text-xs hover:underline"
                          >
                            Website
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Equipamento:</span>
                          <p className="text-slate-600 dark:text-slate-400">{venue.equipment}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700 dark:text-slate-300">Acordo:</span>
                          <p className="text-slate-600 dark:text-slate-400">{venue.agreement}</p>
                        </div>
                        {venue.notes && (
                          <div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">Notas:</span>
                            <p className="text-slate-600 dark:text-slate-400">{venue.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-2 border-slate-200 dark:border-slate-700"
                        onClick={() => {
                          setEventData(prev => ({
                            ...prev,
                            overview: { ...prev.overview, venue: venue.name }
                          }));
                        }}
                      >
                        Selecionar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-slate-200 dark:border-slate-700"
                        onClick={() => {
                          setRequirementsVenue(venue);
                          resetRequirementsForm();
                          setRequirementsDialogOpen(true);
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Requisitos
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-slate-200 dark:border-slate-700"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-2 border-slate-200 dark:border-slate-700"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Dialog open={requirementsDialogOpen} onOpenChange={(open) => setRequirementsDialogOpen(open)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Requisitos da Venue {requirementsVenue ? `— ${requirementsVenue.name}` : ""}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[70vh] overflow-auto pr-1">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Modelo de remuneração</Label>
                      <Input
                        value={requirementsForm.remunerationModel}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, remunerationModel: e.target.value }))}
                        placeholder="flat / % bilheteira / bar split / mínimo garantido"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Capacidade confirmada</Label>
                      <Input
                        value={requirementsForm.capacityConfirmed}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, capacityConfirmed: e.target.value }))}
                        placeholder="Ex: 280 em plateia"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Horários (abertura/fecho)</Label>
                      <Input
                        value={requirementsForm.openHours}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, openHours: e.target.value }))}
                        placeholder="Ex: 22h–06h"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Curfew/regras</Label>
                      <Input
                        value={requirementsForm.curfewRules}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, curfewRules: e.target.value }))}
                        placeholder="Ex: curfew às 02h"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Load-in</Label>
                      <Input
                        value={requirementsForm.loadInWindow}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, loadInWindow: e.target.value }))}
                        placeholder="Ex: 16h–18h; acesso carrinha"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Load-out</Label>
                      <Input
                        value={requirementsForm.loadOutWindow}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, loadOutWindow: e.target.value }))}
                        placeholder="Ex: até 07h"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Backline/PA/Iluminação</Label>
                      <Input
                        value={requirementsForm.backlineProvided}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, backlineProvided: e.target.value }))}
                        placeholder="Ex: PA + monição; guitarra/bateria disponíveis"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Custos técnicos</Label>
                      <Input
                        value={requirementsForm.techCosts}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, techCosts: e.target.value }))}
                        placeholder="Ex: som 50€, luz 50€, bilheteira 30€"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Nº SPA</Label>
                      <Input
                        value={requirementsForm.spaRegistryNumber}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, spaRegistryNumber: e.target.value }))}
                        placeholder="Ex: SPA 123456"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Entidade responsável</Label>
                      <Input
                        value={requirementsForm.responsibleEntity}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, responsibleEntity: e.target.value }))}
                        placeholder="Ex: Cultural Trend Lisbon"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>NIF</Label>
                      <Input
                        value={requirementsForm.invoiceNif}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, invoiceNif: e.target.value }))}
                        placeholder="Ex: 507 589 939"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Director musical</Label>
                      <Input
                        value={requirementsForm.musicalDirector}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, musicalDirector: e.target.value }))}
                        placeholder="Nome do responsável artístico"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Email (press-kit/assets)</Label>
                      <Input
                        value={requirementsForm.emailForAssets}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, emailForAssets: e.target.value }))}
                        placeholder="email@venue.com"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Telefone operações</Label>
                      <Input
                        value={requirementsForm.phoneForOps}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, phoneForOps: e.target.value }))}
                        placeholder="+351 ..."
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Método de pagamento</Label>
                      <Input
                        value={requirementsForm.paymentMethod}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                        placeholder="transferência / numerário / outro"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <Label>Prazo de pagamento</Label>
                      <Input
                        value={requirementsForm.paymentDeadline}
                        onChange={(e) => setRequirementsForm(prev => ({ ...prev, paymentDeadline: e.target.value }))}
                        placeholder="antes/depois do show; 30 dias"
                        className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <Checkbox id="soundtech" checked={requirementsForm.hasSoundTech} onCheckedChange={(v) => setRequirementsForm(prev => ({ ...prev, hasSoundTech: Boolean(v) }))} />
                      <Label htmlFor="soundtech">Tem técnico de som</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="lighttech" checked={requirementsForm.hasLightTech} onCheckedChange={(v) => setRequirementsForm(prev => ({ ...prev, hasLightTech: Boolean(v) }))} />
                      <Label htmlFor="lighttech">Tem técnico de luz</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="boxoffice" checked={requirementsForm.hasBoxOffice} onCheckedChange={(v) => setRequirementsForm(prev => ({ ...prev, hasBoxOffice: Boolean(v) }))} />
                      <Label htmlFor="boxoffice">Tem bilheteira/door</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox id="riderreq" checked={requirementsForm.riderRequired} onCheckedChange={(v) => setRequirementsForm(prev => ({ ...prev, riderRequired: Boolean(v) }))} />
                      <Label htmlFor="riderreq">Exige rider/avançado</Label>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 justify-between pt-2">
                  <Button
                    variant="outline"
                    className="border-2 border-slate-200 dark:border-slate-700"
                    onClick={() => {
                      const text = `Checklist — ${requirementsVenue ? requirementsVenue.name : "Venue"}\n\nItens em falta a confirmar:\n• ${generateMissingQuestions()}`;
                      navigator.clipboard.writeText(text);
                    }}
                  >
                    <FileText className="w-4 h-4 mr-2" /> Copiar perguntas em falta
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-2 border-slate-200 dark:border-slate-700" onClick={() => setRequirementsDialogOpen(false)}>Fechar</Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setRequirementsDialogOpen(false)}>Guardar (local)</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        );

      case 11: // Templates
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Email Confirmação Artistas */}
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Confirmação para Artistas</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {generateArtistConfirmationEmail()}
                    </pre>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(generateArtistConfirmationEmail())}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([generateArtistConfirmationEmail()], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${eventData.overview.eventName}_confirmacao_artistas.txt`;
                        a.click();
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Email Proposta Venue */}
              <Card className="border-2 border-slate-200 dark:border-slate-700">
                <CardHeader className="bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold">Proposta para Venue</h3>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                    <pre className="text-sm whitespace-pre-wrap font-mono">
                      {generateVenueProposalEmail()}
                    </pre>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(generateVenueProposalEmail())}
                      className="border-2 border-slate-200 dark:border-slate-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button
                      onClick={() => {
                        const blob = new Blob([generateVenueProposalEmail()], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${eventData.overview.eventName}_proposta_venue.txt`;
                        a.click();
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timetable */}
            <Card className="border-2 border-slate-200 dark:border-slate-700">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Timetable Oficial</h3>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700">
                  <div className="space-y-2">
                    <h4 className="font-bold text-lg">{eventData.overview.eventName}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(eventData.overview.date).toLocaleDateString('pt-PT')} • {eventData.overview.venue}
                    </p>
                    {eventData.lineup.soundcheck && (
                      <p className="text-sm"><strong>Soundcheck:</strong> {eventData.lineup.soundcheck}</p>
                    )}
                    <div className="mt-4">
                      <h5 className="font-semibold mb-2">Line-up:</h5>
                      {eventData.lineup.artists.map((artist, index) => (
                        <p key={index} className="text-sm">
                          <strong>{artist.time}</strong> - {artist.name}
                        </p>
                      ))}
                    </div>
                    {eventData.lineup.curfew && (
                      <p className="text-sm mt-2"><strong>Curfew:</strong> {eventData.lineup.curfew}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={exportFullItineraryPDF}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar PDF Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 12: // Itinerário do Dia do Show
        const exportDayItineraryPDF = () => {
          const doc = new jsPDF();
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const margin = 10;
          let yPosition = margin;
          
          // Book formatting variables (accessible to all nested functions)
          const bookMargin = 15; // Larger margins for book-like appearance
          const bookPadding = 5; // Padding between paragraphs
          const maxWidth = pageWidth - 2 * bookMargin;
          const lineHeight = 5.5;
          const paragraphSpacing = 8;

          // Title
          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          doc.text("ITINERARIO DO DIA DO SHOW", pageWidth / 2, yPosition, { align: "center" });
          yPosition += 10;

          // Event Info
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(eventData.overview.eventName || "Evento", pageWidth / 2, yPosition, { align: "center" });
          yPosition += 7;
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          if (eventData.dayItinerary.date) {
            doc.text(`Data: ${new Date(eventData.dayItinerary.date).toLocaleDateString("pt-PT")}`, margin, yPosition);
            yPosition += 7;
          }
          if (eventData.dayItinerary.location) {
            doc.text(`Localização: ${eventData.dayItinerary.location}`, margin, yPosition);
            yPosition += 7;
          }
          if (eventData.overview.venue) {
            doc.text(`Venue: ${eventData.overview.venue}`, margin, yPosition);
            yPosition += 7;
          }
          yPosition += 5;

          // Helper function to add sections
          const addSection = (title: string, content: string) => {
            if (!content) return;
            if (yPosition > 280) {
              doc.addPage();
              yPosition = margin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin, yPosition);
            yPosition += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
            doc.text(lines, margin, yPosition);
            yPosition += lines.length * 5 + 3;
          };

          // Helper function to add array sections
          const addArraySection = (title: string, items: any[], formatter: (item: any) => string) => {
            if (!items || items.length === 0) return;
            if (yPosition > 280) {
              doc.addPage();
              yPosition = margin; // Reset to top margin on new page
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text(title, margin, yPosition);
            yPosition += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            items.forEach((item) => {
              const text = formatter(item);
              const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
              doc.text(lines, margin + 5, yPosition);
              yPosition += lines.length * 5 + 2;
            });
            yPosition += 3;
          };

          // Travel Details
          addArraySection("Detalhes de Viagem", eventData.dayItinerary.travelDetails, (item) => {
            return `${item.time || "Sem horario"} - ${item.type}: ${item.details}${item.notes ? ` (${item.notes})` : ""}`;
          });

          // Clothing Stores
          addArraySection("Lojas de Roupa", eventData.dayItinerary.clothingStores, (item) => {
            return `${item.time || "Sem horario"} - ${item.name}${item.address ? ` (${item.address})` : ""}${item.notes ? ` - ${item.notes}` : ""}`;
          });

          // Studio Visits
          addArraySection("Visitas a Estudios / Colaboracoes", eventData.dayItinerary.studioVisits, (item) => {
            return `${item.time || "Sem horario"} - ${item.studio}${item.artist ? ` com ${item.artist}` : ""}${item.purpose ? ` (${item.purpose})` : ""}${item.notes ? ` - ${item.notes}` : ""}`;
          });

          // Voice Practice
          addArraySection("Praticas de Voz / Aquecimento", eventData.dayItinerary.voicePractice, (item) => {
            return `${item.time || "Sem horario"} - ${item.type || "Pratica"}${item.duration ? ` (${item.duration})` : ""}${item.notes ? `: ${item.notes}` : ""}`;
          });

          // Hydration Reminders
          if (eventData.dayItinerary.hydrationReminders && eventData.dayItinerary.hydrationReminders.length > 0) {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = margin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 100, 200); // Blue color
            doc.text("LEMBRETES DE HIDRATACAO", margin, yPosition);
            yPosition += 6;
            doc.setTextColor(0, 0, 0); // Reset to black
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            eventData.dayItinerary.hydrationReminders.forEach((item) => {
              const status = item.completed ? "[FEITO]" : "[PENDENTE]";
              doc.text(`${item.time || "Sem horario"} - ${status}`, margin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;
          }

          // Audience Reminders
          if (eventData.dayItinerary.audienceReminders && eventData.dayItinerary.audienceReminders.length > 0) {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = margin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(139, 92, 246); // Purple color
            doc.text("O QUE A AUDIENCIA REALMENTE QUER VER", margin, yPosition);
            yPosition += 6;
            doc.setTextColor(0, 0, 0); // Reset to black
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            eventData.dayItinerary.audienceReminders.forEach((item) => {
              const status = item.completed ? "[FEITO]" : "[PENDENTE]";
              const text = `${item.time || "Sem horario"} - ${status} - ${item.tip || ""}`;
              const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
              doc.text(lines, margin + 5, yPosition);
              yPosition += lines.length * 5 + 2;
            });
            yPosition += 3;
          }

          // Other sections (string-based)
          addSection("Alojamento", eventData.dayItinerary.accommodation || "");
          
          // Meals section
          if (eventData.dayItinerary.meals && eventData.dayItinerary.meals.length > 0) {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = margin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Refeicoes", margin, yPosition);
            yPosition += 6;
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            let totalMeals = 0;
            eventData.dayItinerary.meals.forEach((item) => {
              const dateStr = item.date ? new Date(item.date).toLocaleDateString("pt-PT") : "";
              const timeStr = item.time || "";
              const locationStr = item.location || "";
              const whatStr = item.whatToEat || "";
              const priceStr = item.price ? `EUR ${item.price.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "";
              const text = `${dateStr} ${timeStr} - ${locationStr}${whatStr ? `: ${whatStr}` : ""}${priceStr ? ` (${priceStr})` : ""}`;
              const lines = doc.splitTextToSize(text, pageWidth - 2 * margin);
              doc.text(lines, margin + 5, yPosition);
              yPosition += lines.length * 5 + 2;
              totalMeals += item.price || 0;
            });
            if (totalMeals > 0) {
              doc.setFont("helvetica", "bold");
              doc.text(`Total: EUR ${totalMeals.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 5, yPosition);
              yPosition += 8;
            }
            yPosition += 3;
          }
          addSection("Horário de Soundcheck", eventData.dayItinerary.soundcheckTime || eventData.lineup.soundcheck || "");
          addSection("Horário de Abertura do Venue", eventData.dayItinerary.venueOpenTime || "");
          addSection("Outras Notas", eventData.dayItinerary.otherNotes || "");

          // Add "The Soloist" book content as additional pages
          const addBookContent = () => {
            // Add new page for book content
            doc.addPage();
            yPosition = margin + 15; // Extra top margin for book pages

            // Book Title Page
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("O SOLISTA", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text("Um Guia para a Prática de Performance", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 15;

            // Quote
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            const quote = "A impressão física do pianista é enormemente importante, mais importante do que alguma vez supus como principiante. . . . Não percebi quão importante [isso] era até a primeira vez que me vi na televisão. Antes disso, se alguém comentava a minha aparência, pensava: 'Aqui estou eu a tentar performar música grandiosa, e eles estão a falar de banalidades.' Fiz todo o tipo de maus movimentos; atirei os braços descontroladamente. Quando finalmente vi como parecia, no entanto, percebi que estava a distrair a audiência da música.";
            const quoteLines = doc.splitTextToSize(quote, maxWidth);
            doc.text(quoteLines, bookMargin, yPosition);
            yPosition += quoteLines.length * lineHeight + 5;
            doc.setFont("helvetica", "normal");
            doc.text("— Alfred Brendel (n. 1931), pianista", bookMargin, yPosition);
            yPosition += paragraphSpacing;

            // Introduction paragraph
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            const introText = "Aprender a música e expressá-la da tua própria forma única é, claro, a tua tarefa principal como performer. É bom perceber, no entanto, que os aspetos visuais da tua apresentação ajudam ou impedem a capacidade da audiência de ser atraída para a tua música. Estás confiante e entusiástico sobre performar? Tiveste tempo para pareceres o teu melhor? Organizaste a gestão do teu palco para que decorra suavemente e não ocupe tempo desnecessário? Fizeste tudo o possível para eliminar movimentos corporais ou faciais repetitivos e possivelmente irritantes? Os performers que prestam atenção a estas coisas parecem confortáveis no palco e, por sua vez, colocam a audiência à vontade e pronta para ouvir. Deves a ti mesmo, após todas as tuas longas horas de prática, apresentar a tua música no melhor contexto.";
            const introLines = doc.splitTextToSize(introText, maxWidth);
            doc.text(introLines, bookMargin, yPosition);
            yPosition += introLines.length * lineHeight + paragraphSpacing;

            // Chapter 2: HOW TO DRESS FOR THE CONCERT STAGE
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("COMO VESTIR PARA O PALCO DE CONCERTO", bookMargin, yPosition);
            yPosition += 10;

            // Dressing for Style section
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Vestir para Estilo", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const styleText1 = "Todos temos os nossos estilos individuais de vestuário no dia a dia, e alguns de nós somos mais conscientes da moda do que outros. É importante perceber, no entanto, que uma performance musical não é um desfile de moda, e que deve ser tomado cuidado para escolher vestuário apropriado para um concerto.";
            const styleLines1 = doc.splitTextToSize(styleText1, maxWidth);
            doc.text(styleLines1, bookMargin, yPosition);
            yPosition += styleLines1.length * lineHeight + bookPadding;

            const styleText2 = "O nível de formalidade do teu vestuário, por exemplo, pode variar dependendo da hora do dia da performance (geralmente, menos formal para as tardes do que para as noites), da época do ano (menos formal no verão do que durante outras estações), ou do local (menos formal numa sala do que numa sala de concertos), mas cada performance, seja perante uma audiência ou juízes, merece uma aparência vestida. Se usas roupas do dia a dia, arriscas que a tua performance pareça um ensaio ou uma sessão de prática. Vestir-se também indica que te levas a sério, e sugere que a audiência também o deve fazer.";
            const styleLines2 = doc.splitTextToSize(styleText2, maxWidth);
            doc.text(styleLines2, bookMargin, yPosition);
            yPosition += styleLines2.length * lineHeight + bookPadding;

            const styleText3 = "Além do nível de formalidade no vestuário, os músicos precisam de ser sensíveis a quão chamativo ou revelador o seu vestuário pode ser. Aqueles que se vestem com roupas provocantes no seu dia a dia devem reconhecer que tais estilos podem ser inadequados ao performar simplesmente porque competem com a música pela atenção da audiência. Alguns jovens performers profissionais são encorajados pelos seus agentes a adotar modos de vestuário incomuns ou provocantes para que as audiências se lembrem deles (o jovem com os grandes músculos ou as meias vermelhas; a jovem com o decote impressionante ou a saia curta); e alguns alcançam notoriedade ao descartar completamente as convenções tradicionais do vestuário de concerto. Roupas reveladoras e não convencionais, no entanto, distraem uma audiência.";
            const styleLines3 = doc.splitTextToSize(styleText3, maxWidth);
            doc.text(styleLines3, bookMargin, yPosition);
            yPosition += styleLines3.length * lineHeight + bookPadding;

            const styleText4 = "A cor é também algo em que pensar. Cada um de nós parece melhor em certas cores. Algumas cores, como pastéis, podem fazer-te parecer desbotado sob as luzes do palco, enquanto cores brilhantes podem parecer demasiado chamativas. O preto é sempre uma escolha segura porque parece digno e forte, e não compete pela atenção. Só porque um conjunto é preto, no entanto, não significa que seja suficientemente vestido ou formal para a ocasião. Roupas casuais que são pretas ainda parecem roupas casuais.";
            const styleLines4 = doc.splitTextToSize(styleText4, maxWidth);
            doc.text(styleLines4, bookMargin, yPosition);
            yPosition += styleLines4.length * lineHeight + bookPadding;

            const styleText5 = "Como músico, podes não te sentir qualificado para escolher o melhor vestuário para ti; a tua sensibilidade estética pode ser principalmente auditiva e não visual. Podes não ter certeza sobre escolher estilos, tecidos e cores. Não hesites em pedir ajuda ao decidir sobre o teu guarda-roupa de concerto. Se não conheces alguém que tenha um talento especial para vestir bem, considera contratar um consultor profissional. Trabalha para obter a confiança que resulta de saberes que pareces bem no palco.";
            const styleLines5 = doc.splitTextToSize(styleText5, maxWidth);
            doc.text(styleLines5, bookMargin, yPosition);
            yPosition += styleLines5.length * lineHeight + paragraphSpacing;

            // Dressing for Utility and Comfort
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Vestir para Utilidade e Conforto", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.text('"Um par de sapatos bons e confortáveis."', bookMargin, yPosition);
            yPosition += 5;
            doc.setFont("helvetica", "normal");
            doc.text("— Birgit Nilsson (n. 1918), soprano wagneriana", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const utilityText1 = "Os performers precisam de considerar mais do que apenas estilo. É essencial que não haja nada irritante ou desconfortável nas tuas roupas. Primeiro, não devem ser demasiado apertadas. Além de restringir o movimento natural do teu corpo, roupas apertadas podem parecer ainda mais apertadas sob a iluminação do palco, o que criará sombras em torno de quaisquer contornos corporais subjacentes ou roupa interior. Também precisas de ser capaz de te moveres livremente sem te preocupares que a tua roupa se desloque para posições indesejáveis. Fendas altas em saias, por exemplo, são problemáticas desta forma, assim como alças de ombro (embora braços descobertos não sejam recomendados) e cintos mal ajustados.";
            const utilityLines1 = doc.splitTextToSize(utilityText1, maxWidth);
            doc.text(utilityLines1, bookMargin, yPosition);
            yPosition += utilityLines1.length * lineHeight + bookPadding;

            const utilityText2 = "As roupas de concerto devem caber confortavelmente. Deve haver espaço suficiente nos braços e nas costas do teu conjunto para te moveres tanto quanto precisas. Encontra um alfaiate em que possas confiar para manter as tuas roupas de palco a caber e a parecer perfeitas. Se ganhas ou perdes alguns quilos, compra roupas novas.";
            const utilityLines2 = doc.splitTextToSize(utilityText2, maxWidth);
            doc.text(utilityLines2, bookMargin, yPosition);
            yPosition += utilityLines2.length * lineHeight + bookPadding;

            const utilityText3 = "Nada no teu vestuário deve precisar de atenção recorrente, porque ajustar a tua roupa no palco parece desajeitado e autoconsciente. Enquanto performas, queres ser capaz de esquecer completamente o teu conjunto e trazer toda a tua concentração para a música. Portanto, nunca performas com roupas que não tenhas usado enquanto tocavas o teu instrumento, cantavas ou dirigias. Há uma boa razão para um ensaio de 'vestuário' mesmo que estejas a performar sozinho.";
            const utilityLines3 = doc.splitTextToSize(utilityText3, maxWidth);
            doc.text(utilityLines3, bookMargin, yPosition);
            yPosition += utilityLines3.length * lineHeight + paragraphSpacing;

            // Hem Lengths, Footwear, and Hosiery
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Comprimentos de Bainha, Calçado e Meias", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const hemText1 = "Ao tocar num palco que está montado mais alto do que a audiência, não deixes de considerar como pareces dos joelhos para baixo. Uma saia que pode parecer modesta quando as pessoas estão de pé ao teu nível, pode parecer escandalosa das primeiras filas da orquestra. Saias curtas são geralmente demasiado reveladoras de um palco elevado. Meio da barriga da perna é aproximadamente o mais curto que uma saia pode ser sem se tornar uma distração.";
            const hemLines1 = doc.splitTextToSize(hemText1, maxWidth);
            doc.text(hemLines1, bookMargin, yPosition);
            yPosition += hemLines1.length * lineHeight + bookPadding;

            const hemText2 = "Escolhe os teus sapatos cuidadosamente. É melhor ter sapatos que uses apenas para performar. Usa um estilo e cor que coordenem apropriadamente com o resto do teu conjunto. Não deixes os sapatos ficarem gastos ou sujos, e mantém-nos impecavelmente polidos. Garante que podes caminhar nos teus sapatos com uma passada natural e sem fazer demasiado barulho no palco. É útil não apenas incluir sapatos no teu ensaio de vestuário, mas também caminhar e praticar neles até se tornarem realmente parte de ti.";
            const hemLines2 = doc.splitTextToSize(hemText2, maxWidth);
            doc.text(hemLines2, bookMargin, yPosition);
            yPosition += hemLines2.length * lineHeight + bookPadding;

            const hemText3 = "Se performas de pé, sapatos com suporte adequado impedir-te-ão de estar com dor ou fatigado no final do concerto. Assim como queres ser capaz de esquecer as tuas roupas, queres ser capaz de esquecer o teu calçado. Saltos muito altos ou sapatos empilhados podem exigir que o usuário adote uma postura não natural ao caminhar, estar de pé e até sentar. O aspeto atlético da musicalidade requer que o corpo esteja no melhor alinhamento para o seu desempenho mais eficiente.";
            const hemLines3 = doc.splitTextToSize(hemText3, maxWidth);
            doc.text(hemLines3, bookMargin, yPosition);
            yPosition += hemLines3.length * lineHeight + paragraphSpacing;

            // Necklines, Hair, Makeup, and Accessories
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Decotes, Cabelo, Maquilhagem e Acessórios", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const neckText1 = "Assim como alguns membros da audiência estão sentados abaixo de ti no nível da orquestra, outros estarão sentados acima de ti quando tocas numa sala com varanda. Decotes baixos que parecem modestos em circunstâncias normais podem tornar-se reveladores quando vistos dos níveis superiores da sala. Considera também a aparência de um decote baixo ao fazer reverência, o momento em que toda a audiência efetivamente te vê de cima. Escolhe cuidadosamente o teu decote para que não constitua uma distração.";
            const neckLines1 = doc.splitTextToSize(neckText1, maxWidth);
            doc.text(neckLines1, bookMargin, yPosition);
            yPosition += neckLines1.length * lineHeight + bookPadding;

            const neckText2 = "Performas com o teu cabelo sob controlo, para que a audiência possa ter uma vista clara e completa do teu rosto. O teu cabelo deve ser suficientemente curto ou firmemente preso para que não obstrua esta vista. Assim como com o vestuário, tocar constantemente no teu cabelo e movê-lo pode parecer desleixado, inseguro e autoconsciente. Cabelo a cair no teu rosto durante a cadência pode interferir com a tua concentração e fazer a audiência questionar como vais lidar com isso.";
            const neckLines2 = doc.splitTextToSize(neckText2, maxWidth);
            doc.text(neckLines2, bookMargin, yPosition);
            yPosition += neckLines2.length * lineHeight + bookPadding;

            const neckText3 = "Usa maquilhagem discreta. É um erro pensar que a maquilhagem deve ser exagerada no palco. Assim como na vida diária, demasiada maquilhagem atrai atenção. Usa apenas verniz de unhas transparente e mantém as unhas muito curtas para tocar um instrumento.";
            const neckLines3 = doc.splitTextToSize(neckText3, maxWidth);
            doc.text(neckLines3, bookMargin, yPosition);
            yPosition += neckLines3.length * lineHeight + bookPadding;

            const neckText4 = "Quando se trata de acessórios, quanto menos melhor. É melhor não usar nada nos pulsos ou dedos se estiveres a tocar um instrumento. Isso inclui um relógio, já que a única razão para o fazer é verificar a hora, e não quererias que a audiência te visse a fazer isso. Tem cuidado ao usar ornamentos de cabelo que possam soltar-se. Um broche ou colar pode estar bem se o teu instrumento nunca o tocar.";
            const neckLines4 = doc.splitTextToSize(neckText4, maxWidth);
            doc.text(neckLines4, bookMargin, yPosition);
            yPosition += neckLines4.length * lineHeight + paragraphSpacing;

            // RAISE EXPECTATIONS WITH YOUR ENTRANCE
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("ELEVAR EXPECTATIVAS COM A TUA ENTRADA", bookMargin, yPosition);
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const entranceText = "No momento em que entras no palco, fazes uma forte impressão na audiência baseada na tua atitude e grau de confiança, refletidos na tua caminhada, expressão facial, reverência e capacidade de criar um silêncio significativo antes da primeira nota ser tocada. Com estes vários elementos da tua entrada, forneces efetivamente à audiência uma expectativa da performance que está para vir, positiva ou negativa. É do interesse de cada performer maximizar a alta expectativa da audiência antes da primeira nota ser tocada.";
            const entranceLines = doc.splitTextToSize(entranceText, maxWidth);
            doc.text(entranceLines, bookMargin, yPosition);
            yPosition += entranceLines.length * lineHeight + paragraphSpacing;

            // Walking Onstage
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Caminhar no Palco", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const walkText1 = "Planeia a rota que vais tomar dos bastidores até ao lugar onde vais parar e fazer reverência. Entra sempre do lado direito do palco (lado esquerdo da audiência), a menos que haja algo na configuração do edifício que te impeça de o fazer. Pratica caminhar para o palco de cada novo local para teres uma sensação da distância e saberes sobre quaisquer desvios ou obstáculos com antecedência.";
            const walkLines1 = doc.splitTextToSize(walkText1, maxWidth);
            doc.text(walkLines1, bookMargin, yPosition);
            yPosition += walkLines1.length * lineHeight + bookPadding;

            const walkText2 = "Para um ator, estabelecer uma caminhada distintiva é um elemento importante no desenvolvimento de qualquer personagem; os atores aprendem que a forma como as pessoas caminham diz muito sobre elas. Quando caminhas para um palco de concerto, a própria caminhada dá à audiência uma mensagem forte sobre quem és, como te sentes por estar lá, a tua atitude em relação à audiência, o teu nível de entusiasmo pela performance, e até se és ou não um bom performer.";
            const walkLines2 = doc.splitTextToSize(walkText2, maxWidth);
            doc.text(walkLines2, bookMargin, yPosition);
            yPosition += walkLines2.length * lineHeight + bookPadding;

            const walkText3 = "Queres que a tua caminhada projete antecipação entusiástica para o evento que está prestes a acontecer, como se estivesses a ir para algum lugar onde queres ir. O ritmo deve, portanto, ser propositado sem ser apressado. Caminhar demasiado depressa pode parecer nervoso e autoconsciente. Caminhar demasiado devagar pode transmitir relutância, falta de entusiasmo, ou simplesmente uma má atitude.";
            const walkLines3 = doc.splitTextToSize(walkText3, maxWidth);
            doc.text(walkLines3, bookMargin, yPosition);
            yPosition += walkLines3.length * lineHeight + paragraphSpacing;

            // Bowing
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Reverência", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const bowText1 = "Fazer reverência à audiência é como apertar a mão de um indivíduo—uma saudação e introdução formal adequada. Estabelecer contacto visual tanto antes como depois da reverência transmite sinceridade. Vem para o palco e move-te propositadamente para o local onde vais performar. Depois:";
            const bowLines1 = doc.splitTextToSize(bowText1, maxWidth);
            doc.text(bowLines1, bookMargin, yPosition);
            yPosition += bowLines1.length * lineHeight + 5;
            doc.text("1. Para e olha para a audiência, estabelecendo contacto visual.", bookMargin + 5, yPosition);
            yPosition += 6;
            doc.text("2. Faz reverência.", bookMargin + 5, yPosition);
            yPosition += 6;
            doc.text("3. Levanta-te e fica nesse local até reestabeleceres contacto visual com a audiência.", bookMargin + 5, yPosition);
            yPosition += 8;

            const bowText2 = "Faz reverência com os pés juntos, porque manter os pés afastados pode parecer desorganizado e desajeitado. Mantém os ombros para baixo e as mãos relaxadas aos teus lados, a menos que estejas a segurar o teu instrumento. Baixa os olhos para o chão enquanto te inclinas da cintura—suavemente, sem movimentos bruscos—até cerca de um ângulo de 45 graus. Baixar os olhos indica humildade e respeito.";
            const bowLines2 = doc.splitTextToSize(bowText2, maxWidth);
            doc.text(bowLines2, bookMargin, yPosition);
            yPosition += bowLines2.length * lineHeight + paragraphSpacing;

            // DURING THE PERFORMANCE
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("DURANTE A PERFORMANCE", bookMargin, yPosition);
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const duringText = "Enquanto tocas, mantém a audiência focada na música o máximo possível, não lhes dando outras coisas para notarem e pensarem. A linguagem corporal deve demonstrar concentração intensa, mas calma. Precisas de estar ciente de problemas potenciais nesta área para que possas tocar com compostura e, após tocar, aceitar graciosamente os aplausos da audiência.";
            const duringLines = doc.splitTextToSize(duringText, maxWidth);
            doc.text(duringLines, bookMargin, yPosition);
            yPosition += duringLines.length * lineHeight + paragraphSpacing;

            // Annoying Physical Habits
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Hábitos Físicos Irritantes", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const habitsText = "À medida que praticam, a maioria dos músicos adquire hábitos físicos que podem ser distrativos na performance. Esforço e concentração intensos, por exemplo, podem criar uma expressão facial desagradável, até grotesca. Um forte sentido de ritmo ou de melodia pode produzir movimento corporal que é exagerado e intrusivo.";
            const habitsLines = doc.splitTextToSize(habitsText, maxWidth);
            doc.text(habitsLines, bookMargin, yPosition);
            yPosition += habitsLines.length * lineHeight + 5;

            doc.setFont("helvetica", "bold");
            doc.text("Hábitos Pessoais a Evitar:", bookMargin, yPosition);
            yPosition += 6;
            doc.setFont("helvetica", "normal");
            const personalHabits = [
              "Enxugar a testa",
              "Torcer ou flexionar as mãos ou dedos",
              "Limpar a boca",
              "Lamber os lábios",
              "Bater os dedos dos pés",
              "Ajustar o cabelo",
              "Tocar nos óculos",
              "Respirar audivelmente",
              "Cantarolar enquanto tocas"
            ];
            personalHabits.forEach(habit => {
              doc.text(`• ${habit}`, bookMargin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;

            doc.setFont("helvetica", "bold");
            doc.text("Manusear o Teu Instrumento:", bookMargin, yPosition);
            yPosition += 6;
            doc.setFont("helvetica", "normal");
            const instrumentHabits = [
              "Sacudir a humidade",
              "Aplicar breu no arco",
              "Puxar cabelos soltos do arco",
              "Limpar o teclado",
              "Chocalhar as válvulas",
              "Soprar audivelmente num bocal ou trompa",
              "Lamber a palheta"
            ];
            instrumentHabits.forEach(habit => {
              doc.text(`• ${habit}`, bookMargin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += 3;

            doc.setFont("helvetica", "bold");
            doc.text("Gestos Dramáticos a Evitar:", bookMargin, yPosition);
            yPosition += 6;
            doc.setFont("helvetica", "normal");
            const dramaticGestures = [
              "Assumir uma expressão facial tensa ou exagerada",
              "Atirar a cabeça",
              "Balançar os braços",
              "Balançar o corpo",
              "Balançar a cabeça",
              "'Dançar' com a música"
            ];
            dramaticGestures.forEach(gesture => {
              doc.text(`• ${gesture}`, bookMargin + 5, yPosition);
              yPosition += 5;
            });
            yPosition += paragraphSpacing;

            // Reacting to Mistakes
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("Reagir a Erros", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const mistakesText = "Assume sempre que cada performance terá erros. Muito mais importante do que eliminar todos os erros (o que é virtualmente impossível) é como reages a eles. Não permitas que a audiência se preocupe com os teus erros. É imperativo que elimines até a mais pequena reação, seja no teu rosto ou corpo. Reagir visivelmente a erros faz com que pareçam muito piores do que são. Podemos seguir o exemplo dos patinadores no gelo: performers que aprenderam a levantar-se de uma queda no gelo com um grande sorriso, quase como se tivessem realmente pretendido cair.";
            const mistakesLines = doc.splitTextToSize(mistakesText, maxWidth);
            doc.text(mistakesLines, bookMargin, yPosition);
            yPosition += mistakesLines.length * lineHeight + paragraphSpacing;

            // ACKNOWLEDGING APPLAUSE
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("RECONHECER OS APLAUSOS", bookMargin, yPosition);
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const applauseText = "Ensaia cuidadosamente a tua linguagem corporal e a tua concentração para controlar o timing dos aplausos da audiência no final da tua peça. Mesmo a audiência mais pouco sofisticada pode ser dissuadida de bater palmas entre movimentos ou demasiado cedo no silêncio significativo no final de uma peça pela forma como o performer mantém a concentração e segura o corpo. Convida os aplausos a começarem exatamente quando queres, libertando a tua concentração, tanto mental como fisicamente.";
            const applauseLines = doc.splitTextToSize(applauseText, maxWidth);
            doc.text(applauseLines, bookMargin, yPosition);
            yPosition += applauseLines.length * lineHeight + bookPadding;

            const applauseText2 = "À medida que os aplausos começam, levanta-te para fazer reverência como fizeste no início, com a mesma expressão facial relaxada e contacto visual com a tua audiência. Se te sentes esgotado e exausto, não o mostres. Faz reverência com gratidão sincera para com os ouvintes. Aceita o elogio dos aplausos abertamente e graciosamente, evitando qualquer sugestão de uma modéstia falsa, 'ai, não foi nada'.";
            const applauseLines2 = doc.splitTextToSize(applauseText2, maxWidth);
            doc.text(applauseLines2, bookMargin, yPosition);
            yPosition += applauseLines2.length * lineHeight + paragraphSpacing;

            // ENCORES
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("BIS", bookMargin, yPosition);
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const encoreText = "Embora os bis possam parecer uma resposta espontânea ao entusiasmo da audiência, o performer tem, claro, planeado cuidadosamente um ou mais deles com antecedência. Precisas de saber exatamente o que vais tocar como se fosse parte do teu programa impresso. Assim como nunca queres fazer demasiadas reverências, nunca queres tocar demasiados bis. Deixa a audiência sempre a querer um pouco mais, em vez de correres o risco de tocar demasiado tempo.";
            const encoreLines = doc.splitTextToSize(encoreText, maxWidth);
            doc.text(encoreLines, bookMargin, yPosition);
            yPosition += encoreLines.length * lineHeight + paragraphSpacing;

            // Final Summary
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("ATENDE A TODOS OS ASPETOS DA TUA PRESENÇA DE PALCO", bookMargin, yPosition);
            yPosition += 10;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const finalText = "O teu trabalho não termina quando a música está pronta para ser executada. Fizeste tudo o possível para maximizar a tua aparência e comportamento quando performas? Tempo e esforço devem ser gastos em muitos aspetos da presença de palco para que a tua música possa ser ouvida no melhor contexto possível. Escolhe as roupas mais apropriadas para o evento e para a tarefa em mãos. Estuda e pratica a tua entrada e reverência para que a audiência antecipe uma boa performance antes mesmo de começares. Avalia o teu comportamento no palco para qualquer coisa que a tua audiência possa achar distrativa. Pratica não reagir a erros. Ou performa de memória, ou garante que o teu uso da partitura é o mais discreto possível. Aceita os aplausos graciosamente, e deixa sempre a audiência a querer mais.";
            const finalLines = doc.splitTextToSize(finalText, maxWidth);
            doc.text(finalLines, bookMargin, yPosition);
            yPosition += finalLines.length * lineHeight + paragraphSpacing;

            const finalText2 = "O teu trabalho árduo merece ser exibido na melhor luz. Avalia constantemente a tua presença de palco como está hoje, e trabalha para melhorá-la no futuro. A tua audiência notará e apreciará a tua atenção a este aspeto importante, mas negligenciado da performance.";
            const finalLines2 = doc.splitTextToSize(finalText2, maxWidth);
            doc.text(finalLines2, bookMargin, yPosition);
          };

          // Add audience types content
          const addAudienceTypesContent = () => {
            // Add new page for audience types
            doc.addPage();
            yPosition = bookMargin + 15;

            // Title
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("TIPOS DE MEMBROS DA AUDIÊNCIA", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text("Um Guia para Artistas", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 15;

            // Introduction
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const introText = "A audiência é um microcosmo da humanidade. Como performer, aprender a ler esta multidão em constante mudança—energizando os entusiastas, conquistando os céticos, e ignorando os disruptivos—é tanto parte da arte quanto tocar os acordes certos. Aqui estão os tipos de membros da audiência que podes encontrar nos teus concertos.";
            const introLines = doc.splitTextToSize(introText, maxWidth);
            doc.text(introLines, bookMargin, yPosition);
            yPosition += introLines.length * lineHeight + paragraphSpacing;

            // I. The Engaged & Enthusiastic
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("I. OS ENGAJADOS E ENTUSIASTAS", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("O Superfã", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const superfanText = "Conhece cada B-side, letra e pedal de guitarra que usas. São os primeiros a chegar, os últimos a sair, e muitas vezes viajam para vários concertos. Vê-los a cantar cada palavra de olhos fechados, completamente perdidos na música.";
            const superfanLines = doc.splitTextToSize(superfanText, maxWidth);
            doc.text(superfanLines, bookMargin, yPosition);
            yPosition += superfanLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O Dançarino Entusiasta", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const dancerText = "Alegria pura e inconsciente em movimento. Não importa se têm ritmo; são uma manifestação física da energia da música. Inclui o 'Hippy Twirler', o 'Punk Pogoer', e o 'Headbanger'.";
            const dancerLines = doc.splitTextToSize(dancerText, maxWidth);
            doc.text(dancerLines, bookMargin, yPosition);
            yPosition += dancerLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O 'Light Me the Fuck Up!' Guy", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const hypeText = "O hype man que não sabias que precisavas. Fornecem um fluxo constante de encorajamento energético, por vezes embriagado, entre as músicas.";
            const hypeLines = doc.splitTextToSize(hypeText, maxWidth);
            doc.text(hypeLines, bookMargin, yPosition);
            yPosition += hypeLines.length * lineHeight + paragraphSpacing;

            // II. The Analytical & Observant
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("II. OS ANALÍTICOS E OBSERVADORES", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("O Músico dos Músicos", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const musicianText = "A 'estátua' que está na verdade a desconstruir o teu setlist, analisando a tua técnica, e catalogando mentalmente o teu equipamento. A sua cara de póquer é uma máscara para foco profundo.";
            const musicianLines = doc.splitTextToSize(musicianText, maxWidth);
            doc.text(musicianLines, bookMargin, yPosition);
            yPosition += musicianLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O 'Human Shazam'", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const shazamText = "Podes vê-los a sussurrar ao amigo após os primeiros acordes de uma música profunda: 'Isto é do EP de 2017, o B-side de Neon Reverie...'";
            const shazamLines = doc.splitTextToSize(shazamText, maxWidth);
            doc.text(shazamLines, bookMargin, yPosition);
            yPosition += shazamLines.length * lineHeight + paragraphSpacing;

            // III. The Social & Interactive
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("III. OS SOCIAIS E INTERATIVOS", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("O Bêbado Excessivamente Amigável", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const drunkText = "A fonte de high-fives não solicitados, abraços desajeitados, e histórias longas e confusas entre sets. Geralmente inofensivo e bem-intencionado.";
            const drunkLines = doc.splitTextToSize(drunkText, maxWidth);
            doc.text(drunkLines, bookMargin, yPosition);
            yPosition += drunkLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("A Máquina de Pedidos", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const requestText = "Acredita que a banda é uma jukebox humana. Gritará 'Free Bird!' sem ironia ou pedirá uma música pop num concerto de metal. Muitas vezes aborda o membro da banda mais acessível (geralmente o baixista).";
            const requestLines = doc.splitTextToSize(requestText, maxWidth);
            doc.text(requestLines, bookMargin, yPosition);
            yPosition += requestLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O 'Eu Poderia Gerir-te Melhor' Guy", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const managerText = "Encontra-te após o set para explicar como estás a fazer tudo errado e oferece conselhos de carreira não solicitados, muitas vezes terríveis. Nunca geriu ninguém.";
            const managerLines = doc.splitTextToSize(managerText, maxWidth);
            doc.text(managerLines, bookMargin, yPosition);
            yPosition += managerLines.length * lineHeight + paragraphSpacing;

            // IV. The Unruly & Unaware
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("IV. OS DESORDENADOS E DESATENTOS", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("O Tanque Humano", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const tankText = "Bêbado e alheio, atravessam a multidão, derramando bebidas e pisando pés sem um pingo de consciência.";
            const tankLines = doc.splitTextToSize(tankText, maxWidth);
            doc.text(tankLines, bookMargin, yPosition);
            yPosition += tankLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O 'Main Character' Mosh-Pitter", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const moshText = "Inicia um mosh pit num concerto acústico de folk. Não tem consideração pela adequação do género ou segurança dos que estão à volta.";
            const moshLines = doc.splitTextToSize(moshText, maxWidth);
            doc.text(moshLines, bookMargin, yPosition);
            yPosition += moshLines.length * lineHeight + paragraphSpacing;

            // V. The Modern & Tech-Obsessed
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("V. OS MODERNOS E OBSESSIVOS COM TECNOLOGIA", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("O Livestreamer", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const streamText = "Segura o telefone durante todo o concerto, vendo a performance através de um ecrã de 6 polegadas enquanto bloqueia a vista de todos atrás deles.";
            const streamLines = doc.splitTextToSize(streamText, maxWidth);
            doc.text(streamLines, bookMargin, yPosition);
            yPosition += streamLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O Selfie Taker", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const selfieText = "Mais preocupado em obter a foto perfeita de si mesmo com o palco ao fundo do que realmente assistir à performance.";
            const selfieLines = doc.splitTextToSize(selfieText, maxWidth);
            doc.text(selfieLines, bookMargin, yPosition);
            yPosition += selfieLines.length * lineHeight + paragraphSpacing;

            // VI. The Niche & Situational
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("VI. OS DE NICHO E SITUACIONAIS", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("O 'Estou Aqui Só pela Música do TikTok'", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const tiktokText = "Aparece tarde, fala durante o set, e só presta atenção quando a banda toca a única música que conhecem do TikTok ou da rádio.";
            const tiktokLines = doc.splitTextToSize(tiktokText, maxWidth);
            doc.text(tiktokLines, bookMargin, yPosition);
            yPosition += tiktokLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O 'Plus-One Relutante'", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const plusoneText = "O namorado, namorada ou amigo que foi arrastado. O corpo está presente, mas o espírito está noutro lugar. Muitas vezes encontrado encostado à parede de trás, a verificar o telefone.";
            const plusoneLines = doc.splitTextToSize(plusoneText, maxWidth);
            doc.text(plusoneLines, bookMargin, yPosition);
            yPosition += plusoneLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("O 'Buscador Espiritual'", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const spiritualText = "Comum em festivais de jam band ou música psicadélica. Estão lá para uma experiência transcendente, quase religiosa, muitas vezes auxiliada por química. Encontrá-los-ás de olhos fechados, braços estendidos, a comunicar com o cosmos.";
            const spiritualLines = doc.splitTextToSize(spiritualText, maxWidth);
            doc.text(spiritualLines, bookMargin, yPosition);
            yPosition += spiritualLines.length * lineHeight + paragraphSpacing;
          };

          // Add festival behaviors content
          const addFestivalBehaviorsContent = () => {
            // Add new page for festival behaviors
            doc.addPage();
            yPosition = bookMargin + 15;

            // Title
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("COMPORTAMENTOS COMUNS EM FESTIVAIS", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text("Dinâmicas de Multidão e Comportamento", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 15;

            // Introduction
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const introText = "As multidões de festivais de música exibem uma ampla gama de comportamentos influenciados por fatores como tamanho do local, lineup, uso de substâncias e dinâmicas sociais. Estes podem variar de vibes positivas e comunitárias a ações disruptivas ou inseguras.";
            const introLines = doc.splitTextToSize(introText, maxWidth);
            doc.text(introLines, bookMargin, yPosition);
            yPosition += introLines.length * lineHeight + paragraphSpacing;

            // Positive Behaviors
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("COMPORTAMENTOS POSITIVOS E COMUNITÁRIOS", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Dança Expressiva e Participação", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const danceText = "Os participantes envolvem-se em dança interpretativa, saltos ou formam conga lines, especialmente em sets de alta energia. Por exemplo, em multidões expressivas como concertos de rock ou festivais EDM, as pessoas amplificam a excitação partilhada sem violência.";
            const danceLines = doc.splitTextToSize(danceText, maxWidth);
            doc.text(danceLines, bookMargin, yPosition);
            yPosition += danceLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Ajudar os Outros", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const helpText = "Apanhar crowd-surfers caídos, assistir aqueles em dificuldade, ou partilhar espaço com atenção. Posts enfatizam lembrar as pessoas de ajudar a segurança e garantir mosh ou surf seguros.";
            const helpLines = doc.splitTextToSize(helpText, maxWidth);
            doc.text(helpLines, bookMargin, yPosition);
            yPosition += helpLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Visualização Respeitosa", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const respectText = "Sentar ou ficar de pé sem bloquear vistas, como visto em alguns festivais internacionais onde multidões se agacham junto às barricadas para deixar outros ver. Isto alinha-se com a teoria de normas emergentes, onde membros influentes estabelecem padrões cooperativos.";
            const respectLines = doc.splitTextToSize(respectText, maxWidth);
            doc.text(respectLines, bookMargin, yPosition);
            yPosition += respectLines.length * lineHeight + paragraphSpacing;

            // Disruptive Behaviors
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("COMPORTAMENTOS DISRUPTIVOS OU IRRITANTES", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Empurrar e Atropelar", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const pushText = "Comum em áreas densas; 'trens' de grupos atravessam multidões sem desculpas, especialmente participantes mais jovens dividindo sets. Multidões inexperientes (ex: participantes infrequentes) tratam-no como um evento desportivo, ignorando etiqueta de espaço.";
            const pushLines = doc.splitTextToSize(pushText, maxWidth);
            doc.text(pushLines, bookMargin, yPosition);
            yPosition += pushLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Falar e Distrações", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const talkText = "Conversar alto sobre a música, bater palmas fora do ritmo, ou usar flashes de telefone. A Geração Z ('zoomers') é notada por se afastar dos palcos para gritar ou derramar bebidas.";
            const talkLines = doc.splitTextToSize(talkText, maxWidth);
            doc.text(talkLines, bookMargin, yPosition);
            yPosition += talkLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Bloquear Vistas", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const blockText = "Segurar cartazes alto, sentar em pits enquanto estão no telefone (ex: Instagram ou Snapchat), ou ficar de pé egoisticamente em áreas sentadas.";
            const blockLines = doc.splitTextToSize(blockText, maxWidth);
            doc.text(blockLines, bookMargin, yPosition);
            yPosition += blockLines.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Ações Inapropriadas", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const inappropriateText = "Agarramentos, lutas ou indecência pública (ex: casais comportando-se intimamente em multidões). Alguns festivais veem bêbados barulhentos ou anéis de roubo.";
            const inappropriateLines = doc.splitTextToSize(inappropriateText, maxWidth);
            doc.text(inappropriateLines, bookMargin, yPosition);
            yPosition += inappropriateLines.length * lineHeight + paragraphSpacing;

            // Final note
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            const noteText = "Compreender estes comportamentos ajuda-te a preparar-te melhor para diferentes tipos de audiências e a adaptar a tua performance de acordo. Lembra-te: cada membro da audiência é único, mas reconhecer padrões pode melhorar a tua capacidade de conectar e envolver.";
            const noteLines = doc.splitTextToSize(noteText, maxWidth);
            doc.text(noteLines, bookMargin, yPosition);
          };

          // Add Stage Presence from Head to Toe book content
          const addStagePresenceBookContent = () => {
            // Add new page for the book
            doc.addPage();
            yPosition = bookMargin + 15;

            // Title Page
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text("PRESENÇA DE PALCO", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 8;
            doc.setFontSize(18);
            doc.text("DA CABEÇA AOS PÉS", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 10;
            doc.setFontSize(14);
            doc.setFont("helvetica", "normal");
            doc.text("Um Manual para Músicos", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 12;
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text("Karen A. Hagberg, Ph.D.", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 20;

            // Introduction
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Introdução", bookMargin, yPosition);
            yPosition += 8;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const introText1 = "Este livro foca-se na performance de música clássica, mas os princípios básicos são os mesmos para todos os tipos de música. Os músicos precisam de tornar as suas audiências recetivas e dar-lhes uma impressão duradoura e positiva. Assim como o treino clássico estabelece uma base para a performance de outros tipos de música, o básico da presença de palco aqui delineado pode ser adaptado a todos os tipos de performances, por todos os tipos de músicos.";
            const introLines1 = doc.splitTextToSize(introText1, maxWidth);
            doc.text(introLines1, bookMargin, yPosition);
            yPosition += introLines1.length * lineHeight + paragraphSpacing;

            const introText2 = "A presença de palco é um aspeto da educação musical que se estende a muitas outras áreas da vida. Uma boa presença de palco é inestimável para entrevistas de emprego, apresentações verbais e situações sociais de todos os tipos. Para o músico, uma boa presença de palco ajuda a construir e manter audiências. Isto é tão importante, pois sem a audiência, não pode haver performances.";
            const introLines2 = doc.splitTextToSize(introText2, maxWidth);
            doc.text(introLines2, bookMargin, yPosition);
            yPosition += introLines2.length * lineHeight + paragraphSpacing;

            // Chapter 1: Stage Presence
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 1: Presença de Palco", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Presença de Palco Definida", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const defText = "A presença de palco é o aspeto visual de uma performance musical ao vivo: tudo desde a caminhada, reverência, expressão facial e vestuário de um performer, até à representação de um ensemble como uma entidade única e unificada; desde a condição de cadeiras, estantes de música e piano, até à mecânica de uma gestão de palco suave. Os performers podem melhorar grandemente a sua imagem e a experiência total da sua audiência, prestando atenção aos detalhes da presença de palco.";
            const defLines = doc.splitTextToSize(defText, maxWidth);
            doc.text(defLines, bookMargin, yPosition);
            yPosition += defLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("A Base Filosófica: Respeito", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const respectText = "Uma boa presença de palco, como a própria música, é uma arte, uma expressão clara do respeito do músico disciplinado pela música, pela audiência, por outros músicos e por si mesmo. Respeitar a música significa fazer tudo o que puderes para proporcionar à audiência acesso direto à música, com o mínimo de distrações possível. Respeitar a audiência significa apreciar as pessoas que tiveram o tempo e o trabalho de vir e ouvir. Respeitar outros músicos significa nunca fazer nada para chamar atenção para ti ou desviar atenção do grupo. Respeitar-te a ti mesmo significa levar o teu trabalho a sério e querer que a tua audiência também te leve a sério.";
            const respectLines = doc.splitTextToSize(respectText, maxWidth);
            doc.text(respectLines, bookMargin, yPosition);
            yPosition += respectLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Presença de Palco e Pavor do Palco", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const frightText = "Uma boa presença de palco pode realmente ajudar a aliviar grande parte da ansiedade associada ao pavor do palco. Em qualquer situação, o stress é reduzido quando sabes o que é esperado de ti e como fazer as coisas corretamente. Conhecer as regras básicas e depois segui-las dá ao músico um sentido de autoconfiança e autocontrolo. Assim como a maioria das pessoas precisa de praticar apertar as mãos de estranhos enquanto olham nos seus olhos e sorriem ao apresentarem-se, os músicos também devem praticar a caminhada no palco, a reverência e depois preparar-se adequadamente para tocar.";
            const frightLines = doc.splitTextToSize(frightText, maxWidth);
            doc.text(frightLines, bookMargin, yPosition);
            yPosition += frightLines.length * lineHeight + paragraphSpacing;

            // Chapter 2: The Soloist - Key Points
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 2: O Solista - Diretrizes Essenciais", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Como Vestir para o Palco de Concerto", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const dressText = "Cada performance merece uma aparência vestida. O nível de formalidade pode variar dependendo da hora do dia, estação ou local, mas cada performance perante uma audiência ou juízes merece vestuário apropriado. Roupas reveladoras e não convencionais distraem uma audiência. O preto é sempre uma escolha segura porque parece digno e forte, e não compete pela atenção. As roupas de concerto devem caber confortavelmente com espaço suficiente para te moveres livremente. Nada no teu vestuário deve precisar de atenção recorrente, porque ajustar a tua roupa no palco parece desajeitado e autoconsciente.";
            const dressLines = doc.splitTextToSize(dressText, maxWidth);
            doc.text(dressLines, bookMargin, yPosition);
            yPosition += dressLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Elevar Expectativas com a Tua Entrada", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const entranceText = "No momento em que entras no palco, fazes uma forte impressão na audiência baseada na tua atitude e grau de confiança, refletidos na tua caminhada, expressão facial, reverência e capacidade de criar um silêncio significativo antes da primeira nota ser tocada. Planeia a rota que vais tomar desde os bastidores. Entra sempre do lado direito do palco (lado esquerdo da audiência). A tua caminhada deve projetar antecipação entusiástica para o evento que está prestes a acontecer. O ritmo deve ser propositado sem ser apressado.";
            const entranceLines = doc.splitTextToSize(entranceText, maxWidth);
            doc.text(entranceLines, bookMargin, yPosition);
            yPosition += entranceLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Reverência", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const bowText = "Fazer reverência à audiência é como apertar a mão de um indivíduo—uma saudação e introdução formal adequada. Estabelecer contacto visual tanto antes como depois da reverência transmite sinceridade. Faz reverência com os pés juntos, porque manter os pés afastados pode parecer desorganizado e desajeitado. Baixa os olhos para o chão enquanto te inclinas da cintura—suavemente, sem movimentos bruscos—até cerca de um ângulo de 45 graus. Nada sobre a reverência deve parecer apressado.";
            const bowLines = doc.splitTextToSize(bowText, maxWidth);
            doc.text(bowLines, bookMargin, yPosition);
            yPosition += bowLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Durante a Performance", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const duringText = "Enquanto tocas, mantém a audiência focada na música o máximo possível, não lhes dando outras coisas para notarem e pensarem. A linguagem corporal deve demonstrar concentração intensa, mas calma. Elimina hábitos físicos repetitivos e desnecessários. Os instrumentistas não devem olhar diretamente para a audiência enquanto performam. Assume sempre que cada performance terá erros. Muito mais importante do que eliminar todos os erros é como reages a eles. Não permitas que a audiência se preocupe com os teus erros. É imperativo que elimines até a mais pequena reação, seja no teu rosto ou corpo.";
            const duringLines = doc.splitTextToSize(duringText, maxWidth);
            doc.text(duringLines, bookMargin, yPosition);
            yPosition += duringLines.length * lineHeight + paragraphSpacing;

            // Chapter 3-12: Summary of Other Chapters
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Resumo de Capítulos Adicionais", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 3: O Passador de Páginas", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const pageTurnerText = "A pessoa que passa páginas no palco é um elemento importante na apresentação geral. As diretrizes gerais de vestuário que se aplicam aos performers também se aplicam aos passadores de páginas. Ao entrar no palco, caminha atrás dos performers e vai diretamente para o piano ou estante de música, sem olhar para a audiência. Permanece sentado entre as passagens de páginas e levanta-te para passar páginas. Permanece absolutamente imóvel, concentrando-te na música. Mantém os olhos sempre na partitura, nunca olhando para os músicos, a audiência ou à volta da sala.";
            const pageTurnerLines = doc.splitTextToSize(pageTurnerText, maxWidth);
            doc.text(pageTurnerLines, bookMargin, yPosition);
            yPosition += pageTurnerLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 4: O Pequeno Ensemble (Sem Maestro)", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const ensembleText = "Ao colaborar com outros músicos sem um maestro, a tua aparência no palco pode ser grandemente melhorada ao planear conscientemente os vários aspetos da tua apresentação. Queres parecer como se tivesses pensado em todos os aspetos da tua aparência, incluindo vestuário, equipamento, a tua forma de te moveres juntos no palco e fora dele, e a tua forma de reconhecer os aplausos. Sem ensaios frequentes das tuas entradas, reverências, saídas e a forma como desejas começar peças e reconhecer aplausos juntos, a tua forma espontânea de fazer estas coisas parecerá desorganizada.";
            const ensembleLines = doc.splitTextToSize(ensembleText, maxWidth);
            doc.text(ensembleLines, bookMargin, yPosition);
            yPosition += ensembleLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 5: O Grande Ensemble Vocal", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const chorusText = "Um coro pode parecer unificado mais facilmente do que um ensemble instrumental porque os seus membros estão todos a fazer a mesma coisa enquanto estão de pé juntos da mesma forma. O objetivo de qualquer coro é criar, de muitos membros, uma única entidade, ou 'voz'. Isto é conseguido ao promulgar e manter políticas concebidas para maximizar o aspeto de profissionalismo e compostura no ensemble, e ao eliminar qualquer coisa por parte dos indivíduos que possa chamar atenção para si mesmos ou desviar do grupo. Todos os cantores devem estar de pé num ângulo uniforme. Os cantores nunca devem fazer nada com os olhos além de olhar para o maestro, nem nada com as mãos além de segurar a partitura.";
            const chorusLines = doc.splitTextToSize(chorusText, maxWidth);
            doc.text(chorusLines, bookMargin, yPosition);
            yPosition += chorusLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 6: A Orquestra", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const orchestraText = "É emocionante ver uma orquestra disciplinada na qual todos os músicos estão obviamente a concentrar-se juntos como um só sob a batuta do maestro. Para alcançar este alto nível de disciplina e uma aparência uniforme, cada orquestra precisa de um código de vestuário claro e diretrizes abrangentes no palco, bem como procedimentos padrão e pessoal responsável pela sua aplicação. Os membros da orquestra podem praticar assumir várias posturas juntos para que, a qualquer momento, possam estar no mesmo estágio de prontidão juntos como grupo. Existem quatro posturas padrão: posição de pé, posição de descanso, posição de semi-descanso e posição de prontidão.";
            const orchestraLines = doc.splitTextToSize(orchestraText, maxWidth);
            doc.text(orchestraLines, bookMargin, yPosition);
            yPosition += orchestraLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 7: O Maestro como Líder", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const conductorText = "Os maestros fornecem muito do material lendário da história da música. Um bom maestro usará o seu carisma para focar a concentração dos músicos e da audiência em cada nota da obra que está a ser executada. Uma boa presença de palco, um elemento indispensável na apresentação geral do maestro, ajuda a conseguir isto. Pareces mais poderoso e eficaz quando os teus sinais para o ensemble são subtis. Uma boa postura é uma característica da maioria dos líderes bem-sucedidos. Ao dirigir, precisas de ser capaz de usar uma gama completa de movimento nos teus braços. O que quer que uses não deve impedir este movimento.";
            const conductorLines = doc.splitTextToSize(conductorText, maxWidth);
            doc.text(conductorLines, bookMargin, yPosition);
            yPosition += conductorLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 8: No Dia do Concerto", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const concertDayText = "Um aspeto importante e por vezes esquecido da presença de palco é o bem-estar geral do(s) performer(s). Precisas de te sentir bem para pareceres o teu melhor, e não podes estar a sentir-te apressado e frenético se vais cuidar de todos os detalhes importantes do teu concerto além de tocar bem. Determina o teu horário ideal no dia de um concerto. Faz as tuas necessidades conhecidas pelas pessoas à tua volta. Especifica os teus pedidos de refeições, incluindo menus preferidos e horários. Pede que nenhum bem-intencionado visite o teu camarim antes do concerto ou durante o intervalo.";
            const concertDayLines = doc.splitTextToSize(concertDayText, maxWidth);
            doc.text(concertDayLines, bookMargin, yPosition);
            yPosition += concertDayLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 9: O Palco e os Seus Mobiliários", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const stageText = "O palco no qual performas, bem como os móveis e o piano que usas são aspetos importantes da tua apresentação que não devem ser esquecidos. Considera o palco um lugar especial, o contexto visual para o teu concerto. Garante que o palco não está cheio de objetos não essenciais. As tuas cadeiras e estantes parecem melhores quando são uniformes em estilo e cor, limpas e em boas condições. Em geral, os performers devem estar centrados no palco. Antes do concerto, decide sobre as configurações tanto para a iluminação do palco como para a iluminação na sala.";
            const stageLines = doc.splitTextToSize(stageText, maxWidth);
            doc.text(stageLines, bookMargin, yPosition);
            yPosition += stageLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 10: Pessoal Não Performante", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const personnelText = "Cada local de performance tem uma equipa de uma ou mais pessoas cujo trabalho é fornecer assistência aos performers e garantir que os concertos decorrem sem problemas. Os membros da equipa podem fazer isto melhor quando os performers comunicam as suas necessidades de forma clara e organizada. Tu, o performer, és responsável por fazer todas as tuas solicitações conhecidas pela equipa com bastante antecedência. Posições típicas incluem: Gestor de Concerto, Gestor de Palco, Engenheiro de Iluminação, Engenheiro de Áudio/Visual e Acompanhantes. Dá-te ao trabalho de lembrar os nomes dos teus ajudantes e conhecer as suas várias responsabilidades.";
            const personnelLines = doc.splitTextToSize(personnelText, maxWidth);
            doc.text(personnelLines, bookMargin, yPosition);
            yPosition += personnelLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 11: Audições e Competições", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const auditionText = "Uma audição não é diferente de qualquer outra performance, exceto que geralmente há um objetivo específico. Uma única audição pode ter um efeito profundo na tua vida, e não há aspeto da presença de palco que não seja importante neste contexto. Escolhe o teu vestuário tão cuidadosamente como farias para um concerto. Nunca uses roupas casuais para qualquer audição. Elimina quaisquer e todos os maneirismos autoconscientes. Nunca reajas a erros, pois isso só chamará mais atenção para eles. Lembra-te que os melhores músicos fazem a performance parecer fácil. Pratica terminar o teu programa com um olhar de sucesso no rosto enquanto fazes a tua reverência final.";
            const auditionLines = doc.splitTextToSize(auditionText, maxWidth);
            doc.text(auditionLines, bookMargin, yPosition);
            yPosition += auditionLines.length * lineHeight + paragraphSpacing;

            doc.setFont("helvetica", "bold");
            doc.text("Capítulo 12: Como Ensinar Presença de Palco", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const teachingText = "A presença de palco pode ser ensinada e pode sempre ser melhorada. Não é algo que a maioria dos músicos faça naturalmente, mesmo após anos de performance em público. Os professores podem fornecer aos alunos experiência contínua e, com o tempo, dar-lhes a capacidade de parecer bem e sentir-se confiantes no palco. A presença de palco pode ser agrupada em quatro componentes: 1) postura, 2) a reverência, 3) vestuário, e 4) comportamento. Ao longo da educação de um aluno, desde a primeira lição até à última, a perícia nestas quatro áreas pode ser ensinada e melhorada. Todas as quatro áreas requerem muito tempo para dominar.";
            const teachingLines = doc.splitTextToSize(teachingText, maxWidth);
            doc.text(teachingLines, bookMargin, yPosition);
            yPosition += teachingLines.length * lineHeight + paragraphSpacing;

            // Final Note
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            const finalNote = "Este manual fornece orientação abrangente sobre presença de palco para músicos. Os princípios aqui delineados aplicam-se a todos os tipos de performances musicais e podem ser adaptados a vários contextos. Lembra-te: uma boa presença de palco complementa e melhora uma performance musical, enquanto uma má presença de palco não só diminui uma performance mas também pode arruiná-la completamente. O teu trabalho árduo merece ser exibido na melhor luz.";
            const finalNoteLines = doc.splitTextToSize(finalNote, maxWidth);
            doc.text(finalNoteLines, bookMargin, yPosition);
          };

          // Add Expressionism and Performance Techniques content
          const addExpressionismAndPerformanceContent = () => {
            // Add new page
            doc.addPage();
            yPosition = bookMargin + 15;

            // Title
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("GUIA DE MOVIMENTOS EXPRESSIONISTAS", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 10;
            doc.setFontSize(12);
            doc.setFont("helvetica", "italic");
            doc.text("Técnicas para Performance no Palco", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 15;

            // Core Principles
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Princípios Fundamentais", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("1. Priorizar Emoção sobre Realismo", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const principle1 = "Abandone movimentos naturalistas do dia a dia. Cada gesto e passo deve ser impulsionado pelos sentimentos internos, ansiedades ou turbulências da personagem.";
            const lines1 = doc.splitTextToSize(principle1, maxWidth);
            doc.text(lines1, bookMargin, yPosition);
            yPosition += lines1.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("2. Exagero e Distorção", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const principle2 = "Movimentos devem ser intensificados, expansivos e frequentemente distorcidos. Ações normais são esticadas, fragmentadas ou tornadas grotescas para refletir o mundo interno da personagem.";
            const lines2 = doc.splitTextToSize(principle2, maxWidth);
            doc.text(lines2, bookMargin, yPosition);
            yPosition += lines2.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("3. Angularidade e Linhas Quebradas", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const principle3 = "Incorpore ângulos agudos, linhas retas e formas geométricas na sua postura e movimentos, evitando as curvas naturais do corpo. Isso cria uma sensação de tensão.";
            const lines3 = doc.splitTextToSize(principle3, maxWidth);
            doc.text(lines3, bookMargin, yPosition);
            yPosition += lines3.length * lineHeight + paragraphSpacing;

            // Specific Techniques
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Técnicas Específicas de Movimento", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Ações Grotescas e Tipo Marionete", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const tech1 = "Adote movimentos mecânicos e amplos, quase como uma marionete. Isso pode ajudar a desumanizar a personagem e criar uma qualidade onírica ou pesadelo.";
            const techLines1 = doc.splitTextToSize(tech1, maxWidth);
            doc.text(techLines1, bookMargin, yPosition);
            yPosition += techLines1.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Gestos Extremos", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const tech2 = "Use dedos e mãos para agarrar, pegar ou arranhar o ar ou outras superfícies, representando desespero ou dor interna. Transicione rapidamente da calma para paixão física intensa.";
            const techLines2 = doc.splitTextToSize(tech2, maxWidth);
            doc.text(techLines2, bookMargin, yPosition);
            yPosition += techLines2.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Andares e Posturas Estilizados", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const tech3 = "Em vez de uma caminhada natural, use uma caminhada pesada e arrastada para mostrar fadiga ou desespero, ou uma caminhada leve e saltitante para mostrar excitação não natural.";
            const techLines3 = doc.splitTextToSize(tech3, maxWidth);
            doc.text(techLines3, bookMargin, yPosition);
            yPosition += techLines3.length * lineHeight + paragraphSpacing;

            // Stage Fright Techniques
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(18);
            doc.setFont("helvetica", "bold");
            doc.text("TÉCNICAS PARA SUPERAR STAGE FRIGHT", pageWidth / 2, yPosition, { align: "center" });
            yPosition += 15;

            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            doc.text("Reconhecer a Insegurança", bookMargin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const fright1 = "O stage fright geralmente vem de três medos: medo de ser visto, medo de cometer erros, ou medo de não ser suficiente. Reconhecer isso é o primeiro passo para superar.";
            const frightLines1 = doc.splitTextToSize(fright1, maxWidth);
            doc.text(frightLines1, bookMargin, yPosition);
            yPosition += frightLines1.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Criar Distância dos Protetores Internos", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const fright2 = "A voz crítica interna é uma parte jovem de ti tentando evitar dor ou embaraço. Cria distância entre ti e essas partes, tratando-as com compaixão em vez de frustração.";
            const frightLines2 = doc.splitTextToSize(fright2, maxWidth);
            doc.text(frightLines2, bookMargin, yPosition);
            yPosition += frightLines2.length * lineHeight + bookPadding;

            doc.setFont("helvetica", "bold");
            doc.text("Construir Capacidade para Vulnerabilidade", bookMargin, yPosition);
            yPosition += 7;
            doc.setFont("helvetica", "normal");
            const fright3 = "Aumenta a tua capacidade de experienciar sensações no corpo sem entrar em pânico. Permite que a audiência testemunhe as tuas emoções genuínas, não apenas uma máscara de emoção.";
            const frightLines3 = doc.splitTextToSize(fright3, maxWidth);
            doc.text(frightLines3, bookMargin, yPosition);
            yPosition += frightLines3.length * lineHeight + paragraphSpacing;

            // Where to Look
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Onde Olhar Durante a Performance", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const look1 = "Olhar para a audiência cria conexão, mas não foques numa pessoa por muito tempo (a menos que o convidem). Alterna entre olhar para a audiência e olhar por cima das suas cabeças para criar um efeito etéreo.";
            const lookLines1 = doc.splitTextToSize(look1, maxWidth);
            doc.text(lookLines1, bookMargin, yPosition);
            yPosition += lookLines1.length * lineHeight + bookPadding;

            const look2 = "NUNCA olhes para baixo! Olhar para cima e para fora é convidativo e grita confiança. Mesmo quando experiencias stage fright, olhar para cima é a melhor camuflagem.";
            const lookLines2 = doc.splitTextToSize(look2, maxWidth);
            doc.text(lookLines2, bookMargin, yPosition);
            yPosition += lookLines2.length * lineHeight + paragraphSpacing;

            // Nine Ways to Calm Nerves
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Nove Maneiras de Acalmar os Nervos", bookMargin, yPosition);
            yPosition += 10;

            const tips = [
              "1. Pausa e faz contacto visual: Pausa quando esperarias uma resposta e estabelece contacto visual. Isso é muito reconfortante.",
              "2. Sai de trás do PowerPoint: Tu és a apresentação, não os slides. Usa slides para apoiar, não para esconder.",
              "3. Envolve a audiência: Faz perguntas, pede um show de mãos, ou permite perguntas durante a apresentação.",
              "4. Torna-te conversacional: Soa o mais natural possível. Não leias ou memorizes palavra por palavra.",
              "5. Conta histórias: Histórias são uma ferramenta poderosa para conexão com a audiência.",
              "6. Sê pessoal: Histórias pessoais são ainda melhores. A audiência adora ouvir sobre a tua experiência.",
              "7. Sê vulnerável: Conexão humana genuína não é possível sem vulnerabilidade. Partilha falhas e aprendizagens.",
              "8. Usa humor: O humor é uma das formas mais rápidas de conectar com uma audiência.",
              "9. Vai fora do script: Ocasionalmente, ir fora do script faz-te parecer espontâneo e a audiência adora isso."
            ];

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            tips.forEach((tip) => {
              if (yPosition > pageHeight - 50) {
                doc.addPage();
                yPosition = bookMargin;
              }
              const tipLines = doc.splitTextToSize(tip, maxWidth);
              doc.text(tipLines, bookMargin, yPosition);
              yPosition += tipLines.length * lineHeight + bookPadding;
            });

            // Tips for Looking Less Awkward
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.text("Como Parecer Menos Awkward no Palco", bookMargin, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const awkward1 = "Foca na música, não na multidão. Trata performances ao vivo como ensaios de banda a 100% de esforço. Se a música está certa, ninguém se importa se pareces estranho.";
            const awkwardLines1 = doc.splitTextToSize(awkward1, maxWidth);
            doc.text(awkwardLines1, bookMargin, yPosition);
            yPosition += awkwardLines1.length * lineHeight + bookPadding;

            const awkward2 = "Grava-te a tocar e pratica movendo-te como se estivesses a performar. Quando estiveres no palco, os movimentos serão parte da tua rotina para tocar a música.";
            const awkwardLines2 = doc.splitTextToSize(awkward2, maxWidth);
            doc.text(awkwardLines2, bookMargin, yPosition);
            yPosition += awkwardLines2.length * lineHeight + bookPadding;

            const awkward3 = "Sê tu mesmo. Se és excêntrico, sê excêntrico. Se és calmo, sê calmo. Tocar como se estivesses sozinho a fazer jam com uma backing track ajuda a relaxar.";
            const awkwardLines3 = doc.splitTextToSize(awkward3, maxWidth);
            doc.text(awkwardLines3, bookMargin, yPosition);
            yPosition += awkwardLines3.length * lineHeight + bookPadding;

            const awkward4 = "Usa um 'power stance': Pés ligeiramente fora dos ombros. Isso parece confiante, poderoso e é fácil de fazer. Mantém o queixo para cima quando possível.";
            const awkwardLines4 = doc.splitTextToSize(awkward4, maxWidth);
            doc.text(awkwardLines4, bookMargin, yPosition);
            yPosition += awkwardLines4.length * lineHeight + paragraphSpacing;

            // Final Note
            if (yPosition > pageHeight - 50) {
              doc.addPage();
              yPosition = bookMargin;
            }
            doc.setFontSize(11);
            doc.setFont("helvetica", "italic");
            const finalNote = "Lembra-te: A tua 'estranheza' natural pode ser uma mais-valia no expressionismo. Abraça essa excentricidade, usa a técnica como estrutura e confia que estás a fazer o que é suposto fazer no contexto da performance. O constrangimento diminui com a repetição e a prática.";
            const finalNoteLines = doc.splitTextToSize(finalNote, maxWidth);
            doc.text(finalNoteLines, bookMargin, yPosition);
          };

          // Call the functions to add all content
          addBookContent();
          addAudienceTypesContent();
          addFestivalBehaviorsContent();
          addStagePresenceBookContent();
          addExpressionismAndPerformanceContent();

          // Save PDF
          doc.save(`itinerario_dia_show_${eventData.overview.eventName || "evento"}.pdf`);
        };

        return (
          <div className="space-y-6">
            <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20 mb-4">
              <h3 className="text-lg font-semibold mb-2">Informações do Evento</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-semibold">Evento:</span> {eventData.overview.eventName || "N/A"}</div>
                <div><span className="font-semibold">Venue:</span> {eventData.overview.venue || "N/A"}</div>
                <div><span className="font-semibold">Data:</span> {eventData.overview.date ? new Date(eventData.overview.date).toLocaleDateString("pt-PT") : "N/A"}</div>
                <div><span className="font-semibold">Organizador:</span> {eventData.overview.organizerName || "N/A"}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itineraryDate">Data do Itinerário</Label>
                <Input
                  id="itineraryDate"
                  type="date"
                  value={eventData.dayItinerary.date}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    dayItinerary: { ...prev.dayItinerary, date: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="itineraryLocation">Localização</Label>
                <Input
                  id="itineraryLocation"
                  value={eventData.dayItinerary.location}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    dayItinerary: { ...prev.dayItinerary, location: e.target.value }
                  }))}
                  placeholder="Ex: Porto, Sexta-feira"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Detalhes de Viagem - CRUD */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Detalhes de Viagem</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem = {
                      id: `travel-${Date.now()}-${Math.random()}`,
                      type: "Transporte",
                      time: "",
                      details: "",
                      notes: "",
                    };
                    setEventData(prev => ({
                      ...prev,
                      dayItinerary: {
                        ...prev.dayItinerary,
                        travelDetails: [...prev.dayItinerary.travelDetails, newItem]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {eventData.dayItinerary.travelDetails.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum detalhe adicionado.
                  </p>
                ) : (
                  eventData.dayItinerary.travelDetails.map((item, index) => (
                    <Card key={item.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Select
                            value={item.type}
                            onValueChange={(value) => {
                              const newItems = [...eventData.dayItinerary.travelDetails];
                              newItems[index].type = value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, travelDetails: newItems }
                              }));
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Transporte">Transporte</SelectItem>
                              <SelectItem value="Bilhetes">Bilhetes</SelectItem>
                              <SelectItem value="Check-in">Check-in</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="time"
                            value={item.time}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.travelDetails];
                              newItems[index].time = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, travelDetails: newItems }
                              }));
                            }}
                            className="h-8 text-xs"
                            placeholder="Hora"
                          />
                        </div>
                        <div className="col-span-5">
                          <Input
                            value={item.details}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.travelDetails];
                              newItems[index].details = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, travelDetails: newItems }
                              }));
                            }}
                            placeholder="Detalhes..."
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = eventData.dayItinerary.travelDetails.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, travelDetails: newItems }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Input
                          value={item.notes}
                          onChange={(e) => {
                            const newItems = [...eventData.dayItinerary.travelDetails];
                            newItems[index].notes = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              dayItinerary: { ...prev.dayItinerary, travelDetails: newItems }
                            }));
                          }}
                          placeholder="Notas adicionais..."
                          className="h-8 text-xs"
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="accommodation">Alojamento</Label>
              <Input
                id="accommodation"
                value={eventData.dayItinerary.accommodation}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, accommodation: e.target.value }
                }))}
                placeholder="Ex: Booking.com - Hotel XYZ, Endereço..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>

            {/* Lojas de Roupa - CRUD */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Lojas de Roupa</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem = {
                      id: `store-${Date.now()}-${Math.random()}`,
                      name: "",
                      address: "",
                      time: "",
                      notes: "",
                    };
                    setEventData(prev => ({
                      ...prev,
                      dayItinerary: {
                        ...prev.dayItinerary,
                        clothingStores: [...prev.dayItinerary.clothingStores, newItem]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Loja
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {eventData.dayItinerary.clothingStores.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma loja adicionada.
                  </p>
                ) : (
                  eventData.dayItinerary.clothingStores.map((item, index) => (
                    <Card key={item.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-4">
                          <Input
                            value={item.name}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.clothingStores];
                              newItems[index].name = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, clothingStores: newItems }
                              }));
                            }}
                            placeholder="Nome da loja"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.address}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.clothingStores];
                              newItems[index].address = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, clothingStores: newItems }
                              }));
                            }}
                            placeholder="Endereço"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="time"
                            value={item.time}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.clothingStores];
                              newItems[index].time = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, clothingStores: newItems }
                              }));
                            }}
                            className="h-8 text-xs"
                            placeholder="Hora"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={item.notes}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.clothingStores];
                              newItems[index].notes = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, clothingStores: newItems }
                              }));
                            }}
                            placeholder="Notas"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = eventData.dayItinerary.clothingStores.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, clothingStores: newItems }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Refeições - CRUD */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Refeições</Label>
                <div className="flex items-center gap-2">
                  {Array.isArray(eventData.dayItinerary.meals) && eventData.dayItinerary.meals.length > 0 && (
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                      Total: EUR {eventData.dayItinerary.meals.reduce((sum, meal) => sum + (meal.price || 0), 0).toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: `meal-${Date.now()}-${Math.random()}`,
                        date: eventData.dayItinerary.date || "",
                        time: "",
                        location: "",
                        whatToEat: "",
                        price: 0,
                      };
                      setEventData(prev => ({
                        ...prev,
                        dayItinerary: {
                          ...prev.dayItinerary,
                          meals: Array.isArray(prev.dayItinerary.meals) 
                            ? [...prev.dayItinerary.meals, newItem]
                            : [newItem]
                        }
                      }));
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Refeição
                  </Button>
                </div>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {!Array.isArray(eventData.dayItinerary.meals) || eventData.dayItinerary.meals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma refeição adicionada.
                  </p>
                ) : (
                  eventData.dayItinerary.meals.map((item, index) => (
                    <Card key={item.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2">
                          <Input
                            type="date"
                            value={item.date}
                            onChange={(e) => {
                              const currentMeals = Array.isArray(eventData.dayItinerary.meals) ? eventData.dayItinerary.meals : [];
                              const newItems = [...currentMeals];
                              newItems[index].date = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, meals: newItems }
                              }));
                            }}
                            className="h-8 text-xs"
                            placeholder="Data"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="time"
                            value={item.time}
                            onChange={(e) => {
                              const currentMeals = Array.isArray(eventData.dayItinerary.meals) ? eventData.dayItinerary.meals : [];
                              const newItems = [...currentMeals];
                              newItems[index].time = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, meals: newItems }
                              }));
                            }}
                            className="h-8 text-xs"
                            placeholder="Hora"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.location}
                            onChange={(e) => {
                              const currentMeals = Array.isArray(eventData.dayItinerary.meals) ? eventData.dayItinerary.meals : [];
                              const newItems = [...currentMeals];
                              newItems[index].location = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, meals: newItems }
                              }));
                            }}
                            placeholder="Onde (restaurante/local)"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.whatToEat}
                            onChange={(e) => {
                              const currentMeals = Array.isArray(eventData.dayItinerary.meals) ? eventData.dayItinerary.meals : [];
                              const newItems = [...currentMeals];
                              newItems[index].whatToEat = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, meals: newItems }
                              }));
                            }}
                            placeholder="O que vou comer"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.price || 0}
                            onChange={(e) => {
                              const currentMeals = Array.isArray(eventData.dayItinerary.meals) ? eventData.dayItinerary.meals : [];
                              const newItems = [...currentMeals];
                              newItems[index].price = parseFloat(e.target.value) || 0;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, meals: newItems }
                              }));
                            }}
                            placeholder="Preço"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const currentMeals = Array.isArray(eventData.dayItinerary.meals) ? eventData.dayItinerary.meals : [];
                              const newItems = currentMeals.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, meals: newItems }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="soundcheckTime">Horário de Soundcheck</Label>
                <Input
                  id="soundcheckTime"
                  type="time"
                  value={eventData.dayItinerary.soundcheckTime}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    dayItinerary: { ...prev.dayItinerary, soundcheckTime: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="venueOpenTime">Horário de Abertura do Venue</Label>
                <Input
                  id="venueOpenTime"
                  type="time"
                  value={eventData.dayItinerary.venueOpenTime}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    dayItinerary: { ...prev.dayItinerary, venueOpenTime: e.target.value }
                  }))}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Visitas a Estúdios / Colaborações - CRUD */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Visitas a Estúdios / Colaborações</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem = {
                      id: `studio-${Date.now()}-${Math.random()}`,
                      studio: "",
                      artist: "",
                      time: "",
                      purpose: "",
                      notes: "",
                    };
                    setEventData(prev => ({
                      ...prev,
                      dayItinerary: {
                        ...prev.dayItinerary,
                        studioVisits: [...prev.dayItinerary.studioVisits, newItem]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Visita
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {eventData.dayItinerary.studioVisits.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma visita adicionada.
                  </p>
                ) : (
                  eventData.dayItinerary.studioVisits.map((item, index) => (
                    <Card key={item.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Input
                            value={item.studio}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.studioVisits];
                              newItems[index].studio = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, studioVisits: newItems }
                              }));
                            }}
                            placeholder="Estúdio"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.artist}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.studioVisits];
                              newItems[index].artist = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, studioVisits: newItems }
                              }));
                            }}
                            placeholder="Artista"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="time"
                            value={item.time}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.studioVisits];
                              newItems[index].time = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, studioVisits: newItems }
                              }));
                            }}
                            className="h-8 text-xs"
                            placeholder="Hora"
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            value={item.purpose}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.studioVisits];
                              newItems[index].purpose = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, studioVisits: newItems }
                              }));
                            }}
                            placeholder="Propósito"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = eventData.dayItinerary.studioVisits.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, studioVisits: newItems }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Input
                          value={item.notes}
                          onChange={(e) => {
                            const newItems = [...eventData.dayItinerary.studioVisits];
                            newItems[index].notes = e.target.value;
                            setEventData(prev => ({
                              ...prev,
                              dayItinerary: { ...prev.dayItinerary, studioVisits: newItems }
                            }));
                          }}
                          placeholder="Notas adicionais..."
                          className="h-8 text-xs"
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Práticas de Voz / Aquecimento - CRUD */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold">Práticas de Voz / Aquecimento</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newItem = {
                      id: `voice-${Date.now()}-${Math.random()}`,
                      type: "",
                      time: "",
                      duration: "",
                      notes: "",
                    };
                    setEventData(prev => ({
                      ...prev,
                      dayItinerary: {
                        ...prev.dayItinerary,
                        voicePractice: [...prev.dayItinerary.voicePractice, newItem]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Prática
                </Button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                {eventData.dayItinerary.voicePractice.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhuma prática adicionada.
                  </p>
                ) : (
                  eventData.dayItinerary.voicePractice.map((item, index) => (
                    <Card key={item.id} className="p-3">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <Input
                            value={item.type}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.voicePractice];
                              newItems[index].type = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, voicePractice: newItems }
                              }));
                            }}
                            placeholder="Tipo (ex: Aquecimento)"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="time"
                            value={item.time}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.voicePractice];
                              newItems[index].time = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, voicePractice: newItems }
                              }));
                            }}
                            className="h-8 text-xs"
                            placeholder="Hora"
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            value={item.duration}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.voicePractice];
                              newItems[index].duration = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, voicePractice: newItems }
                              }));
                            }}
                            placeholder="Duração"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-4">
                          <Input
                            value={item.notes}
                            onChange={(e) => {
                              const newItems = [...eventData.dayItinerary.voicePractice];
                              newItems[index].notes = e.target.value;
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, voicePractice: newItems }
                              }));
                            }}
                            placeholder="Notas / Rotina"
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newItems = eventData.dayItinerary.voicePractice.filter((_, i) => i !== index);
                              setEventData(prev => ({
                                ...prev,
                                dayItinerary: { ...prev.dayItinerary, voicePractice: newItems }
                              }));
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Lembretes de Hidratação - Highlighted */}
            <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  💧 Lembretes de Hidratação
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Adicionar lembretes pré-configurados para a semana do concerto
                      const presetReminders = [
                        { time: "08:00", tip: "Manhã - Início do dia" },
                        { time: "10:00", tip: "Antes do almoço" },
                        { time: "14:00", tip: "Tarde - Continuar hidratação" },
                        { time: "16:00", tip: "2-3h antes do show" },
                        { time: "18:00", tip: "1h antes do show" },
                        { time: "20:00", tip: "Durante/pós-show" },
                      ];
                      
                      const newReminders = presetReminders.map((preset, idx) => ({
                        id: `hydration-preset-${Date.now()}-${idx}`,
                        time: preset.time,
                        completed: false,
                        tip: preset.tip,
                      }));
                      
                      setEventData(prev => ({
                        ...prev,
                        dayItinerary: {
                          ...prev.dayItinerary,
                          hydrationReminders: [...prev.dayItinerary.hydrationReminders, ...newReminders]
                        }
                      }));
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Lembretes Pré-configurados
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: `hydration-${Date.now()}-${Math.random()}`,
                        time: "",
                        completed: false,
                      };
                      setEventData(prev => ({
                        ...prev,
                        dayItinerary: {
                          ...prev.dayItinerary,
                          hydrationReminders: [...prev.dayItinerary.hydrationReminders, newItem]
                        }
                      }));
                    }}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Lembrete
                  </Button>
                </div>
              </div>
              
              {/* Dicas Rápidas de Hidratação */}
              <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded border border-blue-200">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">💡 Dicas Rápidas:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <div>• Água temperatura ambiente (não gelada)</div>
                  <div>• Pequenos goles ao longo do dia</div>
                  <div>• Evite álcool/cafeína 48h antes</div>
                  <div>• Nebulização salina se disponível</div>
                  <div>• Urina clara = bem hidratado</div>
                  <div>• Hidratação leva 30min-1h para efeito</div>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {eventData.dayItinerary.hydrationReminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lembrete adicionado. Adiciona lembretes para beber água ao longo do dia!
                  </p>
                ) : (
                  eventData.dayItinerary.hydrationReminders.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded border border-blue-200">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => {
                          const newItems = [...eventData.dayItinerary.hydrationReminders];
                          newItems[index].completed = checked as boolean;
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, hydrationReminders: newItems }
                          }));
                        }}
                        className="border-blue-400"
                      />
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => {
                          const newItems = [...eventData.dayItinerary.hydrationReminders];
                          newItems[index].time = e.target.value;
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, hydrationReminders: newItems }
                          }));
                        }}
                        className="flex-1 h-8 border-blue-300"
                        placeholder="Hora do lembrete"
                      />
                      {(item as any).tip && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 italic">
                          {(item as any).tip}
                        </span>
                      )}
                      <Badge variant={item.completed ? "default" : "outline"} className={item.completed ? "bg-green-500" : "bg-blue-100 text-blue-700"}>
                        {item.completed ? "✓ Feito" : "Pendente"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newItems = eventData.dayItinerary.hydrationReminders.filter((_, i) => i !== index);
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, hydrationReminders: newItems }
                          }));
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
              {eventData.dayItinerary.hydrationReminders.length > 0 && (
                <div className="mt-3 p-2 bg-blue-100 dark:bg-blue-900/30 rounded text-xs text-blue-700 dark:text-blue-300">
                  <div className="font-semibold mb-1">📋 Checklist de Hidratação:</div>
                  <div className="space-y-1">
                    <div>✓ Água temperatura ambiente (não gelada) - evita contração das cordas vocais</div>
                    <div>✓ 2-3 litros/dia distribuídos (pequenos goles, não grandes quantidades)</div>
                    <div>✓ Começar hidratação 2-3 dias antes do concerto</div>
                    <div>✓ Evitar álcool/cafeína 48h antes</div>
                    <div>✓ Nebulização salina (se disponível) para hidratação direta</div>
                    <div>✓ Urina clara = bem hidratado</div>
                  </div>
                </div>
              )}
            </div>

            {/* Lembretes do que a Audiência Quer Ver - Highlighted */}
            <div className="border-2 border-purple-500 rounded-lg p-4 bg-purple-50 dark:bg-purple-900/20">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-lg font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                  🎭 O que a Audiência Realmente Quer Ver
                </Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Adicionar lembretes pré-configurados baseados no que a audiência quer
                      const presetReminders = [
                        { time: "19:00", tip: "Mistakes são ok - performance honesta, não perfeita" },
                        { time: "19:15", tip: "Take chances - não seja 'safe', é rock and roll" },
                        { time: "19:30", tip: "Engage the audience - contato visual, conversa" },
                        { time: "19:45", tip: "Enjoyment - se não estás a divertir-te, a audiência nota" },
                        { time: "20:00", tip: "Pace the performance - ritmo adequado ao show" },
                        { time: "20:15", tip: "Be grateful - agradece quem pagou para te ver" },
                        { time: "20:30", tip: "Authenticity - conexão real, não falso" },
                        { time: "20:45", tip: "Confidence - confiança genuína, não arrogância" },
                        { time: "21:00", tip: "Listen to bandmates - interação no palco" },
                        { time: "21:15", tip: "Don't judge yourself on stage - foca no momento" },
                        { time: "21:30", tip: "Know your material - conhece tudo de cor" },
                        { time: "21:45", tip: "Know your setlist - sem pausas para decidir próxima música" },
                      ];
                      
                      const newReminders = presetReminders.map((preset, idx) => ({
                        id: `audience-preset-${Date.now()}-${idx}`,
                        time: preset.time,
                        completed: false,
                        tip: preset.tip,
                      }));
                      
                      setEventData(prev => ({
                        ...prev,
                        dayItinerary: {
                          ...prev.dayItinerary,
                          audienceReminders: [...prev.dayItinerary.audienceReminders, ...newReminders]
                        }
                      }));
                    }}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Lembretes Pré-configurados
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newItem = {
                        id: `audience-${Date.now()}-${Math.random()}`,
                        time: "",
                        completed: false,
                        tip: "",
                      };
                      setEventData(prev => ({
                        ...prev,
                        dayItinerary: {
                          ...prev.dayItinerary,
                          audienceReminders: [...prev.dayItinerary.audienceReminders, newItem]
                        }
                      }));
                    }}
                    className="border-purple-300 text-purple-700 hover:bg-purple-100"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Lembrete
                  </Button>
                </div>
              </div>
              
              {/* Dicas Rápidas sobre Performance */}
              <div className="mb-4 p-3 bg-white dark:bg-slate-800 rounded border border-purple-200">
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 mb-2">💡 O que a Audiência Quer:</div>
                <div className="grid grid-cols-2 gap-2 text-xs text-purple-600 dark:text-purple-400">
                  <div>• Mistakes são ok - performance honesta</div>
                  <div>• Take chances - não seja 'safe'</div>
                  <div>• Engage the audience - contato visual</div>
                  <div>• Enjoyment - diverte-te no palco</div>
                  <div>• Pace the performance - ritmo adequado</div>
                  <div>• Be grateful - agradece quem pagou</div>
                  <div>• Authenticity - conexão real</div>
                  <div>• Confidence - confiança genuína</div>
                  <div>• Listen to bandmates - interação</div>
                  <div>• Don't judge yourself - foca no momento</div>
                  <div>• Know your material - conhece tudo</div>
                  <div>• Know your setlist - sem pausas</div>
                </div>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {eventData.dayItinerary.audienceReminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum lembrete adicionado. Adiciona lembretes sobre o que a audiência quer ver!
                  </p>
                ) : (
                  eventData.dayItinerary.audienceReminders.map((item, index) => (
                    <div key={item.id} className="flex items-center gap-3 p-2 bg-white dark:bg-slate-800 rounded border border-purple-200">
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={(checked) => {
                          const newItems = [...eventData.dayItinerary.audienceReminders];
                          newItems[index].completed = checked as boolean;
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, audienceReminders: newItems }
                          }));
                        }}
                        className="border-purple-400"
                      />
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => {
                          const newItems = [...eventData.dayItinerary.audienceReminders];
                          newItems[index].time = e.target.value;
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, audienceReminders: newItems }
                          }));
                        }}
                        className="flex-1 h-8 border-purple-300"
                        placeholder="Hora do lembrete"
                      />
                      <Input
                        value={item.tip}
                        onChange={(e) => {
                          const newItems = [...eventData.dayItinerary.audienceReminders];
                          newItems[index].tip = e.target.value;
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, audienceReminders: newItems }
                          }));
                        }}
                        className="flex-1 h-8 border-purple-300 text-xs"
                        placeholder="Lembrete (ex: Mistakes são ok)"
                      />
                      <Badge variant={item.completed ? "default" : "outline"} className={item.completed ? "bg-green-500" : "bg-purple-100 text-purple-700"}>
                        {item.completed ? "✓ Feito" : "Pendente"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newItems = eventData.dayItinerary.audienceReminders.filter((_, i) => i !== index);
                          setEventData(prev => ({
                            ...prev,
                            dayItinerary: { ...prev.dayItinerary, audienceReminders: newItems }
                          }));
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="otherNotes">Outras Notas</Label>
              <Textarea
                id="otherNotes"
                value={eventData.dayItinerary.otherNotes}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, otherNotes: e.target.value }
                }))}
                placeholder="Qualquer outra informação relevante sobre o evento..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                onClick={exportDayItineraryPDF}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Itinerário do Dia em PDF
              </Button>
            </div>
          </div>
        );

      default:
        return <div>Selecione uma etapa</div>;
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Evento — <span className="text-indigo-600 dark:text-indigo-400">{params.id}</span>
          </h1>
       
        </div>

        {/* Stepper */}
        <Card className="w-full mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Fluxograma de Execução</h2>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700">
                  {steps[currentStep].name}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <MultiStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </CardContent>
        </Card>

        {/* Conteúdo do Step Atual */}
        <Card className="w-full mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold">{steps[currentStep].name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {steps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <Card className="w-full border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-600"
                >
                  Próximo
                </Button>
              </div>
              <div className="flex gap-3 items-center">
                {lastSaved && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Guardado: {lastSaved.toLocaleTimeString('pt-PT')}
                  </span>
                )}
                <Button 
                  variant="outline" 
                  className="gap-2 border-2 border-slate-200 dark:border-slate-700"
                  onClick={handleManualSave}
                >
                  <FileText className="w-4 h-4" />
                  Salvar Agora
                </Button>
                <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white border-2 border-green-600" onClick={exportFullItineraryPDF}>
                  <Download className="w-4 h-4" />
                  Exportar Itinerário Completo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Conteúdo do Vestuário como componente separado para o step
const WardrobePlanningPageContent = ({ eventData, setEventData }: { eventData: EventData; setEventData: any }) => {
  // State for each section from the provided code
  const [selectedHairstyles, setSelectedHairstyles] = useState<string[]>([]);
  const [selectedGlasses, setSelectedGlasses] = useState<string[]>([]);
  const [selectedHeadWear, setSelectedHeadWear] = useState<string[]>([]);
  const [selectedSuperior, setSelectedSuperior] = useState<string[]>([]);
  const [selectedPants, setSelectedPants] = useState<string[]>([]);
  const [selectedShoes, setSelectedShoes] = useState<string[]>([]);
  const [selectedNeckAccessories, setSelectedNeckAccessories] = useState<string[]>([]);
  const [selectedBracelets, setSelectedBracelets] = useState<string[]>([]);
  const [selectedWatch, setSelectedWatch] = useState<string[]>([]);
  const [selectedBelt, setSelectedBelt] = useState<string[]>([]);
  const [customItems, setCustomItems] = useState<{ name: string; category: string; price: number }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Toggle helper for multi-selection
  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: (arr: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  // Specific toggle handlers for each category
  const toggleHairstyle = (value: string) =>
    toggleSelection(value, selectedHairstyles, setSelectedHairstyles);
  const toggleGlasses = (value: string) =>
    toggleSelection(value, selectedGlasses, setSelectedGlasses);
  const toggleHeadWear = (value: string) =>
    toggleSelection(value, selectedHeadWear, setSelectedHeadWear);
  const toggleSuperior = (value: string) =>
    toggleSelection(value, selectedSuperior, setSelectedSuperior);
  const togglePants = (value: string) =>
    toggleSelection(value, selectedPants, setSelectedPants);
  const toggleShoes = (value: string) =>
    toggleSelection(value, selectedShoes, setSelectedShoes);
  const toggleNeckAccessory = (value: string) =>
    toggleSelection(value, selectedNeckAccessories, setSelectedNeckAccessories);
  const toggleBracelet = (value: string) =>
    toggleSelection(value, selectedBracelets, setSelectedBracelets);
  const toggleWatch = (value: string) =>
    toggleSelection(value, selectedWatch, setSelectedWatch);
  const toggleBelt = (value: string) =>
    toggleSelection(value, selectedBelt, setSelectedBelt);

  // Function to add a custom item
  const addCustomItem = (name: string, category: string, price: string) => {
    const priceNumber = parseFloat(price);
    if (!isNaN(priceNumber)) {
      setCustomItems((prev) => [...prev, { name, category, price: priceNumber }]);
    }
  };

  const handleAddCustomItem = () => {
    if (customName && customCategory && customPrice) {
      addCustomItem(customName, customCategory, customPrice);
      setCustomName("");
      setCustomCategory("");
      setCustomPrice("");
    }
  };

  // Function to handle export of invoice using jsPDF
  const handleExportInvoice = () => {
    const doc = new jsPDF();

    // Configurações básicas
    doc.setFontSize(18);
    doc.text("Fatura", 10, 20);
    doc.setFontSize(12);

    // Adicionar itens
    let yPosition = 30;
    const addItem = (description: string, price: number) => {
      doc.text(description, 10, yPosition);
      doc.text(`€${price.toFixed(2)}`, 180, yPosition, { align: "right" });
      yPosition += 10;
    };

    // Adicionar itens selecionados
    const addItems = (
      selectedArray: string[],
      options: PricedOption[],
      categoryLabel: string
    ) => {
      selectedArray.forEach((val: string) => {
        const option = options.find((item: PricedOption) => item.value === val);
        if (option) {
          addItem(`${categoryLabel}: ${option.label}`, option.price);
        }
      });
    };

    addItems(selectedHairstyles, hairstyleOptions, "Cabelo");
    addItems(selectedGlasses, glassesOptions, "Óculos");
    addItems(selectedHeadWear, headWearOptions, "Head Wear");
    addItems(selectedSuperior, superiorOptions, "Parte Superior");
    addItems(selectedPants, pantsOptions, "Pants");
    addItems(selectedShoes, shoesOptions, "Shoes");
    addItems(selectedNeckAccessories, neckAccessoryOptions, "Neck Accessories");
    addItems(selectedBracelets, braceletOptions, "Bracelet");
    addItems(selectedWatch, watchOptions, "Watch");
    addItems(selectedBelt, beltOptions, "Belt");

    // Adicionar itens personalizados
    customItems.forEach((item) => {
      addItem(`Custom (${item.category}): ${item.name}`, item.price);
    });

    // Adicionar total
    yPosition += 10;
    doc.setFontSize(14);
    doc.text(`Total: €${totalPrice.toFixed(2)}`, 10, yPosition);

    // Salvar o PDF
    doc.save("fatura.pdf");
  };

  // Calculate the total price based on all selections and custom items
  const totalPrice = useMemo(() => {
    let total = 0;
    const sumSelected = (
      selected: string[],
      options: { value: string; price: number }[]
    ) => {
      selected.forEach((val) => {
        const found = options.find((item) => item.value === val);
        if (found) total += found.price;
      });
    };

    sumSelected(selectedHairstyles, hairstyleOptions);
    sumSelected(selectedGlasses, glassesOptions);
    sumSelected(selectedHeadWear, headWearOptions);
    sumSelected(selectedSuperior, superiorOptions);
    sumSelected(selectedPants, pantsOptions);
    sumSelected(selectedShoes, shoesOptions);
    sumSelected(selectedNeckAccessories, neckAccessoryOptions);
    sumSelected(selectedBracelets, braceletOptions);
    sumSelected(selectedWatch, watchOptions);
    sumSelected(selectedBelt, beltOptions);

    customItems.forEach((item) => {
      total += item.price;
    });

    return total;
  }, [
    selectedHairstyles,
    selectedGlasses,
    selectedHeadWear,
    selectedSuperior,
    selectedPants,
    selectedShoes,
    selectedNeckAccessories,
    selectedBracelets,
    selectedWatch,
    selectedBelt,
    customItems,
  ]);

  // Update eventData.wardrobe when selections change
  useEffect(() => {
    setEventData((prev: EventData) => ({
      ...prev,
      wardrobe: {
        selectedHairstyles,
        selectedGlasses,
        selectedHeadWear,
        selectedSuperior,
        selectedPants,
        selectedShoes,
        selectedNeckAccessories,
        selectedBracelets,
        selectedWatch,
        selectedBelt,
        customItems,
        totalPrice,
      },
    }));
  }, [
    selectedHairstyles,
    selectedGlasses,
    selectedHeadWear,
    selectedSuperior,
    selectedPants,
    selectedShoes,
    selectedNeckAccessories,
    selectedBracelets,
    selectedWatch,
    selectedBelt,
    customItems,
    totalPrice,
    setEventData,
  ]);

  // Group catalog items by existing planner categories for inline suggestions
  const groupedCatalog = useMemo(() => {
    const flat: Array<{ section: WardrobeSection; item: WardrobeItem; category?: AllowedCategory }> = [];
    const sections = [...abbigliamento, ...accessori];
    sections.forEach((sec) => {
      sec.items.forEach((it) => {
        const cat = mapToCategory(sec, it);
        flat.push({ section: sec, item: it, category: cat });
      });
    });
    const map = new Map<AllowedCategory, Array<{ section: WardrobeSection; item: WardrobeItem }>>();
    ALLOWED_CATEGORIES.forEach((c) => map.set(c, []));
    flat.forEach(({ section, item, category }) => {
      if (category) {
        map.get(category)!.push({ section, item });
      }
    });
    return map;
  }, []);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Vestuário</h1>
      <p>Selecione ou personalize os itens do seu vestuário para o evento</p>

      <div className="grid grid-cols-1 gap-6">
        {/* HEAD Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">CABEÇA</h2>
          <Label className="mb-2 block">Cabelo</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {hairstyleOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedHairstyles.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleHairstyle(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Cabelo")?.length ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Cabelo")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`cabelo-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Cabelo)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Cabelo", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <Label className="mb-2 block">Óculos</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {glassesOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedGlasses.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleGlasses(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Óculos")?.length ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Óculos")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`oculos-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Óculos)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Óculos", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <Label className="mb-2 block">Head Wear</Label>
          <div className="flex flex-wrap gap-4">
            {headWearOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedHeadWear.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleHeadWear(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Head Wear")?.length ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Head Wear")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`headwear-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Head Wear)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Head Wear", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* UPPER Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">PARTES SUPERIORES</h2>
          <Label className="mb-2 block">Parte Superior</Label>
          <div className="flex flex-wrap gap-4">
            {superiorOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedSuperior.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleSuperior(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Parte Superior")?.length ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Parte Superior")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`superior-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Parte Superior)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Parte Superior", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* LOWER Section */}
        <div className="border rounded p-4 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">PARTES INFERIORES</h2>
          <Label className="mb-2 block">Pants</Label>
          <div className="flex flex-wrap gap-4">
            {pantsOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedPants.includes(option.value) ? "default" : "outline"
                }
                onClick={() => togglePants(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Pants")?.length ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Pants")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`pants-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Pants)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Pants", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* FEET Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">PÉ</h2>
          <Label className="mb-2 block">Tênis</Label>
          <div className="flex flex-wrap gap-4">
            {shoesOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedShoes.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleShoes(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Tênis")?.length ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Tênis")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`tenis-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Tênis)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Tênis", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* ACCESSORIES Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">ACESSÓRIOS</h2>
          <Label className="mb-2 block">Acessórios de Pescoço</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {neckAccessoryOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedNeckAccessories.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleNeckAccessory(option.value)}
              >
                {option.label} {option.price > 0 && `(€${option.price})`}
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Acessórios de Pescoço")?.length ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Acessórios de Pescoço")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`neck-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Acessórios de Pescoço)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Acessórios de Pescoço", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <Label className="mb-2 block">Pulseiras</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {braceletOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedBracelets.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleBracelet(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Pulseiras")?.length ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Pulseiras")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`pulseiras-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Pulseiras)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Pulseiras", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
          <Label className="mb-2 block">Relógio</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {watchOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedWatch.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleWatch(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Relógio")?.length ? (
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Relógio")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`relogio-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Relógio)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Relógio", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
            <Label className="mb-2 block">Cinto</Label>
          <div className="flex flex-wrap gap-4">
            {beltOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedBelt.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleBelt(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          {groupedCatalog.get("Cinto")?.length ? (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-2">Sugestões do Catálogo</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedCatalog.get("Cinto")!.map(({ section, item }) => (
                  <CatalogItemCard
                    key={`cinto-${section.key}-${item.id}`}
                    section={section}
                    item={item}
                    onAdd={(it) => {
                      const priceStr = window.prompt(`Preço para ${it.namePt} (Cinto)`, "0");
                      if (priceStr && priceStr.trim() !== "" && !isNaN(parseFloat(priceStr))) {
                        addCustomItem(`${it.namePt} (${it.nameIt})`, "Cinto", priceStr);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Custom Item Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Adicionar Item Personalizado</h2>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nome do Item"
            className="border rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Categoria"
            className="border rounded p-2 w-full mb-2"
          />
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="Preço"
            className="border rounded p-2 w-full mb-2"
          />
          <Button onClick={handleAddCustomItem}>Adicionar Item</Button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="border rounded p-4 shadow-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Resumo do Vestuário</h2>
        <pre className="text-sm whitespace-pre-wrap">
          {JSON.stringify(eventData.wardrobe, null, 2)}
        </pre>
        <div className="text-xl font-bold">Total Estimado: €{totalPrice.toFixed(2)}</div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => (window.location.href = "/filmagem")}>
            Confirmar Vestuário
          </Button>
          <Button variant="outline" onClick={handleExportInvoice}>
            EXPORTAR FATURA
          </Button>
        </div>
      </div>
    </div>
  );
};

// Definições para o vestuário (do código fornecido)
type PricedOption = { label: string; value: string; price: number };

const hairstyleOptions: PricedOption[] = [
  { label: "Tinta Preta", value: "tintapreta", price: 6 },
  { label: "Relaxing", value: "moderno", price: 9 },
  { label: "Retoque", value: "criativo", price: 5 },
];

const glassesOptions: PricedOption[] = [
  { label: "Sem Óculos", value: "sem_oculos", price: 0 },
  { label: "Com Óculos Estilosos", value: "com_oculos", price: 15 },
];

const headWearOptions: PricedOption[] = [
  { label: "Gorro Personalizado", value: "gorro_personalizado", price: 5 },
  { label: "Gorro", value: "gorro", price: 3 },
  { label: "Babushka", value: "babushka", price: 4 },
  { label: "Russian Headwear", value: "russian_headwear", price: 6 },
  { label: "Militar Camoflage", value: "militar_camoflage", price: 7 },
];

const superiorOptions: PricedOption[] = [
  { label: "Let's Copy DTF", value: "dtf", price: 11 },
  { label: "Tshirt Vazia", value: "brincos", price: 9 },
  { label: "Balmacan Personalizada", value: "balmacan", price: 5 },
  { label: "Colete", value: "colete", price: 15 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Chains Personalizado", value: "chainspersonalizados", price: 560 },
  { label: "Gravata Ascot", value: "gravata_ascot", price: 10 },
];

const pantsOptions: PricedOption[] = [
  { label: "Custom Pants", value: "custom_pants", price: 20 },
  { label: "Zara Pants", value: "zara_pants", price: 25 },
  { label: "Pants Chain", value: "pants_chain", price: 10 },
];

const shoesOptions: PricedOption[] = [
  { label: "Zara Boots", value: "zara_boots", price: 40 },
  { label: "Bershka Boots", value: "bershka_boots", price: 35 },
];

const neckAccessoryOptions: PricedOption[] = [
  { label: "Nenhum", value: "nenhum", price: 0 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Correntes", value: "correntes", price: 130 },
];

const braceletOptions: PricedOption[] = [
  { label: "Glitter Bracelet (€3.50)", value: "glitter_bracelet", price: 3.5 },
  { label: "Personalized Bracelet", value: "personalized_bracelet", price: 15 },
];

const watchOptions: PricedOption[] = [
  { label: "Watch", value: "watch", price: 20 },
];

const beltOptions: PricedOption[] = [
  { label: "TRIPARTE BELT", value: "triparte_belt", price: 30 },
];

const ALLOWED_CATEGORIES = [
  "Cabelo",
  "Óculos",
  "Head Wear",
  "Parte Superior",
  "Pants",
  "Tênis",
  "Acessórios de Pescoço",
  "Pulseiras",
  "Relógio",
  "Cinto",
] as const;

type AllowedCategory = typeof ALLOWED_CATEGORIES[number];

type WardrobeItem = {
  id: string;
  nameIt: string;
  namePt: string;
  tooltip: string;
  photo?: string;
};

type WardrobeSection = {
  key: string;
  title: string;
  subtitle?: string;
  items: WardrobeItem[];
};

const foto = (q: string) => `https://source.unsplash.com/640x480/?${encodeURIComponent(q)}`;

const abbigliamento: WardrobeSection[] = [
  {
    key: "camicie",
    title: "Camicie e Maglieria",
    subtitle: "Camisas, t-shirts e malhas que compõem a base do visual",
    items: [
      { id: "camicia-classica", nameIt: "Camicia", namePt: "Camisa", tooltip: "Camisa de mangas compridas, formal ou casual, base para fatos e blazers.", photo: foto("dress shirt") },
      { id: "camicia-sportiva", nameIt: "Camicia sportiva", namePt: "Camisa desportiva", tooltip: "Modelos mais descontraídos, tecidos leves e padrões variados.", photo: foto("casual shirt") },
      { id: "camiseta", nameIt: "Maglietta", namePt: "T-shirt", tooltip: "Camiseta de malha, gola redonda (girocollo) ou em V.", photo: foto("tshirt white") },
      { id: "dolcevita", nameIt: "Dolcevita", namePt: "Gola alta", tooltip: "Malha com gola alta, elegante e versátil sob blazers.", photo: foto("turtleneck sweater") },
      { id: "cardigan", nameIt: "Cardigan", namePt: "Cardigã", tooltip: "Casaco de malha com abertura frontal, ótimo para camadas.", photo: foto("cardigan knit") },
    ],
  },
  {
    key: "giacche",
    title: "Giacche e Cappotti",
    subtitle: "Jaquetas e casacos que definem estrutura e presença",
    items: [
      { id: "giacca", nameIt: "Giacca", namePt: "Blazer/Casaco", tooltip: "Blazer de alfaiataria; último botão inferior deve ficar desabotoado.", photo: foto("blazer menswear") },
      { id: "doppiopetto", nameIt: "Giacca doppiopetto", namePt: "Casaco peito duplo", tooltip: "Casaco com duas fileiras de botões; presença clássica e imponente.", photo: foto("double breasted blazer") },
      { id: "cappotto", nameIt: "Cappotto", namePt: "Sobretudo", tooltip: "Casaco longo para clima frio; peça durável e atemporal.", photo: foto("overcoat wool") },
      { id: "mantello", nameIt: "Mantello", namePt: "Capa", tooltip: "Capa elegante para ocasiões formais ou de gala.", photo: foto("cape coat fashion") },
      { id: "impermeabile", nameIt: "Impermeabile", namePt: "Trench/Impermeável", tooltip: "Trench coat resistente à chuva, clássico e funcional.", photo: foto("trench coat") },
      { id: "giubbotto", nameIt: "Giubbotto", namePt: "Blusão", tooltip: "Casaco curto; pode ser em pele, ganga ou tecido técnico.", photo: foto("leather jacket mens") },
    ],
  },
  {
    key: "pantaloni-gonne",
    title: "Pantaloni e Gonne",
    subtitle: "Peças de baixo masculinas e femininas",
    items: [
      { id: "pantaloni-classici", nameIt: "Pantaloni", namePt: "Calças", tooltip: "Calças de alfaiataria; corte e queda precisos para elegância.", photo: foto("dress trousers") },
      { id: "jeans", nameIt: "Jeans", namePt: "Jeans", tooltip: "Calças de ganga/denim; do slim ao reto, versáteis no dia a dia.", photo: foto("jeans denim") },
      { id: "chino", nameIt: "Pantaloni chino", namePt: "Chino", tooltip: "Calça casual em sarja leve, entre o formal e o descontraído.", photo: foto("chino pants") },
      { id: "gonna", nameIt: "Gonna", namePt: "Saia", tooltip: "Peça feminina com inúmeras variações: lápis, plissada, midi, longa.", photo: foto("pleated skirt") },
      { id: "shorts", nameIt: "Pantaloncini", namePt: "Calções", tooltip: "Versões curtas; alfaiataria, cargo ou desportivo.", photo: foto("tailored shorts") },
    ],
  },
  {
    key: "completi-tute",
    title: "Completi e Tute",
    subtitle: "Fatos completos e peças de corpo inteiro",
    items: [
      { id: "abito", nameIt: "Abito / Completo", namePt: "Fato (terno)", tooltip: "Conjunto de jaqueta e calça; pode incluir colete (gilet).", photo: foto("mens suit three piece") },
      { id: "spezzato", nameIt: "Spezzato", namePt: "Spezzato (misto)", tooltip: "Jaqueta e calças de cores/tecidos diferentes para contraste.", photo: foto("blazer trousers outfit") },
      { id: "tuta-sportiva", nameIt: "Tuta sportiva", namePt: "Fato de treino", tooltip: "Conjunto desportivo de casaco e calça, confortável.", photo: foto("tracksuit fashion") },
      { id: "tutina", nameIt: "Tutina / Tuta intera", namePt: "Macacão", tooltip: "Peça única de corpo inteiro, elegante ou utilitária.", photo: foto("jumpsuit fashion") },
      { id: "vestito", nameIt: "Vestito / Abito", namePt: "Vestido", tooltip: "Do casual ao de gala (abito da sera), comprimentos diversos.", photo: foto("evening dress") },
      { id: "gilet", nameIt: "Gilet", namePt: "Colete", tooltip: "Peça do fato de três peças; último botão costuma ficar aberto.", photo: foto("waistcoat mens") },
    ],
  },
];

const accessori: WardrobeSection[] = [
  {
    key: "cappelli",
    title: "Cappelli e Berretti",
    subtitle: "Chapéus e gorros que moldam o porte e a atitude",
    items: [
      { id: "fedora", nameIt: "Fedora", namePt: "Fedora", tooltip: "Chapéu clássico com aba média e copa vincada.", photo: foto("fedora hat") },
      { id: "panama", nameIt: "Panamá", namePt: "Panamá", tooltip: "Chapéu leve de fibra natural, ideal para clima quente.", photo: foto("panama hat") },
      { id: "trilby", nameIt: "Trilby", namePt: "Trilby", tooltip: "Semelhante ao fedora com aba mais curta e atitude moderna.", photo: foto("trilby hat") },
      { id: "cappello-cilindro", nameIt: "Cappello a cilindro", namePt: "Cartola", tooltip: "Topo alto e formal, presença teatral/clássica.", photo: foto("top hat") },
      { id: "bombetta", nameIt: "Bombetta", namePt: "Chapéu coco", tooltip: "Copa arredondada e rígida, ícone do século XX.", photo: foto("bowler hat") },
      { id: "berretto-baseball", nameIt: "Berretto da baseball", namePt: "Boné", tooltip: "Boné com pala; do desporto ao streetwear.", photo: foto("baseball cap") },
      { id: "basco", nameIt: "Basco", namePt: "Boina", tooltip: "Boina de lã, clássica europeia; versões militares e artísticas.", photo: foto("beret hat") },
      { id: "cuffia-lana", nameIt: "Cuffia di lana", namePt: "Gorro de lã", tooltip: "Gorro para frio; pode ser justo ou oversized.", photo: foto("knit beanie") },
      { id: "cloche", nameIt: "Cloche", namePt: "Cloche", tooltip: "Chapéu feminino de copa arredondada e aba curta, anos 20.", photo: foto("cloche hat vintage") },
    ],
  },
  {
    key: "borse",
    title: "Borse, Zaini e Valigie",
    subtitle: "Bolsas, mochilas e malas – utilidade e assinatura de estilo",
    items: [
      { id: "borsa", nameIt: "Borsa", namePt: "Bolsa", tooltip: "Categoria ampla: ombro, mão, tiracolo, clutch, tote, etc.", photo: foto("handbag leather") },
      { id: "pochette", nameIt: "Pochette", namePt: "Carteira de mão", tooltip: "Acessório de mão elegante; forte impacto visual em gala.", photo: foto("clutch bag woman") },
      { id: "valigetta", nameIt: "Valigetta", namePt: "Pasta/briefcase", tooltip: "Pasta rígida ou flexível para trabalho; pele de qualidade.", photo: foto("leather briefcase") },
      { id: "zaino", nameIt: "Zaino", namePt: "Mochila", tooltip: "Do urbano ao outdoor; atenção a materiais e ergonomia.", photo: foto("backpack urban leather") },
      { id: "borsone", nameIt: "Borsone sport", namePt: "Mala desportiva", tooltip: "Capacidade e robustez; ideal para viagem curta ou ginásio.", photo: foto("duffle bag") },
      { id: "secchiello", nameIt: "Borsa a secchiello", namePt: "Bolsa saco", tooltip: "Formato cilíndrico com fecho por cordão; feminino e prático.", photo: foto("bucket bag leather") },
    ],
  },
  {
    key: "calzature",
    title: "Calzature",
    subtitle: "Sapatos e botas – o fundamento do porte",
    items: [
      { id: "richelieu", nameIt: "Richelieu (Oxford)", namePt: "Oxford", tooltip: "Sapato social com atacadores fechados; formalidade máxima.", photo: foto("oxford shoes men") },
      { id: "derby", nameIt: "Derby", namePt: "Derby", tooltip: "Atacadores abertos; um pouco mais casual que o Oxford.", photo: foto("derby shoes men") },
      { id: "brogue", nameIt: "Brogue", namePt: "Brogue", tooltip: "Perfurações decorativas; do semi ao full brogue (wingtip).", photo: foto("brogue shoes wingtip") },
      { id: "chelsea", nameIt: "Stivaletto Chelsea", namePt: "Bota Chelsea", tooltip: "Bota de cano curto com elástico lateral; elegante e prática.", photo: foto("chelsea boots men") },
      { id: "stivale-militare", nameIt: "Stivale militare", namePt: "Bota militar", tooltip: "Robusta com sola tratorada e atacadores; atitude utilitária.", photo: foto("combat boots") },
      { id: "tacco", nameIt: "Scarpa con tacco", namePt: "Sapato de salto", tooltip: "Modelo feminino de salto; do stiletto ao bloco.", photo: foto("high heels stiletto") },
      { id: "sneaker", nameIt: "Sneaker / Zapatilla", namePt: "Ténis desportivo", tooltip: "Calçado desportivo/urbano; conforto e tecnologia.", photo: foto("sneakers modern") },
    ],
  },
  {
    key: "gioielli",
    title: "Gioelleria",
    subtitle: "Joias e adereços de impacto controlado",
    items: [
      { id: "anello-chevalier", nameIt: "Anello chevalier", namePt: "Anel de minguinho", tooltip: "Tradicional de sinete; iniciais ou brasão; unissexo moderno.", photo: foto("signet ring") },
      { id: "fede", nameIt: "Fede nuziale", namePt: "Aliança", tooltip: "Anel de casamento; simplicidade simbólica.", photo: foto("wedding ring closeup") },
      { id: "bracciale", nameIt: "Bracciale", namePt: "Pulseira", tooltip: "Metal, couro, contas; discreta ou protagonista.", photo: foto("bracelet men leather") },
      { id: "collana", nameIt: "Collana", namePt: "Colar", tooltip: "Do choker (gargantilha) às correntes longas com pingente.", photo: foto("necklace pendant") },
      { id: "gemelli", nameIt: "Gemelli", namePt: "Botões de punho", tooltip: "Fechos decorativos para punhos de camisa dupla.", photo: foto("cufflinks luxury") },
      { id: "fermacravatta", nameIt: "Fermacravatta", namePt: "Alfinete de gravata", tooltip: "Mantém a gravata alinhada; detalhe clássico masculino.", photo: foto("tie bar clip") },
    ],
  },
  {
    key: "altri",
    title: "Altri Accessori",
    subtitle: "Complementos funcionais e expressivos",
    items: [
      { id: "cintura", nameIt: "Cintura", namePt: "Cinto", tooltip: "Couro de qualidade; combinar com os sapatos; fivela como detalhe.", photo: foto("leather belt") },
      { id: "corsetto", nameIt: "Corsetto", namePt: "Corset/Cinta", tooltip: "Modelador de cintura; estética, suporte e construção de silhueta.", photo: foto("corset fashion") },
      { id: "pochette-tasca", nameIt: "Pochette da taschino", namePt: "Lenço de bolso", tooltip: "Toque de cor no bolso do blazer; nunca combinar com a gravata.", photo: foto("pocket square suit") },
      { id: "cravatta", nameIt: "Cravatta", namePt: "Gravata", tooltip: "Lisas, texturadas ou estampadas; nó adequado ao colarinho.", photo: foto("necktie suit") },
      { id: "pajarita", nameIt: "Papillon / Pajarita", namePt: "Laço/gravata borboleta", tooltip: "Formal clássico; preto em black tie, variações criativas no casual.", photo: foto("bow tie tuxedo") },
      { id: "bufanda", nameIt: "Bufanda / Sciarpa", namePt: "Cachecol/lenço", tooltip: "Lã, seda ou algodão; proteção e textura visual.", photo: foto("scarf wool") },
      { id: "occhiali", nameIt: "Occhiali", namePt: "Óculos", tooltip: "De grau ou de sol; armação molda o caráter do rosto.", photo: foto("sunglasses fashion") },
      { id: "guanti", nameIt: "Guanti", namePt: "Luvas", tooltip: "Curtas (matinée), médias (midi) ou longas (de ópera).", photo: foto("leather gloves") },
      { id: "orologio", nameIt: "Orologio da polso", namePt: "Relógio de pulso", tooltip: "Único acessório masculino permitido em gala (com aliança).", photo: foto("wristwatch classic") },
    ],
  },
];

function normalizeInputCategory(input: string | null): AllowedCategory | undefined {
  if (!input) return undefined;
  const trimmed = input.trim().toLowerCase();
  const found = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === trimmed);
  return found as AllowedCategory | undefined;
}

function mapToCategory(section: WardrobeSection, item: WardrobeItem): AllowedCategory | undefined {
  switch (section.key) {
    case "camicie":
    case "giacche":
    case "completi-tute":
      return "Parte Superior";
    case "pantaloni-gonne":
      return "Pants";
    case "cappelli":
      return "Head Wear";
    case "calzature":
      return "Tênis";
    case "gioielli": {
      if (item.id.includes("bracciale")) return "Pulseiras";
      if (item.id.includes("collana")) return "Acessórios de Pescoço";
      if (item.id.includes("fermacravatta")) return "Acessórios de Pescoço";
      if (item.id.includes("gemelli")) return "Acessórios de Pescoço";
      return undefined;
    }
    case "altri": {
      if (item.id === "cintura") return "Cinto";
      if (item.id === "occhiali") return "Óculos";
      if (item.id === "orologio") return "Relógio";
      if (["pochette-tasca", "cravatta", "pajarita", "bufanda"].includes(item.id))
        return "Acessórios de Pescoço";
      if (item.id === "corsetto") return "Parte Superior";
      return undefined;
    }
    // "borse" e outros sem correspondência explícita → undefined para o utilizador escolher
    default:
      return undefined;
  }
}

function Section({
  section,
  onAdd,
}: {
  section: WardrobeSection;
  onAdd: (item: WardrobeItem, section: WardrobeSection) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <h4 className="text-lg font-semibold leading-tight">{section.title}</h4>
        {section.subtitle ? (
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.photo ? (
              <div className="aspect-[4/3] w-full bg-muted/30 relative">
                <Image
                  src={item.photo}
                  alt={`${item.namePt} (${item.nameIt})`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                  priority={false}
                />
              </div>
            ) : null}
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  <span className="font-semibold">{item.nameIt}</span>
                  <span className="ml-2 align-middle rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {item.namePt}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">Original em italiano + etiqueta em PT</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={`O que é ${item.namePt}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm hover:bg-muted"
                    >
                      i
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs leading-relaxed">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <Button
                size="sm"
                variant="outline"
                aria-label={`Adicionar ${item.namePt} ao orçamento`}
                onClick={() => onAdd(item, section)}
              >
                Adicionar ao orçamento
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function CatalogItemCard({
  section,
  item,
  onAdd,
}: {
  section: WardrobeSection;
  item: WardrobeItem;
  onAdd: (item: WardrobeItem, section: WardrobeSection) => void;
}) {
  return (
    <Card key={`${section.key}-${item.id}`} className="overflow-hidden">
      {item.photo ? (
        <div className="aspect-[4/3] w-full bg-muted/30 relative">
          <Image
            src={item.photo}
            alt={`${item.namePt} (${item.nameIt})`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            unoptimized
            priority={false}
          />
        </div>
      ) : null}
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="text-base">
            <span className="font-semibold">{item.nameIt}</span>
            <span className="ml-2 align-middle rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {item.namePt}
            </span>
          </CardTitle>
          <CardDescription className="text-xs">Sugestão do Catálogo</CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                aria-label={`O que é ${item.namePt}`}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm hover:bg-muted"
              >
                i
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs leading-relaxed">
              {item.tooltip}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <Button
          size="sm"
          variant="outline"
          aria-label={`Adicionar ${item.namePt} ao orçamento`}
          onClick={() => onAdd(item, section)}
        >
          Adicionar ao orçamento
        </Button>
      </CardContent>
    </Card>
  );
}