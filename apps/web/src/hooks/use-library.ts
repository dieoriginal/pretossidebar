import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TitleCategory = "Trackz" | "Álbuns" | "Tournés" | "Ideias de Som";
export type TitleSuggestion = {
  id: string;
  title: string;
  category: TitleCategory;
  artist?: string;
  producer?: string;
  description?: string;
};

export type TshirtText = { id: string; text: string; description?: string };

export type Adlib = { id: string; phrase: string; voiceType?: string; how?: string; music?: string; album?: string };

export type GearItem = { id: string; name: string; type?: string; notes?: string };

export type SymbolsConfig = {
  favorites: string[]; // user-preferred symbols
  mapping?: Record<string, string>; // optional char replacements
  sprinkleRatio?: number; // 0..1 how often to insert
};

export type LibraryState = {
  titles: TitleSuggestion[];
  tshirts: TshirtText[];
  adlibs: Adlib[];
  gear: GearItem[];
  symbols: SymbolsConfig;
  hitCriteria: HitCriterion[];
  hitAdoptions: HitFrameworkAdoptions; // projectId -> criterionId -> state
};

export type HitCriterion = {
  id: string;
  title: string;
  category: string;
  description?: string;
  examples?: string[];
  tags?: string[];
  refs?: string[];
  createdAt?: string;
};

export type HitFrameworkAdoptions = Record<string, Record<string, { adopted: boolean; notes?: string }>>;

const seedTitles: TitleSuggestion[] = [
  { id: "t1", title: "Umwelt", category: "Trackz" },
  { id: "t2", title: "NERD PRETO", category: "Álbuns" },
  { id: "t3", title: "Viver À Maior", category: "Ideias de Som" },
  { id: "t4", title: "Senex", category: "Trackz" },
  { id: "t5", title: "Arte do Sotão", category: "Álbuns" },
  { id: "t6", title: "Gás, Gás", category: "Ideias de Som" },
  { id: "t7", title: "eudaimonia", category: "Trackz" },
  { id: "t8", title: "White Collar Hoes", category: "Álbuns" },
  { id: "t9", title: "Sátiro", category: "Trackz" },
  { id: "t10", title: "Senex", category: "Álbuns" },
  { id: "t11", title: "Domicílio", category: "Trackz" },
  { id: "t12", title: "Rapaz Sintético", category: "Álbuns" },
  { id: "t13", title: "O Efetual das Mulheres", category: "Trackz" },
  { id: "t14", title: "eudaimonia", category: "Álbuns" },
  { id: "t15", title: "QWERTY", category: "Tournés" },
  {
    id: "t16",
    title: "Pudor feminino",
    category: "Ideias de Som",
    description:
      "O pudor feminino é a tendência de proteger a intimidade, sendo uma questão cultural e pessoal que varia entre os indivíduos…",
  },
  { id: "t17", title: "Giga Bites vs Swagg", category: "Ideias de Som", description: "Experimento ambíguo audiovisual." },
  { id: "t18", title: "Inspector Gadget", category: "Ideias de Som" },
];

const seedTshirts: TshirtText[] = [
  { id: "s1", text: "FODA-SE AMANHÃ" },
  { id: "s2", text: "INVEJA É AMOR" },
  { id: "s3", text: "NÃO SE FAZ O FUTURO COM O PASSADO" },
  { id: "s4", text: "WHEN U BROKE U KANT NEVER BE ALONE" },
  { id: "s5", text: "IDOLS BECOME RIVALS" },
  { id: "s6", text: "VL00G DÜ SH❹W ®" },
  { id: "s7", text: "HOJE ☆ 22:00 +1 GMT **" },
  { id: "s8", text: "Zara told Benz He Next*" },
  { id: "s9", text: "★☆ ! shot by @_tomaswork ³³³ ®Ⓕ ²" },
];

