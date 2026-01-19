"use client";

import { useMemo, useState } from "react";
import { useLibrary } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus } from "lucide-react";

export default function AdlibsDialog({ onPick }: { onPick?: (phrase: string) => void }) {
  const { adlibs, addAdlib, removeAdlib } = useLibrary();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const [phrase, setPhrase] = useState("");
  const [voiceType, setVoiceType] = useState("");
  const [how, setHow] = useState("");
  const [music, setMusic] = useState("");
  const [album, setAlbum] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return adlibs;
    return adlibs.filter((a) => [a.phrase, a.voiceType, a.how, a.music, a.album].filter(Boolean).some((x) => String(x).toLowerCase().includes(s)));
  }, [q, adlibs]);

  const canAdd = phrase.trim().length > 0;

  const handleAdd = () => {
    if (!canAdd) return;
    addAdlib({ phrase, voiceType: voiceType || undefined, how: how || undefined, music: music || undefined, album: album || undefined });
    setPhrase(""); setVoiceType(""); setHow(""); setMusic(""); setAlbum("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Adlibs</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Biblioteca de Adlibs</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Input placeholder="Pesquisar…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <ScrollArea className="h-[50vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pr-2">
                {filtered.map((a) => (
                  <div key={a.id} className="border rounded p-2 space-y-1">
                    <div className="font-semibold">{a.phrase}</div>
                    <div className="text-xs text-muted-foreground">
                      {[a.voiceType, a.how, a.music, a.album].filter(Boolean).join(" • ")}
                    </div>
                    <div className="flex justify-between items-center gap-2">
                      {onPick ? (
                        <Button size="sm" onClick={() => { onPick(a.phrase); setOpen(false); }}>Usar</Button>
                      ) : <div />}
                      <Button variant="ghost" size="icon" title="Remover" aria-label="Remover" onClick={() => removeAdlib(a.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <Label>Nova adlib</Label>
            <Input placeholder="Frase" value={phrase} onChange={(e) => setPhrase(e.target.value)} />
            <Input placeholder="Tipo de voz (opcional)" value={voiceType} onChange={(e) => setVoiceType(e.target.value)} />
            <Input placeholder="Como (opcional)" value={how} onChange={(e) => setHow(e.target.value)} />
            <Input placeholder="Música/Artista (opcional)" value={music} onChange={(e) => setMusic(e.target.value)} />
            <Input placeholder="Álbum (opcional)" value={album} onChange={(e) => setAlbum(e.target.value)} />
            <Button className="w-full" disabled={!canAdd} onClick={handleAdd}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
