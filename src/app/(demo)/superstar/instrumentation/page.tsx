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
import { Guitar, Plus, Edit, Trash2, Save } from "lucide-react";
import { instruments } from "@/lib/superstar-db";

export default function InstrumentationPage() {
  const [instrumentsList, setInstrumentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'piano' as const,
    skillLevel: 'beginner' as const,
    practiceSchedule: '',
    notes: '',
  });

  useEffect(() => {
    loadInstruments();
  }, []);

  const loadInstruments = async () => {
    try {
      setLoading(true);
      const data = await instruments.getAll();
      setInstrumentsList(data);
    } catch (error) {
      console.error('Error loading instruments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingInstrument) {
        await instruments.save({ ...formData, id: editingInstrument.id });
      } else {
        await instruments.save(formData);
      }
      await loadInstruments();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving instrument:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este instrumento?')) {
      try {
        await instruments.delete(id);
        await loadInstruments();
      } catch (error) {
        console.error('Error deleting instrument:', error);
      }
    }
  };

  const handleEdit = (instrument: any) => {
    setEditingInstrument(instrument);
    setFormData({
      name: instrument.name,
      type: instrument.type,
      skillLevel: instrument.skillLevel,
      practiceSchedule: instrument.practiceSchedule || '',
      notes: instrument.notes || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingInstrument(null);
    setFormData({
      name: '',
      type: 'piano',
      skillLevel: 'beginner',
      practiceSchedule: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar instrumentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Instrumentation</h1>
          <p className="text-muted-foreground">
            Gerir instrumentos e níveis de habilidade
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Instrumento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingInstrument ? 'Editar' : 'Adicionar'} Instrumento</DialogTitle>
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
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="piano">Piano</SelectItem>
                      <SelectItem value="guitar">Guitarra</SelectItem>
                      <SelectItem value="drums">Bateria</SelectItem>
                      <SelectItem value="bass">Baixo</SelectItem>
                      <SelectItem value="strings">Cordas</SelectItem>
                      <SelectItem value="brass">Metais</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skillLevel">Nível de Habilidade</Label>
                  <Select
                    value={formData.skillLevel}
                    onValueChange={(value: any) => setFormData({ ...formData, skillLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Iniciante</SelectItem>
                      <SelectItem value="intermediate">Intermediário</SelectItem>
                      <SelectItem value="advanced">Avançado</SelectItem>
                      <SelectItem value="professional">Profissional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="practiceSchedule">Horário de Prática</Label>
                <Input
                  id="practiceSchedule"
                  value={formData.practiceSchedule}
                  onChange={(e) => setFormData({ ...formData, practiceSchedule: e.target.value })}
                  placeholder="Ex: 30 min diários"
                />
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
        {instrumentsList.map((instrument) => (
          <Card key={instrument.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{instrument.name}</CardTitle>
                <Badge variant="outline">{instrument.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span><strong>Nível:</strong> {instrument.skillLevel}</span>
                {instrument.practiceSchedule && (
                  <span><strong>Prática:</strong> {instrument.practiceSchedule}</span>
                )}
              </div>
              {instrument.notes && (
                <p className="text-sm text-muted-foreground">{instrument.notes}</p>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => handleEdit(instrument)} className="flex-1">
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(instrument.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {instrumentsList.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Ainda não há instrumentos. Adicione o primeiro!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




