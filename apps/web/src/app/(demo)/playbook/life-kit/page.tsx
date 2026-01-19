"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, LifeBuoy, Plus, Save, Search, Trash2, Edit } from "lucide-react";
import { deleteLifeKitLink, getAllLifeKitLinks, saveLifeKitLink } from "@/lib/playbook-db";
import type { PlaybookDB } from "@/lib/playbook-db";

type LifeKitLink = PlaybookDB["lifeKitLinks"]["value"];

const INITIAL_LINKS: Omit<LifeKitLink, "id" | "createdAt" | "updatedAt">[] = [
  {
    name: "Privacy.com (Virtual Cards)",
    url: "https://www.privacy.com/",
    category: "payments-security",
    priority: "critical",
    description: "Cartões virtuais para proteger pagamentos online (anti-fraude, limites, merchant-lock).",
    tags: ["payments", "security", "virtual-cards"],
  },
  {
    name: "Webshare (Proxies)",
    url: "https://help.webshare.io/en/",
    category: "vpn",
    priority: "high",
    description: "Link para comprar/configurar proxies (documentação/Help Center).",
    tags: ["proxies", "vpn", "privacy", "network"],
  },
];

const CATEGORY_LABEL: Record<LifeKitLink["category"], string> = {
  "payments-security": "Pagamentos & Segurança",
  privacy: "Privacidade",
  vpn: "VPN",
  "password-manager": "Password Manager",
  "2fa": "2FA",
  email: "Email",
  backup: "Backup",
  os: "OS",
  comms: "Comunicações",
  hardware: "Hardware",
  other: "Outro",
};

const PRIORITY_LABEL: Record<LifeKitLink["priority"], string> = {
  critical: "Crítico",
  high: "Alto",
  normal: "Normal",
};

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function LifeKitLinksPage() {
  const [links, setLinks] = useState<LifeKitLink[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LifeKitLink | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const [formData, setFormData] = useState<Omit<LifeKitLink, "id" | "createdAt" | "updatedAt">>({
    name: "",
    url: "",
    category: "other",
    priority: "normal",
    description: "",
    notes: "",
    tags: [],
  });

  const loadLinks = async () => {
    try {
      setLoading(true);
      const items = await getAllLifeKitLinks();
      if (items.length === 0) {
        for (const item of INITIAL_LINKS) {
          await saveLifeKitLink(item);
        }
        const seeded = await getAllLifeKitLinks();
        setLinks(seeded);
      } else {
        setLinks(items);
      }
    } catch (e) {
      console.error("Erro ao carregar Life Kit Links:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLinks();
  }, []);

  const filteredItems = useMemo(() => {
    return links
      .filter((item) => {
        const q = searchQuery.trim().toLowerCase();
        const matchesSearch =
          q === "" ||
          item.name.toLowerCase().includes(q) ||
          item.url.toLowerCase().includes(q) ||
          (item.description || "").toLowerCase().includes(q) ||
          (item.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesCategory = filterCategory === "all" || item.category === filterCategory;
        const matchesPriority = filterPriority === "all" || item.priority === filterPriority;
        return matchesSearch && matchesCategory && matchesPriority;
      })
      .sort((a, b) => {
        const rank: Record<LifeKitLink["priority"], number> = { critical: 0, high: 1, normal: 2 };
        return rank[a.priority] - rank[b.priority] || a.name.localeCompare(b.name);
      });
  }, [links, searchQuery, filterCategory, filterPriority]);

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      url: "",
      category: "other",
      priority: "normal",
      description: "",
      notes: "",
      tags: [],
    });
  };

  const handleEdit = (item: LifeKitLink) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      url: item.url,
      category: item.category,
      priority: item.priority,
      description: item.description || "",
      notes: item.notes || "",
      tags: item.tags || [],
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Por favor, preencha o nome.");
      return;
    }
    if (!isValidUrl(formData.url)) {
      alert("Por favor, insira uma URL válida (http/https).");
      return;
    }
    try {
      if (editingItem) {
        await saveLifeKitLink({ ...formData, id: editingItem.id });
      } else {
        await saveLifeKitLink(formData);
      }
      await loadLinks();
      setIsDialogOpen(false);
      resetForm();
    } catch (e) {
      console.error("Erro ao guardar Life Kit Link:", e);
      alert("Falha ao guardar. Vê o console para detalhes.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este link?")) {
      try {
        await deleteLifeKitLink(id);
        await loadLinks();
      } catch (e) {
        console.error("Erro ao eliminar Life Kit Link:", e);
      }
    }
  };

  return (
    <div className="container py-8 px-4 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500/10">
              <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            Life Kit Links
          </h1>
          <p className="text-muted-foreground">
            Links <strong>críticos</strong> (“cyberpunk savior links”) — ferramentas essenciais pra sobreviver online.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Local</Badge>
          <Link href="/playbook">
            <Button variant="outline">Voltar ao Playbook</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>Biblioteca de links</CardTitle>
              <CardDescription>Lista, pesquisa, filtra e mantém sempre atualizado.</CardDescription>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar link" : "Adicionar link"}</DialogTitle>
                  <DialogDescription>Guarda isto localmente (IndexedDB). Nada é enviado ao servidor.</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="url">URL</Label>
                    <Input
                      id="url"
                      value={formData.url}
                      onChange={(e) => setFormData((p) => ({ ...p, url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Categoria</Label>
                      <Select value={formData.category} onValueChange={(v) => setFormData((p) => ({ ...p, category: v as LifeKitLink["category"] }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolhe..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Prioridade</Label>
                      <Select value={formData.priority} onValueChange={(v) => setFormData((p) => ({ ...p, priority: v as LifeKitLink["priority"] }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Escolhe..." />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_LABEL).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição (curta)</Label>
                    <Input
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Para que serve, por que é importante..."
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notas (longas)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                      rows={6}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      value={(formData.tags || []).join(", ")}
                      onChange={(e) =>
                        setFormData((p) => ({
                          ...p,
                          tags: e.target.value
                            .split(",")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        }))
                      }
                      placeholder="security, payments, privacy..."
                    />
                  </div>
                </div>

                <DialogFooter className="gap-2">
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

          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Pesquisar..." className="pl-8" />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="high">Alto</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">A carregar...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem links (ou filtros muito restritos).</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Link</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Prioridade</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">{item.name}</div>
                          {item.priority === "critical" ? <Badge variant="destructive">Crítico</Badge> : null}
                        </div>
                        <div className="text-xs text-muted-foreground break-all">{item.url}</div>
                        {item.description ? <div className="text-sm text-muted-foreground">{item.description}</div> : null}
                        {item.tags && item.tags.length ? (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {item.tags.slice(0, 6).map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">
                                {t}
                              </Badge>
                            ))}
                            {item.tags.length > 6 ? (
                              <Badge variant="secondary" className="text-xs">
                                +{item.tags.length - 6}
                              </Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{CATEGORY_LABEL[item.category]}</TableCell>
                    <TableCell className="text-sm">{PRIORITY_LABEL[item.priority]}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild size="sm" variant="outline">
                          <a href={item.url} target="_blank" rel="noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


