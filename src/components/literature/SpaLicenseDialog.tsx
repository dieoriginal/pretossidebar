"use client";

import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Download, FileText } from "lucide-react";
import { useProject } from "@/hooks/use-project";
import { jsPDF } from "jspdf";

export type SpaLicenseState = {
  version: string;
  tituloObra: string;
  autor: string;
  pseudonimo?: string;
  ano: string;
  titularDireitos?: string;
  territorio?: string;
  termos: string;
};

const DEFAULT_TERMS = `LICENÇA SPA (modelo)

1) Titularidade
O Autor declara ser titular dos direitos necessários sobre a Obra descrita acima.

2) Concessão de licença
O Autor concede licença para reprodução, distribuição e comunicação pública da Obra no âmbito de auto-publicação (“Self Publishing”), incluindo formatos digital e impresso, mantendo-se os créditos autorais.

3) Créditos
Sempre que razoavelmente possível, deve constar: “© {ANO} {AUTOR}. Licença SPA v{VERSAO}”.

4) Derivações / adaptações
Adaptações e obras derivadas podem ser autorizadas pelo Autor, desde que mantenham referência à Obra original e aos créditos.

5) Responsabilidade
Este modelo é informativo e não substitui aconselhamento jurídico.
`;

function interpolate(template: string, vars: Record<string, string>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{${k}}`, v);
  }
  return out;
}

export function SpaLicenseDialog() {
  const project = useProject((s) => s.project);
  const update = useProject((s) => s.update);

  const initial: SpaLicenseState = useMemo(() => {
    const saved = (project as any)?.spaLicense as SpaLicenseState | undefined;
    if (saved) return saved;
    return {
      version: "1.0",
      tituloObra: (project as any)?.bookInfo?.title || (project as any)?.songInfo?.title || "",
      autor: (project as any)?.bookInfo?.author || (project as any)?.songInfo?.artist || "",
      pseudonimo: "",
      ano: String(new Date().getFullYear()),
      titularDireitos: "",
      territorio: "Mundo",
      termos: DEFAULT_TERMS,
    };
  }, [project]);

  const [state, setState] = useState<SpaLicenseState>(initial);

  const rendered = useMemo(() => {
    const vars = {
      ANO: state.ano || String(new Date().getFullYear()),
      AUTOR: state.autor || "Autor",
      VERSAO: state.version || "1.0",
      OBRA: state.tituloObra || "Obra",
    };
    return interpolate(state.termos || DEFAULT_TERMS, vars);
  }, [state]);

  const persist = () => {
    update({ spaLicense: state } as any);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = 56;

    doc.setFontSize(16);
    doc.text("LICENÇA SPA", margin, y);
    y += 18;

    doc.setFontSize(10);
    doc.text(`Obra: ${state.tituloObra || "-"}`, margin, y);
    y += 14;
    doc.text(`Autor: ${state.autor || "-"}`, margin, y);
    y += 14;
    doc.text(`Ano: ${state.ano || "-"}`, margin, y);
    y += 18;

    doc.setFontSize(11);
    const lines = doc.splitTextToSize(rendered, pageWidth - margin * 2);
    const lineHeight = 14;
    const pageHeight = doc.internal.pageSize.getHeight();
    for (const line of lines) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }

    const safe = (state.tituloObra || "obra").replace(/[^a-z0-9-_]+/gi, "_");
    doc.save(`${safe}.licenca-spa.pdf`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" /> Licença SPA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[980px] h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Licença SPA • Auto-publicação</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full min-h-0 gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs opacity-70">Título da obra</label>
              <Input value={state.tituloObra} onChange={(e) => setState((s) => ({ ...s, tituloObra: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Autor</label>
              <Input value={state.autor} onChange={(e) => setState((s) => ({ ...s, autor: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Ano</label>
              <Input value={state.ano} onChange={(e) => setState((s) => ({ ...s, ano: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Versão</label>
              <Input value={state.version} onChange={(e) => setState((s) => ({ ...s, version: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Pseudônimo (opcional)</label>
              <Input value={state.pseudonimo || ""} onChange={(e) => setState((s) => ({ ...s, pseudonimo: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-xs opacity-70">Território (opcional)</label>
              <Input value={state.territorio || ""} onChange={(e) => setState((s) => ({ ...s, territorio: e.target.value }))} />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline">Variáveis: {"{ANO}"} {"{AUTOR}"} {"{VERSAO}"}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={persist}>
                Salvar no projeto
              </Button>
              <Button className="gap-2" onClick={exportPdf}>
                <Download className="w-4 h-4" /> Exportar PDF
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
            <div className="flex flex-col min-h-0 gap-2">
              <div className="text-xs opacity-70">Editar termos (modelo)</div>
              <Textarea
                value={state.termos}
                onChange={(e) => setState((s) => ({ ...s, termos: e.target.value }))}
                className="flex-1 min-h-0 font-mono text-xs"
              />
            </div>
            <div className="flex flex-col min-h-0 gap-2">
              <div className="text-xs opacity-70">Pré-visualização (com variáveis)</div>
              <Textarea value={rendered} readOnly className="flex-1 min-h-0 font-mono text-xs" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}















