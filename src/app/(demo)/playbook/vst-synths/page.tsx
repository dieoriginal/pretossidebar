"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Music, Plus, Edit, Trash2, Search, Save, ExternalLink } from "lucide-react";
import { getAllVstSynths, saveVstSynth, deleteVstSynth } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type VstSynth = PlaybookDB['vstSynths']['value'];

export default function VstSynthsPage() {
  const [vstSynths, setVstSynths] = useState<VstSynth[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VstSynth | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [formData, setFormData] = useState<Omit<VstSynth, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    manufacturer: '',
    version: '',
    category: 'synth',
    legitimateSources: '',
    searchQuery: '',
    downloadUrl: '',
    notes: '',
  });

  useEffect(() => {
    loadVstSynths();
  }, []);

  const loadVstSynths = async () => {
    try {
      setLoading(true);
      const items = await getAllVstSynths();
      setVstSynths(items);
    } catch (error) {
      console.error('Error loading VST synths:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return vstSynths.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.searchQuery.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [vstSynths, searchQuery, filterCategory]);

  const handleSave = async () => {
    try {
      if (editingItem) {
        await saveVstSynth({ ...formData, id: editingItem.id });
      } else {
        await saveVstSynth(formData);
      }
      await loadVstSynths();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving VST synth:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este VST?')) {
      try {
        await deleteVstSynth(id);
        await loadVstSynths();
      } catch (error) {
        console.error('Error deleting VST synth:', error);
      }
    }
  };

  const handleEdit = (item: VstSynth) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      manufacturer: item.manufacturer,
      version: item.version || '',
      category: item.category,
      legitimateSources: item.legitimateSources,
      searchQuery: item.searchQuery,
      downloadUrl: item.downloadUrl || '',
      notes: item.notes || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      manufacturer: '',
      version: '',
      category: 'synth',
      legitimateSources: '',
      searchQuery: '',
      downloadUrl: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar VST synths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">VST Synths</h1>
          <p className="text-muted-foreground">
            Gerir VST synths, samplers e romplers essenciais
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar VST
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Adicionar'} VST Synth</DialogTitle>
              <DialogDescription>
                Adicione ou edite um VST synth com informações completas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Sylenth1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante *</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Ex: LennarDigital"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="Ex: 3.0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synth">Synth</SelectItem>
                      <SelectItem value="sampler">Sampler</SelectItem>
                      <SelectItem value="rompler">Rompler</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="legitimateSources">Fontes Legítimas *</Label>
                <Input
                  id="legitimateSources"
                  value={formData.legitimateSources}
                  onChange={(e) => setFormData({ ...formData, legitimateSources: e.target.value })}
                  placeholder="Ex: Site oficial / Plugin Boutique"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="searchQuery">Query de Pesquisa *</Label>
                <Input
                  id="searchQuery"
                  value={formData.searchQuery}
                  onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
                  placeholder="Ex: Sylenth1 LennarDigital download"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="downloadUrl">URL de Download</Label>
                <Input
                  id="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
                  placeholder="https://..."
                  type="url"
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
                  placeholder="Pesquisar por nome, fabricante ou query..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Todas as categorias</option>
                <option value="synth">Synth</option>
                <option value="sampler">Sampler</option>
                <option value="rompler">Rompler</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            VST Synths ({filteredItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fontes Legítimas</TableHead>
                  <TableHead>Query de Pesquisa</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum VST encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{item.legitimateSources}</TableCell>
                      <TableCell className="max-w-xs truncate font-mono text-sm">{item.searchQuery}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
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






















