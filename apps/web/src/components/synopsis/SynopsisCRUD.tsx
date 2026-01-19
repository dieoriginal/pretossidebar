"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useProject } from "@/hooks/use-project"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Save,
  History,
  FileText,
  Copy,
  Trash2,
  Edit,
  Plus,
  Download,
  Upload,
  Search,
  Tag,
  Link as LinkIcon,
  BookOpen,
  BarChart3,
  CheckCircle2,
  X,
  Clock,
  Eye,
  FileCode,
  Sparkles,
  Lightbulb,
  TrendingUp
} from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { cn } from "@/lib/utils"

type SynopsisVersion = {
  id: string
  content: string
  tags: string[]
  notes?: string
  references?: string[]
  createdAt: string
  updatedAt: string
  wordCount: number
  charCount: number
}

type SynopsisTemplate = {
  id: string
  name: string
  description: string
  content: string
  category: string
}

const SYNOPSIS_TEMPLATES: SynopsisTemplate[] = [
  {
    id: "love-story",
    name: "História de Amor",
    description: "Template para singles românticos",
    category: "Romance",
    content: "Uma narrativa sobre [tema] que explora [emoção]. A música captura [momento/sentimento] através de [elemento musical/poético]."
  },
  {
    id: "empowerment",
    name: "Empoderamento",
    description: "Template para mensagens de força e autoconfiança",
    category: "Motivação",
    content: "Uma declaração de [valor/princípio] que celebra [conceito]. A letra transmite [mensagem] com [estilo/abordagem]."
  },
  {
    id: "party-vibe",
    name: "Vibe de Festa",
    description: "Template para músicas festivas",
    category: "Diversão",
    content: "Uma faixa que captura a energia de [ocasião/ambiente]. O ritmo e a melodia criam [atmosfera] perfeita para [contexto]."
  },
  {
    id: "introspective",
    name: "Introspeção",
    description: "Template para reflexões profundas",
    category: "Filosofia",
    content: "Uma jornada introspetiva sobre [tema profundo]. A música explora [questão/ideia] através de [perspectiva/abordagem]."
  },
  {
    id: "social-commentary",
    name: "Comentário Social",
    description: "Template para críticas e observações sociais",
    category: "Social",
    content: "Uma reflexão sobre [questão social] que questiona [sistema/realidade]. A letra aborda [tema] com [tom/estilo]."
  }
]

const STORAGE_KEY_PREFIX = "synopsis-versions-"

