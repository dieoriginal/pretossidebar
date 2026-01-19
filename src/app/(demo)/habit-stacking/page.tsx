"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Repeat, Plus, Edit, Trash2, CheckCircle2, Circle, Target, TrendingUp, Calendar, Download } from "lucide-react";
import { useProcessManager } from "@/hooks/use-process-manager";
import { processFactory } from "@/lib/process-factory";
import jsPDF from "jspdf";

// Tipos para os dados de hábitos
export interface Habit {
  id: string;
  name: string;
  cue: string;
  craving: string;
  response: string;
  reward: string;
  stackedAfter?: string; // ID do hábito atual ao qual este está ligado
  frequency: "daily" | "weekly" | "monthly";
  type: "positive" | "negative" | "neutral";
  twoMinuteRule?: string;
  environment?: string; // Zona/ambiente onde o hábito acontece
  completedDates: string[]; // Array de datas no formato YYYY-MM-DD
  createdAt: string;
  updatedAt: string;
}

interface HabitStackingData {
  habits: Habit[];
  routines: {
    name: string;
    habits: string[]; // IDs dos hábitos na ordem
    time?: string;
  }[];
  currentHabits: {
    id: string;
    description: string;
    time?: string;
    location?: string;
  }[];
}

const HABIT_TYPES = [
  { value: "positive", label: "Hábito Positivo [+]", icon: "✅" },
  { value: "negative", label: "Hábito Negativo [-]", icon: "❌" },
  { value: "neutral", label: "Hábito Neutro [=]", icon: "⚪" },
] as const;

const FREQUENCIES = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
] as const;

