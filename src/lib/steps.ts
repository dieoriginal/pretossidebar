export type Step = {
  name: string;
  link: string;
  timeframe: string;
  description: string;
};

export const steps: Step[] = [
  { name: "Maquete", link: "/obraeurudita", timeframe: "Mês 1", description: "Definir conceito, moodboard, roteiro e tratamento" },
  { name: "Gravação", link: "/gravacao", timeframe: "Mês 1", description: "Agendar estúdio e gravar todas as faixas" },
  { name: "Vestuário", link: "/vestuario", timeframe: "Mês 2", description: "Produzir e provar figurinos para vídeo e material de imprensa" },
  { name: "Orçamento e Aluguer", link: "/orcamento", timeframe: "Mês 2", description: "Distribuir verba entre estúdio, equipe, figurino e reserva" },
  { name: "Filmagem", link: "/filmagem", timeframe: "Mês 2", description: "Executar gravação de vídeo" },
  { name: "Fotografia", link: "/fotografia", timeframe: "Mês 2", description: "Fotos" },
  { name: "Edição de Vídeo  ", link: "/videoclipe", timeframe: "Mês 2", description: "After Effects, Premiere, Davinci Resolve & Photoshop" },
  { name: "Contratualização", link: "/contratualizacao", timeframe: "Mês 3", description: "Fechar contratos com artistas, equipe, distribuidores e plataformas" },
  { name: "Direitos Autorais", link: "/direitosautorais", timeframe: "Mês 3", description: "Registrar obras, liberar samples e licenciar sincronizações" },
  { name: "Lançamento", link: "/lancamento", timeframe: "Mês 3", description: "Implementar distribuição digital, PR, marketing e monitorar resultados" },
];

export const TOTAL_STEPS = steps.length;