export function SynopsisCRUD() {
  const { project, update } = useProject()
  const projectId = project?.id || "default"
  const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`
  
  const currentSynopsis = project?.songInfo?.synopsis || ""
  const [localContent, setLocalContent] = useState(currentSynopsis)
  const [versions, setVersions] = useState<SynopsisVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [isCompareDialogOpen, setIsCompareDialogOpen] = useState(false)
  const [compareVersion1, setCompareVersion1] = useState<string | null>(null)
  const [compareVersion2, setCompareVersion2] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [notes, setNotes] = useState("")
  const [references, setReferences] = useState<string[]>([])
  const [newReference, setNewReference] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [autoSave, setAutoSave] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load versions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        setVersions(parsed.versions || [])
        setTags(parsed.tags || [])
      }
    } catch (error) {
      console.error("Erro ao carregar versões:", error)
    }
  }, [storageKey])

  // Sync local content with project
  useEffect(() => {
    setLocalContent(currentSynopsis)
  }, [currentSynopsis])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !localContent.trim()) return
    
    const timer = setTimeout(() => {
      handleSave()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer)
  }, [localContent, autoSave])

  // Save versions to localStorage
  useEffect(() => {
    if (versions.length > 0 || tags.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify({ versions, tags }))
    }
  }, [versions, tags, storageKey])

  const calculateStats = (content: string) => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0)
    return {
      wordCount: words.length,
      charCount: content.length,
      charCountNoSpaces: content.replace(/\s/g, "").length,
      paragraphCount: content.split(/\n\n/).filter(p => p.trim().length > 0).length,
      sentenceCount: content.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    }
  }

  const handleSave = useCallback(() => {
    if (!localContent.trim()) return

    const stats = calculateStats(localContent)
    const now = new Date().toISOString()
    
    // Update project
    update({
      songInfo: {
        ...(project?.songInfo ?? { title: "", artist: "", producer: "", featuring: [] }),
        synopsis: localContent
      }
    })

    // Save as new version
    const newVersion: SynopsisVersion = {
      id: `v-${Date.now()}`,
      content: localContent,
      tags: tags,
      notes: notes,
      references: references,
      createdAt: now,
      updatedAt: now,
      wordCount: stats.wordCount,
      charCount: stats.charCount
    }

    setVersions(prev => [newVersion, ...prev])
    setLastSaved(new Date())
    
    // Auto-save to IndexedDB
    ;(async () => {
      try {
        const { saveProjectToIndexedDB } = await import("@/lib/db")
        const current = useProject.getState().project
        if (current) {
          await saveProjectToIndexedDB(current as any)
        }
      } catch (error) {
        console.error("Erro ao salvar no IndexedDB:", error)
      }
    })()
  }, [localContent, tags, notes, references, update, project?.songInfo])

  const handleLoadVersion = (versionId: string) => {
    const version = versions.find(v => v.id === versionId)
    if (version) {
      setLocalContent(version.content)
      setTags(version.tags)
      setNotes(version.notes || "")
      setReferences(version.references || [])
      setSelectedVersion(versionId)
    }
  }

  const handleDeleteVersion = (versionId: string) => {
    if (confirm("Tem certeza que deseja eliminar esta versão?")) {
      setVersions(prev => prev.filter(v => v.id !== versionId))
      if (selectedVersion === versionId) {
        setSelectedVersion(null)
      }
    }
  }

  const handleUseTemplate = (template: SynopsisTemplate) => {
    setLocalContent(template.content)
    setIsTemplateDialogOpen(false)
  }

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }

  const handleAddReference = () => {
    if (newReference.trim() && !references.includes(newReference.trim())) {
      setReferences(prev => [...prev, newReference.trim()])
      setNewReference("")
    }
  }

  const handleRemoveReference = (ref: string) => {
    setReferences(prev => prev.filter(r => r !== ref))
  }

  const handleExport = (format: "txt" | "md" | "json") => {
    const stats = calculateStats(localContent)
    let content = ""
    let filename = `sinopse-${projectId}-${formatDate(new Date(), "yyyy-MM-dd")}`

    switch (format) {
      case "txt":
        content = `SINOPSE DO SINGLE\n${"=".repeat(50)}\n\n${localContent}\n\n${"=".repeat(50)}\nEstatísticas:\n- Palavras: ${stats.wordCount}\n- Caracteres: ${stats.charCount}\n- Parágrafos: ${stats.paragraphCount}\n- Frases: ${stats.sentenceCount}\n\nTags: ${tags.join(", ") || "Nenhuma"}\n\nNotas: ${notes || "Nenhuma"}\n\nReferências:\n${references.map(r => `- ${r}`).join("\n") || "Nenhuma"}`
        filename += ".txt"
        break
      case "md":
        content = `# Sinopse do Single\n\n${localContent}\n\n## Estatísticas\n\n- **Palavras:** ${stats.wordCount}\n- **Caracteres:** ${stats.charCount}\n- **Parágrafos:** ${stats.paragraphCount}\n- **Frases:** ${stats.sentenceCount}\n\n## Tags\n\n${tags.map(t => `- ${t}`).join("\n") || "*Nenhuma*"}\n\n## Notas\n\n${notes || "*Nenhuma*"}\n\n## Referências\n\n${references.map(r => `- ${r}`).join("\n") || "*Nenhuma*"}`
        filename += ".md"
        break
      case "json":
        content = JSON.stringify({
          content: localContent,
          tags,
          notes,
          references,
          stats,
          createdAt: new Date().toISOString(),
          projectId
        }, null, 2)
        filename += ".json"
        break
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatDate = (date: string | Date, formatStr: string = "PPp") => {
    try {
      return format(new Date(date), formatStr, { locale: ptBR })
    } catch {
      return new Date(date).toLocaleString("pt-PT")
    }
  }

  const stats = useMemo(() => calculateStats(localContent), [localContent])
  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return versions
    const query = searchQuery.toLowerCase()
    return versions.filter(v => 
      v.content.toLowerCase().includes(query) ||
      v.tags.some(t => t.toLowerCase().includes(query)) ||
      (v.notes && v.notes.toLowerCase().includes(query))
    )
  }, [versions, searchQuery])

  const version1 = compareVersion1 ? versions.find(v => v.id === compareVersion1) : null
  const version2 = compareVersion2 ? versions.find(v => v.id === compareVersion2) : null

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl">Sinopse do Single</CardTitle>
              <CardDescription>
                Escreve a ideia geral que queres explorar neste single
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsTemplateDialogOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Templates
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Usar template pré-definido</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsHistoryDialogOpen(true)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    Histórico
                    {versions.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {versions.length}
                      </Badge>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ver histórico de versões</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Guardar sinopse</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="metadata">Metadados</TabsTrigger>
              <TabsTrigger value="analytics">Análise</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="synopsis-content">Conteúdo da Sinopse</Label>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        id="auto-save"
                        checked={autoSave}
                        onChange={(e) => setAutoSave(e.target.checked)}
                        className="h-3 w-3"
                      />
                      <label htmlFor="auto-save" className="cursor-pointer">Auto-save</label>
                    </div>
                    {lastSaved && (
                      <span className="text-xs text-muted-foreground">
                        Guardado {formatDistanceToNow(lastSaved, { addSuffix: true, locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
                <Textarea
                  id="synopsis-content"
                  value={localContent}
                  onChange={(e) => setLocalContent(e.target.value)}
                  placeholder="Uma sinopse curta que guia a escrita…"
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stats.wordCount} palavras • {stats.charCount} caracteres</span>
                  <div className="flex items-center gap-4">
                    <span>{stats.paragraphCount} parágrafos</span>
                    <span>{stats.sentenceCount} frases</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(localContent)
                  }}
                  disabled={!localContent.trim()}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText()
                      setLocalContent(prev => prev + "\n\n" + text)
                    } catch (error) {
                      console.error("Erro ao colar:", error)
                    }
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Colar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (confirm("Limpar todo o conteúdo?")) {
                      setLocalContent("")
                    }
                  }}
                  disabled={!localContent.trim()}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <Select onValueChange={(value) => handleExport(value as "txt" | "md" | "json")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Exportar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Texto (.txt)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="md">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        <span>Markdown (.md)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4" />
                        <span>JSON (.json)</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddTag()
                      }
                    }}
                    placeholder="Adicionar tag..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddTag} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="synopsis-notes">Notas Adicionais</Label>
                <Textarea
                  id="synopsis-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações, ideias, referências internas..."
                  rows={4}
                />
              </div>

              <Separator />

              {/* References */}
              <div className="space-y-2">
                <Label>Referências</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={newReference}
                    onChange={(e) => setNewReference(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleAddReference()
                      }
                    }}
                    placeholder="URL ou descrição da referência..."
                    className="flex-1"
                  />
                  <Button onClick={handleAddReference} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {references.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {references.map((ref, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded-md">
                        <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <a
                          href={ref.startsWith("http") ? ref : `https://${ref}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm flex-1 truncate hover:underline"
                        >
                          {ref}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveReference(ref)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.wordCount}</div>
                    <div className="text-xs text-muted-foreground">Palavras</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.charCount}</div>
                    <div className="text-xs text-muted-foreground">Caracteres</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.paragraphCount}</div>
                    <div className="text-xs text-muted-foreground">Parágrafos</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{stats.sentenceCount}</div>
                    <div className="text-xs text-muted-foreground">Frases</div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Distribuição de Palavras</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Palavras únicas</span>
                      <span className="font-mono">
                        {new Set(localContent.toLowerCase().split(/\s+/).filter(w => w.length > 0)).size}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Média de palavras por frase</span>
                      <span className="font-mono">
                        {stats.sentenceCount > 0 ? (stats.wordCount / stats.sentenceCount).toFixed(1) : "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Média de caracteres por palavra</span>
                      <span className="font-mono">
                        {stats.wordCount > 0 ? (stats.charCountNoSpaces / stats.wordCount).toFixed(1) : "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Templates Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Templates de Sinopse</DialogTitle>
            <DialogDescription>
              Escolha um template para começar ou usar como inspiração
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SYNOPSIS_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleUseTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardDescription className="text-xs">{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{template.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico de Versões</DialogTitle>
            <DialogDescription>
              Gerencie todas as versões da sinopse
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar versões..."
                  className="pl-9"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompareDialogOpen(true)}
                disabled={versions.length < 2}
              >
                <Eye className="h-4 w-4 mr-2" />
                Comparar
              </Button>
            </div>

            {filteredVersions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma versão encontrada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Estatísticas</TableHead>
                    <TableHead className="w-[150px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVersions.map((version) => (
                    <TableRow key={version.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatDate(version.createdAt, "dd/MM/yyyy")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(version.createdAt), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm line-clamp-2 max-w-md">
                          {version.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {version.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {version.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{version.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {version.wordCount} palavras
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  handleLoadVersion(version.id)
                                  setIsHistoryDialogOpen(false)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Carregar versão</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  navigator.clipboard.writeText(version.content)
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copiar</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteVersion(version.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Eliminar</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Compare Dialog */}
      <Dialog open={isCompareDialogOpen} onOpenChange={setIsCompareDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparar Versões</DialogTitle>
            <DialogDescription>
              Compare duas versões lado a lado
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Versão 1</Label>
              <Select value={compareVersion1 || ""} onValueChange={setCompareVersion1}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar versão..." />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {formatDate(v.createdAt, "dd/MM/yyyy HH:mm")} - {v.wordCount} palavras
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {version1 && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(version1.createdAt, "PPp")}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{version1.content}</p>
                      {version1.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {version1.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-2">
              <Label>Versão 2</Label>
              <Select value={compareVersion2 || ""} onValueChange={setCompareVersion2}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar versão..." />
                </SelectTrigger>
                <SelectContent>
                  {versions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {formatDate(v.createdAt, "dd/MM/yyyy HH:mm")} - {v.wordCount} palavras
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {version2 && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">
                        {formatDate(version2.createdAt, "PPp")}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{version2.content}</p>
                      {version2.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {version2.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {version1 && version2 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Diferenças</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Diferença de palavras</span>
                    <span className="font-mono">
                      {version2.wordCount - version1.wordCount > 0 ? "+" : ""}
                      {version2.wordCount - version1.wordCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Diferença de caracteres</span>
                    <span className="font-mono">
                      {version2.charCount - version1.charCount > 0 ? "+" : ""}
                      {version2.charCount - version1.charCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Dias entre versões</span>
                    <span className="font-mono">
                      {Math.floor(
                        (new Date(version2.createdAt).getTime() - new Date(version1.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}




