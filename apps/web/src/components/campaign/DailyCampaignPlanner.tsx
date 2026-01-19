"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { format, parseISO, isPast, isToday, isFuture } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"

type CampaignDay = {
  id: string
  date: string // YYYY-MM-DD
  phase: "antes" | "durante" | "depois"
  action: string
  platform?: string
  status: "pendente" | "em_andamento" | "concluido" | "cancelado"
  notes?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = "daily-campaign-planner-v1"

export function DailyCampaignPlanner() {
  const [days, setDays] = useState<CampaignDay[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDay, setEditingDay] = useState<CampaignDay | null>(null)
  const [formData, setFormData] = useState<Omit<CampaignDay, "id" | "createdAt" | "updatedAt">>({
    date: "",
    phase: "antes",
    action: "",
    platform: "",
    status: "pendente",
    notes: "",
  })

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        setDays(JSON.parse(saved))
      }
    } catch (error) {
      console.error("Erro ao carregar planeamento diário:", error)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (days.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(days))
    }
  }, [days])

  const handleOpenDialog = (day?: CampaignDay) => {
    if (day) {
      setEditingDay(day)
      setFormData({
        date: day.date,
        phase: day.phase,
        action: day.action,
        platform: day.platform || "",
        status: day.status,
        notes: day.notes || "",
      })
    } else {
      setEditingDay(null)
      setFormData({
        date: "",
        phase: "antes",
        action: "",
        platform: "",
        status: "pendente",
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingDay(null)
    setFormData({
      date: "",
      phase: "antes",
      action: "",
      platform: "",
      status: "pendente",
      notes: "",
    })
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    if (editingDay) {
      // Update
      setDays((prev) =>
        prev.map((d) =>
          d.id === editingDay.id
            ? { ...d, ...formData, updatedAt: now }
            : d
        )
      )
    } else {
      // Create
      const newDay: CampaignDay = {
        id: `day-${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      }
      setDays((prev) => [...prev, newDay])
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este dia?")) {
      setDays((prev) => prev.filter((d) => d.id !== id))
    }
  }

  const getStatusIcon = (status: CampaignDay["status"], date: string) => {
    const dayDate = parseISO(date)
    if (status === "concluido") {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    }
    if (status === "em_andamento") {
      return <Clock className="w-4 h-4 text-blue-500" />
    }
    if (isPast(dayDate) && !isToday(dayDate)) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }
    return <Clock className="w-4 h-4 text-gray-400" />
  }

  const getStatusBadge = (status: CampaignDay["status"]) => {
    const variants: Record<CampaignDay["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pendente: { variant: "outline", label: "Pendente" },
      em_andamento: { variant: "secondary", label: "Em Andamento" },
      concluido: { variant: "default", label: "Concluído" },
      cancelado: { variant: "destructive", label: "Cancelado" },
    }
    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Execução Diária da Campanha</h3>
          <p className="text-sm text-muted-foreground">
            Planeie todas as ações diárias da campanha do single
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Dia
        </Button>
      </div>

      {sortedDays.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum dia planeado ainda.</p>
            <p className="text-sm">Clique em "Adicionar Dia" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Plataforma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDays.map((day) => {
                  const dayDate = parseISO(day.date)
                  return (
                    <TableRow key={day.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(day.status, day.date)}
                          <div>
                            <div className="font-medium">
                              {format(dayDate, "dd/MM/yyyy", { locale: ptBR })}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {isToday(dayDate) ? "Hoje" : isPast(dayDate) ? "Passado" : format(dayDate, "EEEE", { locale: ptBR })}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {day.phase === "antes" ? "Antes da Estreia" : day.phase === "durante" ? "Durante" : "Depois"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate" title={day.action}>
                          {day.action}
                        </div>
                        {day.notes && (
                          <div className="text-xs text-muted-foreground truncate" title={day.notes}>
                            {day.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{day.platform || "-"}</TableCell>
                      <TableCell>{getStatusBadge(day.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(day)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(day.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingDay ? "Editar Dia da Campanha" : "Adicionar Dia da Campanha"}
            </DialogTitle>
            <DialogDescription>
              Defina a ação e o status para este dia da campanha
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Fase</label>
                <Select
                  value={formData.phase}
                  onValueChange={(value: "antes" | "durante" | "depois") =>
                    setFormData({ ...formData, phase: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="antes">Antes da Estreia</SelectItem>
                    <SelectItem value="durante">Durante</SelectItem>
                    <SelectItem value="depois">Depois</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Ação</label>
              <Textarea
                value={formData.action}
                onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                placeholder="Descreva a ação a realizar neste dia..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Plataforma (opcional)</label>
                <Input
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  placeholder="Instagram, TikTok, YouTube, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: CampaignDay["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notas adicionais..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingDay ? "Guardar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




