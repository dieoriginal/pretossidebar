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
import { Progress } from "@/components/ui/progress";
import { Brain, Plus, Edit, Trash2, Save, Sparkles, TrendingUp } from "lucide-react";
import { ideologies, symbols, artistAlignments } from "@/lib/ideologies-db";

const IDEOLOGY_TYPES = ['political', 'philosophical', 'artistic', 'spiritual'] as const;
const TYPE_LABELS: Record<typeof IDEOLOGY_TYPES[number], string> = {
  political: 'Política',
  philosophical: 'Filosofia',
  artistic: 'Arte',
  spiritual: 'Espiritual',
};

export default function IdeologiesPage() {
  const [ideologiesList, setIdeologiesList] = useState<any[]>([]);
  const [symbolsList, setSymbolsList] = useState<any[]>([]);
  const [alignments, setAlignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSymbolDialogOpen, setIsSymbolDialogOpen] = useState(false);
  const [editingIdeology, setEditingIdeology] = useState<any | null>(null);
  const [editingSymbol, setEditingSymbol] = useState<any | null>(null);
  const [ideologyFormData, setIdeologyFormData] = useState({
    name: '',
    type: 'political' as const,
    description: '',
    keyConcepts: [] as string[],
    symbols: [] as any[],
    alignment: 0,
    notes: '',
  });
  const [symbolFormData, setSymbolFormData] = useState({
    name: '',
    meaning: '',
    visualDescription: '',
    usageInArt: '',
    ideologyId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ideologiesData, symbolsData, alignmentsData] = await Promise.all([
        ideologies.getAll(),
        symbols.getAll(),
        artistAlignments.getAll(),
      ]);
      setIdeologiesList(ideologiesData);
      setSymbolsList(symbolsData);
      setAlignments(alignmentsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIdeology = async () => {
    try {
      if (editingIdeology) {
        await ideologies.save({ ...ideologyFormData, id: editingIdeology.id });
      } else {
        await ideologies.save(ideologyFormData);
      }
      await loadData();
      setIsDialogOpen(false);
      resetIdeologyForm();
    } catch (error) {
      console.error('Error saving ideology:', error);
    }
  };

  const handleSaveSymbol = async () => {
    try {
      if (editingSymbol) {
        await symbols.save({ ...symbolFormData, id: editingSymbol.id });
      } else {
        await symbols.save(symbolFormData);
      }
      await loadData();
      setIsSymbolDialogOpen(false);
      resetSymbolForm();
    } catch (error) {
      console.error('Error saving symbol:', error);
    }
  };

  const handleDeleteIdeology = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta ideologia?')) {
      try {
        await ideologies.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting ideology:', error);
      }
    }
  };

  const handleDeleteSymbol = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este símbolo?')) {
      try {
        await symbols.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting symbol:', error);
      }
    }
  };

  const handleEditIdeology = (ideology: any) => {
    setEditingIdeology(ideology);
    setIdeologyFormData({
      name: ideology.name,
      type: ideology.type,
      description: ideology.description,
      keyConcepts: ideology.keyConcepts || [],
      symbols: ideology.symbols || [],
      alignment: ideology.alignment || 0,
      notes: ideology.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleEditSymbol = (symbol: any) => {
    setEditingSymbol(symbol);
    setSymbolFormData({
      name: symbol.name,
      meaning: symbol.meaning,
      visualDescription: symbol.visualDescription || '',
      usageInArt: symbol.usageInArt || '',
      ideologyId: symbol.ideologyId || '',
    });
    setIsSymbolDialogOpen(true);
  };

  const resetIdeologyForm = () => {
    setEditingIdeology(null);
    setIdeologyFormData({
      name: '',
      type: 'political',
      description: '',
      keyConcepts: [],
      symbols: [],
      alignment: 0,
      notes: '',
    });
  };

  const resetSymbolForm = () => {
    setEditingSymbol(null);
    setSymbolFormData({
      name: '',
      meaning: '',
      visualDescription: '',
      usageInArt: '',
      ideologyId: '',
    });
  };

  const getAlignmentForIdeology = (ideologyId: string) => {
    const alignment = alignments.find(a => a.ideologyId === ideologyId);
    return alignment?.alignment || 0;
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar ideologias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Ideologias & Simbolismos</h1>
        <p className="text-muted-foreground">
          Sistema de ideologias políticas e filosóficas para incorporar na arte
        </p>
      </div>

      <Tabs defaultValue="ideologies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ideologies">Ideologias</TabsTrigger>
          <TabsTrigger value="symbols">Símbolos</TabsTrigger>
          <TabsTrigger value="alignment">Alinhamento</TabsTrigger>
        </TabsList>

        <TabsContent value="ideologies" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ideologias</h2>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetIdeologyForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetIdeologyForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Ideologia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingIdeology ? 'Editar' : 'Adicionar'} Ideologia</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={ideologyFormData.name}
                      onChange={(e) => setIdeologyFormData({ ...ideologyFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo</Label>
                    <Select
                      value={ideologyFormData.type}
                      onValueChange={(value: any) => setIdeologyFormData({ ...ideologyFormData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {IDEOLOGY_TYPES.map(type => (
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
                      value={ideologyFormData.description}
                      onChange={(e) => setIdeologyFormData({ ...ideologyFormData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="alignment">Alinhamento (-100 a 100)</Label>
                    <Input
                      id="alignment"
                      type="number"
                      min="-100"
                      max="100"
                      value={ideologyFormData.alignment}
                      onChange={(e) => setIdeologyFormData({ ...ideologyFormData, alignment: parseInt(e.target.value) || 0 })}
                    />
                    <Progress value={(ideologyFormData.alignment + 100) / 2} className="mt-2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={ideologyFormData.notes}
                      onChange={(e) => setIdeologyFormData({ ...ideologyFormData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveIdeology}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ideologiesList.map((ideology) => {
              const alignment = getAlignmentForIdeology(ideology.id);
              return (
                <Card key={ideology.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{ideology.name}</CardTitle>
                      <Badge variant="outline">{TYPE_LABELS[ideology.type]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {ideology.description && (
                      <p className="text-sm text-muted-foreground">{ideology.description}</p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Alinhamento:</span>
                        <span className="font-medium">{alignment}%</span>
                      </div>
                      <Progress value={(alignment + 100) / 2} />
                    </div>
                    {ideology.keyConcepts && ideology.keyConcepts.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {ideology.keyConcepts.map((concept: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {concept}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" onClick={() => handleEditIdeology(ideology)} className="flex-1">
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteIdeology(ideology.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {ideologiesList.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Ainda não há ideologias. Adicione a primeira!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="symbols" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Símbolos</h2>
            <Dialog open={isSymbolDialogOpen} onOpenChange={(open) => {
              setIsSymbolDialogOpen(open);
              if (!open) resetSymbolForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetSymbolForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Símbolo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingSymbol ? 'Editar' : 'Adicionar'} Símbolo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol-name">Nome *</Label>
                    <Input
                      id="symbol-name"
                      value={symbolFormData.name}
                      onChange={(e) => setSymbolFormData({ ...symbolFormData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meaning">Significado *</Label>
                    <Textarea
                      id="meaning"
                      value={symbolFormData.meaning}
                      onChange={(e) => setSymbolFormData({ ...symbolFormData, meaning: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="visualDescription">Descrição Visual</Label>
                    <Textarea
                      id="visualDescription"
                      value={symbolFormData.visualDescription}
                      onChange={(e) => setSymbolFormData({ ...symbolFormData, visualDescription: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="usageInArt">Como Usar na Arte</Label>
                    <Textarea
                      id="usageInArt"
                      value={symbolFormData.usageInArt}
                      onChange={(e) => setSymbolFormData({ ...symbolFormData, usageInArt: e.target.value })}
                      rows={3}
                      placeholder="Sugestões de como incorporar este símbolo na sua arte..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ideologyId">Ideologia Associada</Label>
                    <Select
                      value={symbolFormData.ideologyId || "__none__"}
                      onValueChange={(value) => setSymbolFormData({ ...symbolFormData, ideologyId: value === "__none__" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar ideologia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Nenhuma</SelectItem>
                        {ideologiesList.map(ideology => (
                          <SelectItem key={ideology.id} value={ideology.id}>
                            {ideology.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsSymbolDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={handleSaveSymbol}>
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {symbolsList.map((symbol) => {
              const associatedIdeology = ideologiesList.find(i => i.id === symbol.ideologyId);
              return (
                <Card key={symbol.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {symbol.name}
                      </CardTitle>
                      {associatedIdeology && (
                        <Badge variant="outline">{associatedIdeology.name}</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{symbol.meaning}</p>
                    {symbol.visualDescription && (
                      <p className="text-sm"><strong>Visual:</strong> {symbol.visualDescription}</p>
                    )}
                    {symbol.usageInArt && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs font-medium mb-1">Como usar na arte:</p>
                        <p className="text-sm">{symbol.usageInArt}</p>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button size="sm" variant="outline" onClick={() => handleEditSymbol(symbol)} className="flex-1">
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Editar
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteSymbol(symbol.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {symbolsList.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Ainda não há símbolos. Adicione o primeiro!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="alignment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Alinhamento Ideológico</CardTitle>
              <CardDescription>
                Visualize o seu alinhamento com diferentes ideologias e filosofias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ideologiesList.map((ideology) => {
                  const alignment = getAlignmentForIdeology(ideology.id);
                  return (
                    <div key={ideology.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{ideology.name}</span>
                        <span className="text-sm text-muted-foreground">{alignment}%</span>
                      </div>
                      <Progress value={(alignment + 100) / 2} />
                    </div>
                  );
                })}
                {ideologiesList.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Adicione ideologias para ver o alinhamento
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}




