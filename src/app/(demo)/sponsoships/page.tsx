"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  CheckCircle,
  DollarSign,
  Calendar,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  FileText,
  Calculator,
  Download,
  Save,
  Mail,
  File,
  Link2,
  Search,
  Edit,
} from "lucide-react";
import { fundingPrograms } from "@/lib/funding-supports";
import type { FundingProgram, FundingCategory, ProfileTag, ProjectTag } from "@/lib/funding-supports";

// Tipagens
interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
  assignee?: string;
  deadline?: string; // ISO date string for simplicity
  notes?: string;
}

interface SponsorshipStep {
  id: string;
  name: string;
  description: string;
  activities: string[];
  skills: string[];
  completed: boolean;
  notes: string;
  deadline?: Date;
  budget?: number;
  checklist?: ChecklistItem[]; // nova
}

interface SponsorshipPhase {
  id: string;
  name: string;
  description: string;
  steps: SponsorshipStep[];
  completed: boolean;
  progress: number;
}

interface SponsorshipItem {
  id: string;
  brandName: string;
  dealType: string;
  value: number;
  benefits: string;
  status: string; // e.g., "Em prospecção", "Negociando", "Fechado"
  integration: string; // e.g., "Vídeo", "Tour", "Merch"
  contractFile?: string; // simulate file upload
  metrics: { views?: number; engagements?: number; sales?: number };
  notes?: string;
}

interface SponsorshipData {
  artistName: string;
  sponsorshipGoal: string;
  missionStatement: string;
  targetBrands: string[];
  totalValue: number;
  securedValue: number;
  phases: SponsorshipPhase[];
}

const defaultChecklistTemplates: Record<string, ChecklistItem[]> = {
  basic: [
    { id: 'c-1', text: 'Pesquisar contato da marca', done: false },
    { id: 'c-2', text: 'Preparar pitch personalizado', done: false },
    { id: 'c-3', text: 'Enviar proposta', done: false },
  ],
  negotiation: [
    { id: 'n-1', text: 'Definir termos do contrato', done: false },
    { id: 'n-2', text: 'Revisar cláusulas legais', done: false },
  ]
};

