"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  addPlatform, 
  getAllPlatforms, 
  searchPlatforms, 
  deletePlatform,
  updatePlatform,
  ArtistPlatform,
  initializeDefaultPlatforms
} from "@/lib/artistPlatformsDb";
import { useAutoSave } from "@/hooks/use-auto-save";
import { useProject } from "@/hooks/use-project";
import { AutoSaveStatus } from "@/components/auto-save-status";
import { ExternalLink, Plus, Trash2, Edit, CheckCircle2, XCircle } from "lucide-react";

const fieldClass = "w-full";

type DraftPlatform = {
  name: string;
  url: string;
  category: string;
  description: string;
  registrationUrl: string;
  requirements: string;
  notes: string;
  isActive: boolean;
};

export default function ArtistaOutThereStep() {
  const project = useProject((s) => s.project);
  const projectId = project?.id || 'current-project';
  
  const [list, setList] = useState<ArtistPlatform[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [category, setCategory] = useState("portugal");
  const [description, setDescription] = useState("");
  const [registrationUrl, setRegistrationUrl] = useState("");
  const [requirements, setRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Auto-save para draft do formulário
  const { save: saveDraft, status: saveStatus, load: loadDraft } = useAutoSave<DraftPlatform>({
    stepKey: 'artista_out_there_draft',
    projectId,
    autoLoad: false,
  });

  // Carregar draft quando abrir diálogo
  useEffect(() => {
    if (open && !editingId) {
      loadDraft().then((loadedData) => {
        if (loadedData) {
          setName(loadedData.name || "");
          setUrl(loadedData.url || "");
          setCategory(loadedData.category || "portugal");
          setDescription(loadedData.description || "");
          setRegistrationUrl(loadedData.registrationUrl || "");
          setRequirements(loadedData.requirements || "");
          setNotes(loadedData.notes || "");
          setIsActive(loadedData.isActive !== undefined ? loadedData.isActive : true);
        }
      });
    }
  }, [open, editingId, loadDraft]);

  // Inicializar plataformas padrão
  useEffect(() => {
    initializeDefaultPlatforms().then(() => {
      load();
    });
  }, []);

  const canSave = name.trim().length > 0 && url.trim().length > 0;

  const load = async () => {
    const all = await getAllPlatforms();
    all.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setList(all);
  };

  const doSearch = async (term: string) => {
    setQ(term);
    const results = await searchPlatforms(term);
    results.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setList(results);
  };

  // Auto-save quando campos mudam
  useEffect(() => {
    if (open && !editingId) {
      const draft: DraftPlatform = {
        name,
        url,
        category,
        description,
        registrationUrl,
        requirements,
        notes,
        isActive,
      };
      saveDraft(draft);
    }
  }, [name, url, category, description, registrationUrl, requirements, notes, isActive, open, editingId, saveDraft]);

  const resetForm = async () => {
    setName("");
    setUrl("");
    setCategory("portugal");
    setDescription("");
    setRegistrationUrl("");
    setRequirements("");
    setNotes("");
    setIsActive(true);
    setEditingId(null);
    // Limpar draft salvo
    await saveDraft({
      name: "",
      url: "",
      category: "portugal",
      description: "",
      registrationUrl: "",
      requirements: "",
      notes: "",
      isActive: true,
    });
  };

  const handleEdit = (platform: ArtistPlatform) => {
    setName(platform.name);
    setUrl(platform.url);
    setCategory(platform.category || "portugal");
    setDescription(platform.description || "");
    setRegistrationUrl(platform.registrationUrl || "");
    setRequirements(platform.requirements || "");
    setNotes(platform.notes || "");
    setIsActive(platform.isActive !== undefined ? platform.isActive : true);
    setEditingId(platform.id);
    setOpen(true);
  };

  const onSave = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      if (editingId) {
        await updatePlatform(editingId, {
          name,
          url,
          category,
          description,
          registrationUrl,
          requirements,
          notes,
          isActive,
        });
      } else {
        await addPlatform({
          name,
          url,
          category,
          description,
          registrationUrl,
          requirements,
          notes,
          isActive,
        });
      }
      await load();
      await resetForm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar esta plataforma?")) return;
    await deletePlatform(id);
    await load();
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case "portugal": return "bg-blue-500";
      case "international": return "bg-purple-500";
      case "booking": return "bg-green-500";
      case "festival": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">Artista Out-there</h3>
          <p className="text-sm text-muted-foreground">
            Plataformas e websites onde o artista pode se inscrever para ser chamado para eventos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) {
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Plataforma
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle>{editingId ? "Editar Plataforma" : "Nova Plataforma"}</DialogTitle>
                  <AutoSaveStatus status={saveStatus} />
                </div>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="name">Nome da Plataforma *</Label>
                  <Input 
                    id="name" 
                    className={fieldClass} 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Ex.: Portal de Artistas" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input 
                    id="url" 
                    className={fieldClass} 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                    placeholder="https://portaldeartistas.pt/pesquisa/eventos" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={fieldClass}>
                      <SelectValue placeholder="Selecionar categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portugal">Portugal</SelectItem>
                      <SelectItem value="international">Internacional</SelectItem>
                      <SelectItem value="booking">Booking</SelectItem>
                      <SelectItem value="festival">Festival</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationUrl">URL de Inscrição</Label>
                  <Input 
                    id="registrationUrl" 
                    className={fieldClass} 
                    value={registrationUrl} 
                    onChange={(e) => setRegistrationUrl(e.target.value)} 
                    placeholder="https://..." 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea 
                    id="description" 
                    className={fieldClass} 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Breve descrição da plataforma..." 
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="requirements">Requisitos para Inscrição</Label>
                  <Textarea 
                    id="requirements" 
                    className={fieldClass} 
                    value={requirements} 
                    onChange={(e) => setRequirements(e.target.value)} 
                    placeholder="Ex.: Bio, fotos, vídeos, rider técnico..." 
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea 
                    id="notes" 
                    className={fieldClass} 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Observações, dicas, contactos..." 
                    rows={2}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isActive" 
                      checked={isActive} 
                      onCheckedChange={(checked) => setIsActive(checked === true)} 
                    />
                    <Label htmlFor="isActive" className="cursor-pointer">
                      Plataforma ativa (em uso)
                    </Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => {
                  setOpen(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button disabled={!canSave || busy} onClick={onSave}>
                  {busy ? "A guardar…" : editingId ? "Atualizar" : "Guardar Plataforma"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input 
          value={q} 
          onChange={(e) => doSearch(e.target.value)} 
          placeholder="Procurar por nome, URL, categoria..." 
          className="max-w-md" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p) => (
          <div 
            key={p.id} 
            className={`border rounded-md p-4 space-y-3 bg-white dark:bg-zinc-900 ${
              !p.isActive ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold leading-tight">{p.name}</h4>
                  {p.isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-gray-400" />
                  )}
                </div>
                {p.category && (
                  <Badge className={`${getCategoryColor(p.category)} text-white text-xs`}>
                    {p.category}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(p)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(p.id)}
                  className="h-8 w-8 p-0 text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            {p.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {p.description}
              </p>
            )}

            <div className="space-y-1">
              {p.url && (
                <a 
                  href={p.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Website
                </a>
              )}
              {p.registrationUrl && (
                <a 
                  href={p.registrationUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 block"
                >
                  <ExternalLink className="w-3 h-3" />
                  Inscrição
                </a>
              )}
            </div>

            {p.requirements && (
              <div className="text-xs text-muted-foreground">
                <strong>Requisitos:</strong> {p.requirements}
              </div>
            )}

            {p.notes && (
              <div className="text-xs text-muted-foreground italic">
                {p.notes}
              </div>
            )}
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-sm text-muted-foreground col-span-full">
            Sem plataformas guardadas ainda. Adicione a primeira plataforma!
          </div>
        )}
      </div>
    </div>
  );
}