const seedAdlibs: Adlib[] = [
  { id: "a1", phrase: "FALA MEMO" },
  { id: "a2", phrase: "LHE FALA" },
  { id: "a3", phrase: "TXE TXE TXE", music: "Diepretty" },
  { id: "a4", phrase: "BUH BUH BUH", music: "Fredo Santana / Carti" },
  { id: "a5", phrase: "YA!", voiceType: "High Pitch", music: "Carti (2017)" },
  { id: "a6", phrase: "WI WI WI", music: "Fredo Santana" },
  { id: "a7", phrase: "Fomos", music: "Diepretty" },
  { id: "a8", phrase: "XE!", music: "Chief Keef" },
  { id: "a9", phrase: "What?", how: "Quê?", music: "Carti" },
  { id: "a10", phrase: "What?", how: "Ewe / Eh!" },
  { id: "a11", phrase: "(fODASS)", how: "DASSSSSSS", music: "Diepretty", album: "Perdi Meu Emprego" },
  { id: "a12", phrase: "GANGER", music: "Slime Dollaz / NGeeYL" },
  { id: "a13", phrase: "GRRRAA!", music: "Fredo Santana" },
  { id: "a14", phrase: "Yeaaaaaaaah", music: "Gucci Mane" },
  { id: "a15", phrase: "Nhooooooooo!", music: "Gucci Mane" },
  { id: "a16", phrase: "Phhiu!", music: "Gucci Mane", album: "Straight Drop (0:38)", how: "Mr. Clean, The Middle Man" },
  { id: "a17", phrase: "Mxua! (Kiss)", music: "Gucci Mane", album: "Straight Drop ()", how: "Mr. Clean, The Middle Man" },
  { id: "a18", phrase: "Hold Up", how: "CALMA LÁ" },
  { id: "a19", phrase: "Porra!", music: "Future" },
  { id: "a20", phrase: "Pera Lá?", music: "Future" },
  { id: "a21", phrase: "Naaaaaaaaah", music: "Chief Keef" },
  { id: "a22", phrase: "Ha! (2x)", how: "Sussurro", music: "21 Savage, Fredo" },
  { id: "a23", phrase: "HELL NA!", music: "GLO" },
  { id: "a24", phrase: "TSI TSI TSI TSI TSI TSI TSI TSI TSI TSI", music: "Carti" },
  { id: "a25", phrase: "Repara" },
  { id: "a26", phrase: "imagina" },
  { id: "a27", phrase: "Eh" },
  { id: "a28", phrase: "Orroh?" },
  { id: "a29", phrase: "Monengue (Radio)" },
  { id: "a30", phrase: "Yeah", music: "Gucci Mane" },
  { id: "a31", phrase: "Wó", how: "Wop", music: "Gucci Mane", album: "Straight Drop (01:26)", },
  { id: "a32", phrase: "Tamuavi" },
  { id: "a33", phrase: "SET SET", how: "Goofy", music: "NGYeeL e Slime Dollaz" },
  { id: "a34", phrase: "Truuuuuue True  True", music: "Chief Keef" },
  { id: "a35", phrase: "Viste?", how: "Agressivo", music: "Bitch" },
  { id: "a36", phrase: "G, G G", how: "Dji, dJI Dji (Então Caralho)" },
  { id: "a37", phrase: "Nakilo", how: "Naquilo", music: "Diepretty" },
];

const seedGear: GearItem[] = [
  { id: "g1", name: "Sony Handycam CCD-TRV58 Hi8 Camcorder", type: "camera" },
];

const seedSymbols: SymbolsConfig = {
  favorites: [
    "☆𝗜𝗡𝗧𝗝¹⁷∯⁺",
    "⚧︎",
    "∾",
    "∯",
    "≵",
    "⊶",
    "⊷",
    "⋨",
    "❴❵",
    "⟢",
    "⟣",
    "⧁",
    "⨔",
    "₂",
    "ø",
  ],
  sprinkleRatio: 0.15,
  mapping: {
    // allow user to edit later in UI
  },
};

