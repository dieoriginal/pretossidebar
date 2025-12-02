"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Trash2,
  AlertCircle,
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllVenues, Venue } from "@/lib/venuesDb";

interface MultiVenueSelectorProps {
  requiredCapacity: number;
  city?: string;
  primaryVenue: Venue | null;
  backupVenues: Venue[];
  onPrimaryChange: (venue: Venue | null) => void;
  onBackupsChange: (venues: Venue[]) => void;
  onCapacityChange: (capacity: number) => void;
  onCityChange?: (city: string) => void;
}

const PORTUGUESE_CITIES = [
  "Lisboa", "Porto", "Braga", "Coimbra", "Aveiro", "Faro", 
  "Évora", "Setúbal", "Viseu", "Leiria", "Funchal", "Ponta Delgada"
];

export function MultiVenueSelector({
  requiredCapacity,
  city,
  primaryVenue,
  backupVenues,
  onPrimaryChange,
  onBackupsChange,
  onCapacityChange,
  onCityChange,
}: MultiVenueSelectorProps) {
  const [allVenues, setAllVenues] = useState<Venue[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(city || "");

  useEffect(() => {
    loadVenues();
  }, []);

  useEffect(() => {
    if (onCityChange) {
      onCityChange(selectedCity);
    }
  }, [selectedCity, onCityChange]);

  const loadVenues = async () => {
    try {
      const venues = await getAllVenues();
      setAllVenues(venues);
    } catch (error) {
      console.error("Error loading venues:", error);
    }
  };

  // Filtrar venues por capacidade e cidade
  const filteredVenues = useMemo(() => {
    return allVenues.filter(venue => {
      // Filtro por capacidade
      const venueCapacity = venue.capacity || 0;
      const meetsCapacity = venueCapacity >= requiredCapacity;
      
      // Filtro por cidade
      const matchesCity = !selectedCity || venue.city === selectedCity;
      
      // Filtro por busca
      const matchesSearch = !searchTerm || 
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchTerm.toLowerCase());

      return meetsCapacity && matchesCity && matchesSearch;
    });
  }, [allVenues, requiredCapacity, selectedCity, searchTerm]);

  const addBackupVenue = (venue: Venue) => {
    if (!backupVenues.find(v => v.id === venue.id) && primaryVenue?.id !== venue.id) {
      onBackupsChange([...backupVenues, venue]);
    }
  };

  const removeBackupVenue = (venueId: string) => {
    onBackupsChange(backupVenues.filter(v => v.id !== venueId));
  };

  const setAsPrimary = (venue: Venue) => {
    // Se já existe primary, move para backups
    if (primaryVenue) {
      onBackupsChange([...backupVenues, primaryVenue]);
    }
    onPrimaryChange(venue);
    // Remove dos backups se estiver lá
    onBackupsChange(backupVenues.filter(v => v.id !== venue.id));
  };

  return (
    <div className="space-y-4">
      {/* Capacity Input */}
      <div>
        <Label htmlFor="requiredCapacity">Capacidade Requerida</Label>
        <Input
          id="requiredCapacity"
          type="number"
          value={requiredCapacity}
          onChange={(e) => onCapacityChange(parseInt(e.target.value) || 0)}
          placeholder="Ex: 200"
          min={0}
        />
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Apenas venues com capacidade ≥ {requiredCapacity} serão mostradas
        </div>
      </div>

      {/* City Selector */}
      <div>
        <Label htmlFor="city">Cidade</Label>
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger>
            <SelectValue placeholder="Selecionar cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas as cidades</SelectItem>
            {PORTUGUESE_CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Primary Venue */}
      <Card className={cn(
        "border-2",
        primaryVenue ? "border-green-500 bg-green-50/50 dark:bg-green-900/10" : "border-slate-300"
      )}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Venue Principal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {primaryVenue ? (
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold">{primaryVenue.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    {primaryVenue.city} {primaryVenue.address && `- ${primaryVenue.address}`}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {primaryVenue.capacity} pessoas
                    </Badge>
                    {primaryVenue.contactEmail && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {primaryVenue.contactEmail}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPrimaryChange(null)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Nenhuma venue principal selecionada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Venues */}
      <Card className="border-2 border-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            Venues de Backup ({backupVenues.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {backupVenues.length > 0 ? (
            backupVenues.map((venue) => (
              <div
                key={venue.id}
                className="flex items-start justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1">
                  <div className="font-semibold">{venue.name}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {venue.city} - {venue.capacity} pessoas
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAsPrimary(venue)}
                  >
                    Tornar Principal
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBackupVenue(venue.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
              Nenhuma venue de backup adicionada
            </div>
          )}
        </CardContent>
      </Card>

      {/* Venue Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Procurar Venues</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Procurar por nome, cidade ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {filteredVenues.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhuma venue encontrada com capacidade ≥ {requiredCapacity}
              {selectedCity && ` em ${selectedCity}`}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredVenues.map((venue) => {
                const isPrimary = primaryVenue?.id === venue.id;
                const isBackup = backupVenues.some(v => v.id === venue.id);
                const isSelected = isPrimary || isBackup;

                return (
                  <div
                    key={venue.id}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                      isPrimary 
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
                        : isBackup
                        ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                        : "border-slate-200 dark:border-slate-700"
                    )}
                    onClick={() => {
                      if (!isSelected) {
                        if (!primaryVenue) {
                          setAsPrimary(venue);
                        } else {
                          addBackupVenue(venue);
                        }
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {venue.name}
                          {isPrimary && (
                            <Badge className="bg-green-500">Principal</Badge>
                          )}
                          {isBackup && !isPrimary && (
                            <Badge className="bg-yellow-500">Backup</Badge>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {venue.city} {venue.address && `- ${venue.address}`}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Users className="h-3 w-3" />
                            Capacidade: {venue.capacity} pessoas
                          </div>
                          {venue.contactEmail && (
                            <div className="text-xs mt-1">{venue.contactEmail}</div>
                          )}
                        </div>
                      </div>
                      {!isSelected && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!primaryVenue) {
                              setAsPrimary(venue);
                            } else {
                              addBackupVenue(venue);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {!primaryVenue ? "Principal" : "Backup"}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