export default function HabitStackingPage() {
  const { saveInstance } = useProcessManager();
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [data, setData] = useState<HabitStackingData>({
    habits: [],
    routines: [],
    currentHabits: [],
  });

  const [habitForm, setHabitForm] = useState<Partial<Habit>>({
    name: "",
    cue: "",
    craving: "",
    response: "",
    reward: "",
    stackedAfter: undefined,
    frequency: "daily",
    type: "positive",
    twoMinuteRule: "",
    environment: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Tentar carregar de localStorage primeiro
      const saved = localStorage.getItem("habitStackingData");
      if (saved) {
        setData(JSON.parse(saved));
      } else {
        // Inicializar com alguns hábitos predefinidos baseados no texto do usuário
        const defaultData: HabitStackingData = {
          habits: [],
          routines: [],
          currentHabits: [
            { id: "acordar", description: "Acordar", time: "00:99" },
            { id: "arrumar-cama", description: "Arrumar a minha cama" },
            { id: "ligar-pc", description: "Ligar computador" },
            { id: "abrir-cursor", description: "Abrir cursor" },
            { id: "run-boleia", description: "Run Boleia" },
            { id: "mijar", description: "Mijar na casa de banho" },
          ],
        };
        setData(defaultData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (newData: HabitStackingData) => {
    try {
      localStorage.setItem("habitStackingData", JSON.stringify(newData));
      setData(newData);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleSaveHabit = () => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      id: editingHabit?.id || `habit-${Date.now()}`,
      name: habitForm.name || "",
      cue: habitForm.cue || "",
      craving: habitForm.craving || "",
      response: habitForm.response || "",
      reward: habitForm.reward || "",
      stackedAfter: habitForm.stackedAfter,
      frequency: habitForm.frequency || "daily",
      type: habitForm.type || "positive",
      twoMinuteRule: habitForm.twoMinuteRule,
      environment: habitForm.environment,
      completedDates: editingHabit?.completedDates || [],
      createdAt: editingHabit?.createdAt || now,
      updatedAt: now,
    };

    const updatedHabits = editingHabit
      ? data.habits.map((h) => (h.id === editingHabit.id ? newHabit : h))
      : [...data.habits, newHabit];

    saveData({ ...data, habits: updatedHabits });
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteHabit = (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este hábito?")) {
      const updatedHabits = data.habits.filter((h) => h.id !== id);
      saveData({ ...data, habits: updatedHabits });
    }
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setHabitForm({
      name: habit.name,
      cue: habit.cue,
      craving: habit.craving,
      response: habit.response,
      reward: habit.reward,
      stackedAfter: habit.stackedAfter,
      frequency: habit.frequency,
      type: habit.type,
      twoMinuteRule: habit.twoMinuteRule,
      environment: habit.environment,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingHabit(null);
    setHabitForm({
      name: "",
      cue: "",
      craving: "",
      response: "",
      reward: "",
      stackedAfter: undefined,
      frequency: "daily",
      type: "positive",
      twoMinuteRule: "",
      environment: "",
    });
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const updatedHabits = data.habits.map((habit) => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        return {
          ...habit,
          completedDates: isCompleted
            ? habit.completedDates.filter((d) => d !== today)
            : [...habit.completedDates, today],
        };
      }
      return habit;
    });
    saveData({ ...data, habits: updatedHabits });
  };

  const getHabitStreak = (habit: Habit): number => {
    const sortedDates = habit.completedDates.sort().reverse();
    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i]);
      date.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

      if (daysDiff === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const isCompletedToday = (habit: Habit): boolean => {
    const today = new Date().toISOString().split("T")[0];
    return habit.completedDates.includes(today);
  };

  const getHabitStackChain = (habitId: string): Habit[] => {
    const chain: Habit[] = [];
    let currentHabit = data.habits.find((h) => h.id === habitId);

    // Ir para trás na cadeia (encontrar hábitos que levam a este)
    const visited = new Set<string>();
    while (currentHabit && !visited.has(currentHabit.id)) {
      visited.add(currentHabit.id);
      chain.unshift(currentHabit);
      if (currentHabit.stackedAfter) {
        currentHabit = data.habits.find((h) => h.id === currentHabit!.stackedAfter);
      } else {
        break;
      }
    }

    return chain;
  };

  const exportHabitsToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    let yPos = margin;
    const lineHeight = 7;
    const sectionSpacing = 15;

    // Helper para adicionar nova página
    const checkPageBreak = (requiredSpace: number = 30) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Cores
    const primaryColor = "#059669"; // emerald-600
    const secondaryColor = "#6b7280"; // gray-500
    const textColor = "#1f2937"; // gray-800

    // Título Principal
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text("Habit Stacking - Meus Hábitos", margin, yPos);
    yPos += 15;

    // Data de exportação
    doc.setFontSize(10);
    doc.setTextColor(secondaryColor);
    doc.text(`Exportado em: ${new Date().toLocaleDateString("pt-PT", { 
      day: "2-digit", 
      month: "long", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })}`, margin, yPos);
    yPos += sectionSpacing;

    // Estatísticas Gerais
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setTextColor(primaryColor);
    doc.text("Estatísticas", margin, yPos);
    yPos += 10;
    
    doc.setDrawColor(secondaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(textColor);
    const totalHabits = data.habits.length;
    const positiveHabits = data.habits.filter(h => h.type === "positive").length;
    const dailyHabits = data.habits.filter(h => h.frequency === "daily").length;
    const totalCompletions = data.habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    
    doc.text(`Total de Hábitos: ${totalHabits}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Hábitos Positivos: ${positiveHabits}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Hábitos Diários: ${dailyHabits}`, margin, yPos);
    yPos += lineHeight;
    doc.text(`Total de Conclusões: ${totalCompletions}`, margin, yPos);
    yPos += sectionSpacing;

    // Lista de Hábitos
    data.habits.forEach((habit, index) => {
      checkPageBreak(80);
      
      // Número e Nome do Hábito
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      const habitTypeIcon = habit.type === "positive" ? "✅" : habit.type === "negative" ? "❌" : "⚪";
      doc.text(`${habitTypeIcon} Hábito ${index + 1}: ${habit.name}`, margin, yPos);
      yPos += 10;

      // Informações básicas
      doc.setFontSize(9);
      doc.setTextColor(secondaryColor);
      const frequencyLabels: Record<string, string> = { daily: "Diário", weekly: "Semanal", monthly: "Mensal" };
      doc.text(`Frequência: ${frequencyLabels[habit.frequency]} | Tipo: ${habit.type}`, margin, yPos);
      yPos += 8;

      // Streak
      const streak = getHabitStreak(habit);
      if (streak > 0) {
        doc.text(`🔥 Streak: ${streak} dias consecutivos`, margin, yPos);
        yPos += 8;
      }

      // CUE
      checkPageBreak(30);
      doc.setFontSize(11);
      doc.setTextColor(textColor);
      doc.setFont("helvetica", "bold");
      doc.text("CUE (Gatilho):", margin, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const cueLines = doc.splitTextToSize(habit.cue || "Não definido", contentWidth);
      cueLines.forEach((line: string) => {
        checkPageBreak(10);
        doc.text(line, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 3;

      // CRAVING
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.text("CRAVING (Desejo):", margin, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const cravingLines = doc.splitTextToSize(habit.craving || "Não definido", contentWidth);
      cravingLines.forEach((line: string) => {
        checkPageBreak(10);
        doc.text(line, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 3;

      // RESPONSE
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.text("RESPONSE (Resposta/Ação):", margin, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const responseLines = doc.splitTextToSize(habit.response || "Não definido", contentWidth);
      responseLines.forEach((line: string) => {
        checkPageBreak(10);
        doc.text(line, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 3;

      // REWARD
      checkPageBreak(30);
      doc.setFont("helvetica", "bold");
      doc.text("REWARD (Recompensa):", margin, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const rewardLines = doc.splitTextToSize(habit.reward || "Não definido", contentWidth);
      rewardLines.forEach((line: string) => {
        checkPageBreak(10);
        doc.text(line, margin + 5, yPos);
        yPos += lineHeight;
      });
      yPos += 3;

      // Regra dos 2 Minutos
      if (habit.twoMinuteRule) {
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(primaryColor);
        doc.text("Regra dos 2 Minutos:", margin, yPos);
        yPos += 7;
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textColor);
        const twoMinLines = doc.splitTextToSize(habit.twoMinuteRule, contentWidth);
        twoMinLines.forEach((line: string) => {
          checkPageBreak(10);
          doc.text(line, margin + 5, yPos);
          yPos += lineHeight;
        });
        yPos += 3;
      }

      // Stack Info
      if (habit.stackedAfter) {
        checkPageBreak(15);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(secondaryColor);
        const stackedAfterName = data.habits.find(h => h.id === habit.stackedAfter)?.name || 
                                 data.currentHabits.find(h => h.id === habit.stackedAfter)?.description || 
                                 "Hábito";
        doc.text(`Stack após: ${stackedAfterName}`, margin, yPos);
        yPos += 7;
      }

      // Linha separadora
      checkPageBreak(15);
      doc.setDrawColor(secondaryColor);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += sectionSpacing;
    });

    // Cadeias de Habit Stacking
    const rootHabits = data.habits.filter(h => !h.stackedAfter);
    if (rootHabits.length > 0) {
      checkPageBreak(50);
      doc.setFontSize(16);
      doc.setTextColor(primaryColor);
      doc.setFont("helvetica", "bold");
      doc.text("Cadeias de Habit Stacking", margin, yPos);
      yPos += 10;
      
      doc.setDrawColor(secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += sectionSpacing;

      rootHabits.forEach((rootHabit, chainIndex) => {
        const chain = getHabitStackChain(rootHabit.id);
        if (chain.length > 1) {
          checkPageBreak(chain.length * 20 + 20);
          doc.setFontSize(12);
          doc.setTextColor(primaryColor);
          doc.setFont("helvetica", "bold");
          doc.text(`Cadeia ${chainIndex + 1}:`, margin, yPos);
          yPos += 10;

          chain.forEach((habit, index) => {
            checkPageBreak(15);
            doc.setFontSize(10);
            doc.setTextColor(textColor);
            doc.setFont("helvetica", "normal");
            doc.text(`${index + 1}. ${habit.name}`, margin + 5, yPos);
            yPos += 8;
            if (habit.response) {
              const responseLines = doc.splitTextToSize(`   → ${habit.response}`, contentWidth - 10);
              responseLines.forEach((line: string) => {
                checkPageBreak(8);
                doc.text(line, margin + 10, yPos);
                yPos += 6;
              });
            }
            if (index < chain.length - 1) {
              yPos += 3;
            }
          });
          yPos += sectionSpacing;
        }
      });
    }

    // Rodapé
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor);
      doc.text(
        `Página ${i} de ${totalPages} - Habit Stacking System`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    }

    // Salvar PDF
    const fileName = `habit-stacking-${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar hábitos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Repeat className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold tracking-tight">Habit Stacking</h1>
          </div>
          <Button onClick={exportHabitsToPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
        <p className="text-muted-foreground">
          Sistema de gestão de hábitos baseado no método Atomic Habits de James Clear
        </p>
      </div>

      <Tabs defaultValue="habits" className="space-y-6">
        <TabsList>
          <TabsTrigger value="habits">Meus Hábitos</TabsTrigger>
          <TabsTrigger value="tracker">Habit Tracker</TabsTrigger>
          <TabsTrigger value="stacking">Habit Stacking</TabsTrigger>
          <TabsTrigger value="routines">Rotinas</TabsTrigger>
          <TabsTrigger value="guide">Guia Atomic Habits</TabsTrigger>
        </TabsList>

        {/* Tab: Meus Hábitos */}
        <TabsContent value="habits" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Todos os Hábitos</h2>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Hábito
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingHabit ? "Editar Hábito" : "Novo Hábito"}</DialogTitle>
                  <DialogDescription>
                    Preencha o formulário usando o método Atomic Habits (CUE, CRAVING, RESPONSE, REWARD)
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Hábito *</Label>
                    <Input
                      id="name"
                      value={habitForm.name}
                      onChange={(e) => setHabitForm({ ...habitForm, name: e.target.value })}
                      placeholder="Ex: Trabalhar em Pretossidebar"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Tipo de Hábito</Label>
                      <Select
                        value={habitForm.type}
                        onValueChange={(value: "positive" | "negative" | "neutral") =>
                          setHabitForm({ ...habitForm, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HABIT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select
                        value={habitForm.frequency}
                        onValueChange={(value: "daily" | "weekly" | "monthly") =>
                          setHabitForm({ ...habitForm, frequency: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="cue">CUE (Gatilho) *</Label>
                    <Textarea
                      id="cue"
                      value={habitForm.cue}
                      onChange={(e) => setHabitForm({ ...habitForm, cue: e.target.value })}
                      placeholder="O que vai desencadear este hábito? Ex: Após mijar na casa de banho..."
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="craving">CRAVING (Desejo) *</Label>
                    <Textarea
                      id="craving"
                      value={habitForm.craving}
                      onChange={(e) => setHabitForm({ ...habitForm, craving: e.target.value })}
                      placeholder="O que você deseja obter? O que motiva este hábito?"
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="response">RESPONSE (Resposta/Ação) *</Label>
                    <Textarea
                      id="response"
                      value={habitForm.response}
                      onChange={(e) => setHabitForm({ ...habitForm, response: e.target.value })}
                      placeholder="Qual é a ação concreta que você vai fazer?"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="reward">REWARD (Recompensa) *</Label>
                    <Textarea
                      id="reward"
                      value={habitForm.reward}
                      onChange={(e) => setHabitForm({ ...habitForm, reward: e.target.value })}
                      placeholder="Qual é a recompensa que você vai receber? Como se sentirá?"
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="stackedAfter">Stack Após (Hábito Existente)</Label>
                    <Select
                      value={habitForm.stackedAfter || "none"}
                      onValueChange={(value) =>
                        setHabitForm({ ...habitForm, stackedAfter: value === "none" ? undefined : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um hábito existente para fazer stack" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum (Hábito independente)</SelectItem>
                        {data.currentHabits.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.description}
                          </SelectItem>
                        ))}
                        {data.habits.map((h) => (
                          <SelectItem key={h.id} value={h.id}>
                            {h.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="twoMinuteRule">Regra dos 2 Minutos</Label>
                    <Textarea
                      id="twoMinuteRule"
                      value={habitForm.twoMinuteRule}
                      onChange={(e) => setHabitForm({ ...habitForm, twoMinuteRule: e.target.value })}
                      placeholder="Versão simplificada de 2 minutos do hábito. Ex: vestir, meter música, ir até o parque"
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="environment">Zona/Ambiente</Label>
                    <Input
                      id="environment"
                      value={habitForm.environment}
                      onChange={(e) => setHabitForm({ ...habitForm, environment: e.target.value })}
                      placeholder="Ex: Zona de dormir, Zona de trabalhar, etc."
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveHabit} disabled={!habitForm.name || !habitForm.cue}>
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {data.habits.map((habit) => {
              const streak = getHabitStreak(habit);
              const completed = isCompletedToday(habit);
              const habitType = HABIT_TYPES.find((t) => t.value === habit.type);

              return (
                <Card key={habit.id} className={completed ? "border-emerald-500" : ""}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{habitType?.icon}</span>
                          <CardTitle className="text-lg">{habit.name}</CardTitle>
                        </div>
                        {habit.stackedAfter && (
                          <Badge variant="outline" className="text-xs mt-1">
                            Stack após: {data.habits.find((h) => h.id === habit.stackedAfter)?.name || 
                              data.currentHabits.find((h) => h.id === habit.stackedAfter)?.description || "Hábito"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHabit(habit)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHabit(habit.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">CUE</Label>
                        <p className="text-sm">{habit.cue || "Não definido"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">CRAVING</Label>
                        <p className="text-sm">{habit.craving || "Não definido"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">RESPONSE</Label>
                        <p className="text-sm">{habit.response || "Não definido"}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">REWARD</Label>
                        <p className="text-sm">{habit.reward || "Não definido"}</p>
                      </div>
                      {habit.twoMinuteRule && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Regra dos 2 Minutos</Label>
                          <p className="text-sm font-medium text-emerald-600">{habit.twoMinuteRule}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{habit.frequency}</Badge>
                          {streak > 0 && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {streak} dias
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant={completed ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleHabitCompletion(habit.id)}
                        >
                          {completed ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Feito
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4 mr-1" />
                              Marcar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {data.habits.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">Ainda não há hábitos criados</p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Criar Primeiro Hábito
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab: Habit Tracker */}
        <TabsContent value="tracker" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Acompanhamento Diário</h2>
            <div className="grid gap-4">
              {data.habits
                .filter((h) => h.frequency === "daily")
                .map((habit) => {
                  const completed = isCompletedToday(habit);
                  const streak = getHabitStreak(habit);
                  const completionRate = habit.completedDates.length > 0
                    ? Math.round((habit.completedDates.length / 30) * 100)
                    : 0;

                  return (
                    <Card key={habit.id} className={completed ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Checkbox
                                checked={completed}
                                onCheckedChange={() => toggleHabitCompletion(habit.id)}
                              />
                              <h3 className="font-semibold text-lg">{habit.name}</h3>
                              <Badge variant="secondary">{habit.frequency}</Badge>
                            </div>
                            {habit.response && (
                              <p className="text-sm text-muted-foreground ml-8">{habit.response}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 ml-8">
                              {streak > 0 && (
                                <div className="flex items-center gap-1 text-sm">
                                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                                  <span className="font-medium">{streak} dias consecutivos</span>
                                </div>
                              )}
                              <div className="text-sm text-muted-foreground">
                                {completionRate}% este mês
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {data.habits.filter((h) => h.frequency === "daily").length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Ainda não há hábitos diários para acompanhar</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Habit Stacking */}
        <TabsContent value="stacking" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Habit Stacking Chains</h2>
            <p className="text-muted-foreground mb-4">
              Visualize as cadeias de hábitos empilhados. A fórmula: "Depois de [hábito atual], vou [novo hábito]"
            </p>
            
            <div className="grid gap-6">
              {data.habits
                .filter((h) => !h.stackedAfter) // Apenas hábitos raiz
                .map((rootHabit) => {
                  const chain = getHabitStackChain(rootHabit.id);
                  return (
                    <Card key={rootHabit.id}>
                      <CardHeader>
                        <CardTitle>Cadeia de Hábitos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {chain.map((habit, index) => (
                            <div key={habit.id} className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center font-semibold">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{habit.name}</div>
                                {habit.response && (
                                  <div className="text-sm text-muted-foreground">{habit.response}</div>
                                )}
                              </div>
                              {index < chain.length - 1 && (
                                <div className="text-muted-foreground">↓</div>
                              )}
                            </div>
                          ))}
                          {chain.length > 1 && (
                            <div className="mt-4 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium mb-1">Fórmula:</p>
                              <p className="text-sm text-muted-foreground">
                                {chain
                                  .map((h, i) =>
                                    i === 0
                                      ? h.cue || h.name
                                      : `Depois de ${chain[i - 1].name}, vou ${h.response || h.name}`
                                  )
                                  .join(" → ")}
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {data.habits.filter((h) => !h.stackedAfter).length === 0 && (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Repeat className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-2">Ainda não há cadeias de hábitos criadas</p>
                    <p className="text-sm text-muted-foreground text-center">
                      Crie hábitos e defina "Stack Após" para formar cadeias de hábitos
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab: Rotinas */}
        <TabsContent value="routines" className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Rotinas Diárias</h2>
            <p className="text-muted-foreground mb-4">
              Organize seus hábitos em rotinas estruturadas do dia
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Rotina Matinal</CardTitle>
                <CardDescription>Hábitos para começar o dia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.currentHabits.map((habit, index) => (
                    <div key={habit.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{habit.description}</div>
                        {habit.time && (
                          <div className="text-sm text-muted-foreground">{habit.time}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Guia Atomic Habits */}
        <TabsContent value="guide" className="space-y-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Cabeçalho */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Atomic Habits</h2>
              <p className="text-xl text-muted-foreground">por James Clear</p>
              <p className="text-sm text-muted-foreground italic">Um resumo completo do livro</p>
            </div>

            {/* O Livro em Três Frases */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  O Livro em Três Frases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">1.</span> Um hábito atómico é uma prática ou rotina regular que não é apenas pequena e fácil de fazer, mas também é a fonte de um poder incrível, um elemento de um sistema maior de crescimento intencional.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">2.</span> Os maus hábitos repetem-se uma e outra vez não porque não queremos mudar, mas porque temos o processo errado para que a mudança ocorra.
                  </p>
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold">3.</span> Mudanças que parecem pequenas e sem importância no início vão colher uma recompensa maior ao longo do tempo.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* As Cinco Grandes Ideias */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  As Cinco Grandes Ideias do Livro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">1.</span> Os bons hábitos são as pequenas ações de autodesenvolvimento.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">2.</span> Se quiser melhores resultados, então esqueça-se de definir objetivos. Foque-se no processo em vez disso.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">3.</span> A forma mais eficaz de mudar os seus hábitos é focar-se não no que quer alcançar, mas em quem deseja tornar-se.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">4.</span> As Quatro Leis da Mudança de Comportamento são um conjunto simples de regras que podemos usar para construir melhores hábitos. São: (1) tornar óbvio, (2) tornar atraente, (3) tornar fácil, e (4) tornar satisfatório.
                    </p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold">5.</span> O ambiente é a mão invisível que molda o comportamento humano.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumo dos Capítulos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Resumo dos Capítulos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Capítulo 1 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 1: O Poder Surpreendente dos Pequenos Hábitos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Os hábitos são uma espada de dois gumes. Podem trabalhar a seu favor ou contra si. A ideia é criar um sistema para desenvolver bons hábitos. O tempo amplifica a fronteira entre o sucesso e o fracasso. Portanto, os bons hábitos fazem do tempo o seu amigo. Os maus hábitos fazem do tempo o seu inimigo.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    Se se encontrar a lutar para construir um bom hábito ou quebrar um mau, não é porque perdeu a sua capacidade de melhorar. É frequentemente porque não encontrou o seu Potencial Oculto. O nosso potencial oculto está escondido atrás dos objetivos que definimos para nós mesmos, que são mais vezes do que não, além do nosso alcance.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2 italic">
                    "Os objetivos são simplesmente sobre os resultados que quer alcançar. Enquanto os sistemas são sobre os processos que levam a esses resultados."
                  </p>
                </div>

                {/* Capítulo 2 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 2: Como os Seus Hábitos Moldam a Sua Identidade (e Vice-Versa)</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pergunte a si mesmo: "Quem é o tipo de pessoa que quero tornar-me?" Essa pessoa que deseja ser torna-se a fonte de motivação intrínseca. Mas para fazer isto, ou seja, para moldar a sua identidade, terá de mudar os seus hábitos. A forma mais eficaz de mudar os seus hábitos é focar-se não no que quer alcançar, mas em quem deseja tornar-se. Cada ação nesse sentido é um voto para o tipo de pessoa que deseja ser.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    Segundo James Clear, "existem três camadas de mudança de comportamento: uma mudança nos seus resultados, uma mudança nos seus processos, ou uma mudança na sua identidade." Ele diz: "Os resultados são sobre o que obtém. Os processos são sobre o que faz. A identidade é sobre o que acredita."
                  </p>
                </div>

                {/* Capítulo 3 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 3: Como Construir Melhores Hábitos em 4 Passos Simples</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Pergunte a si mesmo 4 perguntas simples. Estas quatro perguntas simples são as Quatro Leis da Mudança de Comportamento, que são um conjunto de regras que podemos usar para construir melhores hábitos:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mt-2 text-sm text-muted-foreground">
                    <li>Como posso tornar óbvio?</li>
                    <li>Como posso tornar atraente?</li>
                    <li>Como posso tornar fácil?</li>
                    <li>Como posso tornar satisfatório?</li>
                  </ol>
                </div>

                {/* Capítulo 4 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 4: O Homem Que Não Parecia Certo</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Primeiro, precisamos de nos perguntar duas questões: "Este comportamento ajuda-me a tornar-me no tipo de pessoa que desejo ser? Este hábito dá um voto a favor ou contra a minha identidade desejada?" A razão para se perguntar estas questões é porque o processo de mudança comportamental começa sempre com a consciência. Precisamos de estar cientes dos nossos hábitos antes de os podermos mudar.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    Uma vez que identifiquemos quais são esses bons hábitos, com o tempo e com prática suficiente, os nossos cérebros vão captar os sinais que preveem certos resultados sem pensar conscientemente nisso. Então, assim que os nossos hábitos se tornam automáticos, também se tornam naturais.
                  </p>
                </div>

                {/* Capítulo 5 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 5: A Melhor Forma de Começar um Novo Hábito</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Para tornar óbvio, a maioria das pessoas pensa que a motivação é o que lhes falta, quando na verdade o que realmente lhes falta é clareza. Quando estamos claros sobre as coisas, podemos proceder com total confiança.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                    "Uma das melhores formas de construir um novo hábito," segundo James Clear, "é identificar um hábito atual que já faz todos os dias e depois empilhar o seu novo comportamento em cima. Isto chama-se habit stacking." "Habit stacking," segundo James Clear, "é uma estratégia que pode usar para emparelhar um novo hábito com um hábito atual." Os dois sinais mais importantes que ele diz são o tempo e a localização. É aqui que a intenção de implementação é criada, o que lhe dá a oportunidade de emparelhar um novo hábito com um tempo e localização específicos.
                  </p>
                </div>

                {/* Capítulo 6 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 6: A Motivação é Superestimada; O Ambiente Frequentemente Importa Mais</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Segundo James Clear, devemos "Tornar os sinais dos bons hábitos óbvios no nosso ambiente." Porquê? Porque o nosso ambiente é a mão invisível que delineia o comportamento humano. Ele diz: "Gradualmente, os seus hábitos tornam-se associados não com um único gatilho, mas com todo o contexto que rodeia o comportamento, que é o ambiente em que se encontra. Portanto, é mais fácil construir novos hábitos num novo ambiente porque não está a lutar contra sinais antigos, pois cada hábito tem os seus próprios gatilhos."
                  </p>
                </div>

                {/* Capítulo 7 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 7: O Segredo do Auto-Controlo</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    É passar menos tempo em situações tentadoras. É mais fácil evitar a tentação do que resistir-lhe. Uma das formas mais práticas de eliminar um mau hábito é reduzir a exposição ao gatilho que o causa.
                  </p>
                </div>

                {/* Capítulo 8 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 8: Como Tornar um Hábito Irresistível</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    James Clear oferece que devemos "torná-lo atraente." Ele transmite que "quanto mais atraente uma oportunidade é, mais provável é que se torne formadora de hábitos." É a antecipação de uma recompensa—não o seu cumprimento—que nos faz agir, isto é o que torna o hábito irresistível.
                  </p>
                </div>

                {/* Capítulo 9 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 9: O Papel da Família e dos Amigos na Formação dos Seus Hábitos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    James Clear diz: "Tendemos a imitar os hábitos de três grupos sociais: os próximos (família e amigos), os muitos (a tribo), e os poderosos (aqueles com status e prestígio)." Ele propõe: "Uma das coisas mais eficazes que pode fazer para construir melhores hábitos é juntar-se a uma cultura onde (1) o seu comportamento desejado é o comportamento normal e (2) já tem algo em comum com o grupo."
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-2 italic">
                    "O comportamento normal da tribo frequentemente sobrepõe-se ao comportamento desejado do indivíduo. Na maioria dos dias, preferimos estar errados com a multidão do que estar certos sozinhos."
                  </p>
                </div>

                {/* Capítulo 10 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 10: Como Encontrar e Corrigir a Causa dos Seus Maus Hábitos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    James Clear sugere que devemos "torná-lo pouco atraente." Devemos fazer isto destacando os benefícios de evitar um mau hábito, o que o tornará pouco atraente. Portanto, os hábitos são atraentes quando os associamos a sentimentos positivos e pouco atraentes quando os associamos a sentimentos negativos.
                  </p>
                </div>

                {/* Capítulo 11 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 11: Caminhe Devagar, mas Nunca para Trás</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    James Clear sugere que devemos "torná-lo fácil." Ele diz: "a forma mais eficaz de aprendizagem é a prática, não o planeamento." Então "Foque-se em tomar ação, não estar em movimento."
                  </p>
                </div>

                {/* Capítulo 12 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 12: A Lei do Menor Esforço</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    James Clear diz que naturalmente gravitamos para a opção que requer a menor resistência ou a menor quantidade de trabalho. Então, a ideia é criar um ambiente onde fazer a coisa certa se torna o mais fácil possível.
                  </p>
                </div>

                {/* Capítulo 13 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 13: Como Parar de Procrastinar Usando a Regra dos Dois Minutos</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A Regra dos Dois Minutos afirma: "Quando começar um novo hábito, deve levar menos de dois minutos a fazer." Torne-o o mais simples possível para começar e adicione-lhe à medida que o tempo passa.
                  </p>
                </div>

                {/* Capítulo 14 */}
                <div className="space-y-2 border-l-4 border-emerald-500 pl-4">
                  <h3 className="font-semibold text-lg">Capítulo 14: Como Tornar os Hábitos Inevitáveis e os Maus Hábitos Impossíveis</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    A forma de o fazer é tornar os bons hábitos fáceis e os maus hábitos difíceis.
                  </p>
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-semibold">Torne os bons hábitos inevitáveis por:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Tornar óbvio</li>
                      <li>Tornar atraente</li>
                      <li>Tornar fácil</li>
                      <li>Tornar satisfatório</li>
                    </ol>
                    <p className="text-sm font-semibold mt-3">Torne os maus hábitos impossíveis por:</p>
                    <ol className="list-decimal list-inside space-y-1 ml-4 text-sm text-muted-foreground">
                      <li>Tornar invisível</li>
                      <li>Tornar pouco atraente</li>
                      <li>Tornar difícil</li>
                      <li>Tornar insatisfatório</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quatro Leis - Resumo Visual */}
            <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <Repeat className="w-5 h-5" />
                  As Quatro Leis da Mudança de Comportamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
                    <h4 className="font-semibold text-emerald-700 dark:text-emerald-300 mb-2">Para Bons Hábitos</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Tornar óbvio</li>
                      <li>Tornar atraente</li>
                      <li>Tornar fácil</li>
                      <li>Tornar satisfatório</li>
                    </ol>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700">
                    <h4 className="font-semibold text-red-700 dark:text-red-300 mb-2">Para Maus Hábitos</h4>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Tornar invisível</li>
                      <li>Tornar pouco atraente</li>
                      <li>Tornar difícil</li>
                      <li>Tornar insatisfatório</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

