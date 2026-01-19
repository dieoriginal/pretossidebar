/**
 * Event Templates Generator
 * Auto-creates bi-weekly event templates for Diepretty Mercedes shows
 * Sistema quinzenal: 2 shows por mês
 */

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const PORTUGUESE_CITIES = [
  "Lisboa", "Porto", "Braga", "Coimbra", "Aveiro", "Faro", 
  "Évora", "Setúbal", "Viseu", "Leiria", "Funchal", "Ponta Delgada"
];

export interface EventTemplate {
  id: string;
  month: number;
  year: number;
  week: number; // 1 ou 2 (primeira ou segunda quinzena)
  eventName: string;
  date: string;
  city: string;
  status: "draft" | "confirmed" | "completed";
  template: true;
}

export interface CityRotation {
  year: number;
  month: number;
  week: number;
  city1: string;
  city2: string;
}

/**
 * Gera rotação de cidades para shows quinzenais
 * Estratégia: Lisboa e Porto sempre, outras cidades rotacionam
 */
export function generateCityRotation(year: number): CityRotation[] {
  const rotations: CityRotation[] = [];
  const otherCities = PORTUGUESE_CITIES.filter(c => c !== "Lisboa" && c !== "Porto");
  let cityIndex = 0;

  for (let month = 1; month <= 12; month++) {
    // Primeira quinzena: Lisboa ou Porto (alterna)
    // Segunda quinzena: Outra cidade ou Porto/Lisboa
    const isEvenMonth = month % 2 === 0;
    
    rotations.push({
      year,
      month,
      week: 1,
      city1: isEvenMonth ? "Porto" : "Lisboa",
      city2: isEvenMonth ? "Lisboa" : "Porto",
    });

    // Segunda quinzena: cidade diferente
    const otherCity = otherCities[cityIndex % otherCities.length];
    cityIndex++;

    rotations.push({
      year,
      month,
      week: 2,
      city1: otherCity,
      city2: isEvenMonth ? "Lisboa" : "Porto", // backup
    });
  }

  return rotations;
}

export function generateBiWeeklyTemplates(year: number): EventTemplate[] {
  const templates: EventTemplate[] = [];
  const rotations = generateCityRotation(year);
  
  for (const rotation of rotations) {
    // Primeira data: dia 7 ou 8 (primeira quinzena)
    // Segunda data: dia 21 ou 22 (segunda quinzena)
    const day = rotation.week === 1 ? 7 : 21;
    const date = new Date(year, rotation.month - 1, day);
    
    templates.push({
      id: `template-${year}-${rotation.month}-${rotation.week}`,
      month: rotation.month,
      year,
      week: rotation.week,
      eventName: `Noite com Diepretty Mercedes - ${MONTHS[rotation.month - 1]} ${year} (${rotation.week === 1 ? '1ª' : '2ª'} quinzena)`,
      date: date.toISOString().split('T')[0],
      city: rotation.city1,
      status: "draft",
      template: true,
    });
  }
  
  return templates;
}

export function generateTemplatesForYears(startYear: number, endYear: number): EventTemplate[] {
  const templates: EventTemplate[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    templates.push(...generateBiWeeklyTemplates(year));
  }
  
  return templates;
}

export function getDefaultEventData(month: number, year: number, week: number, city: string) {
  return {
    overview: {
      eventName: `Noite com Diepretty Mercedes - ${MONTHS[month - 1]} ${year} (${week === 1 ? '1ª' : '2ª'} quinzena)`,
      eventType: "Concerto",
      date: new Date(year, month - 1, week === 1 ? 7 : 21).toISOString().split('T')[0],
      city: city,
      venue: "",
      capacity: 0, // Será definido quando selecionar venue
      description: "",
      organizerName: "",
      organizerContact: "",
    },
    venues: {
      primary: null as any,
      backups: [] as any[],
      requiredCapacity: 0,
    },
    venueContact: {
      name: "",
      email: "",
      phone: "",
      emailSent: false,
      emailSentDate: null,
      confirmed: false,
      confirmedDate: null,
    },
    finance: {
      budget: 0,
      ticketPrice: 0,
      sponsorship: 0,
      expenses: [],
      venueSplit: 70, // 70% para nós, 30% para venue
      estimatedProfit: 0,
      expectedAttendance: 70,
      merchPerPerson: 5,
    },
    lineup: {
      artists: [],
      soundcheck: "",
      curfew: "",
      schedule: [],
    },
    production: {
      sound: "",
      lighting: "",
      stage: "",
      crew: [],
      technicalRider: "",
      technicalRiderConfirmed: false,
      team: [],
      estimatedCost: 0,
    },
    tickets: {
      totalTickets: 0,
      soldTickets: 0,
      priceTiers: [],
      policy: "",
      prices: {},
    },
    logistics: {
      address: "",
      parking: "",
      loadIn: "",
      loadOut: "",
      catering: "",
      material: [],
      travelOutfit: [],
      estimatedCost: 0,
      transport: "",
      accommodation: "",
    },
    marketing: {
      socialMedia: [],
      pressRelease: "",
      influencers: [],
      strategy: "",
      assets: "",
      budget: 0,
    },
    status: "draft" as const,
    month,
    year,
    week,
    template: true,
  };
}
