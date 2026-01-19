"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash2, Euro, CheckCircle2, Clock, AlertCircle } from "lucide-react"

type MarketingService = {
  id: string
  name: string
  category: "redes_sociais" | "publicidade" | "influencers" | "imprensa" | "design" | "fotografia" | "video" | "outro"
  provider?: string
  description?: string
  cost: number
  status: "planeado" | "contratado" | "pago" | "cancelado"
  dueDate?: string // YYYY-MM-DD
  notes?: string
  createdAt: string
  updatedAt: string
}

interface EventMarketingServicesProps {
  eventId?: string
  onServicesChange?: (services: MarketingService[]) => void
  initialServices?: MarketingService[]
}

export function EventMarketingServices({ 
  eventId, 
  onServicesChange,
  initialServices = []
}: EventMarketingServicesProps) {
  const [services, setServices] = useState<MarketingService[]>(initialServices)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<MarketingService | null>(null)
  const [formData, setFormData] = useState<Omit<MarketingService, "id" | "createdAt" | "updatedAt">>({
    name: "",
    category: "outro",
    provider: "",
    description: "",
    cost: 0,
    status: "planeado",
    dueDate: "",
    notes: "",
  })

  const STORAGE_KEY = eventId ? `event-marketing-services-${eventId}` : "event-marketing-services-default"

  // Load from localStorage or initialServices
  useEffect(() => {
    if (initialServices.length > 0) {
      setServices(initialServices)
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
          setServices(JSON.parse(saved))
        }
      } catch (error) {
        console.error("Erro ao carregar serviços de marketing:", error)
      }
    }
  }, [STORAGE_KEY, initialServices])

  // Save to localStorage and notify parent
  useEffect(() => {
    if (services.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services))
    }
    if (onServicesChange) {
      onServicesChange(services)
    }
  }, [services, STORAGE_KEY, onServicesChange])

  const handleOpenDialog = (service?: MarketingService) => {
    if (service) {
      setEditingService(service)
      setFormData({
        name: service.name,
        category: service.category,
        provider: service.provider || "",
        description: service.description || "",
        cost: service.cost,
        status: service.status,
        dueDate: service.dueDate || "",
        notes: service.notes || "",
      })
    } else {
      setEditingService(null)
      setFormData({
        name: "",
        category: "outro",
        provider: "",
        description: "",
        cost: 0,
        status: "planeado",
        dueDate: "",
        notes: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingService(null)
    setFormData({
      name: "",
      category: "outro",
      provider: "",
      description: "",
      cost: 0,
      status: "planeado",
      dueDate: "",
      notes: "",
    })
  }

  const handleSave = () => {
    const now = new Date().toISOString()
    if (editingService) {
      // Update
      setServices((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? { ...s, ...formData, updatedAt: now }
            : s
        )
      )
    } else {
      // Create
      const newService: MarketingService = {
        id: `service-${Date.now()}`,
        ...formData,
        createdAt: now,
        updatedAt: now,
      }
      setServices((prev) => [...prev, newService])
    }
    handleCloseDialog()
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja eliminar este serviço?")) {
      setServices((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const getStatusBadge = (status: MarketingService["status"]) => {
    const variants: Record<MarketingService["status"], { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      planeado: { variant: "outline", label: "Planeado" },
      contratado: { variant: "secondary", label: "Contratado" },
      pago: { variant: "default", label: "Pago" },
      cancelado: { variant: "destructive", label: "Cancelado" },
    }
    const { variant, label } = variants[status]
    return <Badge variant={variant}>{label}</Badge>
  }

  const getCategoryLabel = (category: MarketingService["category"]) => {
    const labels: Record<MarketingService["category"], string> = {
      redes_sociais: "Redes Sociais",
      publicidade: "Publicidade",
      influencers: "Influencers",
      imprensa: "Imprensa",
      design: "Design",
      fotografia: "Fotografia",
      video: "Vídeo",
      outro: "Outro",
    }
    return labels[category]
  }

  const totalCost = services.reduce((sum, s) => sum + (s.cost || 0), 0)
  const paidCost = services.filter(s => s.status === "pago").reduce((sum, s) => sum + (s.cost || 0), 0)
  const pendingCost = totalCost - paidCost

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Serviços de Marketing</h3>
          <p className="text-sm text-muted-foreground">
            Planeie todos os serviços que terá que pagar para promover o evento
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Serviço
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Total Planeado</div>
            <div className="text-2xl font-bold">{totalCost.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Já Pago</div>
            <div className="text-2xl font-bold text-green-600">{paidCost.toFixed(2)} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">Pendente</div>
            <div className="text-2xl font-bold text-orange-600">{pendingCost.toFixed(2)} €</div>
          </CardContent>
        </Card>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Euro className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum serviço adicionado ainda.</p>
            <p className="text-sm">Clique em "Adicionar Serviço" para começar.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Fornecedor</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-muted-foreground truncate max-w-xs" title={service.description}>
                            {service.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getCategoryLabel(service.category)}</Badge>
                    </TableCell>
                    <TableCell>{service.provider || "-"}</TableCell>
                    <TableCell className="font-medium">{service.cost.toFixed(2)} €</TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>{service.dueDate ? new Date(service.dueDate).toLocaleDateString("pt-PT") : "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Serviço" : "Adicionar Serviço de Marketing"}
            </DialogTitle>
            <DialogDescription>
              Registre um serviço que terá que pagar para promover o evento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome do Serviço *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Anúncios Instagram"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Categoria *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value: MarketingService["category"]) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                    <SelectItem value="publicidade">Publicidade</SelectItem>
                    <SelectItem value="influencers">Influencers</SelectItem>
                    <SelectItem value="imprensa">Imprensa</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="fotografia">Fotografia</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Fornecedor (opcional)</label>
              <Input
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Nome da empresa/prestador"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descrição (opcional)</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes do serviço..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Custo (€) *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status *</label>
                <Select
                  value={formData.status}
                  onValueChange={(value: MarketingService["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planeado">Planeado</SelectItem>
                    <SelectItem value="contratado">Contratado</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Data de Vencimento</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
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
            <Button onClick={handleSave} disabled={!formData.name || formData.cost < 0}>
              {editingService ? "Guardar Alterações" : "Adicionar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}




