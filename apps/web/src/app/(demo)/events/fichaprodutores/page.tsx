"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  MapPin,
  Mail,
  Phone,
  Globe,
  Edit,
  Trash2,
  Plus,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Copy,
  Filter,
  BarChart3,
  Loader2,
  Music,
  Briefcase,
} from "lucide-react";
import {
  addProducer,
  getAllProducers,
  updateProducer,
  deleteProducer,
  searchProducers,
  EventProducer,
  migrateProducersFromVenues,
  initializeDefaultProducers,
} from "@/lib/producersDb";
import { CONCELHOS_PT, CAES_VENUES } from "@/lib/concelhos";
import { DEFAULT_PRODUCERS } from "@/lib/producersData";

// Função para detectar campos faltantes
type MissingField = {
  key: string;
  label: string;
  priority: "high" | "medium" | "low";
};

function getMissingFields(producer: EventProducer): MissingField[] {
  const missing: MissingField[] = [];

  if (!producer.contactPhone) {
    missing.push({ key: "contactPhone", label: "Telefone", priority: "high" });
  }
  if (!producer.contactEmail) {
    missing.push({ key: "contactEmail", label: "Email", priority: "high" });
  }
  if (!producer.contactName) {
    missing.push({ key: "contactName", label: "Nome do contacto", priority: "high" });
  }
  if (!producer.city) {
    missing.push({ key: "city", label: "Cidade", priority: "medium" });
  }
  if (!producer.url) {
    missing.push({ key: "url", label: "Website", priority: "medium" });
  }
  if (!producer.producerType) {
    missing.push({ key: "producerType", label: "Tipo de produtor", priority: "medium" });
  }
  if (!producer.specialties || producer.specialties.length === 0) {
    missing.push({ key: "specialties", label: "Especialidades", priority: "medium" });
  }
  if (!producer.country) {
    missing.push({ key: "country", label: "País", priority: "low" });
  }
  if (!producer.region) {
    missing.push({ key: "region", label: "Região", priority: "low" });
  }
  if (!producer.photoUrl) {
    missing.push({ key: "photoUrl", label: "Foto", priority: "low" });
  }

  return missing.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function calculateCompleteness(producer: EventProducer): number {
  const totalFields = 10;
  let completedFields = 0;

  if (producer.contactPhone) completedFields++;
  if (producer.contactEmail) completedFields++;
  if (producer.contactName) completedFields++;
  if (producer.city) completedFields++;
  if (producer.url) completedFields++;
  if (producer.producerType) completedFields++;
  if (producer.specialties && producer.specialties.length > 0) completedFields++;
  if (producer.country) completedFields++;
  if (producer.region) completedFields++;
  if (producer.photoUrl) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

export default function ProducersManagementPage() {
  const [producers, setProducers] = useState<EventProducer[]>([]);
  const [filteredProducers, setFilteredProducers] = useState<EventProducer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedProducer, setSelectedProducer] = useState<EventProducer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [producerToDelete, setProducerToDelete] = useState<EventProducer | null>(null);
  const [busy, setBusy] = useState(false);
  const [completenessFilter, setCompletenessFilter] = useState<"all" | "incomplete" | "complete">("all");
  const [expandedProducer, setExpandedProducer] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [migrating, setMigrating] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [url, setUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [region, setRegion] = useState<string>("");
  const [cae, setCae] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [producerType, setProducerType] = useState<string>("");
  const [specialties, setSpecialties] = useState<string>("");
  const [portfolio, setPortfolio] = useState("");
  const [experience, setExperience] = useState("");
  const [equipment, setEquipment] = useState("");
  const [technicalRider, setTechnicalRider] = useState("");
  const [services, setServices] = useState("");
  const [responsibleEntity, setResponsibleEntity] = useState("");
  const [nif, setNif] = useState("");
  const [billingConditions, setBillingConditions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [spaNumber, setSpaNumber] = useState("");
  const [reportPolicy, setReportPolicy] = useState("");
  const [pressKitEmail, setPressKitEmail] = useState("");
  const [operationalContact, setOperationalContact] = useState("");
  const [eventsProduced, setEventsProduced] = useState<number | "">("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const loadProducers = async () => {
    try {
      const all = await getAllProducers();
      all.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      setProducers(all);
      setFilteredProducers(all);
    } catch (error) {
      console.error("Erro ao carregar produtores:", error);
    }
  };

  useEffect(() => {
    loadProducers();
    // Inicializar produtores padrão se necessário (apenas se não houver produtores)
    getAllProducers().then(existing => {
      if (existing.length === 0) {
        initializeDefaultProducers(DEFAULT_PRODUCERS).then(() => {
          loadProducers();
        });
      }
    });
  }, []);

  // Estatísticas
  const stats = useMemo(() => {
    const cities = new Map<string, number>();
    const types = new Map<string, number>();
    const regions = new Map<string, number>();
    
    producers.forEach(p => {
      if (p.city) {
        cities.set(p.city, (cities.get(p.city) || 0) + 1);
      }
      if (p.producerType) {
        types.set(p.producerType, (types.get(p.producerType) || 0) + 1);
      }
      if (p.region) {
        regions.set(p.region, (regions.get(p.region) || 0) + 1);
      }
    });

    return {
      total: producers.length,
      cities: Array.from(cities.entries()).sort((a, b) => b[1] - a[1]),
      types: Array.from(types.entries()).sort((a, b) => b[1] - a[1]),
      regions: Array.from(regions.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [producers]);

  // Filtros
  useEffect(() => {
    let filtered = producers;

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(term) ||
        (p.city?.toLowerCase().includes(term) ?? false) ||
        (p.country?.toLowerCase().includes(term) ?? false) ||
        (p.notes?.toLowerCase().includes(term) ?? false) ||
        (p.specialties?.some(s => s.toLowerCase().includes(term)) ?? false) ||
        (p.services?.toLowerCase().includes(term) ?? false)
      );
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter(p => p.city === selectedCity);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(p => p.producerType === selectedType);
    }

    filtered.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setFilteredProducers(filtered);
  }, [searchQuery, selectedCity, selectedType, producers]);

  const producersWithCompleteness = useMemo(() => {
    return filteredProducers.map(p => ({
      producer: p,
      missingFields: getMissingFields(p),
      completeness: calculateCompleteness(p),
    }));
  }, [filteredProducers]);

  const filteredByCompleteness = useMemo(() => {
    if (completenessFilter === "all") return producersWithCompleteness;
    if (completenessFilter === "complete") {
      return producersWithCompleteness.filter(p => p.completeness === 100);
    }
    return producersWithCompleteness.filter(p => p.completeness < 100);
  }, [producersWithCompleteness, completenessFilter]);

  const resetForm = () => {
    setName("");
    setCity("");
    setCountry("");
    setAddress("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setUrl("");
    setPhotoUrl("");
    setRegion("");
    setCae("");
    setNotes("");
    setProducerType("");
    setSpecialties("");
    setPortfolio("");
    setExperience("");
    setEquipment("");
    setTechnicalRider("");
    setServices("");
    setResponsibleEntity("");
    setNif("");
    setBillingConditions("");
    setPaymentMethod("");
    setPaymentTerms("");
    setSpaNumber("");
    setReportPolicy("");
    setPressKitEmail("");
    setOperationalContact("");
    setEventsProduced("");
    setInstagram("");
    setFacebook("");
    setTwitter("");
    setLinkedin("");
    setSelectedProducer(null);
  };

  const openEditDialog = (producer: EventProducer) => {
    setSelectedProducer(producer);
    setName(producer.name);
    setCity(producer.city || "");
    setCountry(producer.country || "");
    setAddress(producer.address || "");
    setContactName(producer.contactName || "");
    setContactEmail(producer.contactEmail || "");
    setContactPhone(producer.contactPhone || "");
    setUrl(producer.url || "");
    setPhotoUrl(producer.photoUrl || "");
    setRegion(producer.region || "");
    setCae(producer.cae || "");
    setNotes(producer.notes || "");
    setProducerType(producer.producerType || "");
    setSpecialties(producer.specialties?.join(", ") || "");
    setPortfolio(producer.portfolio || "");
    setExperience(producer.experience || "");
    setEquipment(producer.equipment || "");
    setTechnicalRider(producer.technicalRider || "");
    setServices(producer.services || "");
    setResponsibleEntity(producer.responsibleEntity || "");
    setNif(producer.nif || "");
    setBillingConditions(producer.billingConditions || "");
    setPaymentMethod(producer.paymentMethod || "");
    setPaymentTerms(producer.paymentTerms || "");
    setSpaNumber(producer.spaNumber || "");
    setReportPolicy(producer.reportPolicy || "");
    setPressKitEmail(producer.pressKitEmail || "");
    setOperationalContact(producer.operationalContact || "");
    setEventsProduced(producer.eventsProduced || "");
    setInstagram(producer.socialMedia?.instagram || "");
    setFacebook(producer.socialMedia?.facebook || "");
    setTwitter(producer.socialMedia?.twitter || "");
    setLinkedin(producer.socialMedia?.linkedin || "");
    setIsDialogOpen(true);
  };

  const openNewDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;

    setBusy(true);
    try {
      const producerData = {
        name,
        city: city || undefined,
        country: country || undefined,
        address: address || undefined,
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        url: url || undefined,
        photoUrl: photoUrl || undefined,
        region: region || undefined,
        cae: cae || undefined,
        notes: notes || undefined,
        producerType: producerType || undefined,
        specialties: specialties ? specialties.split(",").map(s => s.trim()).filter(Boolean) : undefined,
        portfolio: portfolio || undefined,
        experience: experience || undefined,
        equipment: equipment || undefined,
        technicalRider: technicalRider || undefined,
        services: services || undefined,
        responsibleEntity: responsibleEntity || undefined,
        nif: nif || undefined,
        billingConditions: billingConditions || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentTerms: paymentTerms || undefined,
        spaNumber: spaNumber || undefined,
        reportPolicy: reportPolicy || undefined,
        pressKitEmail: pressKitEmail || undefined,
        operationalContact: operationalContact || undefined,
        eventsProduced: typeof eventsProduced === 'number' ? eventsProduced : undefined,
        socialMedia: {
          instagram: instagram || undefined,
          facebook: facebook || undefined,
          twitter: twitter || undefined,
          linkedin: linkedin || undefined,
        },
      };

      if (selectedProducer) {
        await updateProducer(selectedProducer.id, producerData);
      } else {
        await addProducer(producerData);
      }

      await loadProducers();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao guardar produtor:", error);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!producerToDelete) return;

    setBusy(true);
    try {
      await deleteProducer(producerToDelete.id);
      await loadProducers();
      setIsDeleteDialogOpen(false);
      setProducerToDelete(null);
    } catch (error) {
      console.error("Erro ao eliminar produtor:", error);
    } finally {
      setBusy(false);
    }
  };

  const handleMigrate = async () => {
    if (!confirm("Deseja migrar os produtores existentes da gestão de venues? Esta ação irá copiar todos os produtores marcados como 'event_production'.")) {
      return;
    }

    setMigrating(true);
    try {
      const result = await migrateProducersFromVenues();
      alert(`Migração concluída! ${result.migrated} de ${result.total} produtores migrados.`);
      await loadProducers();
    } catch (error) {
      console.error("Erro ao migrar produtores:", error);
      alert("Erro ao migrar produtores. Verifique o console para mais detalhes.");
    } finally {
      setMigrating(false);
    }
  };

  const canSave = name.trim().length > 0;

  const searchGoogle = (producer: EventProducer) => {
    const query = [producer.name, producer.city, producer.country].filter(Boolean).join(" ");
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  const copyMissingInfo = (producer: EventProducer, missingFields: MissingField[]) => {
    const missingList = missingFields.map(f => f.label).join(", ");
    const text = `Produtor: ${producer.name}\nInformações em falta: ${missingList}\n\nPesquisar: ${[producer.name, producer.city, producer.country].filter(Boolean).join(" ")}`;
    navigator.clipboard.writeText(text);
  };

  const incompleteCount = producersWithCompleteness.filter(p => p.completeness < 100).length;
  const completeCount = producersWithCompleteness.filter(p => p.completeness === 100).length;

  // Cidades únicas para filtro
  const uniqueCities = useMemo(() => {
    const cities = new Set(producers.map(p => p.city).filter(Boolean) as string[]);
    return Array.from(cities).sort();
  }, [producers]);

  // Tipos únicos para filtro
  const uniqueTypes = useMemo(() => {
    const types = new Set(producers.map(p => p.producerType).filter(Boolean) as string[]);
    return Array.from(types).sort();
  }, [producers]);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Music className="w-8 h-8" />
            Ficha Produtores de Eventos — Base de Dados Completa
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa de todos os produtores e produtoras de eventos. Filtre por cidade, tipo, região e visualize estatísticas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleMigrate} disabled={migrating} variant="outline">
            {migrating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A migrar...
              </>
            ) : (
              <>
                <Briefcase className="w-4 h-4 mr-2" />
                Migrar da Gestão de Venues
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produtor
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProducer ? "Editar Produtor" : "Novo Produtor"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Produtora XYZ"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="producerType">Tipo de Produtor</Label>
                <Select value={producerType || "__none__"} onValueChange={(value) => setProducerType(value === "__none__" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Empresa</SelectItem>
                    <SelectItem value="collective">Coletivo</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Digite ou selecione da lista..."
                  list="cities-list"
                />
                <datalist id="cities-list">
                  {CONCELHOS_PT.map(concelho => (
                    <option key={concelho} value={concelho} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Ex.: Portugal"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Rua, número, código postal, cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  <option value="Norte">Norte</option>
                  <option value="Centro">Centro</option>
                  <option value="Sul">Sul</option>
                  <option value="Ilhas">Ilhas</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cae">CAE (Código de Atividade Económica)</Label>
                <Select value={cae || "__none__"} onValueChange={(value) => setCae(value === "__none__" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o CAE..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    {CAES_VENUES.map(caeItem => (
                      <SelectItem key={caeItem.code} value={caeItem.code}>
                        {caeItem.code} — {caeItem.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactName">Contacto</Label>
                <Input
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Nome do responsável"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="nome@dominio.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefone</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+351 …"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://…"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="photoUrl">Foto (URL)</Label>
                <Input
                  id="photoUrl"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://…"
                />
                {photoUrl && (
                  <div className="mt-2">
                    <img
                      src={photoUrl}
                      alt="Foto do produtor"
                      className="w-full max-h-56 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">🎯 Especialidades e Serviços</h3>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="specialties">Especialidades (separadas por vírgula)</Label>
                <Input
                  id="specialties"
                  value={specialties}
                  onChange={(e) => setSpecialties(e.target.value)}
                  placeholder="Ex.: música eletrónica, rock, jazz, hip-hop"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="services">Serviços Oferecidos</Label>
                <Textarea
                  id="services"
                  value={services}
                  onChange={(e) => setServices(e.target.value)}
                  placeholder="Produção, promoção, booking, gestão de artistas, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="portfolio">Portfolio / Descrição</Label>
                <Textarea
                  id="portfolio"
                  value={portfolio}
                  onChange={(e) => setPortfolio(e.target.value)}
                  placeholder="Descrição dos eventos produzidos, histórico, etc."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experiência / Anos</Label>
                <Input
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="Ex.: 10 anos, desde 2010, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventsProduced">Eventos Produzidos (aprox.)</Label>
                <Input
                  id="eventsProduced"
                  type="number"
                  value={eventsProduced}
                  onChange={(e) => setEventsProduced(e.target.value ? Number(e.target.value) : "")}
                  placeholder="Número aproximado"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">🎛️ Informações Técnicas</h3>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="equipment">Equipamento Disponível</Label>
                <Textarea
                  id="equipment"
                  value={equipment}
                  onChange={(e) => setEquipment(e.target.value)}
                  placeholder="PA, monição, backline, iluminação, etc."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="technicalRider">Rider Técnico (Contacto)</Label>
                <Input
                  id="technicalRider"
                  value={technicalRider}
                  onChange={(e) => setTechnicalRider(e.target.value)}
                  placeholder="Email/telefone para envio de rider"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">💳 Informações Fiscais</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsibleEntity">Entidade Responsável</Label>
                <Input
                  id="responsibleEntity"
                  value={responsibleEntity}
                  onChange={(e) => setResponsibleEntity(e.target.value)}
                  placeholder="Nome da entidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nif">NIF</Label>
                <Input
                  id="nif"
                  value={nif}
                  onChange={(e) => setNif(e.target.value)}
                  placeholder="Número de identificação fiscal"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingConditions">Condições de Faturação</Label>
                <Input
                  id="billingConditions"
                  value={billingConditions}
                  onChange={(e) => setBillingConditions(e.target.value)}
                  placeholder="Condições de faturação"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                <Input
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  placeholder="Transferência, cheque, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Prazo de Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  placeholder="Ex.: 30 dias"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">📋 Legal</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spaNumber">Nº Registo SPA</Label>
                <Input
                  id="spaNumber"
                  value={spaNumber}
                  onChange={(e) => setSpaNumber(e.target.value)}
                  placeholder="Número de registo SPA"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportPolicy">Política de Report</Label>
                <Input
                  id="reportPolicy"
                  value={reportPolicy}
                  onChange={(e) => setReportPolicy(e.target.value)}
                  placeholder="Política de report (se aplicável)"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">📞 Contactos Adicionais</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operationalContact">Contacto Operativo (Telefone)</Label>
                <Input
                  id="operationalContact"
                  value={operationalContact}
                  onChange={(e) => setOperationalContact(e.target.value)}
                  placeholder="Telefone operativo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pressKitEmail">Email para Press-Kit/Assets</Label>
                <Input
                  id="pressKitEmail"
                  type="email"
                  value={pressKitEmail}
                  onChange={(e) => setPressKitEmail(e.target.value)}
                  placeholder="Email para envio de press-kit"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">📱 Redes Sociais</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@username ou URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="URL do Facebook"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter/X</Label>
                <Input
                  id="twitter"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  placeholder="@username ou URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="URL do LinkedIn"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <Label htmlFor="notes">Notas Gerais</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações adicionais, logística, contactos internos…"
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button disabled={!canSave || busy} onClick={handleSave}>
                {busy ? "A guardar…" : selectedProducer ? "Atualizar" : "Guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Produtores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cidades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.cities.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Top: {stats.cities[0]?.[0] || "N/A"} ({stats.cities[0]?.[1] || 0})
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.types.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mais comum: {stats.types[0]?.[0] || "N/A"} ({stats.types[0]?.[1] || 0})
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Regiões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.regions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.regions.map(([r, c]) => `${r}: ${c}`).join(", ") || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar por nome, cidade, especialidades…"
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as cidades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            {uniqueCities.map(city => (
              <SelectItem key={city} value={city}>{city}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Button
            variant={completenessFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompletenessFilter("all")}
          >
            Todos ({producersWithCompleteness.length})
          </Button>
          <Button
            variant={completenessFilter === "incomplete" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompletenessFilter("incomplete")}
          >
            Incompletos ({incompleteCount})
          </Button>
          <Button
            variant={completenessFilter === "complete" ? "default" : "outline"}
            size="sm"
            onClick={() => setCompletenessFilter("complete")}
          >
            Completos ({completeCount})
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowStats(!showStats)}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          {showStats ? "Ocultar" : "Mostrar"} Stats
        </Button>
        <Badge variant="secondary">
          {filteredByCompleteness.length} {filteredByCompleteness.length === 1 ? "produtor" : "produtores"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredByCompleteness.map(({ producer, missingFields, completeness }) => (
          <Card 
            key={producer.id} 
            id={`producer-${producer.id}`}
            className={`overflow-hidden ${expandedProducer === producer.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className="aspect-video w-full bg-muted overflow-hidden relative">
              {producer.photoUrl ? (
                <img
                  src={producer.photoUrl}
                  alt={`Foto do produtor ${producer.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  <Music className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-2 right-2">
                <Badge 
                  variant={completeness === 100 ? "default" : completeness >= 70 ? "secondary" : "destructive"}
                  className="flex items-center gap-1"
                >
                  {completeness === 100 ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <AlertCircle className="w-3 h-3" />
                  )}
                  {completeness}%
                </Badge>
              </div>
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{producer.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {[producer.city, producer.country].filter(Boolean).join(", ") || "Sem localização"}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {producer.producerType && (
                    <Badge variant="outline" className="ml-2">
                      {producer.producerType}
                    </Badge>
                  )}
                  {producer.region && (
                    <Badge variant="secondary" className="ml-2">
                      {producer.region}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {producer.specialties && producer.specialties.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {producer.specialties.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              )}

              {producer.contactName && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    <strong>{producer.contactName}</strong>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {producer.contactEmail && (
                  <a
                    href={`mailto:${producer.contactEmail}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                )}
                {producer.contactPhone && (
                  <a
                    href={`tel:${producer.contactPhone}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    Ligar
                  </a>
                )}
                {producer.url && (
                  <a
                    href={producer.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </div>

              {producer.socialMedia && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {producer.socialMedia.instagram && (
                    <a
                      href={producer.socialMedia.instagram.startsWith('http') ? producer.socialMedia.instagram : `https://instagram.com/${producer.socialMedia.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      📷 Instagram
                    </a>
                  )}
                  {producer.socialMedia.facebook && (
                    <a
                      href={producer.socialMedia.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      👤 Facebook
                    </a>
                  )}
                  {producer.socialMedia.twitter && (
                    <a
                      href={producer.socialMedia.twitter.startsWith('http') ? producer.socialMedia.twitter : `https://twitter.com/${producer.socialMedia.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      🐦 Twitter
                    </a>
                  )}
                </div>
              )}

              {missingFields.length > 0 && (
                <div className="space-y-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Faltam {missingFields.length} informação(ões)
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2"
                      onClick={() => setExpandedProducer(expandedProducer === producer.id ? null : producer.id)}
                    >
                      {expandedProducer === producer.id ? "Ocultar" : "Ver"}
                    </Button>
                  </div>
                  {expandedProducer === producer.id && (
                    <div className="space-y-2">
                      <ul className="text-xs space-y-1">
                        {missingFields.map((field) => (
                          <li key={field.key} className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${
                              field.priority === "high" ? "bg-red-500" :
                              field.priority === "medium" ? "bg-amber-500" : "bg-gray-400"
                            }`} />
                            <span className="text-muted-foreground">{field.label}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => searchGoogle(producer)}
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Pesquisar
                        </Button>
                        {producer.contactPhone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(`tel:${producer.contactPhone}`, "_self")}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => copyMissingInfo(producer, missingFields)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {producer.notes && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {producer.notes}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(producer)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setProducerToDelete(producer);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredByCompleteness.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Music className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCity !== "all" || selectedType !== "all"
                ? "Nenhum produtor encontrado com esses filtros"
                : completenessFilter === "incomplete"
                ? "Todos os produtores estão completos! 🎉"
                : completenessFilter === "complete"
                ? "Nenhum produtor completo ainda"
                : "Ainda não há produtores guardados. Adicione o primeiro ou migre da gestão de venues!"}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Eliminação</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem a certeza que deseja eliminar o produtor{" "}
            <strong>{producerToDelete?.name}</strong>? Esta ação não pode ser
            desfeita.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setProducerToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={busy}
            >
              {busy ? "A eliminar…" : "Eliminar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