export type LibraryStore = LibraryState & {
  addTitle: (t: Omit<TitleSuggestion, "id">) => void;
  removeTitle: (id: string) => void;
  addTshirt: (t: Omit<TshirtText, "id">) => void;
  removeTshirt: (id: string) => void;
  addAdlib: (a: Omit<Adlib, "id">) => void;
  removeAdlib: (id: string) => void;
  addGear: (g: Omit<GearItem, "id">) => void;
  removeGear: (id: string) => void;
  updateSymbols: (cfg: Partial<SymbolsConfig>) => void;
  addHitCriterion: (c: Omit<HitCriterion, "id" | "createdAt">) => void;
  updateHitCriterion: (id: string, patch: Partial<HitCriterion>) => void;
  removeHitCriterion: (id: string) => void;
  setHitAdoption: (projectId: string, criterionId: string, adopted: boolean, notes?: string) => void;
};

// Seed for Hit Framework criteria, based on the user's guidance
const seedHitCriteria: HitCriterion[] = [
  { id: "h1", title: "Congruência de estado de espírito + instrumental", category: "Narrativa & Emoção", description: "Alinhar emoção real do artista com a base/instrumental que ressona com esse estado.", examples: ["P$IC00PATHA"], tags: ["mood-match", "energia" ] },
  { id: "h2", title: "Narração vulnerável e ultra detalhada", category: "Narrativa & Emoção", description: "Relatar a situação do sujeito com detalhe e franqueza.", examples: ["Perdi Meu Emprego", "Moneyfesta", "Merda Toda"], tags: ["história", "confessional"] },
  { id: "h3", title: "Locais e experiências sensoriais locais", category: "Contexto Local", description: "Falar de lugares, comida, dificuldades técnicas/emocionais do sítio da audiência.", examples: ["Vasco da Gama", "Comboio", "Pica"], tags: ["Lisboa", "quotidiano"] },
  { id: "h4", title: "Arquitetura de efeitos sonoros", category: "Design Sonoro", description: "Efetuar sound design que enfatiza a história, capturando tudo que pertence ao enredo." },
  { id: "h5", title: "Imoralidade oculta > embelezamentos", category: "Narrativa & Emoção", description: "Revelar o lado imoral/real em vez de polir tudo.", examples: ["Psicopatha", "Lunar Boi"], tags: ["crueza"] },
  { id: "h6", title: "Performance vocal com nuances humanas", category: "Voz & Interpretação", examples: ["Corneto Freestyle"], tags: ["dinâmica", "respiração", "textura"] },
  { id: "h7", title: "Camadas de vozes complexas", category: "Voz & Interpretação", description: "Arranjos vocais com camadas e contrapontos." },
  { id: "h8", title: "Beatmaking fora da caixa", category: "Produção", description: "Arriscar no design rítmico e timbres para provocar reação." },
  { id: "h9", title: "Automação de efeitos significativa", category: "Produção", description: "Automar FX para contar melhor a história." },
  { id: "h10", title: "Autenticidade sem desculpas", category: "Identidade", examples: ["Rapaz Sinistro"], tags: ["auth"] },
  { id: "h11", title: "Erudição e literatura", category: "Lírica & Conteúdo", examples: ["Veredito"] },
  { id: "h12", title: "Pronúncia/dicção e sotaque ressonante", category: "Voz & Interpretação", description: "Pronúncia que reforça o tema, sobretudo ao cantar problemas reais." },
  { id: "h13", title: "Microfone de alta fasquia", category: "Tecnologia", tags: ["captura", "clareza"] },
  { id: "h14", title: "Real-time UAD recording", category: "Tecnologia" },
  { id: "h15", title: "Uso da app FTM", category: "Processo" },
  { id: "h16", title: "Diagnósticos das ineficiências da modernidade", category: "Lírica & Conteúdo" },
  { id: "h17", title: "Filosofia como música", category: "Lírica & Conteúdo" },
  { id: "h18", title: "Voz como instrumento", category: "Voz & Interpretação" },
  { id: "h19", title: "Quanto mais estranho melhor", category: "Identidade" },
  { id: "h20", title: "Falar dos problemas da sociedade", category: "Lírica & Conteúdo" },
  { id: "h21", title: "Mencionar nomes comuns (p.ex., Rita)", category: "Contexto Local" },
  { id: "h22", title: "Instrumentais meticulosamente dogmáticos", category: "Produção" },
  { id: "h23", title: "Artwork super criativa", category: "Visual & Marca", examples: ["Morte Original", "Radical Red", "Metaverse"] },
  { id: "h24", title: "Vestuário e cabelo no videoclipe", category: "Visual & Marca" },
  { id: "h25", title: "Videoclipes com storytelling", category: "Visual & Marca" },
  { id: "h26", title: "Mix & master de alta fasquia", category: "Tecnologia", description: "Rica em técnicas e texturas para os ouvidos." },
];

