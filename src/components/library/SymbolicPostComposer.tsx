"use client";

import { useState } from "react";
import { useLibrary, renderSymbolic } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// using native range input for broad compatibility

export default function SymbolicPostComposer() {
  const { symbols, updateSymbols } = useLibrary();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [favoritesRaw, setFavoritesRaw] = useState(symbols.favorites.join(", "));
  const [mappingRaw, setMappingRaw] = useState(JSON.stringify(symbols.mapping || {}, null, 2));
  const [ratio, setRatio] = useState(symbols.sprinkleRatio ?? 0.15);

  const apply = () => {
    try {
      const map = mappingRaw.trim() ? JSON.parse(mappingRaw) as Record<string, string> : {};
      const favs = favoritesRaw.split(/,\s*/).filter(Boolean);
      const cfg = { favorites: favs, mapping: map, sprinkleRatio: ratio };
      updateSymbols(cfg);
      setOutput(renderSymbolic(text, cfg));
    } catch (e) {
      // ignore JSON errors
      setOutput(renderSymbolic(text, { favorites: favoritesRaw.split(/,\s*/).filter(Boolean), sprinkleRatio: ratio }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">Composer Simbólico</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Composer Simbólico (estilo Carti/Uzi)</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Texto base</Label>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder="Escreve aqui o texto normal…" />
            <Button onClick={apply}>Render</Button>
          </div>
          <div className="space-y-2">
            <Label>Favoritos (separa por vírgula)</Label>
            <Input value={favoritesRaw} onChange={(e) => setFavoritesRaw(e.target.value)} />
            <Label>Mapping (JSON opcional: {`{"a":"ᵃ"}`})</Label>
            <Textarea value={mappingRaw} onChange={(e) => setMappingRaw(e.target.value)} rows={6} />
            <Label>Intensidade de símbolos</Label>
            <div className="px-2 flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={Math.round(ratio * 100)}
                onChange={(e) => setRatio(Number(e.target.value) / 100)}
                aria-label="Intensidade"
              />
              <span className="text-sm text-muted-foreground">{Math.round(ratio * 100)}%</span>
            </div>
          </div>
        </div>
        <div>
          <Label>Resultado</Label>
          <Textarea value={output} readOnly rows={6} />
          <div className="mt-2 flex gap-2">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(output)}>Copiar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
