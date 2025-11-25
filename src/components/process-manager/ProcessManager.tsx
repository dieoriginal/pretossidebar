/**
 * Process Manager Component
 * Centralized component for managing all processes
 * Enables dynamic page creation and navigation
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  getEnabledProcesses, 
  getProcessById, 
  ProcessConfig,
  addCustomProcess,
  getProcessesByCategory 
} from "@/lib/processes-config";
import { processFactory, ProcessInstance } from "@/lib/process-factory";
import { Plus, Search, Filter, Grid, List } from "lucide-react";
import Link from "next/link";

interface ProcessManagerProps {
  filterByCategory?: string;
  showCreateButton?: boolean;
  viewMode?: "grid" | "list";
}

export function ProcessManager({ 
  filterByCategory, 
  showCreateButton = true,
  viewMode: initialViewMode = "grid"
}: ProcessManagerProps) {
  const router = useRouter();
  const [processes] = useState<ProcessConfig[]>(() => 
    filterByCategory 
      ? getProcessesByCategory(filterByCategory)
      : getEnabledProcesses()
  );
  const [instances, setInstances] = useState<Map<string, ProcessInstance[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">(initialViewMode);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllInstances();
  }, []);

  const loadAllInstances = async () => {
    try {
      setLoading(true);
      const instancesMap = new Map<string, ProcessInstance[]>();
      
      for (const process of processes) {
        const processInstances = await processFactory.list(process.id);
        instancesMap.set(process.id, processInstances);
      }
      
      setInstances(instancesMap);
    } catch (error) {
      console.error("Error loading instances:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = async (processId: string) => {
    try {
      const instance = await processFactory.create(processId);
      const config = getProcessById(processId);
      if (config) {
        router.push(`${config.href}/${instance.id}`);
      }
    } catch (error) {
      console.error("Error creating instance:", error);
    }
  };

  const filteredProcesses = processes.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.label.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return <div className="p-4">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Processos</h2>
          <p className="text-sm text-muted-foreground">
            Gerir e criar novos projetos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Pesquisar processos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Processes Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProcesses.map((process) => {
            const processInstances = instances.get(process.id) || [];
            const Icon = process.icon;
            
            return (
              <Card key={process.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${process.metadata?.color || "indigo"}-100 dark:bg-${process.metadata?.color || "indigo"}-900/20`}>
                        <Icon className={`w-5 h-5 text-${process.metadata?.color || "indigo"}-600 dark:text-${process.metadata?.color || "indigo"}-400`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{process.label}</CardTitle>
                        <CardDescription className="text-xs">{process.section}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline">{processInstances.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{process.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {process.metadata?.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateNew(process.id)}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Novo
                    </Button>
                    <Link href={process.href}>
                      <Button size="sm" variant="outline">
                        Ver Todos
                      </Button>
                    </Link>
                  </div>

                  {/* Recent Instances */}
                  {processInstances.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2">Recentes:</p>
                      <div className="space-y-1">
                        {processInstances.slice(0, 3).map((instance) => (
                          <Link
                            key={instance.id}
                            href={`${process.href}/${instance.id}`}
                            className="block text-xs hover:underline truncate"
                          >
                            {instance.id} • {new Date(instance.updatedAt).toLocaleDateString()}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredProcesses.map((process) => {
            const processInstances = instances.get(process.id) || [];
            const Icon = process.icon;
            
            return (
              <Card key={process.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <Icon className="w-5 h-5" />
                      <div className="flex-1">
                        <h3 className="font-semibold">{process.label}</h3>
                        <p className="text-sm text-muted-foreground">{process.description}</p>
                      </div>
                      <Badge>{processInstances.length} projetos</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleCreateNew(process.id)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo
                      </Button>
                      <Link href={process.href}>
                        <Button size="sm" variant="outline">
                          Abrir
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

