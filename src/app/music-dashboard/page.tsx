"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { steps } from "@/lib/steps"
import {
  DashboardProject,
  getCurrent,
  getOrCreateProject,
  listProjects,
  setCurrent,
  uid,
  updateProject,
} from "@/lib/music-dashboard"
import { getAllProjectsFromIndexedDB, saveProjectToIndexedDB } from "@/lib/db"

// Scoped styles: 80% zoom + sticky bars inside the dashboard only
const DashboardStyle = () => (
  <style jsx global>{`
    .mdash-container { zoom: .8; }
    .sticky-top { position: sticky; top: 0; z-index: 10; background: var(--background); padding: 8px 0; }
    .sticky-bottom { position: sticky; bottom: 0; z-index: 10; background: var(--background); padding: 8px 0; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { border-bottom: 1px solid rgba(0,0,0,0.06); text-align: left; padding: 8px; font-size: 13px; }
    .muted { color: var(--muted-foreground); }
  `}</style>
)

// Simple crest factor from PCM samples
function crestFactor(samples: Float32Array) {
  let peak = 0
  let sumSq = 0
  const n = samples.length || 1
  for (let i = 0; i < samples.length; i++) {
    const v = Math.abs(samples[i])
    if (v > peak) peak = v
    sumSq += samples[i] * samples[i]
  }
  const rms = Math.sqrt(sumSq / n) || 1e-12
  const ratio = peak / rms
  const dB = 20 * Math.log10(ratio)
  return { ratio, dB }
}

// Minimal radix-2 FFT for real input (returns magnitude spectrum)
function computeFFTMag(samples: Float32Array, sampleRate: number, size=1024) {
  // window and zero-pad/truncate
  const N = size;
  const buf = new Float32Array(N);
  const step = Math.floor(samples.length / N) || 1;
  for (let i = 0; i < N; i++) {
    const s = samples[i * step] || 0;
    // Hann window
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    buf[i] = s * w;
  }
  // bit-reversal permutation
  const rev = (x: number, bits: number) => {
    let y = 0;
    for (let i = 0; i < bits; i++) { y = (y << 1) | (x & 1); x >>= 1; }
    return y;
  };
  const bits = Math.log2(N) | 0;
  const re = new Float32Array(N);
  const im = new Float32Array(N);
  for (let i = 0; i < N; i++) { const j = rev(i, bits); re[i] = buf[j]; im[i] = 0; }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wlenRe = Math.cos(ang), wlenIm = Math.sin(ang);
    for (let i = 0; i < N; i += len) {
      let wRe = 1, wIm = 0;
      for (let j = 0; j < (len >> 1); j++) {
        const uRe = re[i + j], uIm = im[i + j];
        const vRe = re[i + j + (len >> 1)] * wRe - im[i + j + (len >> 1)] * wIm;
        const vIm = re[i + j + (len >> 1)] * wIm + im[i + j + (len >> 1)] * wRe;
        re[i + j] = uRe + vRe; im[i + j] = uIm + vIm;
        re[i + j + (len >> 1)] = uRe - vRe; im[i + j + (len >> 1)] = uIm - vIm;
        const nwRe = wRe * wlenRe - wIm * wlenIm; const nwIm = wRe * wlenIm + wIm * wlenRe; wRe = nwRe; wIm = nwIm;
      }
    }
  }
  const mags = new Float32Array(N/2);
  for (let i = 0; i < N/2; i++) mags[i] = Math.hypot(re[i], im[i]);
  const freqs = new Float32Array(N/2);
  const binHz = sampleRate / N;
  for (let i = 0; i < N/2; i++) freqs[i] = i * binHz;
  return { mags, freqs };
}

function computeTonalBalance(samples: Float32Array, sampleRate: number) {
  const { mags, freqs } = computeFFTMag(samples, sampleRate, 2048);
  let low=0, mid=0, high=0; let l=0, m=0, h=0;
  for (let i = 0; i < mags.length; i++) {
    const f = freqs[i]; const v = mags[i] || 0;
    if (f < 200) { low += v; l++; }
    else if (f < 4000) { mid += v; m++; }
    else { high += v; h++; }
  }
  const sum = low+mid+high || 1;
  return { low: low/sum, mid: mid/sum, high: high/sum };
}