const initialSponsorshipData: SponsorshipData = {
  artistName: "",
  sponsorshipGoal: "",
  missionStatement: "",
  targetBrands: [],
  totalValue: 0,
  securedValue: 0,
  phases: [
    {
      id: "phase1",
      name: "Preparação e Prospecção",
      description: "Prepare seu perfil e identifique marcas alinhadas para iniciar contatos.",
      completed: false,
      progress: 0,
      steps: [
        {
          id: "step1-1",
          name: "Preparar Perfil e Métricas (Media Kit)",
          description: "Construa um kit com dados de seguidores, streams e demografia do público.",
          activities: ["Coletar métricas de redes sociais","Criar documento de media kit","Definir valor para marcas"],
          skills: ["Análise de dados","Apresentação","Marketing pessoal"],
          completed: false,
          notes: "",
          checklist: []
        },
        {
          id: "step1-2",
          name: "Pesquisar Marcas Alinhadas",
          description: "Identifique empresas que combinem com seu estilo e valores.",
          activities: ["Buscar marcas no LinkedIn e Instagram","Verificar parcerias anteriores de rappers","Criar lista de prospects"],
          skills: ["Pesquisa","Networking","Análise de mercado"],
          completed: false,
          notes: "",
          checklist: []
        }
      ]
    },
    {
      id: "phase2",
      name: "Contato e Pitch",
      description: "Entre em contato com marcas e envie pitches personalizados.",
      completed: false,
      progress: 0,
      steps: [
        {
          id: "step2-1",
          name: "Elaborar Pitch Personalizado",
          description: "Crie mensagens ou e-mails adaptados para cada marca.",
          activities: ["Escrever exemplo de pitch","Incluir links para vídeos e ideias criativas","Propor integrações autênticas"],
          skills: ["Comunicação","Vendas","Criatividade"],
          completed: false,
          notes: "",
          checklist: []
        },
        {
          id: "step2-2",
          name: "Enviar Contatos Iniciais",
          description: "Envie DMs, e-mails ou propostas para marcas selecionadas.",
          activities: ["Enviar pitches para marcas pequenas primeiro","Acompanhar respostas","Registrar contatos no app"],
          skills: ["Follow-up","Organização","Persistência"],
          completed: false,
          notes: "",
          checklist: []
        }
      ]
    },
    {
      id: "phase3",
      name: "Negociação e Integração",
      description: "Negocie termos e integre o deal em conteúdos como vídeos.",
      completed: false,
      progress: 0,
      steps: [
        {
          id: "step3-1",
          name: "Negociar Termos do Deal",
          description: "Defina valor, benefícios e integrações no contrato.",
          activities: ["Pedir recursos como produtos grátis","Definir menções em vídeos ou tours","Assinar contrato"],
          skills: ["Negociação","Direito contratual","Estratégia"],
          completed: false,
          notes: "",
          checklist: []
        },
        {
          id: "step3-2",
          name: "Integrar no Frontend e Conteúdo",
          description: "Registre o deal para refletir no site público como conteúdo patrocinado.",
          activities: ["Linkar a outras áreas como Vídeos","Adicionar banners ou seções patrocinadas","Garantir integração orgânica"],
          skills: ["Produção de conteúdo","Branding","Integração digital"],
          completed: false,
          notes: "",
          checklist: []
        }
      ]
    },
    {
      id: "phase4",
      name: "Execução e Monitoramento",
      description: "Execute o deal e acompanhe métricas de impacto.",
      completed: false,
      progress: 0,
      steps: [
        {
          id: "step4-1",
          name: "Executar Integração",
          description: "Inclua o patrocínio em vídeos, tours ou merch.",
          activities: ["Produzir conteúdo com product placement","Publicar e promover","Manter autenticidade"],
          skills: ["Execução","Criatividade","Gestão de projetos"],
          completed: false,
          notes: "",
          checklist: []
        },
        {
          id: "step4-2",
          name: "Monitorar Métricas",
          description: "Rastreie visualizações, engajamentos e vendas geradas.",
          activities: ["Usar ferramentas de análise","Atualizar status no app","Relatar resultados à marca"],
          skills: ["Análise de dados","Relatórios","Avaliação"],
          completed: false,
          notes: "",
          checklist: []
        }
      ]
    },
    {
      id: "phase5",
      name: "Avaliação e Evolução",
      description: "Avalie o deal e use insights para futuros pitches.",
      completed: false,
      progress: 0,
      steps: [
        {
          id: "step5-1",
          name: "Avaliar Resultados",
          description: "Meça o impacto do patrocínio nos objetivos.",
          activities: ["Analisar métricas pós-deal","Coletar feedback da marca e fãs","Calcular ROI"],
          skills: ["Avaliação","Análise financeira","Feedback"],
          completed: false,
          notes: "",
          checklist: []
        },
        {
          id: "step5-2",
          name: "Atualizar Portfólio",
          description: "Adicione o deal ao media kit para pitches futuros.",
          activities: ["Documentar case de sucesso","Atualizar backend com lições aprendidas","Prospectar novos deals"],
          skills: ["Documentação","Estratégia de longo prazo","Crescimento"],
          completed: false,
          notes: "",
          checklist: []
        }
      ]
    }
  ]
};

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);

