"use client";

import { useMemo, useState } from "react";
import { useProject } from "@/hooks/use-project";
import type { FeaturingContact } from "@/hooks/use-project";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Lock, LockOpen, Plus, User, Users } from "lucide-react";

export default function FeaturingManager() {
  const { project, update } = useProject();
  const [open, setOpen] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true); // oculta contactos por defeito

  const contacts: FeaturingContact[] = project?.featuringContacts ?? [];
  const names = useMemo(() => project?.songInfo?.featuring ?? [], [project?.songInfo?.featuring]);

  const [newArtist, setNewArtist] = useState<FeaturingContact>({ name: "" });

  const knownNames = useMemo(() => new Set(names), [names]);

  const addContact = () => {
    if (!newArtist.name.trim()) return;
    const nextContacts = [...contacts, { ...newArtist }];
    const nextNames = knownNames.has(newArtist.name) ? names : [...names, newArtist.name];
    update({ featuringContacts: nextContacts, songInfo: { ...(project?.songInfo || { title: "", artist: "", producer: "", featuring: [] }), featuring: nextNames } });
    setNewArtist({ name: "" });
  };

  const updateContact = (idx: number, patch: Partial<FeaturingContact>) => {
    const next = contacts.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    update({ featuringContacts: next });
  };

  const removeContact = (idx: number) => {
    const toRemove = contacts[idx];
    const nextContacts = contacts.filter((_, i) => i !== idx);
    const nextNames = names.filter((n) => n !== toRemove.name);
    update({ featuringContacts: nextContacts, songInfo: { ...(project?.songInfo || { title: "", artist: "", producer: "", featuring: [] }), featuring: nextNames } });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all hover:bg-muted"
        >
          <Users className="h-4 w-4" />
          <span>Featuring</span>
          {names.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
              {names.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Featuring (privado)</DialogTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch id="privacyMode" checked={privacyMode} onCheckedChange={setPrivacyMode} />
            <Label htmlFor="privacyMode" className="cursor-pointer flex items-center gap-1">
              {privacyMode ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}
              Ocultar contactos
            </Label>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
            <div className="md:col-span-2">
              <Label htmlFor="artistName">Artista</Label>
              <Input id="artistName" placeholder="Nome do feat" value={newArtist.name} onChange={(e) => setNewArtist((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="artistEmail">Email</Label>
              <Input id="artistEmail" type="email" placeholder="email@exemplo.com" value={newArtist.email || ""} onChange={(e) => setNewArtist((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="artistPhone">Telemóvel</Label>
              <Input id="artistPhone" placeholder="+351 ..." value={newArtist.phone || ""} onChange={(e) => setNewArtist((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div>
              <Button className="w-full" onClick={addContact}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </div>

          <Separator />

          {contacts.length === 0 ? (
            <div className="text-sm text-muted-foreground">Sem artists em featuring ainda.</div>
          ) : (
            <div className="space-y-3">
              {contacts.map((c, idx) => (
                <div key={`${c.name}-${idx}`} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div className="font-medium">{c.name}</div>
                      {c.private && <Badge variant="secondary">Privado</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      {c.email && (
                        <a href={`mailto:${c.email}`} className="inline-flex" aria-label={`Email ${c.name}`} title={`Email ${c.name}`}>
                          <Button size="icon" variant="ghost" aria-hidden>
                            <Mail className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone}`} className="inline-flex" aria-label={`Ligar ${c.name}`} title={`Ligar ${c.name}`}>
                          <Button size="icon" variant="ghost" aria-hidden>
                            <Phone className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <Button size="sm" variant="ghost" onClick={() => removeContact(idx)}>Remover</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <div>
                      <Label>Email</Label>
                      <Input value={c.email || ""} placeholder="—" disabled={privacyMode} onChange={(e) => updateContact(idx, { email: e.target.value })} />
                    </div>
                    <div>
                      <Label>Telemóvel</Label>
                      <Input value={c.phone || ""} placeholder="—" disabled={privacyMode} onChange={(e) => updateContact(idx, { phone: e.target.value })} />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input value={c.instagram || ""} placeholder="@handle" disabled={privacyMode} onChange={(e) => updateContact(idx, { instagram: e.target.value })} />
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Switch id={`private-${idx}`} checked={!!c.private} onCheckedChange={(v) => updateContact(idx, { private: v })} />
                      <Label htmlFor={`private-${idx}`}>Marcar como privado</Label>
                    </div>
                    <div>
                      <Label>Notas</Label>
                      <Input value={c.notes || ""} placeholder="observações internas" disabled={privacyMode} onChange={(e) => updateContact(idx, { notes: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
