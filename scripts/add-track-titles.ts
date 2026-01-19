// Script para adicionar títulos de faixas ao music dashboard
import {
  getCurrent,
  updateProject,
  uid,
  DashboardProject,
  Track,
} from "@/lib/music-dashboard";

// Lista de títulos fornecidos pelo usuário
const trackTitles = [
  "Fidúcia",
  "Pleurotus",
  "Eudaimonia",
  "biópsia",
  "VSOP Superior",
  "Divergente",
  "episteme",
  "Vixerunt",
  "morbidez",
  "paideia",
  "elite Mouseion",
  "saevitia",
  "Doxa",
  "Denilson Africanus'",
  "Craftsmen",
  "Courvoisier",
  "Legião",
  "principium individuationis",
  "DOMUS AUREA (PALÁCIO)",
  "busca pela eudaimonia",
  "G'Vine Floraison",
  "Epimanes (The Mad)",
  "idempotente",
  "SULPICIA",
  "Segundo Triunvirato",
  "imhotep",
  "Johann Wolfgang von Goethe",
  "Hurstwic",
  "Saúde Infantil",
  "Urpflanze",
  "Imhotep",
  "RIP julius Cesar",
  "altar",
  "Rosetta Stone (Pedra Rosetta)",
  "ataraxia",
  "devir contínuo",
  "Numidia",
  "Lepsius",
  "eqüipolência",
  "Tartuffe",
  'Organic evolution"eqüipolência"',
  "odium",
  "finitude",
  "Die Freien",
  "cd back-offices/coo && npm run build",
  "rapsódia-----",
  "Escrutínio",
  "Diplomacia",
  "Nile Delta",
  "Hegemonia",
  "Antiópia",
  "Libertopia",
  "ecletismo",
  "Parricídio",
  "Secrecy",
  "Matricídio",
  "Calpernia Benza",
];

/**
 * Adiciona todos os títulos como tracks no projeto atual do music dashboard
 */
export function addTrackTitlesToCurrentProject() {
  if (typeof window === "undefined") {
    console.error("Este script deve ser executado no navegador");
    return;
  }

  const currentProject = getCurrent();
  const existingTitles = new Set(currentProject.tracks.map((t) => t.title));

  // Criar novos tracks apenas para títulos que ainda não existem
  const newTracks: Track[] = trackTitles
    .filter((title) => !existingTitles.has(title))
    .map((title) => ({
      id: uid("trk"),
      title: title.trim(),
      artist: currentProject.artist || undefined,
    }));

  if (newTracks.length === 0) {
    console.log("Todos os títulos já existem no projeto atual");
    return;
  }

  // Adicionar os novos tracks ao projeto
  const updatedProject = updateProject(currentProject.id, {
    tracks: [...currentProject.tracks, ...newTracks],
  });

  console.log(
    `✅ Adicionados ${newTracks.length} novos tracks ao projeto "${updatedProject.name}"`
  );
  console.log("Tracks adicionados:", newTracks.map((t) => t.title));

  return updatedProject;
}

/**
 * Função para ser chamada via console do navegador
 * Uso: window.addTrackTitles()
 */
if (typeof window !== "undefined") {
  (window as any).addTrackTitles = addTrackTitlesToCurrentProject;
}
