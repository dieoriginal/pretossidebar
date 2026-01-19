"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Download, Copy, FileUp, X } from "lucide-react";
import { saveAs } from "file-saver";

type PdfDeconstructionOverlayProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type WordFreq = { word: string; count: number };

const PT_STOPWORDS = new Set(
  [
    "a","à","ao","aos","as","às","o","os","um","uma","uns","umas",
    "de","do","da","dos","das","dum","duma","duns","dumas",
    "e","ou","mas","porém","todavia","contudo",
    "em","no","na","nos","nas",
    "para","pra","pro","pros","pras",
    "com","sem","sob","sobre","entre","até","após","antes","desde",
    "que","quem","quando","onde","porque","porquê","por que","por quê",
    "se","como","já","ainda","também","só",
    "eu","tu","ele","ela","nós","vós","eles","elas",
    "me","te","se","nos","vos","lhe","lhes",
    "meu","minha","meus","minhas","teu","tua","teus","tuas","seu","sua","seus","suas","nosso","nossa","nossos","nossas",
    "este","esta","estes","estas","esse","essa","esses","essas","aquele","aquela","aqueles","aquelas",
    "isso","isto","aquilo",
    "não","sim",
    "é","era","são","ser","foi","fui","fomos","foram","sendo","seja","sejam",
    "ter","tem","têm","tinha","tinham","teve","tive","tivemos","tiveram",
  ].map((s) => s.trim()).filter(Boolean)
);

