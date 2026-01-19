"use client";

import { useMemo, useState } from "react";
import { useLibrary, TitleCategory } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

export default function TitleSuggestionsDialog() {
  const { titles, addTitle, removeTitle } = useLibrary();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<TitleCategory | "Todas">("Todas");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [producer, setProducer] = useState("");
  const [description, setDescription] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return titles.filter((t) =>
      (category === "Todas" || t.category === category) &&
      (!s || [t.title, t.artist, t.producer, t.description].filter(Boolean).some((x) => String(x).toLowerCase().includes(s)))
    );
  }, [titles, q, category]);

  const canAdd = title.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addTitle({ title, category: (category === "Todas" ? "Trackz" : category) as TitleCategory, artist: artist || undefined, producer: producer || undefined, description: description || undefined });
    setTitle("");
    setArtist("");
    setProducer("");
    setDescription("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Sugestões de Títulos</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Base de Sugestões de Títulos</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 flex items-center gap-2">
            <Input placeholder="Pesquisar…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Select value={category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas</SelectItem>
                <SelectItem value="Trackz">Trackz</SelectItem>
                <SelectItem value="Álbuns">Álbuns</SelectItem>
                <SelectItem value="Tournés">Tournés</SelectItem>
                <SelectItem value="Ideias de Som">Ideias de Som</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Novo título</Label>
            <Input placeholder="Ex.: Umwelt" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Select value={category === "Todas" ? "Trackz" : category} onValueChange={(v: any) => setCategory(v)}>
              <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Trackz">Trackz</SelectItem>
                <SelectItem value="Álbuns">Álbuns</SelectItem>
                <SelectItem value="Tournés">Tournés</SelectItem>
                <SelectItem value="Ideias de Som">Ideias de Som</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Artista (opcional)" value={artist} onChange={(e) => setArtist(e.target.value)} />
            <Input placeholder="Producer (opcional)" value={producer} onChange={(e) => setProducer(e.target.value)} />
            <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button onClick={handleAdd} disabled={!canAdd} className="w-full"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
          </div>
        </div>
        <ScrollArea className="max-h-[50vh] mt-3">
          <div className="space-y-2">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-2 border rounded p-2">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground flex gap-2 items-center">
                    <Badge variant="outline">{t.category}</Badge>
                    {t.artist && <span>• {t.artist}</span>}
                    {t.producer && <span>• prod. {t.producer}</span>}
                    {t.description && <span className="italic">— {t.description}</span>}
                  </div>
                </div>
                <Button variant="ghost" size="icon" aria-label="Remover" title="Remover" onClick={() => removeTitle(t.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
