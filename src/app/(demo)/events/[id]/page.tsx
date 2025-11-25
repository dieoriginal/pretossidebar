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
import { addVenue } from "@/lib/venuesDb";
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
  overview: {
    eventName: string;
    eventType: string;
    date: string;
    venue: string;
    capacity: number;
    description: string;
    organizerName: string;
    organizerContact: string;
  };
  finance: {
    budget: number;
    ticketPrice: number;
    sponsorship: number;
    expenses: Array<{ name: string; amount: number }>;
    venueSplit: number; // 70-30 split
    cachetPago?: number; // Para third party events
  };
  lineup: {
    artists: Array<{ name: string; time: string; fee: number; contact: string; instagram: string; spotify: string }>;
    soundcheck: string;
    curfew: string;
  };
  production: {
    sound: string;
    lighting: string;
    stage: string;
    crew: Array<{ role: string; name: string; contact: string; gear?: string; deal?: string }>;
  };
  logistics: {
    address: string;
    parking: string;
    loadIn: string;
    loadOut: string;
    catering: string;
    material: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>; // Material que vai levar
    travelOutfit: Array<{ id: string; name: string; category: string; checked: boolean; returned: boolean }>; // Roupa que vai vestir até chegar no local
  };
  tickets: {
    totalTickets: number;
    soldTickets: number;
    priceTiers: Array<{ name: string; price: number; quantity: number }>;
  };
  marketing: {
    socialMedia: Array<{ platform: string; content: string; scheduled: string }>;
    pressRelease: string;
    influencers: Array<{ name: string; reach: number; fee: number }>;
  };
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
    travelDetails: string;
    accommodation: string;
    clothingStores: string;
    meals: string;
    soundcheckTime: string;
    venueOpenTime: string;
    studioVisits: string;
    voicePractice: string;
    hydrationReminders: string;
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
      travelDetails: "",
      accommodation: "",
      clothingStores: "",
      meals: "",
      soundcheckTime: "",
      venueOpenTime: "",
      studioVisits: "",
      voicePractice: "",
      hydrationReminders: "",
      otherNotes: "",
    },
  });

  // Load event from database if ID exists and is not "new"
  useEffect(() => {
    // Function to normalize event data (ensure all new fields exist)
    const normalizeEventData = (data: any): EventData => {
      return {
        ...data,
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

  // Auto-save when eventData changes (debounced)
  useEffect(() => {
    if (!isLoading && eventData) {
      const timer = setTimeout(() => {
        const eventToSave = { ...eventData, id: eventData.id || params.id || `evento-${Date.now()}` };
        updateEvent(eventToSave);
        setLastSaved(new Date());
      }, 2000); // Save after 2 seconds of inactivity

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventData, isLoading, params.id]);

  const handleManualSave = () => {
    const eventToSave = { ...eventData, id: eventData.id || params.id || `evento-${Date.now()}` };
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
      name: "Cenário/Notas de Ensaio",
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
    const margin = 10;
    let yPosition = margin;

    const addSectionTitle = (title: string) => {
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(title, margin, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
    };

    const addText = (text: string, isBold = false) => {
      if (isBold) doc.setFont("helvetica", "bold");
      doc.text(text, margin, yPosition);
      yPosition += 7;
      if (isBold) doc.setFont("helvetica", "normal");
    };

    const addList = (label: string, items: any[]) => {
      addText(label, true);
      items.forEach(item => {
        addText(`- ${JSON.stringify(item)}`);
      });
    };

    // Overview
    addSectionTitle("Visão Geral");
    addText(`Nome do Evento: ${eventData.overview.eventName}`);
    addText(`Tipo: ${eventData.overview.eventType}`);
    addText(`Data: ${new Date(eventData.overview.date).toLocaleDateString("pt-PT")}`);
    addText(`Local: ${eventData.overview.venue} (${eventData.logistics.address})`);
    addText(`Capacidade: ${eventData.overview.capacity}`);
    addText(`Descrição: ${eventData.overview.description}`);
    addText(`Organizador: ${eventData.overview.organizerName} - ${eventData.overview.organizerContact}`);
    yPosition += 5;

    // Financeiro
    addSectionTitle("Financeiro");
    addText(`Orçamento Total: €${eventData.finance.budget}`);
    addText(`Preço do Bilhete: €${eventData.finance.ticketPrice}`);
    addText(`Patrocínios: €${eventData.finance.sponsorship}`);
    addText(`Divisão com Venue: ${eventData.finance.venueSplit}% venue / ${100 - eventData.finance.venueSplit}% organizador`);
    if (eventData.overview.eventType === "third-party-event") {
      addText(`Cachet Pago: €${eventData.finance.cachetPago || 0}`);
    }
    addSectionTitle("Despesas");
    eventData.finance.expenses.forEach(exp => addText(`${exp.name}: €${exp.amount}`));
    yPosition += 5;

    // Line-up
    addSectionTitle("Line-up");
    addText(`Soundcheck: ${eventData.lineup.soundcheck}`);
    addText(`Curfew: ${eventData.lineup.curfew}`);
    addList("Artistas", eventData.lineup.artists);
    yPosition += 5;

    // Equipa (Production)
    addSectionTitle("Equipa");
    addText(`Som: ${eventData.production.sound}`);
    addText(`Iluminação: ${eventData.production.lighting}`);
    addText(`Palco: ${eventData.production.stage}`);
    addList("Crew", eventData.production.crew);
    yPosition += 5;

    // Vestuário
    addSectionTitle("Vestuário");
    addList("Cabelo", eventData.wardrobe.selectedHairstyles);
    addList("Óculos", eventData.wardrobe.selectedGlasses);
    addList("Head Wear", eventData.wardrobe.selectedHeadWear);
    addList("Parte Superior", eventData.wardrobe.selectedSuperior);
    addList("Pants", eventData.wardrobe.selectedPants);
    addList("Shoes", eventData.wardrobe.selectedShoes);
    addList("Neck Accessories", eventData.wardrobe.selectedNeckAccessories);
    addList("Bracelets", eventData.wardrobe.selectedBracelets);
    addList("Watch", eventData.wardrobe.selectedWatch);
    addList("Belt", eventData.wardrobe.selectedBelt);
    addList("Custom Items", eventData.wardrobe.customItems);
    addText(`Total Vestuário: €${eventData.wardrobe.totalPrice}`);
    yPosition += 5;

    // Logística
    addSectionTitle("Logística");
    addText(`Endereço Completo: ${eventData.logistics.address}`);
    addText(`Estacionamento: ${eventData.logistics.parking}`);
    addText(`Load-In: ${eventData.logistics.loadIn}`);
    addText(`Load-Out: ${eventData.logistics.loadOut}`);
    addText(`Catering: ${eventData.logistics.catering}`);
    if (eventData.logistics.material && eventData.logistics.material.length > 0) {
      addSectionTitle("Material a Levar");
      eventData.logistics.material.forEach((item) => {
        const status = item.checked ? "✓ Levado" : "○ Não levado";
        const returned = item.returned ? " ✓ Devolvido" : "";
        addText(`${item.category}: ${item.name} - ${status}${returned}`);
      });
    }
    if (eventData.logistics.travelOutfit && eventData.logistics.travelOutfit.length > 0) {
      addSectionTitle("Roupa até Chegar no Local");
      eventData.logistics.travelOutfit.forEach((item) => {
        const status = item.checked ? "✓ Levado" : "○ Não levado";
        const returned = item.returned ? " ✓ Devolvido" : "";
        addText(`${item.category}: ${item.name} - ${status}${returned}`);
      });
    }
    yPosition += 5;

    // Bilheteira
    addSectionTitle("Bilheteira");
    addText(`Total Bilhetes: ${eventData.tickets.totalTickets}`);
    addText(`Vendidos: ${eventData.tickets.soldTickets}`);
    addList("Preços por Categoria", eventData.tickets.priceTiers);
    yPosition += 5;

    // Marketing
    addSectionTitle("Marketing");
    addText(`Press Release: ${eventData.marketing.pressRelease}`);
    addList("Redes Sociais", eventData.marketing.socialMedia);
    addList("Influencers", eventData.marketing.influencers);
    yPosition += 5;

    doc.save(`${eventData.overview.eventName}_itinerario_completo.pdf`);
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
              <div>
                <Label htmlFor="venue">Local</Label>
                <div className="relative">
                  <Input
                    id="venue"
                    value={eventData.overview.venue}
                    onChange={(e) => {
                      setEventData(prev => ({
                        ...prev,
                        overview: { ...prev.overview, venue: e.target.value }
                      }));
                      setShowVenueDropdown(true);
                    }}
                    onFocus={() => setShowVenueDropdown(true)}
                    onBlur={() => {
                      // Delay hiding dropdown to allow for clicks
                      setTimeout(() => setShowVenueDropdown(false), 200);
                    }}
                    placeholder="Ex: Armazém X"
                    className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                  />
                  {showVenueDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {VENUES_DATABASE
                        .filter(venue => {
                          const searchTerm = eventData.overview.venue.toLowerCase();
                          return (
                            venue.name.toLowerCase().includes(searchTerm) ||
                            venue.city.toLowerCase().includes(searchTerm) ||
                            venue.address.toLowerCase().includes(searchTerm) ||
                            venue.equipment.toLowerCase().includes(searchTerm)
                          );
                        })
                        .length === 0 ? (
                          <div className="p-3 text-slate-500 dark:text-slate-400 text-sm">
                            Nenhum local encontrado
                          </div>
                        ) : (
                          VENUES_DATABASE
                            .filter(venue => {
                              const searchTerm = eventData.overview.venue.toLowerCase();
                              return (
                                venue.name.toLowerCase().includes(searchTerm) ||
                                venue.city.toLowerCase().includes(searchTerm) ||
                                venue.address.toLowerCase().includes(searchTerm) ||
                                venue.equipment.toLowerCase().includes(searchTerm)
                              );
                            })
                            .map((venue) => (
                          <div
                            key={venue.id}
                            className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                            onClick={() => {
                              setEventData(prev => ({
                                ...prev,
                                overview: {
                                  ...prev.overview,
                                  venue: venue.name,
                                  capacity: parseInt(venue.capacity.split('-')[1]?.replace(/[^\d]/g, '')) || parseInt(venue.capacity.replace(/[^\d]/g, '')) || 0
                                },
                                logistics: {
                                  ...prev.logistics,
                                  address: venue.address
                                }
                              }));
                              setShowVenueDropdown(false);
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {venue.name}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3 w-3" />
                                    {venue.address}
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Users className="h-3 w-3" />
                                    Capacidade: {venue.capacity}
                                  </div>
                                  {venue.phone && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Phone className="h-3 w-3" />
                                      {venue.phone}
                                    </div>
                                  )}
                                  {venue.email && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Mail className="h-3 w-3" />
                                      {venue.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                                {venue.city}
                              </div>
                            </div>
                          </div>
                        ))
                        )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="capacity">Capacidade</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={eventData.overview.capacity}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    overview: { ...prev.overview, capacity: parseInt(e.target.value) || 0 }
                  }))}
                  placeholder="350"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
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
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="budget">Orçamento Total (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={eventData.finance.budget}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { ...prev.finance, budget: parseInt(e.target.value) || 0 }
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
                  value={eventData.finance.ticketPrice}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { ...prev.finance, ticketPrice: parseInt(e.target.value) || 0 }
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
                  value={eventData.finance.sponsorship}
                  onChange={(e) => setEventData(prev => ({
                    ...prev,
                    finance: { ...prev.finance, sponsorship: parseInt(e.target.value) || 0 }
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
          const margin = 10;
          let yPosition = margin;

          // Title
          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          doc.text("ITINERÁRIO DO DIA DO SHOW", pageWidth / 2, yPosition, { align: "center" });
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
            doc.text(`${title}:`, margin, yPosition);
            yPosition += 7;
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            const lines = doc.splitTextToSize(content, pageWidth - 2 * margin);
            lines.forEach((line: string) => {
              if (yPosition > 280) {
                doc.addPage();
                yPosition = margin;
              }
              doc.text(line, margin + 5, yPosition);
              yPosition += 6;
            });
            yPosition += 3;
          };

          // All sections
          addSection("Detalhes de Viagem", eventData.dayItinerary.travelDetails || "");
          addSection("Alojamento", eventData.dayItinerary.accommodation || "");
          addSection("Lojas de Roupa", eventData.dayItinerary.clothingStores || "");
          addSection("Refeições", eventData.dayItinerary.meals || "");
          addSection("Horário de Soundcheck", eventData.dayItinerary.soundcheckTime || eventData.lineup.soundcheck || "");
          addSection("Horário de Abertura do Venue", eventData.dayItinerary.venueOpenTime || "");
          addSection("Visitas a Estúdios", eventData.dayItinerary.studioVisits || "");
          addSection("Práticas de Voz / Aquecimento", eventData.dayItinerary.voicePractice || "");
          addSection("Lembretes de Hidratação", eventData.dayItinerary.hydrationReminders || "");
          addSection("Outras Notas", eventData.dayItinerary.otherNotes || "");

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

            <div>
              <Label htmlFor="travelDetails">Detalhes de Viagem</Label>
              <Textarea
                id="travelDetails"
                value={eventData.dayItinerary.travelDetails}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, travelDetails: e.target.value }
                }))}
                placeholder="Ex: Comprar bilhetes, ir ao local, transporte..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={3}
              />
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

            <div>
              <Label htmlFor="clothingStores">Lojas de Roupa</Label>
              <Textarea
                id="clothingStores"
                value={eventData.dayItinerary.clothingStores}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, clothingStores: e.target.value }
                }))}
                placeholder="Ex: Loja ABC na Rua XYZ, horários..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="meals">Refeições</Label>
              <Textarea
                id="meals"
                value={eventData.dayItinerary.meals}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, meals: e.target.value }
                }))}
                placeholder="Ex: Almoço no restaurante X, jantar no local Y..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={2}
              />
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

            <div>
              <Label htmlFor="studioVisits">Visitas a Estúdios / Colaborações</Label>
              <Textarea
                id="studioVisits"
                value={eventData.dayItinerary.studioVisits}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, studioVisits: e.target.value }
                }))}
                placeholder="Ex: Estúdio com artista da zona para fazer tempo..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="voicePractice">Práticas de Voz / Aquecimento</Label>
              <Textarea
                id="voicePractice"
                value={eventData.dayItinerary.voicePractice}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, voicePractice: e.target.value }
                }))}
                placeholder="Ex: Práticas para não fatigar a voz, rotinas de aquecimento..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="hydrationReminders">Lembretes de Hidratação</Label>
              <Textarea
                id="hydrationReminders"
                value={eventData.dayItinerary.hydrationReminders}
                onChange={(e) => setEventData(prev => ({
                  ...prev,
                  dayItinerary: { ...prev.dayItinerary, hydrationReminders: e.target.value }
                }))}
                placeholder="Ex: Manter-se hidratado, beber água regularmente..."
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                rows={2}
              />
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