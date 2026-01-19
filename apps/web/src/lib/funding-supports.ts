export type FundingCategory =
  | "NACIONAL"
  | "FUNDAÇÃO"
  | "EU/INTERNACIONAL"
  | "REGIONAL"
  | "PRIVADO"
  | "FISCAL/SOCIAL";

export type ProfileTag = "solo" | "banda" | "entidade" | "jovem<30";
export type ProjectTag =
  | "criacao"
  | "producao"
  | "circulacao"
  | "formacao"
  | "mobilidade"
  | "internacionalizacao"
  | "programacao";

export interface FundingProgram {
  id: string;
  name: string;
  entity: string;
  category: FundingCategory;
  focus: string[];
  amount?: string;
  eligibility: string[];
  profileTags: ProfileTag[];
  projectTags: ProjectTag[];
  deadline?: string;
  link: string;
}

export const fundingPrograms: FundingProgram[] = [
  {
    id: "dgartes-sustentado-25-26",
    name: "Programa de Apoio Sustentado às Artes 2025–2026",
    entity: "DGARTES (Ministério da Cultura)",
    category: "NACIONAL",
    focus: ["música", "programação", "estrutura"],
    amount: "até ~240.000€/ano (por patamar)",
    eligibility: [
      "Entidades privadas com 4+ anos de atividade profissional",
      "Equipa permanente com vínculo laboral (comprovado SS)",
    ],
    profileTags: ["entidade"],
    projectTags: ["programacao", "producao", "criacao"],
    deadline: "2024-07 (encerrado para 2025)",
    link: "https://www.dgartes.gov.pt/pt/node/7334",
  },
  {
    id: "dgartes-projetos-2025-musica",
    name: "Programa de Apoio a Projetos 2025 — Música e Ópera",
    entity: "DGARTES",
    category: "NACIONAL",
    focus: ["criação", "edição", "apresentação"],
    amount: "dotação global setorial; por projeto variável",
    eligibility: ["Pessoas singulares, coletivas e grupos informais"],
    profileTags: ["solo", "banda", "entidade"],
    projectTags: ["criacao", "producao", "circulacao"],
    deadline: "2025-01 (janelas por área)",
    link: "https://www.dgartes.gov.pt/pt/apoio/8100",
  },
  {
    id: "gda-circulacao",
    name: "Apoio à Circulação de Espetáculos",
    entity: "Fundação GDA",
    category: "FUNDAÇÃO",
    focus: ["circulação", "carreira", "internacional"],
    amount: "não especificado (tipicamente milhares de euros)",
    eligibility: ["Artistas intérpretes/executantes com datas confirmadas"],
    profileTags: ["solo", "banda"],
    projectTags: ["circulacao"],
    deadline: "A partir de 2025-02",
    link: "https://www.fundacaogda.pt/candidaturas-apoio-circulacao-abrem-dia-3/",
  },
  {
    id: "gulbenkian-criacao-artistica",
    name: "Apoio à Criação Artística",
    entity: "Fundação Calouste Gulbenkian",
    category: "FUNDAÇÃO",
    focus: ["criação", "interdisciplinar"],
    amount: "4.000€–16.000€",
    eligibility: ["Artistas com domicílio fiscal em Portugal"],
    profileTags: ["solo", "banda", "entidade"],
    projectTags: ["criacao", "producao"],
    deadline: "2025-01-15 → 2025-03-10",
    link: "https://gulbenkian.pt/apoios-lista/apoio-a-criacao-artistica/",
  },
  {
    id: "ipdj-jovens-criadores",
    name: "Bolsas Jovens Criadores",
    entity: "IPDJ / CNC",
    category: "NACIONAL",
    focus: ["criação", "jovens"],
    amount: "até 3.000€",
    eligibility: ["Jovens até 30 anos"],
    profileTags: ["jovem<30", "solo", "banda"],
    projectTags: ["criacao", "formacao"],
    deadline: "anual (abr/mai)",
    link: "https://ipdj.gov.pt/protocolos-de-apoio-na-area-da-cultura",
  },
  {
    id: "mme-livemx",
    name: "Music Moves Europe / LIVEMX",
    entity: "Creative Europe",
    category: "EU/INTERNACIONAL",
    focus: ["sustentabilidade", "diversidade", "showcases"],
    amount: "variável por call",
    eligibility: ["Profissionais da música na UE"],
    profileTags: ["entidade", "banda", "solo"],
    projectTags: ["internacionalizacao", "circulacao", "mobilidade"],
    deadline: "calls ao longo de 2025",
    link: "https://www.europacriativa.eu/cultura/projectos-apoiados/music-moves-europe-livemx",
  },
  {
    id: "effea",
    name: "EFFEA — European Festivals Fund for Emerging Artists",
    entity: "EFFEA",
    category: "EU/INTERNACIONAL",
    focus: ["residências", "festivais", "emergentes"],
    amount: "por residência (não especificado)",
    eligibility: ["Parceria com 3+ festivais de países diferentes"],
    profileTags: ["solo", "banda", "entidade"],
    projectTags: ["mobilidade", "internacionalizacao", "circulacao"],
    deadline: "chamada #4 em 2025",
    link: "https://www.dgartes.gov.pt/pt/noticia/8910",
  },
  {
    id: "ibermusicas",
    name: "Ibermúsicas — Circulação",
    entity: "Ibermúsicas",
    category: "EU/INTERNACIONAL",
    focus: ["circulação ibero-americana"],
    amount: "apoio a viagens e apresentações",
    eligibility: ["Músicos/grupos ibero-americanos"],
    profileTags: ["solo", "banda"],
    projectTags: ["circulacao", "internacionalizacao", "mobilidade"],
    deadline: "convocatórias 2025",
    link: "https://www.ibermusicas.org/",
  },
  {
    id: "iportunus",
    name: "i-Portunus (mobilidade de artistas)",
    entity: "EU Mobility Scheme",
    category: "EU/INTERNACIONAL",
    focus: ["mobilidade", "colaboração"],
    amount: "cobre custos de deslocação e estadia",
    eligibility: ["Artistas residentes em países participantes"],
    profileTags: ["solo", "banda"],
    projectTags: ["mobilidade", "internacionalizacao"],
    deadline: "periódico",
    link: "https://culture.ec.europa.eu/",
  },
  {
    id: "norte-pontual",
    name: "NORTE PONTUAL",
    entity: "CCDR-Norte",
    category: "REGIONAL",
    focus: ["ações culturais regionais", "associativismo musical"],
    amount: "~300.000€ totais (2025) por linhas",
    eligibility: ["Estruturas/artistas no Norte; exceções para profissionais"],
    profileTags: ["entidade", "solo", "banda"],
    projectTags: ["programacao", "circulacao", "criacao"],
    deadline: "conforme regulamento",
    link: "https://www.ccdr-n.pt/pagina/norte-pontual",
  },
  {
    id: "santander-linha-fei",
    name: "Linha FEI Setores Culturais",
    entity: "Banco Santander",
    category: "PRIVADO",
    focus: ["crédito PME culturais"],
    amount: "linha de crédito (montante variável)",
    eligibility: ["PME até 500 trabalhadores"],
    profileTags: ["entidade"],
    projectTags: ["producao", "programacao", "internacionalizacao"],
    deadline: "contínuo",
    link: "https://www.santander.pt/",
  },
  {
    id: "caixa-cultura",
    name: "Caixa Cultura",
    entity: "Caixa Geral de Depósitos",
    category: "PRIVADO",
    focus: ["apoio a projetos artísticos"],
    amount: "variável",
    eligibility: ["Indivíduos 18+ ou coletivos"],
    profileTags: ["solo", "banda", "entidade"],
    projectTags: ["criacao", "producao", "circulacao"],
    deadline: "por aviso",
    link: "https://www.cgd.pt/",
  },
  {
    id: "audiogest-adiantamentos",
    name: "Apoios AUDIOGEST — Internacionalização",
    entity: "AUDIOGEST",
    category: "PRIVADO",
    focus: ["exportação", "showcases", "promo"],
    amount: "adiantamentos até 40.000€",
    eligibility: ["Projetos musicais contratualizados (seleção)"],
    profileTags: ["entidade", "banda", "solo"],
    projectTags: ["internacionalizacao", "circulacao"],
    deadline: "até Dez 2025 (exemplo)",
    link: "https://www.instagram.com/p/DKhw6FGIbhZ/",
  },
  {
    id: "fiscal-estatuto-cultura",
    name: "Estatuto dos Profissionais da Área da Cultura — Benefícios",
    entity: "Governo / AT / SS",
    category: "FISCAL/SOCIAL",
    focus: ["subsídi os", "IVA/IRS", "proteção social"],
    amount: "n/a",
    eligibility: [
      "Profissionais culturais registados (DL 105/2021)",
      "IRS 20% propriedade intelectual; isenções de IVA em certos serviços",
    ],
    profileTags: ["solo", "banda", "entidade"],
    projectTags: ["producao", "programacao", "criacao", "circulacao"],
    deadline: "contínuo",
    link: "https://culturaportugal.gov.pt/pt/participar/estatuto-dos-profissionais-da-area-da-cultura/",
  },
];
