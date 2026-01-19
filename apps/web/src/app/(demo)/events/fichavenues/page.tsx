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
  Building2,
  MapPin,
  Users,
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
  ExternalLink,
  Copy,
  Filter,
  BarChart3,
  FileText,
  Download,
  Check,
  Loader2,
} from "lucide-react";
import {
  addVenue,
  getAllVenues,
  updateVenue,
  deleteVenue,
  searchVenues,
  Venue,
  initializeDefaultVenues,
} from "@/lib/venuesDb";
import VenuesMap from "@/components/venues/VenuesMap";
import { CONCELHOS_PT, CAES_VENUES } from "@/lib/concelhos";
import { VenueCallChecklist } from "@/components/venues/VenueCallChecklist";
import { CAEInfoCard } from "@/components/venues/CAEInfoCard";
import { DEFAULT_VENUES } from "@/lib/venuesData";

// Função para detectar campos faltantes
type MissingField = {
  key: string;
  label: string;
  priority: "high" | "medium" | "low";
};

function getMissingFields(venue: Venue): MissingField[] {
  const missing: MissingField[] = [];

  if (!venue.contactPhone) {
    missing.push({ key: "contactPhone", label: "Telefone", priority: "high" });
  }
  if (!venue.contactEmail) {
    missing.push({ key: "contactEmail", label: "Email", priority: "high" });
  }
  if (!venue.contactName) {
    missing.push({ key: "contactName", label: "Nome do contacto", priority: "high" });
  }
  if (!venue.capacity) {
    missing.push({ key: "capacity", label: "Lotação", priority: "medium" });
  }
  if (!venue.url) {
    missing.push({ key: "url", label: "Website", priority: "medium" });
  }
  if (!venue.city) {
    missing.push({ key: "city", label: "Cidade", priority: "medium" });
  }
  if (!venue.cae) {
    missing.push({ key: "cae", label: "CAE", priority: "medium" });
  }
  if (!venue.country) {
    missing.push({ key: "country", label: "País", priority: "low" });
  }
  if (!venue.region) {
    missing.push({ key: "region", label: "Região", priority: "low" });
  }
  if (!venue.photoUrl) {
    missing.push({ key: "photoUrl", label: "Foto", priority: "low" });
  }
  if (!venue.lat || !venue.lng) {
    missing.push({ key: "location", label: "Localização (GPS)", priority: "medium" });
  }

  return missing.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

function calculateCompleteness(venue: Venue): number {
  const totalFields = 11;
  let completedFields = 0;

  if (venue.contactPhone) completedFields++;
  if (venue.contactEmail) completedFields++;
  if (venue.contactName) completedFields++;
  if (venue.capacity) completedFields++;
  if (venue.url) completedFields++;
  if (venue.city) completedFields++;
  if (venue.cae) completedFields++;
  if (venue.country) completedFields++;
  if (venue.region) completedFields++;
  if (venue.photoUrl) completedFields++;
  if (venue.lat && venue.lng) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
}

export default function VenuesManagementPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCAE, setSelectedCAE] = useState<string>("all");
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [venueToDelete, setVenueToDelete] = useState<Venue | null>(null);
  const [busy, setBusy] = useState(false);
  const [completenessFilter, setCompletenessFilter] = useState<"all" | "incomplete" | "complete">("all");
  const [expandedVenue, setExpandedVenue] = useState<string | null>(null);
  const [showStats, setShowStats] = useState(true);
  const [showCAETable, setShowCAETable] = useState(false);
  
  // DGARTES import state
  const [scraping, setScraping] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scrapedEntities, setScrapedEntities] = useState<Array<{ name: string; area: string; region: string; url?: string }>>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [selectedEntities, setSelectedEntities] = useState<Set<number>>(new Set());

  // Form state
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [address, setAddress] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [url, setUrl] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [region, setRegion] = useState<string>("");
  const [cae, setCae] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [remunerationModel, setRemunerationModel] = useState("");
  const [agreement, setAgreement] = useState("");
  const [equipment, setEquipment] = useState("");
  const [technicalRider, setTechnicalRider] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [curfew, setCurfew] = useState("");
  const [loadIn, setLoadIn] = useState("");
  const [loadOut, setLoadOut] = useState("");
  const [access, setAccess] = useState("");
  const [doorStaff, setDoorStaff] = useState("");
  const [technicalStaff, setTechnicalStaff] = useState("");
  const [responsibleEntity, setResponsibleEntity] = useState("");
  const [nif, setNif] = useState("");
  const [billingConditions, setBillingConditions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [spaNumber, setSpaNumber] = useState("");
  const [reportPolicy, setReportPolicy] = useState("");
  const [pressKitEmail, setPressKitEmail] = useState("");
  const [operationalContact, setOperationalContact] = useState("");
  const [roomConfiguration, setRoomConfiguration] = useState("");

  const loadVenues = async () => {
    try {
      const all = await getAllVenues();
      all.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      setVenues(all);
      setFilteredVenues(all);
    } catch (error) {
      console.error("Erro ao carregar venues:", error);
    }
  };

  // Função para sincronizar novos venues do DEFAULT_VENUES
  const syncNewVenues = async () => {
    setBusy(true);
    try {
      const existing = await getAllVenues();
      const existingKeys = new Set(
        existing.map(v => `${v.name.toLowerCase().trim()}_${(v.city || "").toLowerCase().trim()}`)
      );

      let added = 0;
      let skipped = 0;

      for (const defaultVenue of DEFAULT_VENUES) {
        const key = `${(defaultVenue.name || "").toLowerCase().trim()}_${((defaultVenue.city || "")).toLowerCase().trim()}`;
        
        if (!existingKeys.has(key)) {
          try {
            await addVenue(defaultVenue);
            added++;
          } catch (error) {
            console.warn(`Erro ao adicionar venue ${defaultVenue.name}:`, error);
            skipped++;
          }
        } else {
          skipped++;
        }
      }

      await loadVenues();
      
      if (added > 0) {
        alert(`Sincronização concluída!\n${added} novos venues adicionados\n${skipped} venues já existiam`);
      } else {
        alert(`Todos os venues já estão sincronizados!\n${skipped} venues verificados`);
      }
    } catch (error) {
      console.error("Erro ao sincronizar venues:", error);
      alert("Erro ao sincronizar venues. Verifique o console para mais detalhes.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    loadVenues();
    // Inicializar venues padrão se necessário (apenas se não houver venues)
    getAllVenues().then(existing => {
      if (existing.length === 0) {
        initializeDefaultVenues(DEFAULT_VENUES).then(() => {
          loadVenues();
        });
      }
    });
  }, []);

  // Estatísticas
  const stats = useMemo(() => {
    const cities = new Map<string, number>();
    const caes = new Map<string, number>();
    const regions = new Map<string, number>();
    
    venues.forEach(v => {
      if (v.city) {
        cities.set(v.city, (cities.get(v.city) || 0) + 1);
      }
      if (v.cae) {
        caes.set(v.cae, (caes.get(v.cae) || 0) + 1);
      }
      if (v.region) {
        regions.set(v.region, (regions.get(v.region) || 0) + 1);
      }
    });

    return {
      total: venues.length,
      cities: Array.from(cities.entries()).sort((a, b) => b[1] - a[1]),
      caes: Array.from(caes.entries()).sort((a, b) => b[1] - a[1]),
      regions: Array.from(regions.entries()).sort((a, b) => b[1] - a[1]),
    };
  }, [venues]);

  // Filtros
  useEffect(() => {
    let filtered = venues;

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(term) ||
        (v.city?.toLowerCase().includes(term) ?? false) ||
        (v.country?.toLowerCase().includes(term) ?? false) ||
        (v.notes?.toLowerCase().includes(term) ?? false) ||
        (v.cae?.includes(term) ?? false)
      );
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter(v => v.city === selectedCity);
    }

    if (selectedCAE !== "all") {
      filtered = filtered.filter(v => v.cae === selectedCAE);
    }

    filtered.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    setFilteredVenues(filtered);
  }, [searchQuery, selectedCity, selectedCAE, venues]);

  const venuesWithCompleteness = useMemo(() => {
    return filteredVenues.map(v => ({
      venue: v,
      missingFields: getMissingFields(v),
      completeness: calculateCompleteness(v),
    }));
  }, [filteredVenues]);

  const filteredByCompleteness = useMemo(() => {
    if (completenessFilter === "all") return venuesWithCompleteness;
    if (completenessFilter === "complete") {
      return venuesWithCompleteness.filter(v => v.completeness === 100);
    }
    return venuesWithCompleteness.filter(v => v.completeness < 100);
  }, [venuesWithCompleteness, completenessFilter]);

  const resetForm = () => {
    setName("");
    setCity("");
    setCountry("");
    setAddress("");
    setCapacity("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setUrl("");
    setPhotoUrl("");
    setRegion("");
    setCae("");
    setNotes("");
    setRemunerationModel("");
    setAgreement("");
    setEquipment("");
    setTechnicalRider("");
    setOpeningHours("");
    setCurfew("");
    setLoadIn("");
    setLoadOut("");
    setAccess("");
    setDoorStaff("");
    setTechnicalStaff("");
    setResponsibleEntity("");
    setNif("");
    setBillingConditions("");
    setPaymentMethod("");
    setPaymentTerms("");
    setSpaNumber("");
    setReportPolicy("");
    setPressKitEmail("");
    setOperationalContact("");
    setRoomConfiguration("");
    setSelectedVenue(null);
  };

  const openEditDialog = (venue: Venue) => {
    setSelectedVenue(venue);
    setName(venue.name);
    setCity(venue.city || "");
    setCountry(venue.country || "");
    setAddress(venue.address || "");
    setCapacity(typeof venue.capacity === 'string' ? venue.capacity : (venue.capacity || ""));
    setContactName(venue.contactName || "");
    setContactEmail(venue.contactEmail || "");
    setContactPhone(venue.contactPhone || "");
    setUrl(venue.url || "");
    setPhotoUrl(venue.photoUrl || "");
    setRegion(venue.region || "");
    setCae(venue.cae || "");
    setNotes(venue.notes || "");
    setRemunerationModel(venue.remunerationModel || "");
    setAgreement(venue.agreement || "");
    setEquipment(venue.equipment || "");
    setTechnicalRider(venue.technicalRider || "");
    setOpeningHours(venue.openingHours || "");
    setCurfew(venue.curfew || "");
    setLoadIn(venue.loadIn || "");
    setLoadOut(venue.loadOut || "");
    setAccess(venue.access || "");
    setDoorStaff(venue.doorStaff || "");
    setTechnicalStaff(venue.technicalStaff || "");
    setResponsibleEntity(venue.responsibleEntity || "");
    setNif(venue.nif || "");
    setBillingConditions(venue.billingConditions || "");
    setPaymentMethod(venue.paymentMethod || "");
    setPaymentTerms(venue.paymentTerms || "");
    setSpaNumber(venue.spaNumber || "");
    setReportPolicy(venue.reportPolicy || "");
    setPressKitEmail(venue.pressKitEmail || "");
    setOperationalContact(venue.operationalContact || "");
    setRoomConfiguration(venue.roomConfiguration || "");
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
      const venueData = {
        name,
        city: city || undefined,
        country: country || undefined,
        address: address || undefined,
        capacity: typeof capacity === 'string' ? capacity : (capacity === "" ? undefined : Number(capacity)),
        contactName: contactName || undefined,
        contactEmail: contactEmail || undefined,
        contactPhone: contactPhone || undefined,
        url: url || undefined,
        photoUrl: photoUrl || undefined,
        region: region || undefined,
        cae: cae || undefined,
        notes: notes || undefined,
        remunerationModel: remunerationModel || undefined,
        agreement: agreement || undefined,
        equipment: equipment || undefined,
        technicalRider: technicalRider || undefined,
        openingHours: openingHours || undefined,
        curfew: curfew || undefined,
        loadIn: loadIn || undefined,
        loadOut: loadOut || undefined,
        access: access || undefined,
        doorStaff: doorStaff || undefined,
        technicalStaff: technicalStaff || undefined,
        responsibleEntity: responsibleEntity || undefined,
        nif: nif || undefined,
        billingConditions: billingConditions || undefined,
        paymentMethod: paymentMethod || undefined,
        paymentTerms: paymentTerms || undefined,
        spaNumber: spaNumber || undefined,
        reportPolicy: reportPolicy || undefined,
        pressKitEmail: pressKitEmail || undefined,
        operationalContact: operationalContact || undefined,
        roomConfiguration: roomConfiguration || undefined,
      };

      if (selectedVenue) {
        await updateVenue(selectedVenue.id, venueData);
      } else {
        await addVenue(venueData);
      }

      await loadVenues();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao guardar venue:", error);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!venueToDelete) return;

    setBusy(true);
    try {
      await deleteVenue(venueToDelete.id);
      await loadVenues();
      setIsDeleteDialogOpen(false);
      setVenueToDelete(null);
    } catch (error) {
      console.error("Erro ao eliminar venue:", error);
    } finally {
      setBusy(false);
    }
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

  const canSave = name.trim().length > 0;

  const searchGoogle = (venue: Venue) => {
    const query = [venue.name, venue.city, venue.country].filter(Boolean).join(" ");
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
  };

  const copyMissingInfo = (venue: Venue, missingFields: MissingField[]) => {
    const missingList = missingFields.map(f => f.label).join(", ");
    const text = `Venue: ${venue.name}\nInformações em falta: ${missingList}\n\nPesquisar: ${[venue.name, venue.city, venue.country].filter(Boolean).join(" ")}`;
    navigator.clipboard.writeText(text);
  };

  // DGARTES scraping and import functions
  const scrapeDGARTES = async () => {
    setScraping(true);
    setScrapedEntities([]);
    setSelectedEntities(new Set());
    
    try {
      const maxPages = 50;
      const allEntities: Array<{ name: string; area: string; region: string; url?: string }> = [];
      let currentPage = 1;
      let hasNext = true;
      let consecutiveEmptyPages = 0;
      const maxEmptyPages = 3;
      
      while (hasNext && currentPage <= maxPages && consecutiveEmptyPages < maxEmptyPages) {
        try {
          const response = await fetch(`/api/dgartes/scrape?page=${currentPage}`);
          
          if (!response.ok) {
            console.error(`Error response status: ${response.status}`);
            break;
          }
          
          const data = await response.json();
          
          if (!data.success) {
            console.error(`API error: ${data.error}`);
            break;
          }
          
          if (data.entities && data.entities.length > 0) {
            allEntities.push(...data.entities);
            consecutiveEmptyPages = 0;
            console.log(`Page ${currentPage}: Found ${data.entities.length} entities`);
          } else {
            consecutiveEmptyPages++;
            console.log(`Page ${currentPage}: No entities found (${consecutiveEmptyPages}/${maxEmptyPages})`);
          }
          
          hasNext = data.hasNext === true;
          currentPage++;
          
          if (hasNext && currentPage <= maxPages) {
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } catch (error) {
          console.error(`Error scraping page ${currentPage}:`, error);
          consecutiveEmptyPages++;
          
          if (consecutiveEmptyPages >= maxEmptyPages) {
            break;
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      const uniqueEntities = allEntities.filter((entity, index, self) =>
        index === self.findIndex((e) => e.name.toLowerCase().trim() === entity.name.toLowerCase().trim())
      );
      
      setScrapedEntities(uniqueEntities);
      setSelectedEntities(new Set(uniqueEntities.map((_, index) => index)));
      
      if (uniqueEntities.length === 0) {
        alert("Nenhuma entidade encontrada. O site pode ter mudado sua estrutura ou há problemas de conectividade.");
      } else {
        console.log(`Total entities scraped: ${uniqueEntities.length}`);
      }
    } catch (error) {
      console.error("Error scraping DGARTES:", error);
      alert("Erro ao fazer scraping. Verifique o console para mais detalhes.");
    } finally {
      setScraping(false);
    }
  };

  const importSelectedEntities = async () => {
    if (selectedEntities.size === 0) {
      alert("Selecione pelo menos uma entidade para importar.");
      return;
    }

    setImporting(true);
    setImportProgress({ current: 0, total: selectedEntities.size });

    try {
      const entitiesToImport = Array.from(selectedEntities).map(
        (index) => scrapedEntities[index]
      );

      const regionMap: Record<string, string> = {
        'Norte': 'Norte',
        'Centro': 'Centro',
        'Lisboa e vale do Tejo': 'Lisboa e vale do Tejo',
        'Alentejo': 'Sul',
        'Algarve': 'Sul',
        'Açores': 'Ilhas',
        'Madeira': 'Ilhas',
        'Online': 'outro',
        'Não especificada': 'outro',
      };

      let imported = 0;
      let skipped = 0;

      for (let i = 0; i < entitiesToImport.length; i++) {
        const entity = entitiesToImport[i];
        setImportProgress({ current: i + 1, total: entitiesToImport.length });

        try {
          const existing = venues.find(
            (v) => v.name.toLowerCase() === entity.name.toLowerCase()
          );

          if (existing) {
            skipped++;
            continue;
          }

          const mappedRegion = regionMap[entity.region] || 'outro';

          let city = '';
          const cityMatch = entity.name.match(
            /(?:Lagos|Porto|Lisboa|Braga|Coimbra|Aveiro|Faro|Setúbal|Évora|Leiria|Funchal|Ponta Delgada)/i
          );
          if (cityMatch) {
            city = cityMatch[0];
          }

          await addVenue({
            name: entity.name.trim(),
            region: mappedRegion,
            city: city || undefined,
            country: 'Portugal',
            url: entity.url,
            notes: `Área artística: ${entity.area} | Fonte: DGARTES`,
            entityType: 'venue',
          });

          imported++;
        } catch (error) {
          console.error(`Error importing entity ${entity.name}:`, error);
          skipped++;
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      alert(
        `Importação concluída!\n${imported} venues importados\n${skipped} venues ignorados (já existentes ou erro)`
      );

      await loadVenues();
      setScrapedEntities([]);
      setSelectedEntities(new Set());
    } catch (error) {
      console.error("Error importing entities:", error);
      alert("Erro ao importar entidades. Verifique o console para mais detalhes.");
    } finally {
      setImporting(false);
      setImportProgress({ current: 0, total: 0 });
    }
  };

  const toggleEntitySelection = (index: number) => {
    const newSelected = new Set(selectedEntities);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEntities(newSelected);
  };

  const toggleAllEntities = () => {
    if (selectedEntities.size === scrapedEntities.length) {
      setSelectedEntities(new Set());
    } else {
      setSelectedEntities(new Set(scrapedEntities.map((_, index) => index)));
    }
  };

  const incompleteCount = venuesWithCompleteness.filter(v => v.completeness < 100).length;
  const completeCount = venuesWithCompleteness.filter(v => v.completeness === 100).length;

  // Cidades únicas para filtro
  const uniqueCities = useMemo(() => {
    const cities = new Set(venues.map(v => v.city).filter(Boolean) as string[]);
    return Array.from(cities).sort();
  }, [venues]);

  // CAEs únicos para filtro
  const uniqueCAEs = useMemo(() => {
    const caes = new Set(venues.map(v => v.cae).filter(Boolean) as string[]);
    return Array.from(caes).sort();
  }, [venues]);

  return (
    <div className="container py-8 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="w-8 h-8" />
            Ficha Venues — Base de Dados Completa de Portugal
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestão completa de todas as venues de Portugal. Filtre por cidade, CAE, região e visualize estatísticas.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={syncNewVenues} disabled={busy} variant="outline">
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A sincronizar...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Sincronizar Novos Venues
              </>
            )}
          </Button>
          <Button onClick={scrapeDGARTES} disabled={scraping} variant="outline">
            {scraping ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                A fazer scraping...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Importar da DGARTES
              </>
            )}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Venue
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedVenue ? "Editar Venue" : "Novo Venue"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex.: Casa da Música"
                />
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
                <Label htmlFor="capacity">Lotação (aprox.)</Label>
                <Input
                  id="capacity"
                  value={capacity}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.includes('-') || val.includes('(')) {
                      setCapacity(val); // Permite strings como "30-80 (confirmar)"
                    } else {
                      setCapacity(val ? Number(val) : "");
                    }
                  }}
                  placeholder="Ex.: 1200 ou 30-80 (confirmar)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="roomConfiguration">Configuração da Sala</Label>
                <Input
                  id="roomConfiguration"
                  value={roomConfiguration}
                  onChange={(e) => setRoomConfiguration(e.target.value)}
                  placeholder="Plateia/mesas"
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
                <Input
                  id="cae"
                  value={cae}
                  onChange={(e) => setCae(e.target.value)}
                  placeholder="Ou digite manualmente (ex: 90040)"
                  className="mt-2"
                  list="caes-list"
                />
                <datalist id="caes-list">
                  {CAES_VENUES.map(caeItem => (
                    <option key={caeItem.code} value={caeItem.code} />
                  ))}
                </datalist>
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
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="photoUrl">Foto (URL)</Label>
                    <Input
                      id="photoUrl"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                  <Button variant="secondary" onClick={lookupPhoto}>
                    Procurar foto
                  </Button>
                </div>
                {photoUrl && (
                  <div className="mt-2">
                    <img
                      src={photoUrl}
                      alt="Foto do venue"
                      className="w-full max-h-56 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">💰 Modelo de Remuneração</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="remunerationModel">Modelo</Label>
                <Select value={remunerationModel || "__none__"} onValueChange={(value) => setRemunerationModel(value === "__none__" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Nenhum</SelectItem>
                    <SelectItem value="flat">Flat (aluguer fixo)</SelectItem>
                    <SelectItem value="percentage">% Bilheteira</SelectItem>
                    <SelectItem value="bar_split">Bar Split</SelectItem>
                    <SelectItem value="minimum_guaranteed">Mínimo Garantido</SelectItem>
                    <SelectItem value="negotiable">A negociar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="agreement">Acordo</Label>
                <Input
                  id="agreement"
                  value={agreement}
                  onChange={(e) => setAgreement(e.target.value)}
                  placeholder="Ex.: 70-30, aluguer fixo, bar split"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">🎛️ Informações Técnicas</h3>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="equipment">Equipamento</Label>
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
              <div className="space-y-2">
                <Label htmlFor="technicalStaff">Staff Técnico e Custos</Label>
                <Input
                  id="technicalStaff"
                  value={technicalStaff}
                  onChange={(e) => setTechnicalStaff(e.target.value)}
                  placeholder="Disponibilidade e custos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doorStaff">Bilheteira/Door Staff</Label>
                <Input
                  id="doorStaff"
                  value={doorStaff}
                  onChange={(e) => setDoorStaff(e.target.value)}
                  placeholder="Bilheteira e custos"
                />
              </div>
              <div className="space-y-2 md:col-span-2 border-t pt-4">
                <h3 className="font-semibold text-sm">🚚 Logística</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="openingHours">Horários (Abertura/Fecho)</Label>
                <Input
                  id="openingHours"
                  value={openingHours}
                  onChange={(e) => setOpeningHours(e.target.value)}
                  placeholder="Ex.: 22h-06h"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curfew">Curfew/Licenças</Label>
                <Input
                  id="curfew"
                  value={curfew}
                  onChange={(e) => setCurfew(e.target.value)}
                  placeholder="Horário limite e licenças"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loadIn">Load-In</Label>
                <Input
                  id="loadIn"
                  value={loadIn}
                  onChange={(e) => setLoadIn(e.target.value)}
                  placeholder="Janela de load-in"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="loadOut">Load-Out</Label>
                <Input
                  id="loadOut"
                  value={loadOut}
                  onChange={(e) => setLoadOut(e.target.value)}
                  placeholder="Janela de load-out"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="access">Acessos</Label>
                <Input
                  id="access"
                  value={access}
                  onChange={(e) => setAccess(e.target.value)}
                  placeholder="Carrinha, elevador, etc."
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
                {busy ? "A guardar…" : selectedVenue ? "Atualizar" : "Guardar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Progresso de importação */}
      {importing && importProgress.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Importando venues...</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={(importProgress.current / importProgress.total) * 100}
              className="mb-2"
            />
            <p className="text-sm text-muted-foreground">
              {importProgress.current} de {importProgress.total} venues importados
            </p>
          </CardContent>
        </Card>
      )}

      {/* Entidades scraped para importação */}
      {scrapedEntities.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Entidades da DGARTES ({scrapedEntities.length})</CardTitle>
                <CardDescription>
                  Selecione as entidades que deseja importar como venues
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleAllEntities}
                >
                  {selectedEntities.size === scrapedEntities.length
                    ? "Desselecionar todas"
                    : "Selecionar todas"}
                </Button>
                <Button
                  onClick={importSelectedEntities}
                  disabled={importing || selectedEntities.size === 0}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Importar selecionadas ({selectedEntities.size})
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {scrapedEntities.map((entity, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-muted ${
                    selectedEntities.has(index) ? "bg-muted border-primary" : ""
                  }`}
                  onClick={() => toggleEntitySelection(index)}
                >
                  <div className="flex-shrink-0">
                    {selectedEntities.has(index) ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <div className="w-5 h-5 border-2 rounded" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{entity.name}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline">{entity.area}</Badge>
                      <Badge variant="secondary">{entity.region}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Venues</CardTitle>
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
              <CardTitle className="text-sm font-medium">CAEs Diferentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.caes.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Mais comum: {stats.caes[0]?.[0] || "N/A"} ({stats.caes[0]?.[1] || 0})
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

      {/* Checklist e CAE Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <VenueCallChecklist />
        <CAEInfoCard />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Procurar por nome, cidade, CAE, país…"
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
        <Select value={selectedCAE} onValueChange={setSelectedCAE}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os CAEs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os CAEs</SelectItem>
            {uniqueCAEs.map(cae => (
              <SelectItem key={cae} value={cae}>{cae}</SelectItem>
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
            Todos ({venuesWithCompleteness.length})
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCAETable(!showCAETable)}
        >
          <FileText className="w-4 h-4 mr-2" />
          {showCAETable ? "Ocultar" : "Mostrar"} CAEs
        </Button>
        <Badge variant="secondary">
          {filteredByCompleteness.length} {filteredByCompleteness.length === 1 ? "venue" : "venues"}
        </Badge>
      </div>

      {filteredByCompleteness.length > 0 && (
        <div className="mb-6">
          <VenuesMap 
            venues={filteredByCompleteness.map(v => v.venue)} 
            onVenueClick={(venue) => {
              const found = filteredByCompleteness.find(v => v.venue.id === venue.id);
              if (found) {
                setExpandedVenue(found.venue.id);
                document.getElementById(`venue-${found.venue.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredByCompleteness.map(({ venue, missingFields, completeness }) => (
          <Card 
            key={venue.id} 
            id={`venue-${venue.id}`}
            className={`overflow-hidden ${expandedVenue === venue.id ? "ring-2 ring-primary" : ""}`}
          >
            <div className="aspect-video w-full bg-muted overflow-hidden relative">
              {venue.photoUrl ? (
                <img
                  src={venue.photoUrl}
                  alt={`Foto do venue ${venue.name}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  <Building2 className="w-12 h-12" />
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
                  <CardTitle className="text-lg">{venue.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {[venue.city, venue.country].filter(Boolean).join(", ") || "Sem localização"}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {venue.region && (
                    <Badge variant="outline" className="ml-2">
                      {venue.region}
                    </Badge>
                  )}
                  {venue.cae && (
                    <Badge variant="secondary" className="ml-2 font-mono text-xs">
                      CAE: {venue.cae}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {venue.capacity && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Lotação: <strong>{venue.capacity}</strong>
                  </span>
                </div>
              )}

              {venue.contactName && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    <strong>{venue.contactName}</strong>
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {venue.contactEmail && (
                  <a
                    href={`mailto:${venue.contactEmail}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Mail className="w-3 h-3" />
                    Email
                  </a>
                )}
                {venue.contactPhone && (
                  <a
                    href={`tel:${venue.contactPhone}`}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    Ligar
                  </a>
                )}
                {venue.url && (
                  <a
                    href={venue.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    Website
                  </a>
                )}
              </div>

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
                      onClick={() => setExpandedVenue(expandedVenue === venue.id ? null : venue.id)}
                    >
                      {expandedVenue === venue.id ? "Ocultar" : "Ver"}
                    </Button>
                  </div>
                  {expandedVenue === venue.id && (
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
                          onClick={() => searchGoogle(venue)}
                        >
                          <Search className="w-3 h-3 mr-1" />
                          Pesquisar
                        </Button>
                        {venue.contactPhone && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => window.open(`tel:${venue.contactPhone}`, "_self")}
                          >
                            <Phone className="w-3 h-3" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs"
                          onClick={() => copyMissingInfo(venue, missingFields)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {venue.notes && (
                <div className="text-xs text-muted-foreground line-clamp-2">
                  {venue.notes}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(venue)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    setVenueToDelete(venue);
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
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchQuery || selectedCity !== "all" || selectedCAE !== "all"
                ? "Nenhum venue encontrado com esses filtros"
                : completenessFilter === "incomplete"
                ? "Todos os venues estão completos! 🎉"
                : completenessFilter === "complete"
                ? "Nenhum venue completo ainda"
                : "Ainda não há venues guardados. Adicione o primeiro!"}
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
            Tem a certeza que deseja eliminar o venue{" "}
            <strong>{venueToDelete?.name}</strong>? Esta ação não pode ser
            desfeita.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setVenueToDelete(null);
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