function normalizeToken(raw: string) {
  const cleaned = raw
    .normalize("NFKC")
    .replace(/[“”"„]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}'’-]+/gu, " ")
    .trim();
  return cleaned;
}

function tokenize(text: string) {
  const normalized = normalizeToken(text);
  const tokens = normalized
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean);
  return tokens;
}

function buildFreq(tokens: string[]) {
  const map = new Map<string, number>();
  for (const t of tokens) {
    const k = t.toLowerCase();
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function PdfDeconstructionOverlay({ open, onOpenChange }: PdfDeconstructionOverlayProps) {
  const [fileName, setFileName] = useState<string>("");
  const [rawText, setRawText] = useState<string>("");
  const [pageCount, setPageCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"texto" | "palavras" | "freq">("texto");
  const [filterStopwords, setFilterStopwords] = useState(true);
  const [minLen, setMinLen] = useState<number>(2);
  const [takeTop, setTakeTop] = useState<number>(250);
  const [shuffled, setShuffled] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [lastError, setLastError] = useState<string>("");

  const tokensAll = useMemo(() => {
    const tokens = tokenize(rawText);
    const filtered = tokens.filter((t) => {
      if (t.length < minLen) return false;
      if (filterStopwords && PT_STOPWORDS.has(t.toLowerCase())) return false;
      return true;
    });
    return shuffled ? shuffle(filtered) : filtered;
  }, [rawText, filterStopwords, minLen, shuffled]);

  const freqAll: WordFreq[] = useMemo(() => buildFreq(tokensAll), [tokensAll]);

  const topWords = useMemo(() => freqAll.slice(0, Math.max(1, takeTop)), [freqAll, takeTop]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }, []);

  const exportJson = useCallback(() => {
    const payload = {
      source: { fileName, pageCount },
      extractedAt: new Date().toISOString(),
      rawText,
      tokens: tokensAll,
      frequencyTop: topWords,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    saveAs(blob, `${(fileName || "pdf").replace(/[^a-z0-9-_]+/gi, "_")}.desconstrucao.json`);
  }, [fileName, pageCount, rawText, tokensAll, topWords]);

  const handlePickFile = () => inputRef.current?.click();

  const handleFile = useCallback(async (f: File) => {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/ef8ea2f3-9119-426d-bd67-20a7bedb1406',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'PdfDeconstructionOverlay.tsx:handleFile:entry',message:'handleFile called',data:{name:f?.name,type:f?.type,size:f?.size},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    setLoading(true);
    setFileName(f.name);
    setRawText("");
    setPageCount(0);
    setLastError("");
    try {
      const buf = await f.arrayBuffer();
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/ef8ea2f3-9119-426d-bd67-20a7bedb1406',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B',location:'PdfDeconstructionOverlay.tsx:handleFile:beforeImport',message:'About to dynamically import pdfjs module',data:{module:'pdfjs-dist'},timestamp:Date.now()})}).catch(()=>{});
      // #endregion

      // NOTE: usamos import dinâmico via Function para evitar erro de build quando a dependência ainda não foi instalada.
      // Hipótese A: dependência não instalada/lockfile congelado -> build quebrava. Isso evita o quebra-build e permite diagnosticar em runtime.
      const importer = new Function("m", "return import(m)") as (m: string) => Promise<any>;
      let pdfjs: any;
      try {
        pdfjs = await importer("pdfjs-dist");
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/ef8ea2f3-9119-426d-bd67-20a7bedb1406',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'PdfDeconstructionOverlay.tsx:handleFile:importOk',message:'pdfjs import OK',data:{keys:Object.keys(pdfjs||{}).slice(0,20)},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
      } catch (e: any) {
        const msg = e?.message || String(e);
        setLastError(`Falha ao carregar leitor de PDF (pdfjs). Provável dependência não instalada: ${msg}`);
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/ef8ea2f3-9119-426d-bd67-20a7bedb1406',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'A',location:'PdfDeconstructionOverlay.tsx:handleFile:importFail',message:'pdfjs import FAILED',data:{error:msg},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return;
      }
      // NOTE: Em Next.js, referenciar o worker via new URL("pdfjs-dist/...") pode quebrar o build
      // se o bundler não conseguir resolver o path. Para estabilizar, usamos disableWorker.
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/ef8ea2f3-9119-426d-bd67-20a7bedb1406',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'debug-session',runId:'pre-fix',hypothesisId:'D',location:'PdfDeconstructionOverlay.tsx:handleFile:disableWorker',message:'Creating loadingTask with disableWorker=true',data:{disableWorker:true},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const loadingTask = (pdfjs as any).getDocument({ data: buf, disableWorker: true });
      const pdf = await loadingTask.promise;
      setPageCount(pdf.numPages);

      const chunks: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        const pageText = (tc.items || [])
          .map((it: any) => (typeof it?.str === "string" ? it.str : ""))
          .filter(Boolean)
          .join(" ");
        chunks.push(pageText);
      }
      setRawText(chunks.join("\n\n"));
    } finally {
      setLoading(false);
    }
  }, []);

  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1100px] h-[90vh] p-0 overflow-hidden">
        <div className="h-full flex flex-col">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle>PDF • Desconstrução (texto → palavras)</DialogTitle>
                <div className="text-xs opacity-70 mt-1">
                  {fileName ? (
                    <>
                      <span className="font-medium">{fileName}</span>
                      {pageCount > 0 && <> • {pageCount} páginas</>}
                    </>
                  ) : (
                    "Carrega um PDF para extrair o texto e sistematizar a desconstrução."
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={close} aria-label="Fechar">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4 border-b flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <Button onClick={handlePickFile} className="gap-2">
              <FileUp className="w-4 h-4" /> Carregar PDF
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <label className="text-xs opacity-70">Min. letras</label>
              <Input
                value={String(minLen)}
                onChange={(e) => setMinLen(Math.max(1, Number(e.target.value || 1)))}
                className="w-20 h-8"
                inputMode="numeric"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs opacity-70">Top freq</label>
              <Input
                value={String(takeTop)}
                onChange={(e) => setTakeTop(Math.max(10, Number(e.target.value || 250)))}
                className="w-24 h-8"
                inputMode="numeric"
              />
            </div>
            <Button
              variant={filterStopwords ? "secondary" : "outline"}
              onClick={() => setFilterStopwords((v) => !v)}
            >
              {filterStopwords ? "Sem stopwords" : "Com stopwords"}
            </Button>
            <Button variant={shuffled ? "secondary" : "outline"} onClick={() => setShuffled((v) => !v)}>
              {shuffled ? "Embaralhado" : "Ordenado"}
            </Button>

            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline">{tokensAll.length} tokens</Badge>
              <Badge variant="outline">{freqAll.length} únicos</Badge>
            </div>
          </div>

          <div className="px-4 pt-3">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="texto">Texto</TabsTrigger>
                <TabsTrigger value="palavras">Palavras</TabsTrigger>
                <TabsTrigger value="freq">Frequência</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 min-h-0 p-4">
            {loading ? (
              <div className="h-full flex items-center justify-center text-sm opacity-70">
                Extraindo… (pode demorar em PDFs grandes)
              </div>
            ) : (
              <>
                {!!lastError && (
                  <div className="mb-3 border rounded-md p-3 text-sm">
                    <div className="font-semibold mb-1">Erro</div>
                    <div className="opacity-80">{lastError}</div>
                    <div className="text-xs opacity-70 mt-2">
                      Dica: rode <span className="font-mono">npm install</span> (ou o seu gerenciador) e reinicie o servidor.
                    </div>
                  </div>
                )}
                {activeTab === "texto" && (
                  <div className="h-full flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="gap-2" onClick={() => copyToClipboard(rawText)}>
                        <Copy className="w-4 h-4" /> Copiar texto
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={exportJson} disabled={!rawText.trim()}>
                        <Download className="w-4 h-4" /> Exportar JSON
                      </Button>
                    </div>
                    <Textarea
                      value={rawText}
                      onChange={(e) => setRawText(e.target.value)}
                      className="flex-1 min-h-0 font-mono text-xs"
                      placeholder="Depois de carregar um PDF, o texto extraído aparece aqui."
                    />
                  </div>
                )}

                {activeTab === "palavras" && (
                  <div className="h-full flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => copyToClipboard(tokensAll.join(" "))}
                        disabled={tokensAll.length === 0}
                      >
                        <Copy className="w-4 h-4" /> Copiar tokens
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={exportJson} disabled={!rawText.trim()}>
                        <Download className="w-4 h-4" /> Exportar JSON
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 min-h-0 border rounded-md p-3">
                      <div className="flex flex-wrap gap-2">
                        {tokensAll.slice(0, 2000).map((t, i) => (
                          <Badge key={`${t}-${i}`} variant="secondary" className="font-normal">
                            {t}
                          </Badge>
                        ))}
                        {tokensAll.length > 2000 && (
                          <div className="text-xs opacity-70 mt-2 w-full">
                            Mostrando só 2000 tokens (para não travar o navegador).
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}

                {activeTab === "freq" && (
                  <div className="h-full flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => copyToClipboard(topWords.map((w) => `${w.word}\t${w.count}`).join("\n"))}
                        disabled={topWords.length === 0}
                      >
                        <Copy className="w-4 h-4" /> Copiar tabela
                      </Button>
                      <Button variant="outline" className="gap-2" onClick={exportJson} disabled={!rawText.trim()}>
                        <Download className="w-4 h-4" /> Exportar JSON
                      </Button>
                    </div>
                    <ScrollArea className="flex-1 min-h-0 border rounded-md">
                      <div className="p-3 space-y-2">
                        {topWords.map((w) => (
                          <div key={w.word} className="flex items-center justify-between gap-3">
                            <div className="truncate">
                              <span className="font-mono text-sm">{w.word}</span>
                            </div>
                            <Badge variant="outline">{w.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


