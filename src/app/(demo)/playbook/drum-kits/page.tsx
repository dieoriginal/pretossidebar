"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drum, Plus, Edit, Trash2, Search, Copy, Save, Download, Upload } from "lucide-react";
import { getAllDrumKits, saveDrumKit, deleteDrumKit } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type DrumKit = PlaybookDB['drumKits']['value'];

const INITIAL_DRUM_KITS: Omit<DrumKit, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: "Super Star O - Undefeated Drum Kit", type: "Drum kit", legitimateSources: "Splice / Loopmasters / Producer site", searchQuery: "Super Star O Undefeated Drum Kit official", notes: "" },
  { name: "13 Team Hitz Drum Kit", type: "Drum kit", legitimateSources: "Drum kit marketplaces / YouTube", searchQuery: "13 Team Hitz Drum Kit download", notes: "Likely free promo" },
  { name: "Super Star O - Motivation Drum Kit", type: "Drum kit", legitimateSources: "Splice / Producer site", searchQuery: "Super Star O Motivation Drum Kit", notes: "" },
  { name: "Sylenth1", type: "Plugin (synth)", legitimateSources: "LennarDigital", searchQuery: "Sylenth1 LennarDigital", notes: "Commercial" },
  { name: "Refx Nexus", type: "Plugin (synth)", legitimateSources: "reFX official", searchQuery: "Refx Nexus", notes: "Commercial" },
  { name: "Super Star O Sylenth1 Expansion Volume 2", type: "Sylenth1 preset pack", legitimateSources: "ADSR / Plugin Boutique", searchQuery: "Super Star O Sylenth1 Expansion Volume 2", notes: "" },
  { name: "Super Star O Sylenth1 Expansion Volume 1", type: "Sylenth1 preset pack", legitimateSources: "ADSR / Plugin Boutique", searchQuery: "Super Star O Sylenth1 Expansion Volume 1", notes: "" },
  { name: "Johnny Juliano - Sylenth1 Expansion Volume 1", type: "Sylenth1 preset pack", legitimateSources: "ADSR / Plugin Boutique", searchQuery: "Johnny Juliano Sylenth1 Expansion Volume 1", notes: "" },
  { name: "Johnny Juliano Nexus Expansion / Bread & Butter", type: "Nexus expansion", legitimateSources: "reFX / producer site", searchQuery: "Johnny Juliano Nexus Expansion Bread & Butter", notes: "" },
  { name: "Harmless Johnny Juliano Edition", type: "Harmless preset", legitimateSources: "Producer site", searchQuery: "Johnny Juliano Harmless presets", notes: "Requires FL Studio Harmless" },
  { name: "Celemony Melodyne", type: "Plugin", legitimateSources: "Celemony official", searchQuery: "Celemony Melodyne", notes: "Commercial" },
  { name: "iZoTope The T-Pain Effect Bundle", type: "Plugin", legitimateSources: "iZotope / Plugin Boutique", searchQuery: "iZotope T-Pain Effect Bundle", notes: "Commercial" },
  { name: "Antares AVOX Evo", type: "Plugin", legitimateSources: "Antares official", searchQuery: "Antares AVOX Evo", notes: "Commercial" },
  { name: "Antares Auto-Tune EFX", type: "Plugin", legitimateSources: "Antares official", searchQuery: "Antares Auto-Tune EFX", notes: "Commercial" },
  { name: "Antares Auto-Tune Evo", type: "Plugin", legitimateSources: "Antares official", searchQuery: "Antares Auto-Tune Evo", notes: "Legacy" },
  { name: "Supa Mario Productionz - Supa Crank it Drum Kit Vol.1", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Supa Mario Supa Crank it Drum Kit Vol.1", notes: "" },
  { name: "Johnny Juliano - Instant Ramen Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Instant Ramen Drum Kit", notes: "" },
  { name: "Johnny Juliano - Meat & Potatoes Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Meat & Potatoes Drum Kit", notes: "" },
  { name: "Johnny Juliano - Ah Yeah Bwoi Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Ah Yeah Bwoi Drum Kit", notes: "" },
  { name: "Johnny Juliano - This Plane Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano This Plane Drum Kit", notes: "" },
  { name: "Johnny Juliano - Get Your Own Fucking Style Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Get Your Own Fucking Style Drum Kit", notes: "" },
  { name: "Johnny Juliano - Tha Goonies Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Tha Goonies Drum Kit", notes: "" },
  { name: "Johnny Juliano - Imagination", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Imagination Drum Kit", notes: "" },
  { name: "Johnny Juliano Trap Ghost Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano Trap Ghost Drum Kit", notes: "" },
  { name: "Johnny Juliano - The Day After Tomorrow Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Johnny Juliano The Day After Tomorrow Drum Kit", notes: "" },
  { name: "Vybe Beatz Drum Kit (Exclusive!)", type: "Drum kit", legitimateSources: "Producer site / Splice", searchQuery: "Vybe Beatz Drum Kit", notes: "" },
  { name: "Vybe Beatz - Drum Kit", type: "Drum kit", legitimateSources: "Producer site / Splice", searchQuery: "Vybe Beatz Drum Kit", notes: "" },
  { name: "Vybe Beatz - Facebook Drum Kit", type: "Drum kit", legitimateSources: "Old Facebook promos", searchQuery: "Vybe Beatz Facebook Drum Kit", notes: "" },
  { name: "SuperstarO & Vybe - WeMakeHitz Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "WeMakeHitz Drum Kit SuperstarO Vybe", notes: "" },
  { name: "Super Star O - Grind Or Die Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Super Star O Grind Or Die Kit", notes: "" },
  { name: "KE On The Track Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "KE On The Track Drum Kit", notes: "" },
  { name: "Jerk Drum Kit", type: "Drum kit", legitimateSources: "Marketplaces", searchQuery: "Jerk Drum Kit download", notes: "" },
  { name: "Gucci Mane Drum Kit", type: "Drum kit", legitimateSources: "DrumKits.com / YouTube", searchQuery: "Gucci Mane Drum Kit download", notes: "Fan-made kits exist" },
  { name: "Essay Potna Drum kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Essay Potna Drum Kit", notes: "" },
  { name: "Drumma Boy Drum Kit", type: "Drum kit", legitimateSources: "Producer site / marketplaces", searchQuery: "Drumma Boy Drum Kit official", notes: "" },
  { name: "Lex Luger Torture Rack Shawty Drum Kit", type: "Drum kit", legitimateSources: "Producer site", searchQuery: "Lex Luger Torture Rack Shawty Drum Kit", notes: "" },
  { name: "Download Lex Luger Drum Kit", type: "Drum kit", legitimateSources: "Producer site / marketplaces", searchQuery: "Lex Luger Drum Kit official download", notes: "" },
  { name: "Dat Nigga Lex Luger Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Dat Nigga Lex Luger Drum Kit", notes: "" },
  { name: "Trap-A-Holics Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Trap-A-Holics Drum Kit", notes: "" },
  { name: "Zaytoven Drum Kit", type: "Drum kit", legitimateSources: "Official Zaytoven store / marketplaces", searchQuery: "Zaytoven Drum Kit official", notes: "" },
  { name: "Shawty Redd Drum Kit", type: "Drum kit", legitimateSources: "Producer site", searchQuery: "Shawty Redd Drum Kit", notes: "" },
  { name: "Reggaeton Drum Kit", type: "Drum kit", legitimateSources: "Splice / Loopmasters", searchQuery: "Reggaeton drum kit sample pack", notes: "" },
  { name: "Plies Drum Kit", type: "Drum kit", legitimateSources: "Producer site / YouTube", searchQuery: "Plies Drum Kit", notes: "" },
  { name: "Kane Beatz Drum Kit", type: "Drum kit", legitimateSources: "Producer site / official store", searchQuery: "Kane Beatz Drum Kit official", notes: "" },
];

export default function DrumKitsPage() {
  const [drumKits, setDrumKits] = useState<DrumKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKit, setEditingKit] = useState<DrumKit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState<Omit<DrumKit, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    type: '',
    legitimateSources: '',
    searchQuery: '',
    notes: '',
  });

  useEffect(() => {
    loadDrumKits();
  }, []);

  const loadDrumKits = async () => {
    try {
      setLoading(true);
      const items = await getAllDrumKits();
      if (items.length === 0) {
        // Initialize with default drum kits
        for (const kit of INITIAL_DRUM_KITS) {
          await saveDrumKit(kit);
        }
        const loaded = await getAllDrumKits();
        setDrumKits(loaded);
      } else {
        setDrumKits(items);
      }
    } catch (error) {
      console.error('Error loading drum kits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredKits = useMemo(() => {
    return drumKits.filter(kit => {
      const matchesSearch = searchQuery === "" || 
        kit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        kit.searchQuery.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || kit.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [drumKits, searchQuery, filterType]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(drumKits.map(kit => kit.type))).sort();
  }, [drumKits]);

  const handleSave = async () => {
    try {
      if (editingKit) {
        await saveDrumKit({ ...formData, id: editingKit.id });
      } else {
        await saveDrumKit(formData);
      }
      await loadDrumKits();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving drum kit:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este drum kit?')) {
      try {
        await deleteDrumKit(id);
        await loadDrumKits();
      } catch (error) {
        console.error('Error deleting drum kit:', error);
      }
    }
  };

  const handleEdit = (kit: DrumKit) => {
    setEditingKit(kit);
    setFormData({
      name: kit.name,
      type: kit.type,
      legitimateSources: kit.legitimateSources,
      searchQuery: kit.searchQuery,
      notes: kit.notes,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingKit(null);
    setFormData({
      name: '',
      type: '',
      legitimateSources: '',
      searchQuery: '',
      notes: '',
    });
  };

  const handleCopySearchQuery = (query: string) => {
    navigator.clipboard.writeText(query);
    // You could add a toast notification here
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Type', 'Legitimate Sources', 'Search Query', 'Notes'];
    const rows = drumKits.map(kit => [
      kit.name,
      kit.type,
      kit.legitimateSources,
      kit.searchQuery,
      kit.notes,
    ]);
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'drum-kits.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar drum kits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Drum Kits Favoritos</h1>
          <p className="text-muted-foreground">
            Gerir drum kits favoritos com fontes legítimas e queries de pesquisa
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Drum Kit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingKit ? 'Editar' : 'Adicionar'} Drum Kit</DialogTitle>
                <DialogDescription>
                  Adicione ou edite um drum kit com informações completas
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Super Star O - Undefeated Drum Kit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Input
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Ex: Drum kit, Plugin, Preset pack"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legitimateSources">Fontes Legítimas *</Label>
                  <Input
                    id="legitimateSources"
                    value={formData.legitimateSources}
                    onChange={(e) => setFormData({ ...formData, legitimateSources: e.target.value })}
                    placeholder="Ex: Splice / Loopmasters / Producer site"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="searchQuery">Query de Pesquisa *</Label>
                  <Input
                    id="searchQuery"
                    value={formData.searchQuery}
                    onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
                    placeholder="Ex: Super Star O Undefeated Drum Kit official"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notas adicionais..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por nome ou query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todos os tipos</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Drum Kits ({filteredKits.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fontes Legítimas</TableHead>
                  <TableHead>Query de Pesquisa</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum drum kit encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKits.map((kit) => (
                    <TableRow key={kit.id}>
                      <TableCell className="font-medium">{kit.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{kit.type}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{kit.legitimateSources}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono max-w-xs truncate">{kit.searchQuery}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopySearchQuery(kit.searchQuery)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{kit.notes || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(kit)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(kit.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




