"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Edit, Trash2, Save } from "lucide-react";
import { EventData } from "@/hooks/use-events";
import { useEvents } from "@/hooks/use-events";

interface EventStepComponentsProps {
  eventData: EventData;
  setEventData: React.Dispatch<React.SetStateAction<EventData>>;
}

// Helper para persistir dados no localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const loadFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  }
  return null;
};

// Venue Step Component (Logistics, Food, Beverage, Decor)
export function VenueStep({ eventData, setEventData }: EventStepComponentsProps) {
  const { updateEvent } = useEvents();
  const eventId = eventData.id || "current";
  
  const [venueData, setVenueData] = useState(() => {
    const saved = loadFromLocalStorage(`venue_${eventId}`);
    return saved || {
      logistics: {
        address: eventData.logistics?.address || "",
        loadIn: eventData.logistics?.loadIn || "",
        loadOut: eventData.logistics?.loadOut || "",
        parking: eventData.logistics?.parking || "",
        transport: eventData.logistics?.transport || "",
      },
      food: {
        catering: eventData.logistics?.catering || "",
        specialMenu: "",
        mealTimes: { lunch: "", dinner: "" },
        dietaryRequirements: [] as string[],
      },
      beverage: {
        barService: "full",
        includedDrinks: "",
        barSplit: 30,
        barProvider: "",
      },
      decor: {
        decoration: "",
        lighting: "",
        branding: "",
      },
    };
  });

  useEffect(() => {
    saveToLocalStorage(`venue_${eventId}`, venueData);
    setEventData(prev => ({
      ...prev,
      logistics: {
        ...prev.logistics,
        address: venueData.logistics.address,
        loadIn: venueData.logistics.loadIn,
        loadOut: venueData.logistics.loadOut,
        parking: venueData.logistics.parking,
        transport: venueData.logistics.transport,
        catering: venueData.food.catering,
      },
    }));
    updateEvent({ logistics: { ...eventData.logistics, ...venueData.logistics, catering: venueData.food.catering } });
  }, [venueData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Logistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Endereço</Label>
              <Input
                value={venueData.logistics.address}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  logistics: { ...prev.logistics, address: e.target.value }
                }))}
                placeholder="Endereço completo"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Load-in</Label>
                <Input
                  type="datetime-local"
                  value={venueData.logistics.loadIn}
                  onChange={(e) => setVenueData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, loadIn: e.target.value }
                  }))}
                />
              </div>
              <div>
                <Label>Load-out</Label>
                <Input
                  type="datetime-local"
                  value={venueData.logistics.loadOut}
                  onChange={(e) => setVenueData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, loadOut: e.target.value }
                  }))}
                />
              </div>
            </div>
            <div>
              <Label>Estacionamento</Label>
              <Textarea
                value={venueData.logistics.parking}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  logistics: { ...prev.logistics, parking: e.target.value }
                }))}
                rows={2}
              />
            </div>
            <div>
              <Label>Transporte</Label>
              <Input
                value={venueData.logistics.transport}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  logistics: { ...prev.logistics, transport: e.target.value }
                }))}
                placeholder="Informações de transporte"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Food</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Catering</Label>
              <Textarea
                value={venueData.food.catering}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  food: { ...prev.food, catering: e.target.value }
                }))}
                placeholder="Detalhes do catering..."
                rows={3}
              />
            </div>
            <div>
              <Label>Menu Especial</Label>
              <Textarea
                value={venueData.food.specialMenu}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  food: { ...prev.food, specialMenu: e.target.value }
                }))}
                placeholder="Requisitos alimentares especiais..."
                rows={2}
              />
            </div>
            <div>
              <Label>Horário das Refeições</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  value={venueData.food.mealTimes.lunch}
                  onChange={(e) => setVenueData(prev => ({
                    ...prev,
                    food: { ...prev.food, mealTimes: { ...prev.food.mealTimes, lunch: e.target.value } }
                  }))}
                  placeholder="Almoço"
                />
                <Input
                  type="time"
                  value={venueData.food.mealTimes.dinner}
                  onChange={(e) => setVenueData(prev => ({
                    ...prev,
                    food: { ...prev.food, mealTimes: { ...prev.food.mealTimes, dinner: e.target.value } }
                  }))}
                  placeholder="Jantar"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Beverage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Bar Service</Label>
              <Select
                value={venueData.beverage.barService}
                onValueChange={(value) => setVenueData(prev => ({
                  ...prev,
                  beverage: { ...prev.beverage, barService: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Bar Completo</SelectItem>
                  <SelectItem value="limited">Bar Limitado</SelectItem>
                  <SelectItem value="none">Sem Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Bebidas Incluídas</Label>
              <Textarea
                value={venueData.beverage.includedDrinks}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  beverage: { ...prev.beverage, includedDrinks: e.target.value }
                }))}
                placeholder="Lista de bebidas incluídas..."
                rows={2}
              />
            </div>
            <div>
              <Label>Split do Bar (%)</Label>
              <Input
                type="number"
                value={venueData.beverage.barSplit}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  beverage: { ...prev.beverage, barSplit: parseInt(e.target.value) || 0 }
                }))}
                placeholder="Ex: 30"
              />
            </div>
            <div>
              <Label>Fornecedor do Bar</Label>
              <Input
                value={venueData.beverage.barProvider}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  beverage: { ...prev.beverage, barProvider: e.target.value }
                }))}
                placeholder="Nome do fornecedor"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Decor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Decoração do Espaço</Label>
              <Textarea
                value={venueData.decor.decoration}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  decor: { ...prev.decor, decoration: e.target.value }
                }))}
                placeholder="Descrição da decoração..."
                rows={3}
              />
            </div>
            <div>
              <Label>Iluminação</Label>
              <Textarea
                value={venueData.decor.lighting}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  decor: { ...prev.decor, lighting: e.target.value }
                }))}
                placeholder="Requisitos de iluminação..."
                rows={2}
              />
            </div>
            <div>
              <Label>Branding/Materiais</Label>
              <Textarea
                value={venueData.decor.branding}
                onChange={(e) => setVenueData(prev => ({
                  ...prev,
                  decor: { ...prev.decor, branding: e.target.value }
                }))}
                placeholder="Materiais de branding necessários..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Advertising Step Component (Radio, TV, Newspaper, Magazines)
