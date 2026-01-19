"use client";

import { useMemo, useState } from "react";
import { useLibrary } from "@/hooks/use-library";
import { useProject } from "@/hooks/use-project";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, CheckCircle2, PlusCircle, Brain, Filter } from "lucide-react";

export default function HitFrameworkDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("");
  const [activeTab, setActiveTab] = useState("browse");

  const project = useProject((s) => s.project);
  const projectId = project?.id || "_default_";

  const {
    hitCriteria,
    hitAdoptions,
    addHitCriterion,
    updateHitCriterion,
    removeHitCriterion,
    setHitAdoption,
  } = useLibrary();

  const adoptionMap = hitAdoptions[projectId] || {};
  const categories = useMemo(
    () => Array.from(new Set(hitCriteria.map((c) => c.category))).sort(),
    [hitCriteria]
  );

  const filtered = hitCriteria.filter((c) => {
    if (category && c.category !== category) return false;
    if (!q) return true;
    const hay = `${c.title} ${c.category} ${c.description || ""} ${(c.examples || []).join(" ")} ${(c.tags || []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  const adoptedCount = Object.values(adoptionMap).filter((s) => s.adopted).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="w-4 h-4" /> Framework de Hits
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[980px]">
        <DialogHeader>
          <DialogTitle>Framework de Hits</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="browse">Critérios</TabsTrigger>
            <TabsTrigger value="add">Adicionar</TabsTrigger>
            <TabsTrigger value="evaluate">Avaliar</TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === "browse" && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar critério…" className="pl-8 w-[260px]" />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <select className="border rounded px-2 py-1" value={category} onChange={(e) => setCategory(e.target.value)} title="Filtrar por categoria">
                  <option value="">Todas categorias</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="ml-auto text-sm opacity-70">
                {adoptedCount} adotados neste projeto
              </div>
            </div>
            <Separator />
            <ScrollArea className="max-h-[55vh] pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((c) => {
                  const state = adoptionMap[c.id] || { adopted: false };
                  return (
                    <div key={c.id} className="border rounded-lg p-3 bg-card">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold flex items-center gap-2">
                            {c.title}
                            {state.adopted && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                          <div className="text-xs opacity-70 mb-1">{c.category}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox id={`adopt-${c.id}`} checked={!!state.adopted} onCheckedChange={(v) => setHitAdoption(projectId, c.id, Boolean(v))} />
                          <label htmlFor={`adopt-${c.id}`} className="text-sm">Adotar</label>
                        </div>
                      </div>
                      {c.description && <p className="text-sm mt-2">{c.description}</p>}
                      {(c.examples?.length || 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.examples!.map((ex, i) => (
                            <Badge key={i} variant="secondary">{ex}</Badge>
                          ))}
                        </div>
                      )}
                      {(c.tags?.length || 0) > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {c.tags!.map((t, i) => (
                            <Badge key={i} variant="outline">#{t}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === "add" && <AddCriterionForm onAdd={(c) => addHitCriterion(c)} />}

        {activeTab === "evaluate" && (
          <div className="space-y-3">
            <p className="text-sm opacity-80">Percorre os critérios por categoria e marca os que estão a ser aplicados neste projeto.</p>
            <Separator />
            {categories.map((cat) => (
              <div key={cat} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{cat}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hitCriteria.filter((c) => c.category === cat).map((c) => {
                    const state = adoptionMap[c.id] || { adopted: false };
                    return (
                      <label key={c.id} className="border rounded-md p-3 flex items-start gap-2 cursor-pointer bg-card">
                        <Checkbox checked={!!state.adopted} onCheckedChange={(v) => setHitAdoption(projectId, c.id, Boolean(v))} />
                        <div>
                          <div className="font-medium">{c.title}</div>
                          {c.description && <div className="text-xs opacity-70">{c.description}</div>}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function AddCriterionForm({ onAdd }: { onAdd: (c: { title: string; category: string; description?: string; examples?: string[]; tags?: string[] }) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [tags, setTags] = useState("");

  const submit = () => {
    if (!title.trim() || !category.trim()) return;
    onAdd({ title: title.trim(), category: category.trim(), description: description.trim() || undefined, examples: examples.split("\n").map((s) => s.trim()).filter(Boolean), tags: tags.split(",").map((s) => s.trim()).filter(Boolean) });
    setTitle(""); setCategory(""); setDescription(""); setExamples(""); setTags("");
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs">Título</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Narração vulnerável" />
        </div>
        <div>
          <label className="text-xs">Categoria</label>
          <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ex: Narrativa & Emoção" />
        </div>
        <div className="col-span-2">
          <label className="text-xs">Descrição</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explica o critério e a sua intenção" />
        </div>
        <div className="col-span-2">
          <label className="text-xs">Exemplos (um por linha)</label>
          <Textarea value={examples} onChange={(e) => setExamples(e.target.value)} placeholder="P$IC00PATHA\nPerdi Meu Emprego" />
        </div>
        <div className="col-span-2">
          <label className="text-xs">Tags (separadas por vírgulas)</label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="ex: mood, local, textura" />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={submit} className="gap-2"><PlusCircle className="w-4 h-4" /> Adicionar</Button>
      </div>
    </div>
  );
}