export const useLibrary = create(
  persist<LibraryStore>(
    (set, get) => ({
      titles: seedTitles,
      tshirts: seedTshirts,
      adlibs: seedAdlibs,
      gear: seedGear,
      symbols: seedSymbols,
      hitCriteria: seedHitCriteria,
      hitAdoptions: {},
      addTitle: (t) => set({ titles: [{ id: `t-${Date.now()}`, ...t }, ...get().titles] }),
      removeTitle: (id) => set({ titles: get().titles.filter((x) => x.id !== id) }),
      addTshirt: (t) => set({ tshirts: [{ id: `s-${Date.now()}`, ...t }, ...get().tshirts] }),
      removeTshirt: (id) => set({ tshirts: get().tshirts.filter((x) => x.id !== id) }),
      addAdlib: (a) => set({ adlibs: [{ id: `a-${Date.now()}`, ...a }, ...get().adlibs] }),
      removeAdlib: (id) => set({ adlibs: get().adlibs.filter((x) => x.id !== id) }),
      addGear: (g) => set({ gear: [{ id: `g-${Date.now()}`, ...g }, ...get().gear] }),
      removeGear: (id) => set({ gear: get().gear.filter((x) => x.id !== id) }),
      updateSymbols: (cfg) => set({ symbols: { ...get().symbols, ...cfg } }),
      addHitCriterion: (c) => set({ hitCriteria: [{ id: `h-${Date.now()}`, createdAt: new Date().toISOString(), ...c }, ...get().hitCriteria] }),
      updateHitCriterion: (id, patch) => set({ hitCriteria: get().hitCriteria.map((x) => (x.id === id ? { ...x, ...patch } : x)) }),
      removeHitCriterion: (id) => set({ hitCriteria: get().hitCriteria.filter((x) => x.id !== id) }),
      setHitAdoption: (projectId, criterionId, adopted, notes) =>
        set(() => {
          const current = get().hitAdoptions[projectId] || {};
          return {
            hitAdoptions: {
              ...get().hitAdoptions,
              [projectId]: { ...current, [criterionId]: { adopted, notes } },
            },
          };
        }),
    }),
    { name: "creativeLibrary", storage: createJSONStorage(() => localStorage) }
  )
);

export function renderSymbolic(input: string, cfg: SymbolsConfig): string {
  const map = cfg.mapping || {};
  let out = input
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("");
  if (cfg.favorites.length && (cfg.sprinkleRatio ?? 0) > 0) {
    const ratio = Math.max(0, Math.min(1, cfg.sprinkleRatio ?? 0));
    out = out
      .split(/(\s+)/)
      .map((tok) => {
        if (/^\s+$/.test(tok)) return tok;
        return Math.random() < ratio ? `${tok} ${cfg.favorites[Math.floor(Math.random() * cfg.favorites.length)]}` : tok;
      })
      .join("");
  }
  return out;
}
