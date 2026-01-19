/**
 * Dialog for adding new processes dynamically
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Music, CalendarClock, ShoppingBag, MapPin, HandCoins, Clapperboard, BookOpenText, Store, Settings } from "lucide-react";
import { addCustomProcess, ProcessConfig, getEnabledProcesses } from "@/lib/processes-config";
import { processFactory } from "@/lib/process-factory";

const AVAILABLE_ICONS = {
  Music,
  CalendarClock,
  ShoppingBag,
  MapPin,
  HandCoins,
  Clapperboard,
  BookOpenText,
  Store,
  Settings,
};

const CATEGORIES = ["criação", "eventos", "negócio", "produção", "educação", "licenciamento"];

export function AddProcessDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    label: "",
    href: "",
    section: "",
    description: "",
    icon: "Settings" as keyof typeof AVAILABLE_ICONS,
    category: "criação",
    order: getEnabledProcesses().length + 1,
    tags: "",
    features: {
      save: true,
      export: true,
      share: false,
      templates: false,
      analytics: false,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Generate ID from label if not provided
      const processId = formData.id || formData.label.toLowerCase().replace(/\s+/g, "-");
      const href = formData.href || `/${processId}`;

      // Get icon component
      const IconComponent = AVAILABLE_ICONS[formData.icon] || Settings;
      
      // Add process to config
      const newProcess = addCustomProcess({
        id: processId,
        type: "custom",
        label: formData.label,
        href,
        section: formData.section || `Processo ${formData.order}`,
        icon: IconComponent,
        description: formData.description,
        enabled: true,
        order: formData.order,
        dbStore: processId,
        features: formData.features,
        metadata: {
          color: "indigo",
          category: formData.category,
          tags: formData.tags.split(",").map(t => t.trim()).filter(Boolean),
        },
      });

      // Create initial instance
      const instance = await processFactory.create(processId, {
        overview: {
          name: formData.label,
          description: formData.description,
          createdAt: new Date().toISOString(),
        },
      });

      // Create page file structure (we'll create a template)
      await createProcessPage(processId, newProcess);

      setOpen(false);
      
      // Reset form
      setFormData({
        id: "",
        label: "",
        href: "",
        section: "",
        description: "",
        icon: "Settings",
        category: "criação",
        order: getEnabledProcesses().length + 1,
        tags: "",
        features: {
          save: true,
          export: true,
          share: false,
          templates: false,
          analytics: false,
        },
      });
      
      // Dispatch custom event to refresh sidebar
      window.dispatchEvent(new CustomEvent('processAdded'));
      
      // Small delay to ensure localStorage is updated and sidebar refreshes
      setTimeout(() => {
        // Navigate to new process
        window.location.href = `${href}/${instance.id}`;
      }, 200);
    } catch (error) {
      console.error("Error creating process:", error);
      alert("Erro ao criar processo. Verifica a consola para mais detalhes.");
    } finally {
      setLoading(false);
    }
  };

  const createProcessPage = async (processId: string, config: ProcessConfig) => {
    // This would ideally create the file, but in browser we can't write files
    // So we'll store the page template in IndexedDB and load it dynamically
    const pageTemplate = generatePageTemplate(processId, config);
    
    // Store template in IndexedDB for dynamic loading
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open("FazteUmAmboDB", 4);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("processPages")) {
          db.createObjectStore("processPages", { keyPath: "processId" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const transaction = db.transaction("processPages", "readwrite");
    const store = transaction.objectStore("processPages");
    await new Promise((resolve, reject) => {
      const request = store.put({
        processId,
        template: pageTemplate,
        config,
        createdAt: new Date(),
      });
      request.onsuccess = () => resolve(null);
      request.onerror = () => reject(request.error);
    });
  };

  const generatePageTemplate = (processId: string, config: ProcessConfig): string => {
    return `"use client";

import { useState, useEffect } from "react";
import { useProcessManager } from "@/hooks/use-process-manager";
import { processFactory, ProcessInstance } from "@/lib/process-factory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";

export default function ${processId.charAt(0).toUpperCase() + processId.slice(1)}Page({ 
  params 
}: { 
  params: { id: string } 
}) {
  const { saveInstance } = useProcessManager();
  const [instance, setInstance] = useState<ProcessInstance | null>(null);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [params.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const loaded = await processFactory.load(params.id);
      if (loaded) {
        setInstance(loaded);
        setData(loaded.data || {});
      }
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!instance) return;
    
    try {
      setSaving(true);
      instance.data = data;
      instance.updatedAt = new Date();
      await saveInstance(instance);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>${config.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={data.name || ""}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Nome do projeto"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={data.description || ""}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Descrição do projeto"
              rows={4}
            />
          </div>

          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-start">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Novo Processo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Processo</DialogTitle>
          <DialogDescription>
            Cria um novo processo personalizado. O sistema irá gerar automaticamente a página e integrar tudo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="label">Nome do Processo *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Ex: Produção de Álbum"
                required
              />
            </div>
            <div>
              <Label htmlFor="id">ID (auto-gerado se vazio)</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="producao-album"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="section">Secção</Label>
            <Input
              id="section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              placeholder="Ex: Processo 13"
            />
          </div>

          <div>
            <Label htmlFor="href">URL (auto-gerado se vazio)</Label>
            <Input
              id="href"
              value={formData.href}
              onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              placeholder="/meu-processo"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do que este processo faz..."
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="icon">Ícone</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value as keyof typeof AVAILABLE_ICONS })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(AVAILABLE_ICONS).map((iconName) => (
                    <SelectItem key={iconName} value={iconName}>
                      {iconName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          <div>
            <Label htmlFor="order">Ordem</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              min={1}
            />
          </div>

          <div className="space-y-2">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save"
                  checked={formData.features.save}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, save: checked as boolean },
                    })
                  }
                />
                <Label htmlFor="save" className="text-sm font-normal">Guardar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export"
                  checked={formData.features.export}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, export: checked as boolean },
                    })
                  }
                />
                <Label htmlFor="export" className="text-sm font-normal">Exportar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="share"
                  checked={formData.features.share}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, share: checked as boolean },
                    })
                  }
                />
                <Label htmlFor="share" className="text-sm font-normal">Partilhar</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="templates"
                  checked={formData.features.templates}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, templates: checked as boolean },
                    })
                  }
                />
                <Label htmlFor="templates" className="text-sm font-normal">Templates</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={formData.features.analytics}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      features: { ...formData.features, analytics: checked as boolean },
                    })
                  }
                />
                <Label htmlFor="analytics" className="text-sm font-normal">Analytics</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "A criar..." : "Criar Processo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

