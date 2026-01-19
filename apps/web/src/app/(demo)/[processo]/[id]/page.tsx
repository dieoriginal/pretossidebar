/**
 * Dynamic Process Page Loader
 * Loads custom processes created via AddProcessDialog
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, ArrowLeft, Settings } from "lucide-react";
import { processFactory, ProcessInstance } from "@/lib/process-factory";
import { getProcessById } from "@/lib/processes-config";
import { useProcessManager } from "@/hooks/use-process-manager";
import { getIconByName } from "@/lib/icon-helper";
import Link from "next/link";

export default function DynamicProcessPage() {
  const params = useParams();
  const router = useRouter();
  const processo = params.processo as string;
  const id = params.id as string;
  
  const { saveInstance } = useProcessManager();
  const [instance, setInstance] = useState<ProcessInstance | null>(null);
  const [config, setConfig] = useState<any>(null);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pageTemplate, setPageTemplate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [processo, id]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load process config
      const processConfig = getProcessById(processo);
      if (!processConfig) {
        // Try to load from IndexedDB (custom process)
        const customConfig = await loadCustomProcessConfig(processo);
        if (customConfig) {
          setConfig(customConfig);
        } else {
          console.error("Process not found:", processo);
          return;
        }
      } else {
        setConfig(processConfig);
      }

      // Load instance
      const loaded = await processFactory.load(id);
      if (loaded) {
        setInstance(loaded);
        setData(loaded.data || {});
      }

      // Load page template if custom process
      if (!processConfig) {
        const template = await loadPageTemplate(processo);
        if (template) {
          setPageTemplate(template);
        }
      }
    } catch (error) {
      console.error("Error loading:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomProcessConfig = async (processId: string): Promise<any> => {
    try {
      // First try to load from localStorage (where addCustomProcess saves it)
      const customProcesses = JSON.parse(localStorage.getItem("customProcesses") || "[]");
      const found = customProcesses.find((p: any) => p.id === processId);
      if (found) {
        // Map icon name back to component
        if (found.iconName) {
          found.icon = getIconByName(found.iconName);
        } else {
          found.icon = Settings;
        }
        return found;
      }

      // Fallback to IndexedDB
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

      const transaction = db.transaction("processPages", "readonly");
      const store = transaction.objectStore("processPages");
      
      return new Promise((resolve, reject) => {
        const request = store.get(processId);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result?.config || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error loading custom config:", error);
      return null;
    }
  };

  const loadPageTemplate = async (processId: string): Promise<string | null> => {
    try {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open("FazteUmAmboDB", 4);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      const transaction = db.transaction("processPages", "readonly");
      const store = transaction.objectStore("processPages");
      
      return new Promise((resolve, reject) => {
        const request = store.get(processId);
        request.onsuccess = () => {
          const result = request.result;
          resolve(result?.template || null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error loading template:", error);
      return null;
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
      alert("Erro ao guardar. Verifica a consola.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Carregando processo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!instance || !config) {
    return (
      <div className="container mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Processo não encontrado</h2>
            <p className="text-muted-foreground mb-4">
              O processo "{processo}" não foi encontrado.
            </p>
            <Link href="/">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle icon - can be component or string (for custom processes)
  let Icon: any = null;
  if (typeof config.icon === "function") {
    Icon = config.icon;
  } else if (typeof config.icon === "string") {
    // For custom processes stored in localStorage, icon might be string
    // We'll use a default icon
    Icon = Settings;
  } else {
    Icon = Settings;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            {Icon && <Icon className="w-6 h-6" />}
            <div>
              <CardTitle>{config.label}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="name">Nome do Projeto</Label>
            <Input
              id="name"
              value={data.name || ""}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="Nome do projeto"
              className="mt-2"
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
              className="mt-2"
            />
          </div>

          {/* Additional fields from instance data */}
          {data.overview && (
            <div className="space-y-4 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold">Detalhes Adicionais</h3>
              {Object.entries(data.overview).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    id={key}
                    value={value || ""}
                    onChange={(e) => setData({
                      ...data,
                      overview: { ...data.overview, [key]: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Custom fields from template */}
          {data.customFields && Object.entries(data.customFields).map(([key, value]: [string, any]) => (
            <div key={key}>
              <Label htmlFor={key}>{key}</Label>
              <Input
                id={key}
                value={value || ""}
                onChange={(e) => setData({
                  ...data,
                  customFields: { ...data.customFields, [key]: e.target.value }
                })}
                className="mt-2"
              />
            </div>
          ))}

          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground pt-4 border-t">
            <p>ID: {instance.id}</p>
            <p>Criado: {new Date(instance.createdAt).toLocaleString('pt-PT')}</p>
            <p>Atualizado: {new Date(instance.updatedAt).toLocaleString('pt-PT')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

