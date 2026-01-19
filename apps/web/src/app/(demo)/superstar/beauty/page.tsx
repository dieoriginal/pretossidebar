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
import { Heart, Plus, Edit, Trash2, Save, Star } from "lucide-react";
import { beautyProducts } from "@/lib/superstar-db";

const CATEGORIES = ['cleanser', 'moisturizer', 'serum', 'sunscreen', 'mask', 'other'] as const;
const CATEGORY_LABELS: Record<typeof CATEGORIES[number], string> = {
  cleanser: 'Limpeza',
  moisturizer: 'Hidratante',
  serum: 'Sérum',
  sunscreen: 'Protetor Solar',
  mask: 'Máscara',
  other: 'Outro',
};

const ROUTINES = ['morning', 'evening', 'both'] as const;
const ROUTINE_LABELS: Record<typeof ROUTINES[number], string> = {
  morning: 'Manhã',
  evening: 'Tarde',
  both: 'Ambos',
};

export default function BeautyPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'cleanser' as const,
    brand: '',
    price: undefined as number | undefined,
    rating: undefined as number | undefined,
    notes: '',
    routine: undefined as 'morning' | 'evening' | 'both' | undefined,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const items = await beautyProducts.getAll();
      setProducts(items);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await beautyProducts.save({ ...formData, id: editingProduct.id });
      } else {
        await beautyProducts.save(formData);
      }
      await loadProducts();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar este produto?')) {
      try {
        await beautyProducts.delete(id);
        await loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      brand: product.brand || '',
      price: product.price,
      rating: product.rating,
      notes: product.notes || '',
      routine: product.routine,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'cleanser',
      brand: '',
      price: undefined,
      rating: undefined,
      notes: '',
      routine: undefined,
    });
  };

  const groupedProducts = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Beauty & Skin Care</h1>
          <p className="text-muted-foreground">
            Gerir produtos de skincare e rotinas de beleza
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Editar' : 'Adicionar'} Produto</DialogTitle>
              <DialogDescription>
                Adicione ou edite um produto de skincare
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Cleanser Facial"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {CATEGORY_LABELS[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: La Mer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (€)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price || ''}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating || ''}
                    onChange={(e) => setFormData({ ...formData, rating: e.target.value ? parseInt(e.target.value) : undefined })}
                    placeholder="5"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="routine">Rotina</Label>
                <Select
                  value={formData.routine || '__none__'}
                  onValueChange={(value: any) => setFormData({ ...formData, routine: value === '__none__' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar rotina" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhuma</SelectItem>
                    {ROUTINES.map(routine => (
                      <SelectItem key={routine} value={routine}>
                        {ROUTINE_LABELS[routine]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas sobre este produto..."
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

      <div className="space-y-8">
        {Object.entries(groupedProducts).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              {CATEGORY_LABELS[category as typeof CATEGORIES[number]]}
              <Badge variant="secondary" className="ml-2">
                {items.length}
              </Badge>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.brand && (
                          <CardDescription className="mt-1">
                            {product.brand}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant="outline">{CATEGORY_LABELS[product.category]}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      {product.price && (
                        <span className="text-sm font-medium">€{product.price.toFixed(2)}</span>
                      )}
                      {product.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating}/5</span>
                        </div>
                      )}
                    </div>
                    {product.routine && (
                      <Badge variant="secondary" className="text-xs">
                        {ROUTINE_LABELS[product.routine]}
                      </Badge>
                    )}
                    {product.notes && (
                      <p className="text-sm text-muted-foreground">{product.notes}</p>
                    )}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(product)}
                        className="flex-1"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1.5" />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(product.id)}
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
        {products.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Ainda não há produtos. Adicione o primeiro!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




