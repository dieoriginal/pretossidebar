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
import { Mic, Plus, Edit, Trash2, ExternalLink, Save, X, FolderPlus } from "lucide-react";
import { getAllGearItems, saveGearItem, deleteGearItem, getAllCustomCategories, saveCustomCategory, deleteCustomCategory } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type GearItem = PlaybookDB['gear']['value'];
type CustomCategory = PlaybookDB['customCategories']['value'];

const DEFAULT_CATEGORIES = ['microphone', 'interface', 'computer', 'preamp', 'capsule', 'other'] as const;
const DEFAULT_CATEGORY_LABELS: Record<typeof DEFAULT_CATEGORIES[number], string> = {
  microphone: 'Microfone',
  interface: 'Interface',
  computer: 'Computador',
  preamp: 'Preamp',
  capsule: 'Cápsula',
  other: 'Outro',
};

const INITIAL_GEAR: Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    category: 'microphone',
    name: 'Neumann TLM 103',
    brand: 'Neumann',
    model: 'TLM 103',
    alternatives: ['Roswell Pro Audio Mini K87'],
    notes: 'Microfone de condensador de grande diafragma',
  },
  {
    category: 'microphone',
    name: 'Roswell Pro Audio Mini K87',
    brand: 'Roswell Pro Audio',
    model: 'Mini K87',
    alternatives: ['Neumann TLM 103'],
    notes: 'Alternativa ao Neumann TLM 103',
  },
  {
    category: 'interface',
    name: 'UAD APOLLO SOLO',
    brand: 'Universal Audio',
    model: 'Apollo Solo',
    notes: 'Interface de áudio Thunderbolt',
  },
  {
    category: 'computer',
    name: 'MAC MINI M4',
    brand: 'Apple',
    model: 'Mac Mini M4',
    notes: 'Computador principal para produção',
  },
  {
    category: 'preamp',
    name: 'ART Pro MPA II',
    brand: 'ART',
    model: 'Pro MPA II',
    notes: 'Preamp de tubo',
  },
  {
    category: 'capsule',
    name: 'K103 capsule',
    brand: 'Neumann',
    model: 'K103',
    notes: 'Cápsula de microfone',
  },
  {
    category: 'other',
    name: 'STUDIO V3',
    brand: 'Studio',
    model: 'V3',
    notes: 'Estúdio versão 3',
  },
];

