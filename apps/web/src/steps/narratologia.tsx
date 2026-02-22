"use client";

import { useState, useEffect } from "react";
import { useProject } from "@/hooks/use-project";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import FeaturingManager from "@/components/FeaturingManager";
import { TitleSuggestionsDialog, TShirtTextsDialog, AdlibsDialog, SymbolicPostComposer } from "@/components/library";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAutoSave } from "@/hooks/use-auto-save";
import { AutoSaveStatus } from "@/components/auto-save-status";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

const POETIC_FORMS = [
  "Didática / Poesia didática",
  "Verso livre",
  "Soneto (petrarquiano)",
  "Soneto (shakespeariano)",
  "Haicai / Haiku",
  "Sestina",
  "Terza rima",
  "Villanela",
  "Ode",
  "Elegia",
  "Égloga / Ídilio",
  "Balada",
  "Épico / Epopeia",
  "Dramático (peça em versos)",
  "Limerick",
  "Pantum / Pantoum",
  "Ghazal",
  "Acróstico",
  "Concreta / Visual",
  "Prosa poética",
  "Cântico / Hino",
  "Ode pindárica",
  "Ode horaciana",
  "Redondilha (maior/menor)",
  "Quadra popular",
];

const METHOD_FAMILIES = [
  { title: "Pelo propósito", items: ["Lírico", "Narrativo", "Dramático", "Satírico", "Didático", "Místico/Religioso", "Político/Engajado"] },
  { title: "Pela forma/estrutura", items: ["Verso livre", "Métrico (decassílabo, alexandrino, redondilhas)", "Com rima (pareada, cruzada, interpolada)", "Sem rima", "Visual/Concreta"] },
  { title: "Pelas técnicas de escrita", items: ["Metáfora, símbolo, alegoria", "Aliteração, assonância, paranomásia", "Anáfora, quiasmo, hipérbato", "Intertextualidade, colagem, montagem", "Imagem e sensorialismo", "Ritmo (pés, acentos, pausas)"] },
];

export default function NarratologiaStep() {
  const { project, update } = useProject();
  const projectId = project?.id || 'current-project';

  // Auto-save para synopsis draft
  const { save: saveSynopsis, status: synopsisStatus, load: loadSynopsis } = useAutoSave<string>({
    stepKey: 'narratologia_synopsis',
    projectId,
    autoLoad: true,
  });

  const [synopsisDraft, setSynopsisDraft] = useState(project?.songInfo?.synopsis ?? "");

  // Carregar synopsis salva
  useEffect(() => {
    loadSynopsis().then((loaded) => {
      if (loaded) {
        setSynopsisDraft(loaded);
      }
    });
  }, [loadSynopsis]);

  // Auto-save quando synopsis muda
  useEffect(() => {
    if (synopsisDraft !== (project?.songInfo?.synopsis ?? "")) {
      saveSynopsis(synopsisDraft);
    }
  }, [synopsisDraft, saveSynopsis, project?.songInfo?.synopsis]);

  const strophes = project?.strophes ?? [];

  const commitSynopsis = () => {
    update({ songInfo: { ...(project?.songInfo ?? { title: "", artist: "", producer: "", featuring: [] }), synopsis: synopsisDraft } });
  };

  const setStropheForm = (stropheId: string, form: string) => {
    const next = (strophes || []).map((s: any) => (s.id === stropheId ? { ...s, poeticForm: form } : s));
    update({ strophes: next });
  };

  const addStrophe = () => {
    const newStrophe = { id: `s-${Date.now()}`, verses: [], description: "", poeticForm: "" } as any;
    const next = [...(strophes || []), newStrophe];
    update({ strophes: next });
  };

  return (
    <ContentLayout title="Narratologia e Forma">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Sinopse do Single — collapsible */}
        <Collapsible defaultOpen className="xl:col-span-2">
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Sinopse do Single</CardTitle>
                  <div className="flex items-center gap-2">
                    <AutoSaveStatus status={synopsisStatus} />
                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <TitleSuggestionsDialog />
                  <TShirtTextsDialog />
                  <AdlibsDialog />
                  <SymbolicPostComposer />
                  <FeaturingManager />
                </div>
                <Label htmlFor="synopsis">Escreve a ideia geral que queres explorar neste single</Label>
                <Textarea id="synopsis" value={synopsisDraft} onChange={(e: any) => setSynopsisDraft(e.target.value)} rows={5} placeholder="Uma sinopse curta que guia a escrita…" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={commitSynopsis}>Guardar sinopse</Button>
                  {project?.songInfo?.synopsis && (
                    <div className="text-xs text-muted-foreground self-center">
                      Última: {project.songInfo.synopsis?.slice(0, 60)}{(project.songInfo.synopsis?.length ?? 0) > 60 ? "…" : ""}
                    </div>
                  )}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Formas e Métodos — collapsible */}
        <Collapsible defaultOpen={false}>
          <Card>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer py-3 hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Formas e Métodos</CardTitle>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3 text-sm pt-0">
                {METHOD_FAMILIES.map((g) => (
                  <div key={g.title}>
                    <div className="font-semibold mb-1">{g.title}</div>
                    <ul className="list-disc pl-5 space-y-1">
                      {g.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </div>

      {/* Forma poética por estrofe — collapsible, starts collapsed */}
      <Collapsible defaultOpen={false} className="mt-4">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer py-3 hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Forma poética por estrofe</CardTitle>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); addStrophe(); }}>
                    Adicionar estrofe
                  </Button>
                  <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform [[data-state=open]_&]:rotate-180" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4 pt-0">
              {strophes.length === 0 && <div className="text-sm text-muted-foreground">Ainda não há estrofes neste projeto.</div>}
              {strophes.map((s: any, idx: number) => (
                <div key={s.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                  <div className="text-sm font-medium">Estrofe {idx + 1}</div>
                  <div className="md:col-span-2">
                    <Select value={s.poeticForm || ""} onValueChange={(val: string) => setStropheForm(s.id, val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolhe a forma poética" />
                      </SelectTrigger>
                      <SelectContent>
                        {POETIC_FORMS.map((f) => (
                          <SelectItem key={f} value={f}>
                            {f}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </ContentLayout>
  );
}
