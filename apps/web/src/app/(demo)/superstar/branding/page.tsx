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
import { Palette, Plus, Edit, Trash2, Save } from "lucide-react";
import { brandingElements } from "@/lib/superstar-db";

const TYPES = ['logo', 'color-palette', 'typography', 'imagery', 'voice', 'values'] as const;
const TYPE_LABELS: Record<typeof TYPES[number], string> = {
  logo: 'Logo',
  'color-palette': 'Paleta de Cores',
  typography: 'Tipografia',
  imagery: 'Imagery',
  voice: 'Voz',
  values: 'Valores',
};

export default function BrandingPage() {
  const [elements, setElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    type: 'logo' as const,
    name: '',
    description: '',
    examples: [] as string[],
    notes: '',
  });

  useEffect(() => {
    loadElements();
  }, []);

  const loadElements = async () => {
    try {
      setLoading(true);
      const data = await brandingElements.getAll();
      setElements(data);
    } catch (error) {
      console.error('Error loading elements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingElement) {
        await brandingElements.save({ ...formData, id: editingElement.id });
      } else {
        await brandingElements.save(formData);
      }
      await loadElements();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving element:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este elemento?')) {
      try {
        await brandingElements.delete(id);
        await loadElements();
      } catch (error) {
        console.error('Error deleting element:', error);
      }
    }
  };

  const handleEdit = (element: any) => {
    setEditingElement(element);
    setFormData({
      type: element.type,
      name: element.name,
      description: element.description,
      examples: element.examples || [],
      notes: element.notes || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingElement(null);
    setFormData({
      type: 'logo',
      name: '',
      description: '',
      examples: [],
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar elementos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Branding & Marketing</h1>
          <p className="text-muted-foreground">
            Gerir elementos de marca e identidade visual
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Elemento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingElement ? 'Editar' : 'Adicionar'} Elemento de Branding</DialogTitle>
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
                    {TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
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
        {elements.map((element) => (
          <Card key={element.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{element.name}</CardTitle>
                <Badge variant="outline">{TYPE_LABELS[element.type]}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {element.description && (
                <p className="text-sm text-muted-foreground">{element.description}</p>
              )}
              {element.notes && (
                <p className="text-sm">{element.notes}</p>
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => handleEdit(element)} className="flex-1">
                  <Edit className="w-3.5 h-3.5 mr-1.5" />
                  Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(element.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {elements.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Ainda não há elementos. Adicione o primeiro!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




