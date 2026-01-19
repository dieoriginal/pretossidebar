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
import { Switch } from "@/components/ui/switch";
import { Lock, Plus, Edit, Trash2, Search, Save, Eye, EyeOff, Copy, Shield, AlertCircle } from "lucide-react";
import { getAllPasswords, savePassword, deletePassword } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type PasswordItem = PlaybookDB['passwords']['value'];

export default function PasswordsPage() {
  const [passwords, setPasswords] = useState<PasswordItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PasswordItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<Omit<PasswordItem, 'id' | 'createdAt' | 'updatedAt'>>({
    service: '',
    username: '',
    email: '',
    password: '',
    category: 'social-media',
    url: '',
    notes: '',
    twoFactorEnabled: false,
    twoFactorSecret: '',
  });

  useEffect(() => {
    loadPasswords();
  }, []);

  const loadPasswords = async () => {
    try {
      setLoading(true);
      const items = await getAllPasswords();
      setPasswords(items);
    } catch (error) {
      console.error('Error loading passwords:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    return passwords.filter(item => {
      const matchesSearch = searchQuery === "" || 
        item.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [passwords, searchQuery, filterCategory]);

  const handleSave = async () => {
    if (!formData.service || !formData.username || !formData.password) {
      alert('Por favor, preencha pelo menos o serviço, username e senha');
      return;
    }
    try {
      if (editingItem) {
        await savePassword({ ...formData, id: editingItem.id });
      } else {
        await savePassword(formData);
      }
      await loadPasswords();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving password:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja eliminar esta senha? Esta ação não pode ser desfeita.')) {
      try {
        await deletePassword(id);
        await loadPasswords();
      } catch (error) {
        console.error('Error deleting password:', error);
      }
    }
  };

  const handleEdit = (item: PasswordItem) => {
    setEditingItem(item);
    setFormData({
      service: item.service,
      username: item.username,
      email: item.email || '',
      password: item.password,
      category: item.category,
      url: item.url || '',
      notes: item.notes || '',
      twoFactorEnabled: item.twoFactorEnabled || false,
      twoFactorSecret: item.twoFactorSecret || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      service: '',
      username: '',
      email: '',
      password: '',
      category: 'social-media',
      url: '',
      notes: '',
      twoFactorEnabled: false,
      twoFactorSecret: '',
    });
  };

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const copyPassword = async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      // You could add a toast notification here
    } catch (error) {
      console.error('Error copying password:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      'social-media': 'Redes Sociais',
      'distrokid': 'DistroKid',
      'music-platform': 'Plataformas Musicais',
      'email': 'Email',
      'studio': 'Estúdio',
      'other': 'Outro',
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="container py-8 px-4">
        <div className="text-center py-12">
          <p className="text-muted-foreground">A carregar senhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4">
      {/* Privacy Notice */}
      <Alert className="mb-6 border-primary/50 bg-primary/5">
        <Shield className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          Privacidade Total
        </AlertTitle>
        <AlertDescription>
          <strong>Todas as suas senhas são armazenadas localmente no seu navegador.</strong> Nós não temos acesso a nenhuma das suas senhas. 
          Os dados nunca são enviados para servidores externos. Esta informação é 100% privada e segura no seu dispositivo.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Password Manager</h1>
          <p className="text-muted-foreground">
            Gerir todas as senhas: redes sociais, DistroKid, plataformas musicais, emails e mais
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Senha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar' : 'Adicionar'} Senha</DialogTitle>
              <DialogDescription>
                Armazene senhas de forma segura e privada (apenas no seu dispositivo)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Serviço/Plataforma *</Label>
                  <Input
                    id="service"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    placeholder="Ex: Instagram, DistroKid, Spotify"
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
                      <SelectItem value="social-media">Redes Sociais</SelectItem>
                      <SelectItem value="distrokid">DistroKid</SelectItem>
                      <SelectItem value="music-platform">Plataformas Musicais</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="studio">Estúdio</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Username ou ID"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    type="email"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  type="password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL do Site</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="twoFactor"
                  checked={formData.twoFactorEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, twoFactorEnabled: checked })}
                />
                <Label htmlFor="twoFactor" className="cursor-pointer">
                  Autenticação de dois fatores (2FA) ativada
                </Label>
              </div>
              {formData.twoFactorEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="twoFactorSecret">Código/Secret 2FA</Label>
                  <Input
                    id="twoFactorSecret"
                    value={formData.twoFactorSecret}
                    onChange={(e) => setFormData({ ...formData, twoFactorSecret: e.target.value })}
                    placeholder="Código de backup ou secret"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais sobre esta conta..."
                  rows={2}
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
                  placeholder="Pesquisar por serviço, username ou email..."
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
                <option value="social-media">Redes Sociais</option>
                <option value="distrokid">DistroKid</option>
                <option value="music-platform">Plataformas Musicais</option>
                <option value="email">Email</option>
                <option value="studio">Estúdio</option>
                <option value="other">Outro</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Senhas Armazenadas ({filteredItems.length})
          </CardTitle>
          <CardDescription>
            Todas as senhas são armazenadas localmente no seu navegador
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Senha</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhuma senha encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.service}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getCategoryLabel(item.category)}</Badge>
                      </TableCell>
                      <TableCell>{item.username}</TableCell>
                      <TableCell>{item.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">
                            {visiblePasswords.has(item.id) ? item.password : '••••••••'}
                          </span>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => togglePasswordVisibility(item.id)}
                              className="h-6 w-6 p-0"
                            >
                              {visiblePasswords.has(item.id) ? (
                                <EyeOff className="w-3 h-3" />
                              ) : (
                                <Eye className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyPassword(item.password)}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.twoFactorEnabled ? (
                          <Badge variant="secondary" className="text-xs">2FA</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
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






















