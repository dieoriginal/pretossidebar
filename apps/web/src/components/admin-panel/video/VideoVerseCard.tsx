import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { jsPDF } from "jspdf";

type PricedOption = { label: string; value: string; price: number };

// HEAD OPTIONS
const hairstyleOptions = [
  { label: "Tinta Preta", value: "tintapreta", price: 6 },
  { label: "Relaxing", value: "moderno", price: 9 },
  { label: "Retoque", value: "criativo", price: 5 },
];

const glassesOptions = [
  { label: "Sem Óculos", value: "sem_oculos", price: 0 },
  { label: "Com Óculos Estilosos", value: "com_oculos", price: 15 },
];

const headWearOptions = [
  { label: "Gorro Personalizado", value: "gorro_personalizado", price: 5 },
  { label: "Gorro", value: "gorro", price: 3 },
  { label: "Babushka", value: "babushka", price: 4 },
  { label: "Russian Headwear", value: "russian_headwear", price: 6 },
  { label: "Militar Camoflage", value: "militar_camoflage", price: 7 },
];

// UPPER OPTIONS
const superiorOptions = [
  { label: "Let's Copy DTF", value: "dtf", price: 11 },
  { label: "Tshirt Vazia", value: "brincos", price: 9 },
  { label: "Balmacan Personalizada", value: "balmacan", price: 5 },
  { label: "Colete", value: "colete", price: 15 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Chains Personalizado", value: "chainspersonalizados", price: 560 },
  { label: "Gravata Ascot", value: "gravata_ascot", price: 10 },
];

// LOWER OPTIONS (Pants)
const pantsOptions = [
  { label: "Custom Pants", value: "custom_pants", price: 20 },
  { label: "Zara Pants", value: "zara_pants", price: 25 },
  { label: "Pants Chain", value: "pants_chain", price: 10 },
];

// FEET OPTIONS (Shoes)
const shoesOptions = [
  { label: "Zara Boots", value: "zara_boots", price: 40 },
  { label: "Bershka Boots", value: "bershka_boots", price: 35 },
];

// ACCESSORY OPTIONS
const neckAccessoryOptions = [
  { label: "Nenhum", value: "nenhum", price: 0 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Correntes", value: "correntes", price: 130 },
];

const braceletOptions = [
  { label: "Glitter Bracelet (€3.50)", value: "glitter_bracelet", price: 3.5 },
  { label: "Personalized Bracelet", value: "personalized_bracelet", price: 15 },
];

const watchOptions = [
  { label: "Watch", value: "watch", price: 20 },
];

const beltOptions = [
  { label: "TRIPARTE BELT", value: "triparte_belt", price: 30 },
];

// =====================
// Catálogo Visual (merge de src/app/vestuario/page.tsx)
// =====================
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

// =====================
// Mapeamento para categorias existentes do planner
// =====================
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
  onAdd?: (item: WardrobeItem, section: WardrobeSection) => void;
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
            {onAdd ? (
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
            ) : null}
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
  onAdd?: (item: WardrobeItem, section: WardrobeSection) => void;
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
      {onAdd ? (
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
      ) : null}
    </Card>
  );
}

const WardrobePlanningPage = () => {
  // State for each section
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

  // State for custom item addition
  const [customItems, setCustomItems] = useState<{ name: string; category: string; price: number }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Group catalog items by existing planner categories for inline suggestions
  const groupedCatalog = useMemo(() => {
    const entries: Array<{ section: WardrobeSection; item: WardrobeItem; category?: AllowedCategory }>[] = [] as any;
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

  // Create summary object for display
  const wardrobeSummary = useMemo(() => {
    return {
      head: {
        hairstyles: selectedHairstyles,
        glasses: selectedGlasses,
        headWear: selectedHeadWear,
      },
      upper: selectedSuperior,
      lower: selectedPants,
      feet: selectedShoes,
      accessories: {
        neckAccessories: selectedNeckAccessories,
        bracelets: selectedBracelets,
        watch: selectedWatch,
        belt: selectedBelt,
      },
      customItems,
      totalPrice,
    };
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
  ]);

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

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Outfit</h1>
      <p>Selecione ou personalize os itens do seu vestuário para o videoclip</p>

     

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
          {JSON.stringify(wardrobeSummary, null, 2)}
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

export default WardrobePlanningPage;