async function decodeFileToPCM(file: File): Promise<{ samples: Float32Array; sampleRate: number } | null> {
  try {
    const arrayBuf = await file.arrayBuffer()
    const ctx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(2, 44100 * 10, 44100)
    const audioBuf = await ctx.decodeAudioData(arrayBuf.slice(0))
    // Mixdown to mono
    const ch0 = audioBuf.getChannelData(0)
    const ch1 = audioBuf.numberOfChannels > 1 ? audioBuf.getChannelData(1) : null
    const samples = new Float32Array(audioBuf.length)
    for (let i = 0; i < audioBuf.length; i++) {
      samples[i] = ch1 ? (ch0[i] + ch1[i]) / 2 : ch0[i]
    }
    return { samples, sampleRate: audioBuf.sampleRate }
  } catch (e) {
    console.warn("Audio decode failed:", e)
    return null
  }
}

export default function MusicDashboardPage() {
  const [projectId, setProjectId] = useState<string>(getCurrent().id)
  const [proj, setProj] = useState<DashboardProject>(() => getOrCreateProject(projectId))

  // refresh when project changes
  useEffect(() => {
    setCurrent(projectId)
    setProj(getOrCreateProject(projectId))
  }, [projectId])

  function savePatch(patch: Partial<DashboardProject>) {
    const next = updateProject(projectId, patch)
    setProj(next)
  }

  // Tracks state
  const [trackFilter, setTrackFilter] = useState("")
  const filteredTracks = useMemo(() => {
    if (!trackFilter) return proj.tracks
    const k = trackFilter.toLowerCase()
    return proj.tracks.filter(t => (t.title || "").toLowerCase().includes(k) || (t.artist || "").toLowerCase().includes(k))
  }, [proj.tracks, trackFilter])

  // Tasks state
  const [taskFilter, setTaskFilter] = useState("")
  const filteredTasks = useMemo(() => {
    if (!taskFilter) return proj.tasks
    const k = taskFilter.toLowerCase()
    return proj.tasks.filter(t => t.title.toLowerCase().includes(k))
  }, [proj.tasks, taskFilter])

  // Mix metrics
  const [mixFile, setMixFile] = useState<File | null>(null)
  const [mixMetrics, setMixMetrics] = useState<{ crest?: { ratio: number; dB: number }; tonal?: { low: number; mid: number; high: number } } | null>(null)

  async function onUploadMix(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setMixFile(file)
    const decoded = await decodeFileToPCM(file)
    if (!decoded) { setMixMetrics(null); return }
    const { samples, sampleRate } = decoded
  const cf = crestFactor(samples)
  const tonal = computeTonalBalance(samples, sampleRate)
  setMixMetrics({ crest: cf, tonal })
  }

  // Quality score
  const qualityScore = useMemo(() => {
    let score = 0
    if (proj.tracks.length) score += 30
    if (proj.tasks.length) score += 20
    if (mixMetrics?.crest) score += 25
    if (proj.artwork.concept) score += 25
    return score
  }, [proj, mixMetrics])

  // Compilation from singles (from existing IndexedDB projects)
  const [allSingles, setAllSingles] = useState<any[]>([])
  const [selectedSingles, setSelectedSingles] = useState<string[]>([])
  const [newSlug, setNewSlug] = useState("")
  const [newName, setNewName] = useState("")
  const [compilationKind, setCompilationKind] = useState<'Mixtape' | 'LP' | 'EP'>('Mixtape')

  useEffect(() => {
    ;(async () => {
      try { const list = (await getAllProjectsFromIndexedDB()) as any[]; setAllSingles(Array.isArray(list) ? list : []) } catch {}
    })()
  }, [])

  async function createCompilation() {
    if (!selectedSingles.length || !newSlug.trim()) return
    const combinedTracks: any[] = []
    for (const s of allSingles) {
      if (!selectedSingles.includes(s.id)) continue
      const data = s?.data ?? s
      if (Array.isArray(data?.tracks)) {
        for (const t of data.tracks) {
          combinedTracks.push({
            id: uid('trk'),
            title: t.title || t.name || 'Track',
            artist: data?.songInfo?.artist || data?.artist || '',
            sourceProjectId: s.id,
            // Preserve path/refs if present
            path: t.path || data?.audio?.name || undefined,
          })
        }
      } else if (data?.songInfo?.title) {
        // Treat the single as one track
        combinedTracks.push({ id: uid('trk'), title: data.songInfo.title, artist: data.songInfo.artist || '', sourceProjectId: s.id })
      }
    }
    const newProject = {
      id: newSlug.trim(),
      title: newName.trim() || newSlug.trim(),
      lastModified: new Date(),
      data: {
        id: newSlug.trim(),
        type: 'compilation',
        name: newName.trim() || newSlug.trim(),
        tracks: combinedTracks,
      }
    }
    await saveProjectToIndexedDB(newProject)
    alert(`Coletânea criada: ${newProject.title} com ${combinedTracks.length} faixas.`)
  }

  return (
    <div className="mdash-container p-4">
      <DashboardStyle />
      <div className="sticky-top">
        <div className="flex gap-2 items-center">
          <div className="text-sm muted">Dashboard de Música</div>
          <Separator className="mx-2" />
          <Select value={projectId} onValueChange={(v) => setProjectId(v)}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Projeto" /></SelectTrigger>
            <SelectContent>
              {[getOrCreateProject(projectId), ...listProjects().filter(p=>p.id!==projectId)].map((p) => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="ml-auto flex items-center">
            <MiniTourStrip />
          </div>
        </div>
      </div>

      <Tabs defaultValue="info" className="mt-2">
        <TabsList>
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="faixas">Faixas</TabsTrigger>
          <TabsTrigger value="arte">Arte</TabsTrigger>
          <TabsTrigger value="todo">To‑do</TabsTrigger>
          <TabsTrigger value="letras">Letras</TabsTrigger>
          <TabsTrigger value="mix">Mix</TabsTrigger>
          <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
          <TabsTrigger value="exportar">Exportar</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid gap-3 max-w-3xl">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs muted mb-1">ID</div>
                <Input value={proj.id} readOnly />
              </div>
              <div>
                <div className="text-xs muted mb-1">Tipo</div>
                <Select value={proj.kind} onValueChange={(v)=> savePatch({ kind: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Single">Single</SelectItem>
                    <SelectItem value="EP">EP</SelectItem>
                    <SelectItem value="Mixtape">Mixtape</SelectItem>
                    <SelectItem value="LP">LP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs muted mb-1">Título</div>
                <Input value={proj.name} onChange={(e)=> savePatch({ name: e.target.value })} />
              </div>
              <div>
                <div className="text-xs muted mb-1">Artista</div>
                <Input value={proj.artist||''} onChange={(e)=> savePatch({ artist: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs muted mb-1">Featured (separado por vírgulas)</div>
                <Input value={(proj.featured||[]).join(', ')} onChange={(e)=> {
                  const arr = e.target.value.split(',').map(s=>s.trim()).filter(Boolean); savePatch({ featured: arr })
                }} />
              </div>
              <div>
                <div className="text-xs muted mb-1">Producer</div>
                <Input value={proj.producer||''} onChange={(e)=> savePatch({ producer: e.target.value })} />
              </div>
            </div>
            <div>
              <div className="text-xs muted mb-1">Capa (URL)</div>
              <Input value={proj.coverUrl||''} onChange={(e)=> savePatch({ coverUrl: e.target.value })} />
              <div className="mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {proj.coverUrl ? <img src={proj.coverUrl} alt="Capa" className="h-28 w-28 object-cover rounded" /> : <div className="h-28 w-28 bg-muted rounded" />}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="faixas">
          <div className="sticky-top">
            <div className="flex gap-2">
              <Input placeholder="Filtrar faixas..." value={trackFilter} onChange={(e)=>setTrackFilter(e.target.value)} />
              <Button onClick={()=> savePatch({ tracks: [...proj.tracks, { id: uid('trk'), title: `Nova faixa ${proj.tracks.length+1}` }] })}>Adicionar faixa</Button>
            </div>
          </div>
          <table className="table mt-2">
            <thead><tr><th>Título</th><th>Artista</th><th>Duração</th></tr></thead>
            <tbody>
              {filteredTracks.map(t => (
                <tr key={t.id}>
                  <td><Input value={t.title} onChange={(e)=>{
                    const v = e.target.value; savePatch({ tracks: proj.tracks.map(x=> x.id===t.id ? { ...x, title: v } : x) })
                  }} /></td>
                  <td><Input value={t.artist||''} onChange={(e)=>{
                    const v = e.target.value; savePatch({ tracks: proj.tracks.map(x=> x.id===t.id ? { ...x, artist: v } : x) })
                  }} /></td>
                  <td className="text-xs muted">{t.durationSec ? `${Math.round(t.durationSec)}s` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="arte">
          <div className="sticky-top">Planeamento de arte</div>
          <div className="grid gap-2 max-w-3xl mt-2">
            <Textarea placeholder="Conceito de capa..." value={proj.artwork.concept||''} onChange={(e)=>savePatch({ artwork: { ...proj.artwork, concept: e.target.value } })} />
            <Input placeholder="#RRGGBB, #112233..." value={(proj.artwork.palette||[]).join(', ')} onChange={(e)=>{
              const palette = e.target.value.split(',').map(s=>s.trim()).filter(Boolean)
              savePatch({ artwork: { ...proj.artwork, palette } })
            }} />
            <div className="flex gap-2 flex-wrap">
              {(proj.artwork.palette||[]).map((c,i)=> <Badge key={i} variant="secondary">{c}</Badge>)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="todo">
          <div className="sticky-top">
            <div className="flex gap-2">
              <Input placeholder="Filtrar tarefas..." value={taskFilter} onChange={(e)=>setTaskFilter(e.target.value)} />
              <Input placeholder="Nova tarefa" onKeyDown={(e)=>{
                if (e.key==='Enter' && (e.target as HTMLInputElement).value.trim()) {
                  const title = (e.target as HTMLInputElement).value.trim()
                  savePatch({ tasks: [...proj.tasks, { id: uid('tsk'), title, status: 'todo' }] })
                  ;(e.target as HTMLInputElement).value = ''
                }
              }} />
            </div>
          </div>
          <table className="table mt-2">
            <thead><tr><th>Tarefa</th><th>Status</th><th>Prioridade</th><th>Etapa</th></tr></thead>
            <tbody>
              {filteredTasks.map(t => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>
                    <Select value={t.status} onValueChange={(v)=> savePatch({ tasks: proj.tasks.map(x=> x.id===t.id ? { ...x, status: v as any } : x) })}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">A fazer</SelectItem>
                        <SelectItem value="doing">Fazendo</SelectItem>
                        <SelectItem value="done">Feito</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <Select value={t.priority||'med'} onValueChange={(v)=> savePatch({ tasks: proj.tasks.map(x=> x.id===t.id ? { ...x, priority: v as any } : x) })}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="med">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td>
                    <Select value={t.stepSlug||''} onValueChange={(v)=> savePatch({ tasks: proj.tasks.map(x=> x.id===t.id ? { ...x, stepSlug: v || undefined } : x) })}>
                      <SelectTrigger className="w-[160px]"><SelectValue placeholder="(nenhum)" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">(nenhum)</SelectItem>
                        {steps.map(st => (
                          <SelectItem key={st.link} value={st.link.replace(/^\//,'')}>{st.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TabsContent>

        <TabsContent value="letras">
          <div className="grid gap-2 max-w-3xl">
            <Select onValueChange={(trackId)=>{
              // preload lyrics into a temp state? We'll directly bind to proj.lyrics map.
              setSelectedTrackId(trackId)
            }}>
              <SelectTrigger className="w-[260px]"><SelectValue placeholder="Selecione faixa" /></SelectTrigger>
              <SelectContent>
                {proj.tracks.map(t => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Letra..." value={proj.lyrics[selectedTrackId||'']||''} onChange={(e)=>{
              if (!selectedTrackId) return
              savePatch({ lyrics: { ...proj.lyrics, [selectedTrackId]: e.target.value } })
            }} className="min-h-[180px]" />
          </div>
        </TabsContent>

        <TabsContent value="mix">
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor="mix-file">Carregar mix</label>
            <input id="mix-file" aria-label="Carregar arquivo de mix" type="file" accept="audio/*" onChange={onUploadMix} />
            {mixMetrics?.crest && (
              <div className="text-sm">Crest factor: {mixMetrics.crest.ratio.toFixed(2)} ({mixMetrics.crest.dB.toFixed(2)} dB)</div>
            )}
          </div>
          <div className="text-xs muted mt-1">{mixMetrics?.tonal ? (
            <span>Tonal: Low {(mixMetrics.tonal.low*100).toFixed(0)}% • Mid {(mixMetrics.tonal.mid*100).toFixed(0)}% • High {(mixMetrics.tonal.high*100).toFixed(0)}%</span>
          ) : 'Carrega um mix para analisar espectro/tonal.'}</div>
        </TabsContent>

        <TabsContent value="qualidade">
          <Card className="p-3">
            <div className="text-sm">Sinal de conclusão/qualidade</div>
            <div className="text-2xl font-semibold mt-2">{qualityScore}/100</div>
          </Card>
        </TabsContent>

        <TabsContent value="exportar">
          <div className="grid gap-3">
            <div>
              <div className="font-medium">Exportar</div>
              <div className="flex gap-2 mt-2">
                <Button variant="secondary" onClick={()=>{
                  const blob = new Blob([JSON.stringify(proj,null,2)], { type: 'application/json' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url; a.download = `${proj.id||'dashboard'}-export.json`; a.click(); URL.revokeObjectURL(url)
                }}>Exportar JSON</Button>
              </div>
            </div>
            <Separator />
            <div>
              <div className="font-medium">Publicar (Firebase)</div>
              <div className="text-xs muted">Publica metadados de Single para leitura pública em /public/singles (cross-device).</div>
              <div className="flex gap-2 mt-2">
                <Button onClick={async()=>{
                  try {
                    const { publishPublicSingle } = await import("@/lib/firebase");
                    await publishPublicSingle({
                      id: proj.id,
                      title: proj.name,
                      artist: proj.artist,
                      featured: proj.featured,
                      producer: proj.producer,
                      coverUrl: proj.coverUrl,
                    });
                    alert('Publicado!');
                  } catch (e) {
                    alert('Falha ao publicar: ' + (e as any)?.message)
                  }
                }}>Publicar Single</Button>
              </div>
            </div>
            <Separator />
            <div>
              <div className="font-medium">Coletânea (compilar singles)</div>
              <div className="text-xs muted">Selecione projetos salvos (IndexedDB) para combinar.</div>
              <div className="flex gap-2 flex-wrap mt-2 max-h-40 overflow-auto">
                {allSingles.map(s => (
                  <label key={s.id} className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={selectedSingles.includes(s.id)} onChange={(e)=>{
                      setSelectedSingles(prev => e.target.checked ? [...prev, s.id] : prev.filter(x=>x!==s.id))
                    }} />
                    <span>{s?.title || s?.data?.songInfo?.title || s.id}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <Input placeholder="novo-slug" value={newSlug} onChange={(e)=>setNewSlug(e.target.value)} className="w-[200px]" />
                <Input placeholder="Nome do projeto" value={newName} onChange={(e)=>setNewName(e.target.value)} className="w-[260px]" />
                <Select value={compilationKind} onValueChange={(v)=> setCompilationKind(v as any)}>
                  <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mixtape">Mixtape</SelectItem>
                    <SelectItem value="LP">LP</SelectItem>
                    <SelectItem value="EP">EP</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={createCompilation}>Criar coletânea</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="sticky-bottom mt-4 text-xs muted">Controles fixos</div>

      {/* Track selection state for lyrics */}
      <HiddenStateBridge setSelected={(id)=> setSelectedTrackId(id)} />
    </div>
  )
}

function HiddenStateBridge({ setSelected }: { setSelected: (id: string) => void }) {
  // Simple helper to keep TSX tidy
  return null
}

// Local component state outside main component for lyrics (avoid re-creation warnings)
let selectedTrackId: string | null = null
function setSelectedTrackId(id: string) { selectedTrackId = id }

// Compact mini-tour strip showing quick status and link to planner
function MiniTourStrip() {
  const STORAGE_KEY = "minitour-project-v1"
  const [stops, setStops] = useState<Array<{ date?: string }>>([])
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const data = JSON.parse(saved)
      if (Array.isArray(data?.stops)) setStops(data.stops)
    } catch {}
  }, [])
  const nextDate = useMemo(() => {
    const dated = stops.filter(s => s.date)
    if (!dated.length) return null
    // Select the next upcoming date if possible
    const now = new Date().toISOString().slice(0,10)
    const sorted = dated.map(s => s.date as string).sort()
    const upcoming = sorted.find(d => d >= now)
    return upcoming || sorted[0]
  }, [stops])
  return (
    <div className="flex items-center gap-2 text-xs">
      <Badge variant="secondary">Mini‑tour</Badge>
      <Badge variant="outline">{stops.length} paragens</Badge>
      <Badge variant={nextDate ? "default" : "outline"}>{nextDate ? `Próx: ${new Date(nextDate).toLocaleDateString()}` : "Sem datas"}</Badge>
      <Button asChild size="sm" variant="outline" className="ml-1">
        <Link href="/minitour">Abrir planner</Link>
      </Button>
    </div>
  )
}