function SponsorshipList({ sponsorshipData, setSponsorshipData }: { sponsorshipData: SponsorshipData; setSponsorshipData: (t: SponsorshipData) => void }) {
  const [sponsorships, setSponsorships] = useState<SponsorshipItem[]>([]);

  const addSponsorship = () => {
    const newItem: SponsorshipItem = {
      id: String(Date.now()) + Math.random().toString(16).slice(2),
      brandName: "Nova Marca",
      dealType: "Product Placement",
      value: 0,
      benefits: "",
      status: "Em prospecção",
      integration: "Vídeo",
      metrics: {},
      notes: "",
    };
    setSponsorships([...sponsorships, newItem]);
  };

  const updateSponsorship = (id: string, patch: Partial<SponsorshipItem>) => {
    setSponsorships(sponsorships.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeSponsorship = (id: string) => {
    setSponsorships(sponsorships.filter((it) => it.id !== id));
  };

  const securedTotal = sponsorships.reduce((s, i) => s + (i.status === "Fechado" ? Number(i.value || 0) : 0), 0);

  useEffect(() => {
    setSponsorshipData({
      ...sponsorshipData,
      securedValue: securedTotal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsorships]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> Lista de Patrocínios</h3>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={addSponsorship}>+ Adicionar Patrocínio</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-muted-foreground">
                <th className="pr-4">Marca</th>
                <th className="pr-4">Tipo</th>
                <th className="pr-4">Valor</th>
                <th className="pr-4">Status</th>
                <th className="pr-4">Integração</th>
                <th className="pr-4">Notas</th>
                <th className="pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sponsorships.map((row) => (
                <tr key={row.id} className="align-top">
                  <td><Input value={row.brandName} onChange={(e) => updateSponsorship(row.id, { brandName: e.target.value })} /></td>
                  <td><Input value={row.dealType} onChange={(e) => updateSponsorship(row.id, { dealType: e.target.value })} /></td>
                  <td><Input type="number" value={row.value} onChange={(e) => updateSponsorship(row.id, { value: Number(e.target.value) })} /></td>
                  <td><Input value={row.status} onChange={(e) => updateSponsorship(row.id, { status: e.target.value })} /></td>
                  <td><Input value={row.integration} onChange={(e) => updateSponsorship(row.id, { integration: e.target.value })} /></td>
                  <td><Input value={row.notes} onChange={(e) => updateSponsorship(row.id, { notes: e.target.value })} /></td>
                  <td><div className="flex gap-2"><Button variant="destructive" onClick={() => removeSponsorship(row.id)}>Remover</Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-4 border-t mt-4">
          <div className="flex justify-between"><span className="font-medium">Valor Total Segurado:</span><span className="font-semibold">{formatCurrency(securedTotal)}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}

const SponsorshipsPage = () => {
  const [sponsorshipData, setSponsorshipData] = useState<SponsorshipData>(initialSponsorshipData);
  const [activePhase, setActivePhase] = useState<string>("phase1");
  const [newBrand, setNewBrand] = useState("");
  const [saving, setSaving] = useState(false);
  const [compact, setCompact] = useState(true);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<FundingCategory | "ALL">("ALL");
  const [profile, setProfile] = useState<ProfileTag | "ALL">("ALL");
  const [project, setProject] = useState<ProjectTag | "ALL">("ALL");
  const [wizType, setWizType] = useState<ProfileTag | "entidade">("solo");
  const [wizUnder30, setWizUnder30] = useState(false);
  const [wizEntity4y, setWizEntity4y] = useState(false);
  const [wizPrefCat, setWizPrefCat] = useState<FundingCategory | "ALL">("ALL");

  const calculateOverallProgress = useCallback(() => {
    const totalItems = sponsorshipData.phases.reduce((acc, phase) => acc + phase.steps.length, 0);
    const stepProgressSum = sponsorshipData.phases.reduce((acc, phase) => acc + phase.steps.reduce((s, st) => {
      const checklist = st.checklist || [];
      const checklistDone = checklist.filter(c => c.done).length;
      const stepProg = checklist.length > 0 ? Math.round((checklistDone / checklist.length) * 100) : (st.completed ? 100 : 0);
      return s + stepProg;
    }, 0), 0);
    return totalItems > 0 ? Math.round(stepProgressSum / totalItems) : 0;
  }, [sponsorshipData]);

  const updatePhaseProgress = useCallback((phaseId: string) => {
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.id === phaseId) {
          const stepProgresses = phase.steps.map(step => {
            const checklist = step.checklist || [];
            const checklistDone = checklist.filter(c => c.done).length;
            return checklist.length > 0 ? Math.round((checklistDone / checklist.length) * 100) : (step.completed ? 100 : 0);
          });
          const avg = stepProgresses.length > 0 ? Math.round(stepProgresses.reduce((a,b) => a+b,0) / stepProgresses.length) : 0;
          const completed = avg === 100;
          return { ...phase, progress: avg, completed };
        }
        return phase;
      })
    }));
  }, []);

  const toggleStepCompletion = (phaseId: string, stepId: string) => {
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.id === phaseId) {
          return {
            ...phase,
            steps: phase.steps.map(step => {
              if (step.id === stepId) {
                const newCompleted = !step.completed;
                const newChecklist = (step.checklist || []).map(c => ({ ...c, done: newCompleted }));
                return { ...step, completed: newCompleted, checklist: newChecklist };
              }
              return step;
            })
          };
        }
        return phase;
      })
    }));
    setTimeout(() => updatePhaseProgress(phaseId), 0);
  };

  const updateStepNotes = (phaseId: string, stepId: string, notes: string) => {
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => phase.id === phaseId ? ({ ...phase, steps: phase.steps.map(step => step.id === stepId ? { ...step, notes } : step) }) : phase)
    }));
  };

  const addChecklistItem = (phaseId: string, stepId: string, text = 'Novo item') => {
    const id = String(Date.now()) + Math.random().toString(16).slice(2);
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          steps: phase.steps.map(step => {
            if (step.id !== stepId) return step;
            const list = step.checklist ? [...step.checklist, { id, text, done: false }] : [{ id, text, done: false }];
            return { ...step, checklist: list };
          })
        };
      })
    }));
    setTimeout(() => updatePhaseProgress(phaseId), 0);
  };

  const toggleChecklistDone = (phaseId: string, stepId: string, itemId: string) => {
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          steps: phase.steps.map(step => {
            if (step.id !== stepId) return step;
            const checklist = (step.checklist || []).map(c => c.id === itemId ? { ...c, done: !c.done } : c);
            const allDone = checklist.length > 0 && checklist.every(c => c.done);
            return { ...step, checklist, completed: allDone ? true : step.completed };
          })
        };
      })
    }));
    setTimeout(() => updatePhaseProgress(phaseId), 0);
  };

  const updateChecklistField = (phaseId: string, stepId: string, itemId: string, patch: Partial<ChecklistItem>) => {
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => {
        if (phase.id !== phaseId) return phase;
        return {
          ...phase,
          steps: phase.steps.map(step => {
            if (step.id !== stepId) return step;
            return { ...step, checklist: (step.checklist || []).map(c => c.id === itemId ? { ...c, ...patch } : c) };
          })
        };
      })
    }));
  };

  const applyChecklistTemplate = (phaseId: string, stepId: string, templateKey: string) => {
    const template = defaultChecklistTemplates[templateKey] || [];
    const mapped = template.map(t => ({ ...t, id: String(Date.now()) + Math.random().toString(16).slice(2) }));
    setSponsorshipData(prev => ({
      ...prev,
      phases: prev.phases.map(phase => phase.id === phaseId ? ({ ...phase, steps: phase.steps.map(step => step.id === stepId ? { ...step, checklist: [...(step.checklist||[]), ...mapped] } : step) }) : phase)
    }));
    setTimeout(() => updatePhaseProgress(phaseId), 0);
  };

  const addTargetBrand = () => {
    if (newBrand.trim() && !sponsorshipData.targetBrands.includes(newBrand.trim())) {
      setSponsorshipData(prev => ({ ...prev, targetBrands: [...prev.targetBrands, newBrand.trim()] }));
      setNewBrand("");
    }
  };

  const removeTargetBrand = (brand: string) => {
    setSponsorshipData(prev => ({ ...prev, targetBrands: prev.targetBrands.filter(m => m !== brand) }));
  };

  const saveSponsorshipData = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    localStorage.setItem('sponsorship-data', JSON.stringify(sponsorshipData));
    setSaving(false);
  };

  useEffect(() => {
    const saved = localStorage.getItem('sponsorship-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSponsorshipData(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const exportToPDF = async () => {
    try {
      const el = document.getElementById('sponsorship-pdf');
      if (!el) return alert('Área para exportação não encontrada');

      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(el, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${sponsorshipData.artistName || 'sponsorship'}-management.pdf`);
    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF. Verifique se as dependências html2canvas e jspdf estão instaladas.');
    }
  };

  const overallProgress = calculateOverallProgress();
  const filteredPrograms: FundingProgram[] = fundingPrograms.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQ = !q || [p.name, p.entity, p.focus.join(" ")].some((s) => s.toLowerCase().includes(q));
    const matchesCat = cat === "ALL" || p.category === cat;
    const matchesProfile = profile === "ALL" || p.profileTags.includes(profile);
    const matchesProject = project === "ALL" || p.projectTags.includes(project);
    return matchesQ && matchesCat && matchesProfile && matchesProject;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patrocínios e Parcerias — Ação & Checklists</h1>
          <p className="text-muted-foreground">Gerencie deals com marcas, integre em conteúdos e acompanhe impactos.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={saveSponsorshipData} disabled={saving}><Save className="w-4 h-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}</Button>
          <Button variant="outline" onClick={exportToPDF}><Download className="w-4 h-4 mr-2" /> Exportar PDF</Button>
        </div>
      </div>

      <div id="sponsorship-pdf" className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Informações Gerais</h2>
              <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>{overallProgress}% Concluído</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artistName">Nome do Artista/Rapper</Label>
                <Input id="artistName" value={sponsorshipData.artistName} onChange={(e) => setSponsorshipData(prev => ({ ...prev, artistName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsorshipGoal">Objetivo de Patrocínios</Label>
                <Input id="sponsorshipGoal" value={sponsorshipData.sponsorshipGoal} onChange={(e) => setSponsorshipData(prev => ({ ...prev, sponsorshipGoal: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="missionStatement">Declaração de Missão</Label>
              <Textarea id="missionStatement" value={sponsorshipData.missionStatement} onChange={(e) => setSponsorshipData(prev => ({ ...prev, missionStatement: e.target.value }))} rows={compact ? 2 : 4} />
            </div>

            <div className="space-y-2">
              <Label>Marcas-Alvo</Label>
              <div className="flex gap-2 mb-2">
                <Input value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="Adicionar marca-alvo" onKeyDown={(e) => e.key === 'Enter' && addTargetBrand()} />
                <Button onClick={addTargetBrand}>Adicionar</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sponsorshipData.targetBrands.map((brand) => (
                  <Badge key={brand} variant="outline" className="flex items-center gap-1"><Search className="w-3 h-3" /> {brand}<button onClick={() => removeTargetBrand(brand)} className="ml-1 text-muted-foreground hover:text-foreground">×</button></Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <div className="space-y-2"><div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-600" /><Label>Valor Total Alvo</Label></div><Input type="number" value={sponsorshipData.totalValue} onChange={(e) => setSponsorshipData(prev => ({ ...prev, totalValue: Number(e.target.value) }))} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center"><Label>Progresso Geral de Patrocínios</Label><span className="text-sm font-medium">{overallProgress}%</span></div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Fases de Gestão de Patrocínios</h2>
              <div className="flex items-center gap-2"><Label>Modo compacto</Label><Switch checked={compact} onCheckedChange={setCompact} /></div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activePhase} onValueChange={setActivePhase}>
              <TabsList className="grid grid-cols-5 mb-6">
                {sponsorshipData.phases.map((phase, index) => (
                  <TabsTrigger key={phase.id} value={phase.id} className="flex flex-col h-auto py-3">
                    <div className="flex items-center gap-2">{phase.completed ? <CheckCircle className="w-4 h-4 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />}<span className="font-medium">Fase {index + 1}</span></div>
                    <span className="text-xs mt-1 text-muted-foreground">{phase.progress}%</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              {sponsorshipData.phases.map((phase) => (
                <TabsContent key={phase.id} value={phase.id} className="space-y-4">
                  <div className="flex justify-between items-start"><div><h3 className="text-lg font-semibold">{phase.name}</h3><p className="text-muted-foreground">{phase.description}</p></div><Badge variant={phase.completed ? 'default' : 'secondary'}>{phase.completed ? 'Concluída' : `${phase.progress}% Concluída`}</Badge></div>

                  <div className="space-y-4">
                    {phase.steps.map((step) => (
                      <Card key={step.id} className={step.completed ? 'border-green-200 bg-green-50/50' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              <Switch checked={step.completed} onCheckedChange={() => toggleStepCompletion(phase.id, step.id)} />
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium flex items-center gap-2">{step.name} {step.completed && <CheckCircle className="w-4 h-4 text-green-600" />}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                </div>
                                <div className="w-1/3">
                                  <Label className="text-xs">Responsável</Label>
                                  <Input value={(step.checklist && step.checklist.find(c=>c.assignee)?.assignee) || ''} onChange={(e) => {
                                    if (step.checklist && step.checklist.length>0) {
                                      updateChecklistField(phase.id, step.id, step.checklist[0].id, { assignee: e.target.value });
                                    } else {
                                      addChecklistItem(phase.id, step.id, 'Tarefa principal');
                                      setTimeout(() => {
                                        const sc = (sponsorshipData.phases.find(p=>p.id===phase.id)?.steps.find(s=>s.id===step.id)?.checklist||[])[0];
                                        if (sc) updateChecklistField(phase.id, step.id, sc.id, { assignee: e.target.value });
                                      }, 50);
                                    }
                                  }} placeholder="Nome" />
                                  <Label className="text-xs mt-2">Deadline</Label>
                                  <Input type="date" value={(step.checklist && step.checklist.find(c=>c.deadline)?.deadline) || ''} onChange={(e) => {
                                    if (step.checklist && step.checklist.length>0) {
                                      updateChecklistField(phase.id, step.id, step.checklist[0].id, { deadline: e.target.value });
                                    } else {
                                      addChecklistItem(phase.id, step.id, 'Tarefa com deadline');
                                      setTimeout(() => {
                                        const sc = (sponsorshipData.phases.find(p=>p.id===phase.id)?.steps.find(s=>s.id===step.id)?.checklist||[])[0];
                                        if (sc) updateChecklistField(phase.id, step.id, sc.id, { deadline: e.target.value });
                                      }, 50);
                                    }
                                  }} />
                                </div>
                              </div>

                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><Target className="w-4 h-4" /> Atividades Chave</h5>
                                  <ul className="text-sm space-y-1">
                                    {step.activities.map((activity, idx) => (<li key={idx} className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />{activity}</li>))}
                                  </ul>
                                </div>

                                <div>
                                  <h5 className="text-sm font-medium mb-2 flex items-center gap-1"><TrendingUp className="w-4 h-4" /> Competências Necessárias</h5>
                                  <div className="flex flex-wrap gap-1">{step.skills.map((skill, idx) => (<Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>))}</div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Label className="text-sm">Checklist</Label>
                                <div className="mt-2 space-y-2">
                                  {(step.checklist || []).map(item => (
                                    <div key={item.id} className="flex items-center gap-2">
                                      <input type="checkbox" aria-label="Marcar tarefa concluída" checked={item.done} onChange={() => toggleChecklistDone(phase.id, step.id, item.id)} />
                                      <Input value={item.text} onChange={(e) => updateChecklistField(phase.id, step.id, item.id, { text: e.target.value })} />
                                      <Input type="date" value={item.deadline || ''} onChange={(e) => updateChecklistField(phase.id, step.id, item.id, { deadline: e.target.value })} />
                                      <Input value={item.assignee || ''} onChange={(e) => updateChecklistField(phase.id, step.id, item.id, { assignee: e.target.value })} placeholder="Assignee" />
                                    </div>
                                  ))}

                                  <div className="flex gap-2 mt-2">
                                    <Button variant="ghost" onClick={() => addChecklistItem(phase.id, step.id)}>+ Nova tarefa</Button>
                                    <Button variant="outline" onClick={() => applyChecklistTemplate(phase.id, step.id, 'basic')}>Template Básico</Button>
                                    <Button variant="outline" onClick={() => applyChecklistTemplate(phase.id, step.id, 'negotiation')}>Template Negociação</Button>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-4">
                                <Label htmlFor={`notes-${step.id}`} className="text-sm">Notas e Observações</Label>
                                <Textarea id={`notes-${step.id}`} value={step.notes} onChange={(e) => updateStepNotes(phase.id, step.id, e.target.value)} placeholder="Adicione notas..." rows={compact ? 2 : 4} className="mt-1" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><h3 className="text-lg font-semibold flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Resumo de Progresso</h3></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sponsorshipData.phases.map((phase, index) => (
                  <div key={phase.id} className="space-y-2">
                    <div className="flex justify-between items-center"><span className="text-sm font-medium">Fase {index + 1}: {phase.name}</span><span className="text-sm font-medium">{phase.progress}%</span></div>
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div>
            <SponsorshipList sponsorshipData={sponsorshipData} setSponsorshipData={setSponsorshipData} />
          </div>
        </div>

        <Card>
          <CardHeader><h3 className="text-lg font-semibold">Ferramentas e Recursos</h3></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><FileText className="w-6 h-6" /><span>Modelos de Contratos</span></Button></TooltipTrigger>
                  <TooltipContent><p>Acesse modelos de contratos para patrocínios</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><Mail className="w-6 h-6" /><span>Gerador de Pitch</span></Button></TooltipTrigger>
                  <TooltipContent><p>Crie pitches personalizados para marcas</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><Link2 className="w-6 h-6" /><span>Integrador Frontend</span></Button></TooltipTrigger>
                  <TooltipContent><p>Integre deals ao site público</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Button variant="outline" className="h-auto py-4 flex flex-col gap-2"><Calculator className="w-6 h-6" /><span>Calculadora de ROI</span></Button></TooltipTrigger>
                  <TooltipContent><p>Calcule retorno de investimentos em deals</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Apoios & Financiamentos (Portugal/EU)</h3>
                <p className="text-sm text-muted-foreground">Filtre por categoria, perfil e tipo de projeto para descobrir a que pode candidatar-se agora.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 w-full md:w-auto">
                <div className="flex flex-col">
                  <Label>Pesquisar</Label>
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="DGARTES, GDA, mobilidade…" />
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="fund-cat">Categoria</Label>
                  <select id="fund-cat" aria-label="Categoria" className="border rounded h-10 px-2" value={cat} onChange={(e) => setCat(e.target.value as any)}>
                    <option value="ALL">Todas</option>
                    <option value="NACIONAL">Nacional</option>
                    <option value="FUNDAÇÃO">Fundação</option>
                    <option value="EU/INTERNACIONAL">EU/Internacional</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="PRIVADO">Privado</option>
                    <option value="FISCAL/SOCIAL">Fiscal/Social</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="fund-profile">Perfil</Label>
                  <select id="fund-profile" aria-label="Perfil" className="border rounded h-10 px-2" value={profile} onChange={(e) => setProfile(e.target.value as any)}>
                    <option value="ALL">Todos</option>
                    <option value="solo">Solo</option>
                    <option value="banda">Banda</option>
                    <option value="entidade">Entidade</option>
                    <option value="jovem<30">Jovem &lt; 30</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <Label htmlFor="fund-project">Projeto</Label>
                  <select id="fund-project" aria-label="Projeto" className="border rounded h-10 px-2" value={project} onChange={(e) => setProject(e.target.value as any)}>
                    <option value="ALL">Todos</option>
                    <option value="criacao">Criação</option>
                    <option value="producao">Produção</option>
                    <option value="circulacao">Circulação</option>
                    <option value="formacao">Formação</option>
                    <option value="mobilidade">Mobilidade</option>
                    <option value="internacionalizacao">Internacionalização</option>
                    <option value="programacao">Programação</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <details className="rounded-md border p-4 text-sm space-y-3 mb-4">
              <summary className="font-medium cursor-pointer">Minha elegibilidade (ajuda a filtrar)</summary>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-1 block">Tipo de perfil</Label>
                  <div className="flex gap-3 items-center">
                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="wizType" aria-label="Perfil solo" checked={wizType === 'solo'} onChange={() => setWizType('solo')} /> Solo</label>
                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="wizType" aria-label="Perfil banda" checked={wizType === 'banda'} onChange={() => setWizType('banda')} /> Banda</label>
                    <label className="flex items-center gap-1 text-sm"><input type="radio" name="wizType" aria-label="Perfil entidade" checked={wizType === 'entidade'} onChange={() => setWizType('entidade')} /> Entidade</label>
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Critérios</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" aria-label="Tenho menos de 30 anos" checked={wizUnder30} onChange={(e) => setWizUnder30(e.target.checked)} /> Tenho &lt; 30 anos</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" aria-label="Entidade com 4 anos e equipa" checked={wizEntity4y} onChange={(e) => setWizEntity4y(e.target.checked)} /> Entidade com 4+ anos e equipa</label>
                  </div>
                </div>
                <div>
                  <Label className="mb-1 block">Preferência de categoria</Label>
                  <select aria-label="Preferência categoria" className="border rounded h-10 px-2 w-full" value={wizPrefCat} onChange={(e) => setWizPrefCat(e.target.value as any)}>
                    <option value="ALL">Todas</option>
                    <option value="NACIONAL">Nacional</option>
                    <option value="FUNDAÇÃO">Fundação</option>
                    <option value="EU/INTERNACIONAL">EU/Internacional</option>
                    <option value="REGIONAL">Regional</option>
                    <option value="PRIVADO">Privado</option>
                    <option value="FISCAL/SOCIAL">Fiscal/Social</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => {
                  // define perfil prioritário
                  if (wizUnder30) {
                    setProfile('jovem<30');
                  } else if (wizType === 'solo' || wizType === 'banda') {
                    setProfile(wizType);
                  } else {
                    setProfile('entidade');
                  }
                  // se entidade 4+ anos, sugere Nacional Sustentado
                  if (wizType === 'entidade' && wizEntity4y) {
                    setCat('NACIONAL');
                    setProject('programacao');
                  } else {
                    setCat(wizPrefCat);
                  }
                }}>Aplicar filtros</Button>
                <Button variant="ghost" onClick={() => { setProfile('ALL'); setCat('ALL'); setProject('ALL' as any); setQuery(''); }}>Limpar</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                <a className="text-blue-600 hover:underline" href="https://apoios.dgartes.gov.pt" target="_blank" rel="noreferrer noopener">Balcão das Artes (DGARTES)</a>
                <a className="text-blue-600 hover:underline" href="https://my.gulbenkian.pt" target="_blank" rel="noreferrer noopener">MyGulbenkian</a>
                <a className="text-blue-600 hover:underline" href="https://www.fundacaogda.pt/" target="_blank" rel="noreferrer noopener">Portal do Artista (Fundação GDA)</a>
              </div>
            </details>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="py-2 pr-4">Programa</th>
                    <th className="py-2 pr-4">Entidade</th>
                    <th className="py-2 pr-4">Categoria</th>
                    <th className="py-2 pr-4">Foco</th>
                    <th className="py-2 pr-4">Montante</th>
                    <th className="py-2 pr-4">Elegibilidade</th>
                    <th className="py-2 pr-4">Prazo</th>
                    <th className="py-2 pr-4">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrograms.map((p) => (
                    <tr key={p.id} className="align-top border-t">
                      <td className="py-2 pr-4 font-medium">{p.name}</td>
                      <td className="py-2 pr-4">{p.entity}</td>
                      <td className="py-2 pr-4">{p.category}</td>
                      <td className="py-2 pr-4">
                        <div className="flex flex-wrap gap-1">{p.focus.map((f, i) => (<Badge key={i} variant="outline" className="text-xs">{f}</Badge>))}</div>
                      </td>
                      <td className="py-2 pr-4">{p.amount || "—"}</td>
                      <td className="py-2 pr-4">
                        <ul className="list-disc pl-4 space-y-1">
                          {p.eligibility.map((e, i) => (<li key={i}>{e}</li>))}
                        </ul>
                      </td>
                      <td className="py-2 pr-4 whitespace-nowrap">{p.deadline || "—"}</td>
                      <td className="py-2 pr-4"><a className="text-blue-600 hover:underline" href={p.link} target="_blank" rel="noreferrer noopener">Abrir</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground mt-3">Nota: valores e prazos podem mudar. Confirme sempre no portal oficial antes de submeter.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SponsorshipsPage;