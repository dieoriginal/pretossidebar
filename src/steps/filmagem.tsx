"use client";

import React, { useState } from "react";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import jsPDF from "jspdf";

// Static options
const equipmentCategoryOptions = ["Camera", "Lens", "Stabilization", "Lighting"];
const mealVendors = [
  { name: "BBGrill", cost: 4.8 },
  { name: "Glovo", cost: 12 },
  { name: "Bolt Food", cost: 10 },
  { name: "Tupperware", cost: 0 },
  { name: "Bald KFC 30 Wings", cost: 0 },
];

// -- Type Definitions --
type CrewMember = {
  id: number;
  name: string;
  role: string;
};

type EquipmentEntry = {
  id: number;
  name: string;
  category: string;
};

type Location = {
  id: number;
  date: string;
  startTime: string;
  wrapUpTime: string;
  address: string;
  scenes: string[]; // scene tags
  equipment: number[]; // store equipment IDs (from global equipment inventory)
  crew: number[]; // store crew member IDs
  notes: string;
};

type MealPerson = { personId: number; cost: number };

type Meal = {
  id: number;
  vendor: string;
  people: MealPerson[];
  dietary: string;
  notes: string;
};

type Transport = {
  id: number;
  vehicle: string;
  driver: string;
  passengers: number[];
  equipment: number[]; // store equipment IDs (from global equipment inventory)
  route: string;
};

// -- Component: LocationCard --
interface LocationCardProps {
  location: Location;
  onUpdate: (field: keyof Location, value: any) => void;
  onRemove: () => void;
  crew: CrewMember[];
  equipments: EquipmentEntry[];
}

function LocationCard({ location, onUpdate, onRemove, crew, equipments }: LocationCardProps) {
  const [sceneInput, setSceneInput] = useState("");

  // Add scene tag (only if it is 1 or 2 digits)
  const addScene = () => {
    if (/^\d{1,2}$/.test(sceneInput)) {
      onUpdate("scenes", [...location.scenes, sceneInput]);
      setSceneInput("");
    }
  };

  const handleSceneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addScene();
      e.preventDefault();
    }
  };

  const removeScene = (tag: string) => {
    onUpdate("scenes", location.scenes.filter((s) => s !== tag));
  };

  return (
    <section className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Location</h2>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          ✕
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Date, Times, Address, Scenes */}
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Dia</Label>
            <Input
              type="date"
              value={location.date}
              onChange={(e) => onUpdate("date", e.target.value)}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label className="text-gray-700 dark:text-gray-300">Hora de Começo</Label>
              <Input
                type="time"
                value={location.startTime}
                onChange={(e) => onUpdate("startTime", e.target.value)}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex-1">
              <Label className="text-gray-700 dark:text-gray-300">Hora de Bazar</Label>
              <Input
                type="time"
                value={location.wrapUpTime}
                onChange={(e) => onUpdate("wrapUpTime", e.target.value)}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Morada Completa</Label>
            <Input
              value={location.address}
              onChange={(e) => onUpdate("address", e.target.value)}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Versos por Filmar Nesta Morada</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {location.scenes.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => removeScene(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
            <Input
              value={sceneInput}
              onChange={(e) => setSceneInput(e.target.value)}
              onKeyDown={handleSceneKeyDown}
              placeholder="Enter scene (1-2 digits) then press Enter"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        {/* Right Column: Crew and Equipment */}
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Equipa Presente</Label>
            <div className="flex flex-wrap gap-2">
              {crew.map((member) => (
                <Button
                  key={member.id}
                  variant={location.crew.includes(member.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onUpdate(
                      "crew",
                      location.crew.includes(member.id)
                        ? location.crew.filter((id) => id !== member.id)
                        : [...location.crew, member.id]
                    )
                  }
                >
                  {member.name}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Equipamento Adquirido</Label>
            <div className="flex flex-wrap gap-2">
              {equipments.map((equip) => (
                <Button
                  key={equip.id}
                  variant={location.equipment.includes(equip.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (location.equipment.includes(equip.id)) {
                      onUpdate("equipment", location.equipment.filter((eid) => eid !== equip.id));
                    } else {
                      onUpdate("equipment", [...location.equipment, equip.id]);
                    }
                  }}
                >
                  {equip.name} ({equip.category})
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -- Component: TransportCard --
interface TransportCardProps {
  transport: Transport;
  onUpdate: (field: keyof Transport, value: any) => void;
  onRemove: () => void;
  crew: CrewMember[];
  equipments: EquipmentEntry[];
}

function TransportCard({ transport, onUpdate, onRemove, crew, equipments }: TransportCardProps) {
  return (
    <section className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Carro</h2>
        <Button variant="ghost" size="sm" onClick={onRemove}>
          ✕
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Vehicle, Driver, Route */}
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Tipo de Veículo</Label>
            <Select
              value={transport.vehicle}
              onValueChange={(v) => onUpdate("vehicle", v)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectItem value="Van">Bolt Van</SelectItem>
                <SelectItem value="Car">Carro</SelectItem>
             
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Driver</Label>
            <Select
              value={transport.driver}
              onValueChange={(v) => onUpdate("driver", v)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select driver" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {crew.map((member) => (
                  <SelectItem key={member.id} value={member.name}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Rota</Label>
            <Input
              value={transport.route}
              onChange={(e) => onUpdate("route", e.target.value)}
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
        {/* Right Column: Passengers and Equipment */}
        <div className="space-y-4">
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Passegeiros</Label>
            <div className="flex flex-wrap gap-2">
              {crew.map((member) => (
                <Button
                  key={member.id}
                  variant={transport.passengers.includes(member.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    onUpdate(
                      "passengers",
                      transport.passengers.includes(member.id)
                        ? transport.passengers.filter((id) => id !== member.id)
                        : [...transport.passengers, member.id]
                    )
                  }
                >
                  {member.name}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <Label className="text-gray-700 dark:text-gray-300">Equipamento por Transportar</Label>
            <div className="flex flex-wrap gap-2">
              {equipments.map((equip) => (
                <Button
                  key={equip.id}
                  variant={transport.equipment.includes(equip.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (transport.equipment.includes(equip.id)) {
                      onUpdate("equipment", transport.equipment.filter((eid) => eid !== equip.id));
                    } else {
                      onUpdate("equipment", [...transport.equipment, equip.id]);
                    }
                  }}
                >
                  {equip.name} ({equip.category})
                </Button>
              ))}
            </div>
          </div>
          <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-gray-100">Custo Total:</span>
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {(() => {
                  switch (transport.vehicle) {
             
                    case "Carro":
                      return "20€";
                    default:
                      return "0€";
                  }
                })()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// -- Main Component: ShootingDayPage --
export default function ShootingDayPage() {
  // Crew state
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [newCrewName, setNewCrewName] = useState("");
  const [newCrewRole, setNewCrewRole] = useState("");

  // Equipment state
  const [equipments, setEquipments] = useState<EquipmentEntry[]>([]);
  const [newEquipmentName, setNewEquipmentName] = useState("");
  const [newEquipmentCategory, setNewEquipmentCategory] = useState(equipmentCategoryOptions[0]);

  // Location state (scenes, equipment as array of equipment IDs)
  const [locations, setLocations] = useState<Location[]>([
    {
      id: Date.now(),
      date: "",
      startTime: "",
      wrapUpTime: "",
      address: "",
      scenes: [],
      equipment: [],
      crew: [],
      notes: "",
    },
  ]);

  // Meal state remains similar
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: Date.now(),
      vendor: "",
      people: [],
      dietary: "",
      notes: "",
    },
  ]);

  // Transport state updated
  const [transports, setTransports] = useState<Transport[]>([
    {
      id: Date.now(),
      vehicle: "",
      driver: "",
      passengers: [],
      equipment: [],
      route: "",
    },
  ]);

  // --- Crew Management ---
  const addCrewMember = () => {
    if (newCrewName && newCrewRole) {
      setCrew([...crew, { id: Date.now(), name: newCrewName, role: newCrewRole }]);
      setNewCrewName("");
      setNewCrewRole("");
    }
  };

  const handleCrewKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addCrewMember();
      e.preventDefault();
    }
  };

  // --- Equipment Management ---
  const addEquipment = () => {
    if (newEquipmentName.trim()) {
      setEquipments([
        ...equipments,
        { id: Date.now(), name: newEquipmentName.trim(), category: newEquipmentCategory },
      ]);
      setNewEquipmentName("");
    }
  };

  const removeEquipment = (id: number) => {
    // Remove from global equipment list
    setEquipments(equipments.filter((e) => e.id !== id));
    // Remove the equipment from any location or transport assignment
    setLocations((prev) =>
      prev.map((loc) => ({ ...loc, equipment: loc.equipment.filter((eid) => eid !== id) }))
    );
    setTransports((prev) =>
      prev.map((tr) => ({ ...tr, equipment: tr.equipment.filter((eid) => eid !== id) }))
    );
  };

  // --- Generic Update Handler ---
  const handleUpdate = (
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    id: number,
    field: string,
    value: any
  ) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // --- Meal Cost Calculation ---
  const calculateMealCost = (meal: Meal) =>
    meal.people.reduce((acc, curr) => acc + curr.cost, 0);

  // Overall total: sum of meal totals plus sum of transport costs.
  const overallTotal =
    meals.reduce((acc, meal) => acc + calculateMealCost(meal), 0) +
    transports.reduce((acc, transport) => {
      switch (transport.vehicle) {
        case "Van":
          return acc + 100;
        case "Car":
          return acc + 50;
        case "Truck":
          return acc + 150;
        default:
          return acc;
      }
    }, 0);

  // --- Adding New Entries ---
  const addLocation = () => {
    setLocations([
      ...locations,
      {
        id: Date.now(),
        date: "",
        startTime: "",
        wrapUpTime: "",
        address: "",
        scenes: [],
        equipment: [],
        crew: [],
        notes: "",
      },
    ]);
  };

  const addMeal = () => {
    setMeals([
      ...meals,
      {
        id: Date.now(),
        vendor: "",
        people: [],
        dietary: "",
        notes: "",
      },
    ]);
  };

  const addTransport = () => {
    setTransports([
      ...transports,
      {
        id: Date.now(),
        vehicle: "",
        driver: "",
        passengers: [],
        equipment: [],
        route: "",
      },
    ]);
  };

  // --- Removing Entries ---
  const removeLocation = (id: number) => {
    setLocations(locations.filter((loc) => loc.id !== id));
  };

  const removeMeal = (id: number) => {
    setMeals(meals.filter((meal) => meal.id !== id));
  };

  const removeTransport = (id: number) => {
    setTransports(transports.filter((transport) => transport.id !== id));
  };

  // --- PDF Generation ---
  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 10;

    // Função para adicionar nova página se necessário
    const checkPageBreak = (heightNeeded: number) => {
      if (yPos + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // PDF Styles
    const primaryColor = "#2d3748";
    const secondaryColor = "#718096";
    const accentColor = "#4299e1";

    // Header
    doc.setFontSize(24);
    doc.setTextColor(primaryColor);
    doc.text("Plano de Filmagem", margin, yPos);
    yPos += 20;

    // Crew Section
    checkPageBreak(30);
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("Equipa", margin, yPos);
    yPos += 10;
    doc.setLineWidth(0.5);
    doc.setDrawColor(secondaryColor);
    doc.line(margin, yPos, 210 - margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(secondaryColor);
    crew.forEach((member) => {
      checkPageBreak(lineHeight);
      doc.text(`${member.name} - ${member.role}`, margin, yPos);
      yPos += lineHeight;
    });

    // Locations Section
    checkPageBreak(30);
    yPos += 10;
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("Locais de Filmagem", margin, yPos);
    yPos += 10;
    doc.line(margin, yPos, 210 - margin, yPos);
    yPos += 15;

    locations.forEach((location) => {
      checkPageBreak(50);
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text(`Local: ${location.address}`, margin, yPos);
      yPos += lineHeight;

      const locationDetails = [
        `Dia: ${location.date}`,
        `Horário: ${location.startTime} - ${location.wrapUpTime}`,
        `Cenas por Filmar nesta Morada: ${location.scenes.join(", ")}`,
        `Equipa: ${location.crew.map(id => crew.find(m => m.id === id)?.name).join(", ")}`,
        `Equipamentos: ${location.equipment
          .map(eid => {
            const eq = equipments.find(e => e.id === eid);
            return eq ? `${eq.name} (${eq.category})` : "";
          })
          .join(", ")}`
      ];

      locationDetails.forEach(detail => {
        checkPageBreak(lineHeight);
        doc.setTextColor(secondaryColor);
        doc.text(detail, margin + 5, yPos);
        yPos += lineHeight;
      });

      yPos += 10;
    });

    // Meals Section
    checkPageBreak(30);
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("Refeições", margin, yPos);
    yPos += 10;
    doc.line(margin, yPos, 210 - margin, yPos);
    yPos += 15;

    meals.forEach((meal) => {
      checkPageBreak(50);
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text(`Refeição: ${meal.vendor}`, margin, yPos);
      yPos += lineHeight;

      doc.setTextColor(secondaryColor);
      meal.people.forEach(person => {
        checkPageBreak(lineHeight);
        const member = crew.find(m => m.id === person.personId);
        doc.text(`${member?.name}: €${person.cost.toFixed(2)}`, margin + 5, yPos);
        yPos += lineHeight;
      });

      checkPageBreak(lineHeight);
      doc.setTextColor(accentColor);
      doc.text(`Total: €${calculateMealCost(meal).toFixed(2)}`, 160, yPos);
      yPos += 15;
    });

    // Transport Section
    checkPageBreak(30);
    doc.setFontSize(18);
    doc.setTextColor(primaryColor);
    doc.text("Transportes", margin, yPos);
    yPos += 10;
    doc.line(margin, yPos, 210 - margin, yPos);
    yPos += 15;

    transports.forEach((transport) => {
      checkPageBreak(50);
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.text(`Transporte: ${transport.vehicle}`, margin, yPos);
      yPos += lineHeight;
      doc.setTextColor(secondaryColor);
      doc.text(`Condutor: ${transport.driver}`, margin + 5, yPos);
      yPos += lineHeight;
      doc.text(
        `Passageiros: ${transport.passengers.map(id => crew.find(m => m.id === id)?.name).join(", ")}`,
        margin + 5,
        yPos
      );
      yPos += lineHeight;
      doc.text(`Rota: ${transport.route}`, margin + 5, yPos);
      yPos += lineHeight;

      const transportCost = () => {
        switch (transport.vehicle) {
          case "Van": return 100;
          case "Car": return 50;
          case "Truck": return 150;
          default: return 0;
        }
      };

      checkPageBreak(lineHeight);
      doc.setTextColor(accentColor);
      doc.text(`Custo: €${transportCost().toFixed(2)}`, 160, yPos);
      yPos += 15;
    });

    // Overall Total
    checkPageBreak(30);
    doc.setFontSize(20);
    doc.setTextColor(primaryColor);
    doc.text(`Total Geral: €${overallTotal.toFixed(2)}`, margin, yPos);

    doc.save("plano-filmagem.pdf");
  };

  return (
    <ContentLayout title="Shooting Day Plan">
      <div className="pt-4 space-y-8">
        {/* Crew Management Section */}
        <section className="bg-muted dark:bg-muted-dark p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Adicionar Crew</h2>
          <div className="flex flex-col gap-2 mb-4 max-w-xs">
            <Input
              value={newCrewName}
              onChange={(e) => setNewCrewName(e.target.value)}
              onKeyDown={handleCrewKeyDown}
              placeholder="Nome"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Input
              value={newCrewRole}
              onChange={(e) => setNewCrewRole(e.target.value)}
              onKeyDown={handleCrewKeyDown}
              placeholder="Função"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Button onClick={addCrewMember}>Adicionar Membro</Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {crew.map((member) => (
              <div
                key={member.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition"
              >
                <p className="font-bold">{member.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Equipment Inventory Section */}
        <section className="bg-muted dark:bg-muted-dark p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Equipamentos Adquiridos</h2>
          <div className="flex flex-col gap-2 mb-4 max-w-xs">
            <Input
              value={newEquipmentName}
              onChange={(e) => setNewEquipmentName(e.target.value)}
              placeholder="Nome do Equipamento"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Select
              value={newEquipmentCategory}
              onValueChange={(v) => setNewEquipmentCategory(v)}
            >
              <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {equipmentCategoryOptions.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addEquipment}>Adicionar Equipamento</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {equipments.map((equip) => (
              <Badge key={equip.id} variant="secondary" className="cursor-pointer" onClick={() => removeEquipment(equip.id)}>
                {equip.name} ({equip.category})
              </Badge>
            ))}
          </div>
        </section>

        {/* Locations Section */}
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            crew={crew}
            equipments={equipments}
            onUpdate={(field, value) => handleUpdate(setLocations, location.id, field, value)}
            onRemove={() => removeLocation(location.id)}
          />
        ))}
        <div className="flex justify-end">
          <Button variant="outline" onClick={addLocation}>
            + Add Another Location
          </Button>
        </div>

        {/* Meals Section */}
        {meals.map((meal, idx) => (
          <section key={meal.id} className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Refeição {idx + 1}</h2>
              <Button variant="ghost" size="sm" onClick={() => removeMeal(meal.id)}>
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Vendor and Dietary */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Providenciador</Label>
                  <Select
                    value={meal.vendor}
                    onValueChange={(v) => {
                      handleUpdate(setMeals, meal.id, "vendor", v);
                      const selected = mealVendors.find((vendor) => vendor.name === v);
                      if (selected) {
                        // Update each assigned person's cost to match the vendor's cost
                        handleUpdate(
                          setMeals,
                          meal.id,
                          "people",
                          meal.people.map((p) => ({ ...p, cost: selected.cost }))
                        );
                      }
                    }}
                  >
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Selecionar providenciador" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      {mealVendors.map((vendor) => (
                        <SelectItem key={vendor.name} value={vendor.name}>
                          {vendor.name} ({vendor.cost}€/person)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Dietas</Label>
                  <Input
                    value={meal.dietary}
                    onChange={(e) => handleUpdate(setMeals, meal.id, "dietary", e.target.value)}
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              {/* Right Column: Crew assignment & Cost per person */}
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Quem vai comer esta refeição?</Label>
                  <div className="flex flex-wrap gap-2">
                    {crew.map((member) => {
                      const isAssigned = meal.people.some((p) => p.personId === member.id);
                      return (
                        <Button
                          key={member.id}
                          variant={isAssigned ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (!isAssigned) {
                              // When adding, use vendor cost if available
                              const vendorData = mealVendors.find(v => v.name === meal.vendor);
                              handleUpdate(setMeals, meal.id, "people", [
                                ...meal.people,
                                { personId: member.id, cost: vendorData ? vendorData.cost : 0 },
                              ]);
                            } else {
                              handleUpdate(
                                setMeals,
                                meal.id,
                                "people",
                                meal.people.filter((p) => p.personId !== member.id)
                              );
                            }
                          }}
                        >
                          {member.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>
                {meal.people.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">Enter Cost for Each Assigned Person</Label>
                    {meal.people.map((p) => {
                      const crewMember = crew.find((m) => m.id === p.personId);
                      return (
                        <div key={p.personId} className="flex items-center gap-2">
                          <span className="w-24">{crewMember?.name}</span>
                          <Input
                            type="number"
                            placeholder="Cost in €"
                            value={p.cost}
                            onChange={(e) =>
                              handleUpdate(
                                setMeals,
                                meal.id,
                                "people",
                                meal.people.map((mp) =>
                                  mp.personId === p.personId
                                    ? { ...mp, cost: Number(e.target.value) }
                                    : mp
                                )
                              )
                            }
                            className="w-24 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Total Cost:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {calculateMealCost(meal).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}
        <div className="flex justify-end">
          <Button variant="outline" onClick={addMeal}>
            + Add Another Meal
          </Button>
        </div>

        {/* Transports Section */}
        {transports.map((transport) => (
          <TransportCard
            key={transport.id}
            transport={transport}
            crew={crew}
            equipments={equipments}
            onUpdate={(field, value) => handleUpdate(setTransports, transport.id, field, value)}
            onRemove={() => removeTransport(transport.id)}
          />
        ))}
        <div className="flex justify-end">
          <Button variant="outline" onClick={addTransport}>
            + Add Another Transport
          </Button>
        </div>

        {/* Summary Card */}
        <section className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Overall Total</h2>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{overallTotal.toFixed(2)}€</span>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button size="lg">Salvar Plano</Button>
          <Button size="lg" variant="secondary" onClick={generatePDF}>
            Exportar Itinerário
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
