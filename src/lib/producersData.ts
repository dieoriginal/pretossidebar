// Base de dados inicial de produtores de eventos de Portugal
// Este arquivo contém produtores fornecidos pelo utilizador

import { EventProducer } from "./producersDb";

export const DEFAULT_PRODUCERS: Omit<EventProducer, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "NewEvents Global",
    city: "Seixal",
    country: "Portugal",
    region: "Sul",
    producerType: "company",
    specialties: [
      "feiras",
      "congressos",
      "ações de formação",
      "ativação de marcas",
      "eventos temáticos",
      "lançamento de produtos",
      "consultoria de imprensa",
      "workshops",
      "conferências",
      "eventos corporativos",
      "eventos sociais",
      "desfiles de moda",
      "animação de eventos",
      "organização de eventos internacionais"
    ],
    portfolio: "A NewEvents Global oferece uma organização integral de todo o tipo de eventos corporativos e sociais. Criamos, desenvolvemos e executamos com a máxima qualidade e profissionalismo o seu evento. Somos especialistas em organização de feiras, congressos, ações de formação, ativação de marcas, eventos temáticos, lançamento de produtos e consultoria de imprensa.",
    experience: "Aberto desde 2016",
    services: "Organização integral de eventos corporativos e sociais. Eventos Corporativos: Workshops, Conferências, Congressos, Ações de Formação, Ativação de Marcas, Consultoria de Imprensa, Feiras, Consultoria. Eventos Sociais: Lançamentos de produtos, Desfiles de Moda, Animação de eventos, Aluguer de audiovisuais, Estruturas, Organização de Eventos Internacionais.",
    url: "https://www.facebook.com/neweventsglobal/?fref=ts",
    socialMedia: {
      facebook: "https://www.facebook.com/neweventsglobal/?fref=ts"
    },
    notes: "Localização: Lisboa » Cidade - Seixal. Também trabalha com Auditório UACS no centro de Lisboa, Rua Castilho - espaço com características favoráveis à realização dos mais variados eventos.",
  },
];







