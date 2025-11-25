"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import Link from "next/link";
import Image from "next/image";
import { addVenue, getAllVenues, searchVenues, Venue } from "@/lib/venuesDb";

const fieldClass = "w-full";

export default function VenuesStep() {
  const [list, setList] = useState<Venue[]>([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [url, setUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [notes, setNotes] = useState("");

  const canSave = name.trim().length > 0;

  const load = async () => {
    const all = await getAllVenues();
    all.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setList(all.slice(0, 8));
  };

  useEffect(() => {
    load();
  }, []);

  const doSearch = async (term: string) => {
    setQ(term);
    const results = await searchVenues(term);
    results.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setList(results.slice(0, 8));
  };

  const lookupPhoto = async () => {
    const query = [name, city, country].filter(Boolean).join(" ");
    if (!query.trim()) return;
    try {
      const r = await fetch(`/api/venue-photo?query=${encodeURIComponent(query)}`);
      const j = await r.json();
      if (j?.url) setPhotoUrl(j.url);
    } catch {}
  };

  const resetForm = () => {
    setName("");
    setCity("");
    setCountry("");
    setCapacity("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setUrl("");
    setPhotoUrl("");
    setNotes("");
  };

  const onSave = async () => {
    if (!canSave) return;
    setBusy(true);
    try {
      await addVenue({
        name,
        city,
        country,
        capacity: capacity === "" ? undefined : Number(capacity),
        contactName,
        contactEmail,
        contactPhone,
        url,
        photoUrl,
        notes,
      });
      await load();
      resetForm();
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">Venues</h3>
          <p className="text-sm text-muted-foreground">Seleciona um venue para este evento ou adiciona um novo. Gestão completa está em Ficha Venues.</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Adicionar novo venue</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Novo venue</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Casa da Música" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" className={fieldClass} value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex.: Porto" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input id="country" className={fieldClass} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Ex.: Portugal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacidade (aprox.)</Label>
                  <Input id="capacity" type="number" className={fieldClass} value={capacity} onChange={(e) => setCapacity(e.target.value ? Number(e.target.value) : "")} placeholder="Ex.: 1200" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Website</Label>
                  <Input id="url" className={fieldClass} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contacto</Label>
                  <Input id="contactName" className={fieldClass} value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nome do responsável" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Email</Label>
                  <Input id="contactEmail" type="email" className={fieldClass} value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="nome@dominio.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Telefone</Label>
                  <Input id="contactPhone" className={fieldClass} value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+351 …" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="photoUrl">Foto (URL)</Label>
                      <Input id="photoUrl" className={fieldClass} value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://…" />
                    </div>
                    <Button variant="secondary" onClick={lookupPhoto}>Procurar foto</Button>
                  </div>
                  {photoUrl && (
                    <div className="mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={photoUrl} alt="Foto do venue" className="w-full max-h-56 object-cover rounded border" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Input id="notes" className={fieldClass} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observações, logística, contactos internos…" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button disabled={!canSave || busy} onClick={onSave}>{busy ? "A guardar…" : "Guardar venue"}</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Link href="/events/fichavenues" className="text-sm underline text-primary">Abrir Ficha Venues</Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input value={q} onChange={(e) => doSearch(e.target.value)} placeholder="Procurar por nome, cidade, país…" className="max-w-md" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {list.map((v) => (
          <div key={v.id} className="border rounded-md p-3 space-y-2 bg-white dark:bg-zinc-900">
            <div className="aspect-video w-full bg-muted overflow-hidden rounded">
              {v.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.photoUrl} alt={`Foto do venue ${v.name}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Sem imagem</div>
              )}
            </div>
            <div>
              <div className="font-semibold leading-tight">{v.name}</div>
              <div className="text-sm text-muted-foreground">{[v.city, v.country].filter(Boolean).join(", ")}</div>
              {v.capacity ? (
                <div className="text-xs text-muted-foreground">Capacidade aprox.: {v.capacity}</div>
              ) : null}
            </div>
            {v.url ? (
              <a className="text-xs underline text-primary" href={v.url} target="_blank" rel="noreferrer">Website</a>
            ) : null}
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-sm text-muted-foreground">Sem venues guardados ainda.</div>
        )}
      </div>
    </div>
  );
}