interface AdvertisingItem {
  id: string;
  name: string;
  contact: string;
  cost: number;
  notes: string;
  scheduledDate?: string;
  status: "pending" | "confirmed" | "completed";
}

export function AdvertisingStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [radioStations, setRadioStations] = useState<AdvertisingItem[]>(() => {
    const saved = loadFromLocalStorage(`advertising_radio_${eventId}`);
    return saved || [];
  });
  const [tvChannels, setTvChannels] = useState<AdvertisingItem[]>(() => {
    const saved = loadFromLocalStorage(`advertising_tv_${eventId}`);
    return saved || [];
  });
  const [newspapers, setNewspapers] = useState<AdvertisingItem[]>(() => {
    const saved = loadFromLocalStorage(`advertising_newspaper_${eventId}`);
    return saved || [];
  });
  const [magazines, setMagazines] = useState<AdvertisingItem[]>(() => {
    const saved = loadFromLocalStorage(`advertising_magazines_${eventId}`);
    return saved || [];
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<AdvertisingItem>>({});

  useEffect(() => {
    saveToLocalStorage(`advertising_radio_${eventId}`, radioStations);
    saveToLocalStorage(`advertising_tv_${eventId}`, tvChannels);
    saveToLocalStorage(`advertising_newspaper_${eventId}`, newspapers);
    saveToLocalStorage(`advertising_magazines_${eventId}`, magazines);
  }, [radioStations, tvChannels, newspapers, magazines, eventId]);

  const addItem = (list: AdvertisingItem[], setList: React.Dispatch<React.SetStateAction<AdvertisingItem[]>>) => {
    const newItem: AdvertisingItem = {
      id: `ad_${Date.now()}`,
      name: "",
      contact: "",
      cost: 0,
      notes: "",
      status: "pending",
    };
    setList([...list, newItem]);
    setEditingId(newItem.id);
    setFormData(newItem);
  };

  const updateItem = (list: AdvertisingItem[], setList: React.Dispatch<React.SetStateAction<AdvertisingItem[]>>, id: string, updates: Partial<AdvertisingItem>) => {
    setList(list.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const deleteItem = (list: AdvertisingItem[], setList: React.Dispatch<React.SetStateAction<AdvertisingItem[]>>, id: string) => {
    setList(list.filter(item => item.id !== id));
  };

  const renderMediaList = (
    title: string,
    items: AdvertisingItem[],
    setItems: React.Dispatch<React.SetStateAction<AdvertisingItem[]>>,
    color: string
  ) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">{title}</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem(items, setItems)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum item adicionado
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Custo (€)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  {editingId === item.id ? (
                    <>
                      <TableCell>
                        <Input
                          value={formData.name || ""}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Nome"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={formData.contact || ""}
                          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                          placeholder="Contacto"
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={formData.cost || 0}
                          onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                          className="h-8"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={formData.status || "pending"}
                          onValueChange={(value: AdvertisingItem["status"]) => setFormData({ ...formData, status: value })}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="completed">Completo</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              updateItem(items, setItems, item.id, formData);
                              setEditingId(null);
                              setFormData({});
                            }}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setFormData({});
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{item.name || "-"}</TableCell>
                      <TableCell>{item.contact || "-"}</TableCell>
                      <TableCell>{item.cost}€</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            item.status === "completed" ? "default" :
                            item.status === "confirmed" ? "secondary" : "outline"
                          }
                        >
                          {item.status === "pending" ? "Pendente" :
                           item.status === "confirmed" ? "Confirmado" : "Completo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(item.id);
                              setFormData(item);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteItem(items, setItems, item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {renderMediaList("Radio", radioStations, setRadioStations, "blue")}
        {renderMediaList("TV", tvChannels, setTvChannels, "purple")}
        {renderMediaList("Newspaper", newspapers, setNewspapers, "green")}
        {renderMediaList("Magazines", magazines, setMagazines, "orange")}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Resumo de Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Rádio</div>
              <div className="text-2xl font-bold">
                {radioStations.reduce((sum, item) => sum + (item.cost || 0), 0)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">TV</div>
              <div className="text-2xl font-bold">
                {tvChannels.reduce((sum, item) => sum + (item.cost || 0), 0)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Jornais</div>
              <div className="text-2xl font-bold">
                {newspapers.reduce((sum, item) => sum + (item.cost || 0), 0)}€
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Revistas</div>
              <div className="text-2xl font-bold">
                {magazines.reduce((sum, item) => sum + (item.cost || 0), 0)}€
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                {radioStations.reduce((sum, item) => sum + (item.cost || 0), 0) +
                 tvChannels.reduce((sum, item) => sum + (item.cost || 0), 0) +
                 newspapers.reduce((sum, item) => sum + (item.cost || 0), 0) +
                 magazines.reduce((sum, item) => sum + (item.cost || 0), 0)}€
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Volunteer Step Component (Contract, Roles, Meetings, Schedule, Contacts)
interface VolunteerRole {
  id: string;
  name: string;
  quantity: number;
}

interface VolunteerMeeting {
  id: string;
  dateTime: string;
  location: string;
  agenda: string;
}

interface VolunteerSchedule {
  id: string;
  volunteerName: string;
  startTime: string;
  endTime: string;
  role: string;
}

interface VolunteerContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export function VolunteerStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [contract, setContract] = useState(() => {
    const saved = loadFromLocalStorage(`volunteer_contract_${eventId}`);
    return saved || { template: "", terms: "" };
  });
  const [roles, setRoles] = useState<VolunteerRole[]>(() => {
    const saved = loadFromLocalStorage(`volunteer_roles_${eventId}`);
    return saved || [];
  });
  const [meetings, setMeetings] = useState<VolunteerMeeting[]>(() => {
    const saved = loadFromLocalStorage(`volunteer_meetings_${eventId}`);
    return saved || [];
  });
  const [schedules, setSchedules] = useState<VolunteerSchedule[]>(() => {
    const saved = loadFromLocalStorage(`volunteer_schedules_${eventId}`);
    return saved || [];
  });
  const [contacts, setContacts] = useState<VolunteerContact[]>(() => {
    const saved = loadFromLocalStorage(`volunteer_contacts_${eventId}`);
    return saved || [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    saveToLocalStorage(`volunteer_contract_${eventId}`, contract);
    saveToLocalStorage(`volunteer_roles_${eventId}`, roles);
    saveToLocalStorage(`volunteer_meetings_${eventId}`, meetings);
    saveToLocalStorage(`volunteer_schedules_${eventId}`, schedules);
    saveToLocalStorage(`volunteer_contacts_${eventId}`, contacts);
  }, [contract, roles, meetings, schedules, contacts, eventId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Contract</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Modelo de Contrato</Label>
              <Textarea
                value={contract.template}
                onChange={(e) => setContract({ ...contract, template: e.target.value })}
                placeholder="Template de contrato para voluntários..."
                rows={6}
              />
            </div>
            <div>
              <Label>Termos e Condições</Label>
              <Textarea
                value={contract.terms}
                onChange={(e) => setContract({ ...contract, terms: e.target.value })}
                placeholder="Termos específicos..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Roles</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newRole: VolunteerRole = { id: `role_${Date.now()}`, name: "", quantity: 1 };
                  setRoles([...roles, newRole]);
                  setEditingId(newRole.id);
                  setFormData(newRole);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {roles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma função adicionada</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Função</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      {editingId === role.id ? (
                        <>
                          <TableCell>
                            <Input
                              value={formData.name || ""}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="h-8"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={formData.quantity || 1}
                              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                              className="h-8 w-20"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setRoles(roles.map(r => r.id === role.id ? formData : r));
                                setEditingId(null);
                                setFormData({});
                              }}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingId(null);
                                setFormData({});
                              }}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{role.name}</TableCell>
                          <TableCell>{role.quantity}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditingId(role.id);
                                setFormData(role);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setRoles(roles.filter(r => r.id !== role.id))}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Meetings</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newMeeting: VolunteerMeeting = { id: `meeting_${Date.now()}`, dateTime: "", location: "", agenda: "" };
                  setMeetings([...meetings, newMeeting]);
                  setEditingId(newMeeting.id);
                  setFormData(newMeeting);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {meetings.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhuma reunião agendada</p>
            ) : (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <Card key={meeting.id}>
                    <CardContent className="pt-4">
                      {editingId === meeting.id ? (
                        <div className="space-y-2">
                          <Input
                            type="datetime-local"
                            value={formData.dateTime || ""}
                            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                            className="h-8"
                          />
                          <Input
                            value={formData.location || ""}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            placeholder="Local"
                            className="h-8"
                          />
                          <Textarea
                            value={formData.agenda || ""}
                            onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                            placeholder="Agenda..."
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => {
                              setMeetings(meetings.map(m => m.id === meeting.id ? formData : m));
                              setEditingId(null);
                              setFormData({});
                            }}>
                              <Save className="w-4 h-4 mr-2" />
                              Guardar
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => {
                              setEditingId(null);
                              setFormData({});
                            }}>
                              <X className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{new Date(meeting.dateTime).toLocaleString("pt-PT")}</div>
                              <div className="text-sm text-muted-foreground">{meeting.location}</div>
                              <div className="text-sm mt-1">{meeting.agenda}</div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditingId(meeting.id);
                                setFormData(meeting);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setMeetings(meetings.filter(m => m.id !== meeting.id))}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Schedule</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSchedule: VolunteerSchedule = { id: `schedule_${Date.now()}`, volunteerName: "", startTime: "", endTime: "", role: "" };
                  setSchedules([...schedules, newSchedule]);
                  setEditingId(newSchedule.id);
                  setFormData(newSchedule);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum horário definido</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Início</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      {editingId === schedule.id ? (
                        <>
                          <TableCell>
                            <Input value={formData.volunteerName || ""} onChange={(e) => setFormData({ ...formData, volunteerName: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input value={formData.role || ""} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input type="time" value={formData.startTime || ""} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input type="time" value={formData.endTime || ""} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setSchedules(schedules.map(s => s.id === schedule.id ? formData : s));
                                setEditingId(null);
                                setFormData({});
                              }}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingId(null);
                                setFormData({});
                              }}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{schedule.volunteerName}</TableCell>
                          <TableCell>{schedule.role}</TableCell>
                          <TableCell>{schedule.startTime}</TableCell>
                          <TableCell>{schedule.endTime}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditingId(schedule.id);
                                setFormData(schedule);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setSchedules(schedules.filter(s => s.id !== schedule.id))}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Contacts</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newContact: VolunteerContact = { id: `contact_${Date.now()}`, name: "", email: "", phone: "", role: "" };
                  setContacts([...contacts, newContact]);
                  setEditingId(newContact.id);
                  setFormData(newContact);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum contacto adicionado</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.map((contact) => (
                    <TableRow key={contact.id}>
                      {editingId === contact.id ? (
                        <>
                          <TableCell>
                            <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input value={formData.email || ""} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input value={formData.phone || ""} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell>
                            <Input value={formData.role || ""} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="h-8" />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => {
                                setContacts(contacts.map(c => c.id === contact.id ? formData : c));
                                setEditingId(null);
                                setFormData({});
                              }}>
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => {
                                setEditingId(null);
                                setFormData({});
                              }}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell>{contact.name}</TableCell>
                          <TableCell>{contact.email}</TableCell>
                          <TableCell>{contact.phone}</TableCell>
                          <TableCell>{contact.role}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="ghost" onClick={() => {
                                setEditingId(contact.id);
                                setFormData(contact);
                              }}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setContacts(contacts.filter(c => c.id !== contact.id))}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Speaker Step Component (Contract, Curation, Program, Bio, Practice)
interface Speaker {
  id: string;
  name: string;
  contract: string;
  cachet: number;
  curation: string;
  themes: string;
  programStart: string;
  programEnd: string;
  programDescription: string;
  bio: string;
  bioShort: string;
  practiceDateTime: string;
  practiceLocation: string;
  practiceNotes: string;
}

export function SpeakerStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [speakers, setSpeakers] = useState<Speaker[]>(() => {
    const saved = loadFromLocalStorage(`speakers_${eventId}`);
    return saved || [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Speaker>>({});

  useEffect(() => {
    saveToLocalStorage(`speakers_${eventId}`, speakers);
  }, [speakers, eventId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Speakers</h3>
        <Button
          variant="outline"
          onClick={() => {
            const newSpeaker: Speaker = {
              id: `speaker_${Date.now()}`,
              name: "",
              contract: "",
              cachet: 0,
              curation: "",
              themes: "",
              programStart: "",
              programEnd: "",
              programDescription: "",
              bio: "",
              bioShort: "",
              practiceDateTime: "",
              practiceLocation: "",
              practiceNotes: "",
            };
            setSpeakers([...speakers, newSpeaker]);
            setEditingId(newSpeaker.id);
            setFormData(newSpeaker);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Speaker
        </Button>
      </div>

      {speakers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum speaker adicionado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {speakers.map((speaker) => (
            <Card key={speaker.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">
                    {editingId === speaker.id ? (
                      <Input
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do Speaker"
                        className="font-semibold"
                      />
                    ) : (
                      speaker.name || "Speaker sem nome"
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingId === speaker.id ? (
                      <>
                        <Button size="sm" onClick={() => {
                          setSpeakers(speakers.map(s => s.id === speaker.id ? { ...speaker, ...formData } as Speaker : s));
                          setEditingId(null);
                          setFormData({});
                        }}>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingId(null);
                          setFormData({});
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingId(speaker.id);
                          setFormData(speaker);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSpeakers(speakers.filter(s => s.id !== speaker.id))}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === speaker.id ? (
                  <div className="grid grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Contract</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Contrato do Speaker</Label>
                          <Textarea
                            value={formData.contract || ""}
                            onChange={(e) => setFormData({ ...formData, contract: e.target.value })}
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label>Cachet (€)</Label>
                          <Input
                            type="number"
                            value={formData.cachet || 0}
                            onChange={(e) => setFormData({ ...formData, cachet: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Curation</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Curadoria do Programa</Label>
                          <Textarea
                            value={formData.curation || ""}
                            onChange={(e) => setFormData({ ...formData, curation: e.target.value })}
                            rows={4}
                          />
                        </div>
                        <div>
                          <Label>Temas Principais</Label>
                          <Textarea
                            value={formData.themes || ""}
                            onChange={(e) => setFormData({ ...formData, themes: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Program</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label>Início</Label>
                            <Input
                              type="time"
                              value={formData.programStart || ""}
                              onChange={(e) => setFormData({ ...formData, programStart: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Fim</Label>
                            <Input
                              type="time"
                              value={formData.programEnd || ""}
                              onChange={(e) => setFormData({ ...formData, programEnd: e.target.value })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Descrição da Apresentação</Label>
                          <Textarea
                            value={formData.programDescription || ""}
                            onChange={(e) => setFormData({ ...formData, programDescription: e.target.value })}
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Bio</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Biografia Completa</Label>
                          <Textarea
                            value={formData.bio || ""}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label>Bio Curta (para programa)</Label>
                          <Textarea
                            value={formData.bioShort || ""}
                            onChange={(e) => setFormData({ ...formData, bioShort: e.target.value })}
                            rows={2}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="col-span-2">
                      <CardHeader>
                        <CardTitle className="text-sm">Practice</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Data/Hora do Ensaio</Label>
                            <Input
                              type="datetime-local"
                              value={formData.practiceDateTime || ""}
                              onChange={(e) => setFormData({ ...formData, practiceDateTime: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label>Local do Ensaio</Label>
                            <Input
                              value={formData.practiceLocation || ""}
                              onChange={(e) => setFormData({ ...formData, practiceLocation: e.target.value })}
                              placeholder="Local"
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Notas de Ensaio</Label>
                          <Textarea
                            value={formData.practiceNotes || ""}
                            onChange={(e) => setFormData({ ...formData, practiceNotes: e.target.value })}
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Cachet:</span> {speaker.cachet}€
                    </div>
                    <div>
                      <span className="font-medium">Programa:</span> {speaker.programStart} - {speaker.programEnd}
                    </div>
                    {speaker.bioShort && (
                      <div className="col-span-2">
                        <span className="font-medium">Bio:</span> {speaker.bioShort}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Sponsor Step Component (Contracts, Marketing, Logistic)
interface Sponsor {
  id: string;
  name: string;
  contractValue: number;
  contractTerms: string;
  marketingActivations: Array<{ id: string; type: string; location: string; description: string }>;
  logistics: Array<{ id: string; material: string; deliveryDate: string; instructions: string }>;
}

export function SponsorStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [sponsors, setSponsors] = useState<Sponsor[]>(() => {
    const saved = loadFromLocalStorage(`sponsors_${eventId}`);
    return saved || [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Sponsor>>({});
  const [editingActivationId, setEditingActivationId] = useState<string | null>(null);
  const [editingLogisticId, setEditingLogisticId] = useState<string | null>(null);

  useEffect(() => {
    saveToLocalStorage(`sponsors_${eventId}`, sponsors);
  }, [sponsors, eventId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Patrocinadores</h3>
        <Button
          variant="outline"
          onClick={() => {
            const newSponsor: Sponsor = {
              id: `sponsor_${Date.now()}`,
              name: "",
              contractValue: 0,
              contractTerms: "",
              marketingActivations: [],
              logistics: [],
            };
            setSponsors([...sponsors, newSponsor]);
            setEditingId(newSponsor.id);
            setFormData(newSponsor);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Patrocinador
        </Button>
      </div>

      {sponsors.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum patrocinador adicionado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sponsors.map((sponsor) => (
            <Card key={sponsor.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">
                    {editingId === sponsor.id ? (
                      <Input
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do Patrocinador"
                        className="font-semibold"
                      />
                    ) : (
                      sponsor.name || "Patrocinador sem nome"
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingId === sponsor.id ? (
                      <>
                        <Button size="sm" onClick={() => {
                          setSponsors(sponsors.map(s => s.id === sponsor.id ? { ...sponsor, ...formData } as Sponsor : s));
                          setEditingId(null);
                          setFormData({});
                        }}>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingId(null);
                          setFormData({});
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingId(sponsor.id);
                          setFormData(sponsor);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setSponsors(sponsors.filter(s => s.id !== sponsor.id))}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === sponsor.id ? (
                  <div className="grid grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Contracts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Valor do Contrato (€)</Label>
                          <Input
                            type="number"
                            value={formData.contractValue || 0}
                            onChange={(e) => setFormData({ ...formData, contractValue: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Termos do Contrato</Label>
                          <Textarea
                            value={formData.contractTerms || ""}
                            onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
                            rows={6}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">Marketing</CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newActivation = { id: `act_${Date.now()}`, type: "", location: "", description: "" };
                              setFormData({
                                ...formData,
                                marketingActivations: [...(formData.marketingActivations || []), newActivation]
                              });
                              setEditingActivationId(newActivation.id);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(formData.marketingActivations || []).map((act) => (
                          <Card key={act.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <Input value={act.type} onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    marketingActivations: (formData.marketingActivations || []).map(a => a.id === act.id ? { ...a, type: e.target.value } : a)
                                  });
                                }} placeholder="Tipo" className="h-8" />
                                <Input value={act.location} onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    marketingActivations: (formData.marketingActivations || []).map(a => a.id === act.id ? { ...a, location: e.target.value } : a)
                                  });
                                }} placeholder="Localização" className="h-8" />
                                <Textarea value={act.description} onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    marketingActivations: (formData.marketingActivations || []).map(a => a.id === act.id ? { ...a, description: e.target.value } : a)
                                  });
                                }} placeholder="Descrição" rows={2} />
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setFormData({
                                    ...formData,
                                    marketingActivations: (formData.marketingActivations || []).filter(a => a.id !== act.id)
                                  });
                                }}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-sm">Logistic</CardTitle>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const newLogistic = { id: `log_${Date.now()}`, material: "", deliveryDate: "", instructions: "" };
                              setFormData({
                                ...formData,
                                logistics: [...(formData.logistics || []), newLogistic]
                              });
                              setEditingLogisticId(newLogistic.id);
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {(formData.logistics || []).map((log) => (
                          <Card key={log.id}>
                            <CardContent className="pt-4">
                              <div className="space-y-2">
                                <Input value={log.material} onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    logistics: (formData.logistics || []).map(l => l.id === log.id ? { ...l, material: e.target.value } : l)
                                  });
                                }} placeholder="Material" className="h-8" />
                                <Input type="datetime-local" value={log.deliveryDate} onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    logistics: (formData.logistics || []).map(l => l.id === log.id ? { ...l, deliveryDate: e.target.value } : l)
                                  });
                                }} className="h-8" />
                                <Textarea value={log.instructions} onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    logistics: (formData.logistics || []).map(l => l.id === log.id ? { ...l, instructions: e.target.value } : l)
                                  });
                                }} placeholder="Instruções" rows={2} />
                                <Button size="sm" variant="ghost" onClick={() => {
                                  setFormData({
                                    ...formData,
                                    logistics: (formData.logistics || []).filter(l => l.id !== log.id)
                                  });
                                }}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Valor:</span> {sponsor.contractValue}€
                    </div>
                    <div>
                      <span className="font-medium">Ativações:</span> {sponsor.marketingActivations.length}
                    </div>
                    <div>
                      <span className="font-medium">Itens Logísticos:</span> {sponsor.logistics.length}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Producer Step Component (Contracts, Audio, Video)
interface Producer {
  id: string;
  name: string;
  cachet: number;
  contractTerms: string;
  audioRequirements: string;
  audioEquipment: string;
  videoRequirements: string;
  videoEquipment: string;
}

export function ProducerStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [producers, setProducers] = useState<Producer[]>(() => {
    const saved = loadFromLocalStorage(`producers_${eventId}`);
    return saved || [];
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Producer>>({});

  useEffect(() => {
    saveToLocalStorage(`producers_${eventId}`, producers);
    // Sync audio requirements to eventData
    if (producers.length > 0 && producers[0].audioRequirements) {
      setEventData(prev => ({
        ...prev,
        production: { ...prev.production, sound: producers[0].audioRequirements }
      }));
    }
  }, [producers, eventId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Produtores</h3>
        <Button
          variant="outline"
          onClick={() => {
            const newProducer: Producer = {
              id: `producer_${Date.now()}`,
              name: "",
              cachet: 0,
              contractTerms: "",
              audioRequirements: "",
              audioEquipment: "",
              videoRequirements: "",
              videoEquipment: "",
            };
            setProducers([...producers, newProducer]);
            setEditingId(newProducer.id);
            setFormData(newProducer);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produtor
        </Button>
      </div>

      {producers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum produtor adicionado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {producers.map((producer) => (
            <Card key={producer.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm">
                    {editingId === producer.id ? (
                      <Input
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do Produtor"
                        className="font-semibold"
                      />
                    ) : (
                      producer.name || "Produtor sem nome"
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {editingId === producer.id ? (
                      <>
                        <Button size="sm" onClick={() => {
                          setProducers(producers.map(p => p.id === producer.id ? { ...producer, ...formData } as Producer : p));
                          setEditingId(null);
                          setFormData({});
                        }}>
                          <Save className="w-4 h-4 mr-2" />
                          Guardar
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingId(null);
                          setFormData({});
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingId(producer.id);
                          setFormData(producer);
                        }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setProducers(producers.filter(p => p.id !== producer.id))}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingId === producer.id ? (
                  <div className="grid grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Contracts</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Cachet (€)</Label>
                          <Input
                            type="number"
                            value={formData.cachet || 0}
                            onChange={(e) => setFormData({ ...formData, cachet: parseFloat(e.target.value) || 0 })}
                          />
                        </div>
                        <div>
                          <Label>Termos do Contrato</Label>
                          <Textarea
                            value={formData.contractTerms || ""}
                            onChange={(e) => setFormData({ ...formData, contractTerms: e.target.value })}
                            rows={6}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Audio</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Requisitos de Áudio</Label>
                          <Textarea
                            value={formData.audioRequirements || ""}
                            onChange={(e) => setFormData({ ...formData, audioRequirements: e.target.value })}
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label>Equipamento de Áudio</Label>
                          <Textarea
                            value={formData.audioEquipment || ""}
                            onChange={(e) => setFormData({ ...formData, audioEquipment: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Video</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Requisitos de Vídeo</Label>
                          <Textarea
                            value={formData.videoRequirements || ""}
                            onChange={(e) => setFormData({ ...formData, videoRequirements: e.target.value })}
                            rows={6}
                          />
                        </div>
                        <div>
                          <Label>Equipamento de Vídeo</Label>
                          <Textarea
                            value={formData.videoEquipment || ""}
                            onChange={(e) => setFormData({ ...formData, videoEquipment: e.target.value })}
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Cachet:</span> {producer.cachet}€
                    </div>
                    <div>
                      <span className="font-medium">Áudio:</span> {producer.audioRequirements ? "Definido" : "Não definido"}
                    </div>
                    <div>
                      <span className="font-medium">Vídeo:</span> {producer.videoRequirements ? "Definido" : "Não definido"}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Stage Step Component (Project, Screen, Mic, Internet, Batteries, Cable)
interface StageEquipment {
  project: {
    model: string;
    resolution: string;
    lumens: string;
    notes: string;
  };
  screen: {
    size: string;
    type: string;
    position: string;
    notes: string;
  };
  mic: {
    type: string;
    quantity: number;
    models: string;
    notes: string;
  };
  internet: {
    speed: string;
    connectionType: string;
    hasBackup: boolean;
    notes: string;
  };
  batteries: {
    type: string;
    quantity: number;
    hasBackup: boolean;
    notes: string;
  };
  cables: {
    types: string;
    quantity: number;
    length: string;
    notes: string;
  };
}

export function StageStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [equipment, setEquipment] = useState<StageEquipment>(() => {
    const saved = loadFromLocalStorage(`stage_equipment_${eventId}`);
    return saved || {
      project: { model: "", resolution: "", lumens: "", notes: "" },
      screen: { size: "", type: "", position: "", notes: "" },
      mic: { type: "", quantity: 0, models: "", notes: "" },
      internet: { speed: "", connectionType: "", hasBackup: false, notes: "" },
      batteries: { type: "", quantity: 0, hasBackup: false, notes: "" },
      cables: { types: "", quantity: 0, length: "", notes: "" },
    };
  });

  useEffect(() => {
    saveToLocalStorage(`stage_equipment_${eventId}`, equipment);
  }, [equipment, eventId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Modelo/Tipo</Label>
              <Input
                value={equipment.project.model}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  project: { ...prev.project, model: e.target.value }
                }))}
                placeholder="Modelo/Tipo"
              />
            </div>
            <div>
              <Label>Resolução</Label>
              <Input
                value={equipment.project.resolution}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  project: { ...prev.project, resolution: e.target.value }
                }))}
                placeholder="Resolução"
              />
            </div>
            <div>
              <Label>Lumens</Label>
              <Input
                value={equipment.project.lumens}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  project: { ...prev.project, lumens: e.target.value }
                }))}
                placeholder="Lumens"
              />
            </div>
            <div>
              <Label>Notas do Projetor</Label>
              <Textarea
                value={equipment.project.notes}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  project: { ...prev.project, notes: e.target.value }
                }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Screen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tamanho (polegadas)</Label>
              <Input
                value={equipment.screen.size}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  screen: { ...prev.screen, size: e.target.value }
                }))}
                placeholder="Tamanho"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select
                value={equipment.screen.type}
                onValueChange={(value) => setEquipment(prev => ({
                  ...prev,
                  screen: { ...prev.screen, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LED">LED</SelectItem>
                  <SelectItem value="LCD">LCD</SelectItem>
                  <SelectItem value="Projeção">Projeção</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Posicionamento</Label>
              <Input
                value={equipment.screen.position}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  screen: { ...prev.screen, position: e.target.value }
                }))}
                placeholder="Posicionamento"
              />
            </div>
            <div>
              <Label>Notas do Ecrã</Label>
              <Textarea
                value={equipment.screen.notes}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  screen: { ...prev.screen, notes: e.target.value }
                }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Mic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select
                value={equipment.mic.type}
                onValueChange={(value) => setEquipment(prev => ({
                  ...prev,
                  mic: { ...prev.mic, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wireless">Wireless</SelectItem>
                  <SelectItem value="Wired">Wired</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={equipment.mic.quantity}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  mic: { ...prev.mic, quantity: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div>
              <Label>Modelos</Label>
              <Input
                value={equipment.mic.models}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  mic: { ...prev.mic, models: e.target.value }
                }))}
                placeholder="Modelos"
              />
            </div>
            <div>
              <Label>Notas dos Microfones</Label>
              <Textarea
                value={equipment.mic.notes}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  mic: { ...prev.mic, notes: e.target.value }
                }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Internet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Velocidade (Mbps)</Label>
              <Input
                value={equipment.internet.speed}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  internet: { ...prev.internet, speed: e.target.value }
                }))}
                placeholder="Velocidade"
              />
            </div>
            <div>
              <Label>Tipo de Conexão</Label>
              <Select
                value={equipment.internet.connectionType}
                onValueChange={(value) => setEquipment(prev => ({
                  ...prev,
                  internet: { ...prev.internet, connectionType: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WiFi">WiFi</SelectItem>
                  <SelectItem value="Ethernet">Ethernet</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="backup-internet"
                checked={equipment.internet.hasBackup}
                onCheckedChange={(checked) => setEquipment(prev => ({
                  ...prev,
                  internet: { ...prev.internet, hasBackup: checked as boolean }
                }))}
              />
              <Label htmlFor="backup-internet" className="font-normal">Internet de Backup</Label>
            </div>
            <div>
              <Label>Notas de Internet</Label>
              <Textarea
                value={equipment.internet.notes}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  internet: { ...prev.internet, notes: e.target.value }
                }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Batteries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select
                value={equipment.batteries.type}
                onValueChange={(value) => setEquipment(prev => ({
                  ...prev,
                  batteries: { ...prev.batteries, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AA">AA</SelectItem>
                  <SelectItem value="AAA">AAA</SelectItem>
                  <SelectItem value="9V">9V</SelectItem>
                  <SelectItem value="Li-ion">Li-ion</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={equipment.batteries.quantity}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  batteries: { ...prev.batteries, quantity: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="backup-batteries"
                checked={equipment.batteries.hasBackup}
                onCheckedChange={(checked) => setEquipment(prev => ({
                  ...prev,
                  batteries: { ...prev.batteries, hasBackup: checked as boolean }
                }))}
              />
              <Label htmlFor="backup-batteries" className="font-normal">Baterias de Reserva</Label>
            </div>
            <div>
              <Label>Notas das Baterias</Label>
              <Textarea
                value={equipment.batteries.notes}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  batteries: { ...prev.batteries, notes: e.target.value }
                }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Cable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipos</Label>
              <Input
                value={equipment.cables.types}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  cables: { ...prev.cables, types: e.target.value }
                }))}
                placeholder="XLR/TRS/HDMI/etc"
              />
            </div>
            <div>
              <Label>Quantidade</Label>
              <Input
                type="number"
                value={equipment.cables.quantity}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  cables: { ...prev.cables, quantity: parseInt(e.target.value) || 0 }
                }))}
              />
            </div>
            <div>
              <Label>Comprimento (metros)</Label>
              <Input
                value={equipment.cables.length}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  cables: { ...prev.cables, length: e.target.value }
                }))}
                placeholder="Comprimento"
              />
            </div>
            <div>
              <Label>Notas dos Cabos</Label>
              <Textarea
                value={equipment.cables.notes}
                onChange={(e) => setEquipment(prev => ({
                  ...prev,
                  cables: { ...prev.cables, notes: e.target.value }
                }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Attendees Step Component (Communication, Payment, Email, Directions, Badges, Access)
export function AttendeesStep({ eventData, setEventData }: EventStepComponentsProps) {
  const eventId = eventData.id || "current";
  const [attendeesData, setAttendeesData] = useState(() => {
    const saved = loadFromLocalStorage(`attendees_${eventId}`);
    return saved || {
      communication: {
        channels: { email: false, sms: false, app: false },
        autoMessages: "",
      },
      payment: {
        methods: { card: false, cash: false, online: false },
        priceTiers: eventData.tickets?.priceTiers || [],
      },
      email: {
        confirmationTemplate: "",
        reminderTemplate: "",
      },
      directions: {
        instructions: eventData.logistics?.address || "",
        mapLink: "",
      },
      badges: {
        type: "physical",
        design: "",
        info: { name: false, role: false, qr: false },
      },
      access: {
        control: { list: false, ticket: false, wristband: false },
        areas: { general: false, vip: false, backstage: false },
      },
    };
  });

  useEffect(() => {
    saveToLocalStorage(`attendees_${eventId}`, attendeesData);
    // Sync price tiers to eventData
    if (attendeesData.payment.priceTiers.length > 0) {
      setEventData(prev => ({
        ...prev,
        tickets: {
          ...prev.tickets,
          priceTiers: attendeesData.payment.priceTiers,
        },
      }));
    }
  }, [attendeesData, eventId]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Canais de Comunicação</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="comm-email"
                    checked={attendeesData.communication.channels.email}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      communication: {
                        ...prev.communication,
                        channels: { ...prev.communication.channels, email: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="comm-email" className="font-normal">Email</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="comm-sms"
                    checked={attendeesData.communication.channels.sms}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      communication: {
                        ...prev.communication,
                        channels: { ...prev.communication.channels, sms: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="comm-sms" className="font-normal">SMS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="comm-app"
                    checked={attendeesData.communication.channels.app}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      communication: {
                        ...prev.communication,
                        channels: { ...prev.communication.channels, app: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="comm-app" className="font-normal">App Push</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Mensagens Automáticas</Label>
              <Textarea
                value={attendeesData.communication.autoMessages}
                onChange={(e) => setAttendeesData(prev => ({
                  ...prev,
                  communication: { ...prev.communication, autoMessages: e.target.value }
                }))}
                placeholder="Templates de mensagens..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Métodos de Pagamento</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pay-card"
                    checked={attendeesData.payment.methods.card}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        methods: { ...prev.payment.methods, card: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="pay-card" className="font-normal">Cartão</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pay-cash"
                    checked={attendeesData.payment.methods.cash}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        methods: { ...prev.payment.methods, cash: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="pay-cash" className="font-normal">Dinheiro</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="pay-online"
                    checked={attendeesData.payment.methods.online}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        methods: { ...prev.payment.methods, online: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="pay-online" className="font-normal">Online</Label>
                </div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Preços</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setAttendeesData(prev => ({
                      ...prev,
                      payment: {
                        ...prev.payment,
                        priceTiers: [...prev.payment.priceTiers, { name: "", price: 0, quantity: 0 }]
                      }
                    }));
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              <div className="space-y-2">
                {attendeesData.payment.priceTiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2">
                    <Input
                      value={tier.name}
                      onChange={(e) => {
                        const newTiers = [...attendeesData.payment.priceTiers];
                        newTiers[index].name = e.target.value;
                        setAttendeesData(prev => ({
                          ...prev,
                          payment: { ...prev.payment, priceTiers: newTiers }
                        }));
                      }}
                      placeholder="Nome"
                    />
                    <Input
                      type="number"
                      value={tier.price}
                      onChange={(e) => {
                        const newTiers = [...attendeesData.payment.priceTiers];
                        newTiers[index].price = parseFloat(e.target.value) || 0;
                        setAttendeesData(prev => ({
                          ...prev,
                          payment: { ...prev.payment, priceTiers: newTiers }
                        }));
                      }}
                      placeholder="Preço"
                    />
                    <Input
                      type="number"
                      value={tier.quantity}
                      onChange={(e) => {
                        const newTiers = [...attendeesData.payment.priceTiers];
                        newTiers[index].quantity = parseInt(e.target.value) || 0;
                        setAttendeesData(prev => ({
                          ...prev,
                          payment: { ...prev.payment, priceTiers: newTiers }
                        }));
                      }}
                      placeholder="Qtd"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setAttendeesData(prev => ({
                          ...prev,
                          payment: {
                            ...prev.payment,
                            priceTiers: prev.payment.priceTiers.filter((_, i) => i !== index)
                          }
                        }));
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Emails para Participantes</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-xs">Confirmação de Inscrição</Label>
                  <Textarea
                    value={attendeesData.email.confirmationTemplate}
                    onChange={(e) => setAttendeesData(prev => ({
                      ...prev,
                      email: { ...prev.email, confirmationTemplate: e.target.value }
                    }))}
                    placeholder="Template de email..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs">Lembrete Pré-Evento</Label>
                  <Textarea
                    value={attendeesData.email.reminderTemplate}
                    onChange={(e) => setAttendeesData(prev => ({
                      ...prev,
                      email: { ...prev.email, reminderTemplate: e.target.value }
                    }))}
                    placeholder="Template de email..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Directions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Instruções de Chegada</Label>
              <Textarea
                value={attendeesData.directions.instructions}
                onChange={(e) => {
                  setAttendeesData(prev => ({
                    ...prev,
                    directions: { ...prev.directions, instructions: e.target.value }
                  }));
                  setEventData(prev => ({
                    ...prev,
                    logistics: { ...prev.logistics, address: e.target.value }
                  }));
                }}
                placeholder="Instruções detalhadas de como chegar..."
                rows={6}
              />
            </div>
            <div>
              <Label>Mapa/Coordenadas</Label>
              <Input
                value={attendeesData.directions.mapLink}
                onChange={(e) => setAttendeesData(prev => ({
                  ...prev,
                  directions: { ...prev.directions, mapLink: e.target.value }
                }))}
                placeholder="Link do Google Maps"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Sistema de Badges</Label>
              <Select
                value={attendeesData.badges.type}
                onValueChange={(value) => setAttendeesData(prev => ({
                  ...prev,
                  badges: { ...prev.badges, type: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physical">Físico</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
                  <SelectItem value="both">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Design do Badge</Label>
              <Textarea
                value={attendeesData.badges.design}
                onChange={(e) => setAttendeesData(prev => ({
                  ...prev,
                  badges: { ...prev.badges, design: e.target.value }
                }))}
                placeholder="Especificações do design..."
                rows={3}
              />
            </div>
            <div>
              <Label>Informações no Badge</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="badge-name"
                    checked={attendeesData.badges.info.name}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      badges: {
                        ...prev.badges,
                        info: { ...prev.badges.info, name: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="badge-name" className="font-normal">Nome</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="badge-role"
                    checked={attendeesData.badges.info.role}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      badges: {
                        ...prev.badges,
                        info: { ...prev.badges.info, role: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="badge-role" className="font-normal">Função</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="badge-qr"
                    checked={attendeesData.badges.info.qr}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      badges: {
                        ...prev.badges,
                        info: { ...prev.badges.info, qr: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="badge-qr" className="font-normal">QR Code</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Controlo de Acesso</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="access-list"
                    checked={attendeesData.access.control.list}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        control: { ...prev.access.control, list: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="access-list" className="font-normal">Lista de Convidados</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="access-ticket"
                    checked={attendeesData.access.control.ticket}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        control: { ...prev.access.control, ticket: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="access-ticket" className="font-normal">Bilhetes</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="access-wristband"
                    checked={attendeesData.access.control.wristband}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        control: { ...prev.access.control, wristband: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="access-wristband" className="font-normal">Pulseiras</Label>
                </div>
              </div>
            </div>
            <div>
              <Label>Áreas de Acesso</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="area-general"
                    checked={attendeesData.access.areas.general}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        areas: { ...prev.access.areas, general: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="area-general" className="font-normal">Geral</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="area-vip"
                    checked={attendeesData.access.areas.vip}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        areas: { ...prev.access.areas, vip: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="area-vip" className="font-normal">VIP</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="area-backstage"
                    checked={attendeesData.access.areas.backstage}
                    onCheckedChange={(checked) => setAttendeesData(prev => ({
                      ...prev,
                      access: {
                        ...prev.access,
                        areas: { ...prev.access.areas, backstage: checked as boolean }
                      }
                    }))}
                  />
                  <Label htmlFor="area-backstage" className="font-normal">Backstage</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
