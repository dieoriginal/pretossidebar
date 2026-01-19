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
import { Dumbbell, Plus, Edit, Trash2, Save } from "lucide-react";
import { workoutPrograms } from "@/lib/superstar-db";

export default function FitnessPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    duration: 30,
    frequency: '',
    exercises: [] as Array<{ name: string; sets?: number; reps?: number; duration?: number }>,
    target: 'cardio' as const,
    notes: '',
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await workoutPrograms.getAll();
      setPrograms(data);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingProgram) {
        await workoutPrograms.save({ ...formData, id: editingProgram.id });
      } else {
        await workoutPrograms.save(formData);
      }
      await loadPrograms();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving program:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este programa?')) {
      try {
        await workoutPrograms.delete(id);
        await loadPrograms();
      } catch (error) {
        console.error('Error deleting program:', error);
      }
    }
  };

  const handleEdit = (program: any) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      duration: program.duration,
      frequency: program.frequency,
      exercises: program.exercises || [],
      target: program.target,
      notes: program.notes || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      duration: 30,
      frequency: '',
      exercises: [],
      target: 'cardio',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar programas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Fitness</h1>
          <p className="text-muted-foreground">
            Gerir programas de treino e exercícios
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Programa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProgram ? 'Editar' : 'Adicionar'} Programa de Treino</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequência</Label>
                  <Input
                    id="frequency"
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    placeholder="Ex: 3x por semana"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Objetivo</Label>
                <Select
                  value={formData.target}
                  onValueChange={(value: any) => setFormData({ ...formData, target: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="strength">Força</SelectItem>
                    <SelectItem value="flexibility">Flexibilidade</SelectItem>
                    <SelectItem value="endurance">Resistência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card key={program.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{program.name}</CardTitle>
                <Badge variant="outline">{program.target}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span><strong>Duração:</strong> {program.duration} min</span>
                <span><strong>Frequência:</strong> {program.frequency}</span>
              </div>
              {program.notes && (
                <p className="text-sm text-muted-foreground">{program.notes}</p>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => handleEdit(program)} className="flex-1">
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(program.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {programs.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Ainda não há programas. Adicione o primeiro!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




