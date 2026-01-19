"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Monitor, Plus, Edit, Trash2, Search, Save, ExternalLink } from "lucide-react";
import { getAllSoftware, saveSoftware, deleteSoftware } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type SoftwareItem = PlaybookDB['software']['value'];

export default function SoftwarePage() {
  const [software, setSoftware] = useState<SoftwareItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SoftwareItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [formData, setFormData] = useState<Omit<SoftwareItem, 'id' | 'createdAt' | 'updatedAt'>>({
    name: '',
    type: 'video-editing',
    manufacturer: '',
    version: '',
    legitimateSources: '',
    searchQuery: '',
    downloadUrl: '',
    licenseKey: '',
    notes: '',
  });

  useEffect(() => {
    loadSoftware();
  }, []);

  const loadSoftware = async () => {
    try {
      setLoading(true);
      const items = await getAllSoftware();
      setSoftware(items);
    } catch (error) {
      console.error('Error loading software:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return software.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === "all" || item.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [software, searchQuery, filterType]);

  const handleSave = async () => {
    try {
      if (editingItem) {
        await saveSoftware({ ...formData, id: editingItem.id });
      } else {
        await saveSoftware(formData);
      }
      await loadSoftware();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving software:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este software?')) {
      try {
        await deleteSoftware(id);
        await loadSoftware();
      } catch (error) {
        console.error('Error deleting software:', error);
      }
    }
  };

  const handleEdit = (item: SoftwareItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      manufacturer: item.manufacturer,
      version: item.version || '',
      legitimateSources: item.legitimateSources,
      searchQuery: item.searchQuery,
      downloadUrl: item.downloadUrl || '',
      licenseKey: item.licenseKey || '',
      notes: item.notes || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      type: 'video-editing',
      manufacturer: '',
      version: '',
      legitimateSources: '',
      searchQuery: '',
      downloadUrl: '',
      licenseKey: '',
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar software...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Software</h1>
          <p className="text-muted-foreground">
            Gerir software de edição de vídeo, design gráfico e áudio
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Software
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Adicionar'} Software</DialogTitle>
              <DialogDescription>
                Adicione ou edite software (Premiere, Davinci, Photoshop, etc.)
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
                    placeholder="Ex: Adobe Premiere Pro"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video-editing">Edição de Vídeo</SelectItem>
                      <SelectItem value="graphic-design">Design Gráfico</SelectItem>
                      <SelectItem value="audio-editing">Edição de Áudio</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturer">Fabricante *</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Ex: Adobe, Blackmagic Design"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="version">Versão</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="Ex: 2024"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="legitimateSources">Fontes Legítimas *</Label>
                <Input
                  id="legitimateSources"
                  value={formData.legitimateSources}
                  onChange={(e) => setFormData({ ...formData, legitimateSources: e.target.value })}
                  placeholder="Ex: Site oficial / Creative Cloud"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="searchQuery">Query de Pesquisa *</Label>
                <Input
                  id="searchQuery"
                  value={formData.searchQuery}
                  onChange={(e) => setFormData({ ...formData, searchQuery: e.target.value })}
                  placeholder="Ex: Adobe Premiere Pro 2024 download"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="licenseKey">Chave de Licença</Label>
                  <Input
                    id="licenseKey"
                    value={formData.licenseKey}
                    onChange={(e) => setFormData({ ...formData, licenseKey: e.target.value })}
                    placeholder="Chave de licença (opcional)"
                    type="password"
                  />
                </div>
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
                  placeholder="Pesquisar por nome ou fabricante..."
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
                <option value="video-editing">Edição de Vídeo</option>
                <option value="graphic-design">Design Gráfico</option>
                <option value="audio-editing">Edição de Áudio</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Software ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fabricante</TableHead>
                  <TableHead>Fontes Legítimas</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhum software encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.type}</Badge>
                      </TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.legitimateSources}</TableCell>
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






















