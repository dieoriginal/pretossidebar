/**
 * Event Completion Tracker
 * Tracks completion status of all required steps for event execution
 * Forces execution by making requirements visible and blocking
 */

export interface EventCompletionStatus {
  isComplete: boolean;
  completionPercentage: number;
  completedSteps: number;
  totalSteps: number;
  missingSteps: string[];
  criticalSteps: {
    emailSent: boolean;
    venueConfirmed: boolean;
    technicalRider: boolean;
    schedule: boolean;
    ticketPolicy: boolean;
  };
}

export interface EventStep {
  id: string;
  name: string;
  completed: boolean;
  required: boolean;
  phase: string;
}

const CRITICAL_STEPS = {
  emailSent: "Email enviado para venue",
  venueConfirmed: "Venue confirmou o dia",
  technicalRider: "Rider técnico enviado/confirmado",
  schedule: "Horários definidos",
  ticketPolicy: "Política de bilhetes definida",
};

export function calculateEventCompletion(eventData: any): EventCompletionStatus {
  const steps: EventStep[] = [
    // Fase 1 - Contacto e Confirmação
    {
      id: "overview",
      name: "Visão Geral",
      completed: !!(eventData?.overview?.eventName && eventData?.overview?.date && eventData?.overview?.venue),
      required: true,
      phase: "Fase 1",
    },
    {
      id: "email-sent",
      name: CRITICAL_STEPS.emailSent,
      completed: !!(eventData?.venueContact?.emailSent && eventData?.venueContact?.emailSentDate),
      required: true,
      phase: "Fase 1",
    },
    {
      id: "venue-confirmed",
      name: CRITICAL_STEPS.venueConfirmed,
      completed: !!(eventData?.venueContact?.confirmed && eventData?.venueContact?.confirmedDate),
      required: true,
      phase: "Fase 1",
    },
    {
      id: "finance",
      name: "Financeiro",
      completed: !!(eventData?.finance?.budget && eventData?.finance?.budget > 0),
      required: true,
      phase: "Fase 1",
    },
    
    // Fase 2 - Planeamento Técnico
    {
      id: "technical-rider",
      name: CRITICAL_STEPS.technicalRider,
      completed: !!(eventData?.production?.technicalRider && eventData?.production?.technicalRiderConfirmed),
      required: true,
      phase: "Fase 2",
    },
    {
      id: "schedule",
      name: CRITICAL_STEPS.schedule,
      completed: !!(eventData?.lineup?.schedule && eventData?.lineup?.schedule.length > 0),
      required: true,
      phase: "Fase 2",
    },
    {
      id: "lineup",
      name: "Line-up",
      completed: !!(eventData?.lineup?.artists && eventData?.lineup?.artists.length > 0),
      required: true,
      phase: "Fase 2",
    },
    {
      id: "production",
      name: "Equipa Técnica",
      completed: !!(eventData?.production?.team && eventData?.production?.team.length > 0),
      required: true,
      phase: "Fase 2",
    },
    
    // Fase 2 - Operacional
    {
      id: "ticket-policy",
      name: CRITICAL_STEPS.ticketPolicy,
      completed: !!(eventData?.tickets?.policy && eventData?.tickets?.prices),
      required: true,
      phase: "Fase 2",
    },
    {
      id: "logistics",
      name: "Logística",
      completed: !!(eventData?.logistics?.transport && eventData?.logistics?.accommodation),
      required: false,
      phase: "Fase 2",
    },
    {
      id: "marketing",
      name: "Marketing",
      completed: !!(eventData?.marketing?.strategy && eventData?.marketing?.assets),
      required: false,
      phase: "Fase 2",
    },
  ];

  const requiredSteps = steps.filter(s => s.required);
  const completedRequired = requiredSteps.filter(s => s.completed);
  const missingSteps = requiredSteps.filter(s => !s.completed).map(s => s.name);

  const criticalSteps = {
    emailSent: steps.find(s => s.id === "email-sent")?.completed || false,
    venueConfirmed: steps.find(s => s.id === "venue-confirmed")?.completed || false,
    technicalRider: steps.find(s => s.id === "technical-rider")?.completed || false,
    schedule: steps.find(s => s.id === "schedule")?.completed || false,
    ticketPolicy: steps.find(s => s.id === "ticket-policy")?.completed || false,
  };

  const allCriticalComplete = Object.values(criticalSteps).every(v => v === true);
  const allRequiredComplete = requiredSteps.every(s => s.completed);

  return {
    isComplete: allCriticalComplete && allRequiredComplete,
    completionPercentage: Math.round((completedRequired.length / requiredSteps.length) * 100),
    completedSteps: completedRequired.length,
    totalSteps: requiredSteps.length,
    missingSteps,
    criticalSteps,
  };
}

export function getEventStatusLabel(status: EventCompletionStatus): { label: string; color: string } {
  if (status.isComplete) {
    return {
      label: "Show Confirmado",
      color: "green",
    };
  }

  if (status.completionPercentage >= 80) {
    return {
      label: "Quase Completo",
      color: "yellow",
    };
  }

  return {
    label: "Concerto por terminar de planear",
    color: "red",
  };
}




