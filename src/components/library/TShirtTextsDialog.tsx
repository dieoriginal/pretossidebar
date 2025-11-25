"use client";

import { useState } from "react";
import { useLibrary } from "@/hooks/use-library";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus } from "lucide-react";

export default function TShirtTextsDialog() {
  const { tshirts, addTshirt, removeTshirt } = useLibrary();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");

  const canAdd = text.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">T-Shirts</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Base de Textos para T-Shirts</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-2 pr-2">
                {tshirts.map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-2 border rounded p-2">
                    <div>
                      <div className="font-medium whitespace-pre-wrap break-words">{t.text}</div>
                      {t.description && <div className="text-xs text-muted-foreground">{t.description}</div>}
                    </div>
                    <Button variant="ghost" size="icon" title="Remover" aria-label="Remover" onClick={() => removeTshirt(t.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <div className="space-y-2">
            <Label>Novo texto</Label>
            <Input placeholder="Ex.: INVEJA É AMOR" value={text} onChange={(e) => setText(e.target.value)} />
            <Input placeholder="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Button disabled={!canAdd} onClick={() => { addTshirt({ text, description: description || undefined }); setText(""); setDescription(""); }} className="w-full">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
