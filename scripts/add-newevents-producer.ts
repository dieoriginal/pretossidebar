// Script para adicionar NewEvents Global como produtor
// Execute este script no console do browser na página de gestão de produtores

import { addProducer } from "@/lib/producersDb";

export async function addNewEventsGlobal() {
  try {
    const producerId = await addProducer({
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
    });
    
    console.log(`✅ NewEvents Global adicionado com sucesso! ID: ${producerId}`);
    return producerId;
  } catch (error) {
    console.error("❌ Erro ao adicionar NewEvents Global:", error);
    throw error;
  }
}