export default function GearPage() {
  const [gearItems, setGearItems] = useState<GearItem[]>([]);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GearItem | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [formData, setFormData] = useState<Omit<GearItem, 'id' | 'createdAt' | 'updatedAt'>>({
    category: 'microphone',
    name: '',
    brand: '',
    model: '',
    alternatives: [],
    notes: '',
    links: [],
  });

  useEffect(() => {
    loadGear();
    loadCustomCategories();
  }, []);

  const loadGear = async () => {
    try {
      setLoading(true);
      const items = await getAllGearItems();
      if (items.length === 0) {
        // Initialize with default gear
        for (const item of INITIAL_GEAR) {
          await saveGearItem(item);
        }
        const loaded = await getAllGearItems();
        setGearItems(loaded);
      } else {
        setGearItems(items);
      }
    } catch (error) {
      console.error('Error loading gear:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomCategories = async () => {
    try {
      const categories = await getAllCustomCategories();
      setCustomCategories(categories);
    } catch (error) {
      console.error('Error loading custom categories:', error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !newCategoryLabel.trim()) {
      alert('Por favor, preencha o nome e o label da categoria');
      return;
    }
    try {
      await saveCustomCategory({
        name: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        label: newCategoryLabel.trim(),
      });
      await loadCustomCategories();
      setNewCategoryName('');
      setNewCategoryLabel('');
      setIsCategoryDialogOpen(false);
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    // Verificar se há itens usando esta categoria
    const itemsUsingCategory = gearItems.filter(item => {
      const categoryId = customCategories.find(c => c.name === item.category)?.id;
      return categoryId === id;
    });
    
    if (itemsUsingCategory.length > 0) {
      alert(`Não é possível eliminar esta categoria. Existem ${itemsUsingCategory.length} item(ns) usando-a. Por favor, mova ou elimine esses itens primeiro.`);
      return;
    }

    if (confirm('Tem certeza que deseja eliminar esta categoria?')) {
      try {
        await deleteCustomCategory(id);
        await loadCustomCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
    }
  };

  // Função para obter o label de uma categoria
  const getCategoryLabel = (categoryName: string): string => {
    // Verificar se é uma categoria padrão
    if (DEFAULT_CATEGORIES.includes(categoryName as any)) {
      return DEFAULT_CATEGORY_LABELS[categoryName as typeof DEFAULT_CATEGORIES[number]];
    }
    // Verificar se é uma categoria customizada
    const custom = customCategories.find(c => c.name === categoryName);
    return custom?.label || categoryName;
  };

  // Todas as categorias disponíveis (padrão + customizadas)
  const allCategories = [
    ...DEFAULT_CATEGORIES.map(cat => ({ name: cat, label: DEFAULT_CATEGORY_LABELS[cat], isCustom: false })),
    ...customCategories.map(cat => ({ name: cat.name, label: cat.label, isCustom: true, id: cat.id }))
  ];

  const handleSave = async () => {
    try {
      if (editingItem) {
        await saveGearItem({ ...formData, id: editingItem.id });
      } else {
        await saveGearItem(formData);
      }
      await loadGear();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving gear:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este item?')) {
      try {
        await deleteGearItem(id);
        await loadGear();
      } catch (error) {
        console.error('Error deleting gear:', error);
      }
    }
  };

  const handleEdit = (item: GearItem) => {
    setEditingItem(item);
    setFormData({
      category: item.category,
      name: item.name,
      brand: item.brand || '',
      model: item.model || '',
      alternatives: item.alternatives || [],
      notes: item.notes || '',
      links: item.links || [],
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      category: 'microphone',
      name: '',
      brand: '',
      model: '',
      alternatives: [],
      notes: '',
      links: [],
    });
  };

  const groupedGear = gearItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, GearItem[]>);

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar gear...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Gear Essencial</h1>
          <p className="text-muted-foreground">
            Gerir equipamento essencial para produção musical
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Gear
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Adicionar'} Gear</DialogTitle>
              <DialogDescription>
                Adicione ou edite um item de equipamento essencial
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="category">Categoria</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCategoryDialogOpen(true)}
                  >
                    <FolderPlus className="w-4 h-4 mr-1" />
                    Nova Categoria
                  </Button>
                </div>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {DEFAULT_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                    {customCategories.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-t mt-1">
                          Categorias Personalizadas
                        </div>
                        {customCategories.map(cat => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Neumann TLM 103"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: Neumann"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: TLM 103"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais sobre este gear..."
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

        {/* Dialog para criar nova categoria */}
        <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Categoria</DialogTitle>
              <DialogDescription>
                Crie uma categoria personalizada para organizar o seu gear de forma única
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nome da Categoria (ID)</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: cables, monitors, software"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Será convertido para minúsculas e espaços substituídos por hífens
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryLabel">Label (Nome de Exibição)</Label>
                <Input
                  id="categoryLabel"
                  value={newCategoryLabel}
                  onChange={(e) => setNewCategoryLabel(e.target.value)}
                  placeholder="Ex: Cabos, Monitores, Software"
                />
                <p className="text-xs text-muted-foreground">
                  Nome amigável que será exibido na interface
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCategoryDialogOpen(false);
                setNewCategoryName('');
                setNewCategoryLabel('');
              }}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCategory}>
                <Save className="w-4 h-4 mr-2" />
                Criar Categoria
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de categorias customizadas */}
      {customCategories.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="w-5 h-5" />
              Categorias Personalizadas
            </CardTitle>
            <CardDescription>
              Gerir as suas categorias personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {customCategories.map(cat => (
                <Badge key={cat.id} variant="outline" className="flex items-center gap-2 px-3 py-1">
                  <span>{cat.label}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {Object.entries(groupedGear).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5" />
              {getCategoryLabel(category)}
              <Badge variant="secondary" className="ml-2">
                {items.length}
              </Badge>
              {customCategories.some(c => c.name === category) && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Personalizada
                </Badge>
              )}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.brand && (
                          <CardDescription className="mt-1">
                            {item.brand} {item.model && `• ${item.model}`}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {item.alternatives && item.alternatives.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Alternativas:</p>
                        <div className="flex flex-wrap gap-1">
                          {item.alternatives.map((alt, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {alt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-sm text-muted-foreground">{item.notes}</p>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(item)}
                        className="flex-1"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




