"use client";

import React, { useState } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Sample Data
const initialCrew = [
  { id: 1, name: "Director", role: "Director" },
  { id: 2, name: "DoP", role: "Cinematographer" },
  { id: 3, name: "Gaffer", role: "Lighting" },
];

const equipmentOptions = [
  { id: 1, name: "Camera A", type: "camera", cost: 100 },
  { id: 2, name: "Tripod Pro", type: "support", cost: 50 },
  { id: 3, name: "LED Panel", type: "lighting", cost: 75 },
];

const mealVendors = [
  { name: "BBGrill", cost: 4.8 },
  { name: "Glovo", cost: 12 },
  { name: "Bolt Food", cost: 10 },
  { name: "Tupperware", cost: 0 },
];

export default function ShootingDayPage() {
  const [crew, setCrew] = useState(initialCrew);
  const [newMember, setNewMember] = useState("");

  // Location State
  const [locations, setLocations] = useState([{ 
    id: Date.now(),
    date: "",
    time: "",
    address: "",
    scenes: "",
    equipment: [] as number[],
    crew: [] as number[],
    notes: ""
  }]);

  // Meal State
  const [meals, setMeals] = useState([{
    id: Date.now(),
    vendor: "",
    people: [] as number[],
    dietary: "",
    costPerPerson: 0,
    notes: ""
  }]);

  // Transport State
  const [transports, setTransports] = useState([{
    id: Date.now(),
    vehicle: "",
    driver: "",
    passengers: [] as number[],
    equipment: [] as number[],
    gasolineCost: 0,
    route: ""
  }]);

  // Add new crew member
  const addCrewMember = () => {
    if (newMember) {
      setCrew([...crew, { id: Date.now(), name: newMember, role: "Crew" }]);
      setNewMember("");
    }
  };

  // Generic update handlers
  const handleUpdate = (setter: Function, id: number, field: string, value: any) => {
    setter((prev: any[]) => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Toggle array items
  const toggleArrayItem = (arr: any[], item: any) => 
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  // Calculate totals
  const calculateMealCost = (meal: typeof meals[0]) => meal.people.length * meal.costPerPerson;
  const calculateTransportCost = (transport: typeof transports[0]) => 
    transport.gasolineCost + (transport.vehicle === "Van" ? 100 : 0);

  return (
    <ContentLayout title="Shooting Day Plan">
      <div className="pt-4 space-y-8">
        {/* Crew Management */}
        <section className="bg-muted dark:bg-muted-dark p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Crew & Talent</h2>
          <div className="flex gap-4 mb-4">
            <Input 
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="Add new crew member"
              className="max-w-xs bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Button onClick={addCrewMember}>Add Member</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {crew.map(member => (
              <Badge key={member.id} variant="secondary" className="px-4 py-2">
                {member.name} ({member.role})
              </Badge>
            ))}
          </div>
        </section>

        {/* Locations Section */}
        {locations.map((location, idx) => (
          <section key={location.id} className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Location {idx + 1}</h2>
              <Button variant="ghost" size="sm">✕</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Date & Time</Label>
                  <div className="flex gap-2">
                    <Input type="date" value={location.date} onChange={(e) => handleUpdate(setLocations, location.id, 'date', e.target.value)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                    <Input type="time" value={location.time} onChange={(e) => handleUpdate(setLocations, location.id, 'time', e.target.value)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Address</Label>
                  <Input value={location.address} onChange={(e) => handleUpdate(setLocations, location.id, 'address', e.target.value)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Scenes to Shoot</Label>
                  <Input value={location.scenes} onChange={(e) => handleUpdate(setLocations, location.id, 'scenes', e.target.value)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Crew Present</Label>
                  <div className="flex flex-wrap gap-2">
                    {crew.map(member => (
                      <Button
                        key={member.id}
                        variant={location.crew.includes(member.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdate(setLocations, location.id, 'crew', toggleArrayItem(location.crew, member.id))}
                      >
                        {member.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Equipment</Label>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map(equip => (
                      <Button
                        key={equip.id}
                        variant={location.equipment.includes(equip.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdate(setLocations, location.id, 'equipment', toggleArrayItem(location.equipment, equip.id))}
                      >
                        {equip.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Meals Section */}
        {meals.map((meal, idx) => (
          <section key={meal.id} className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Meal {idx + 1}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Vendor</Label>
                  <Select value={meal.vendor} onValueChange={(v) => handleUpdate(setMeals, meal.id, 'vendor', v)}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select vendor" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      {mealVendors.map(vendor => (
                        <SelectItem key={vendor.name} value={vendor.name}>
                          {vendor.name} ({vendor.cost}€/person)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Dietary Notes</Label>
                  <Input value={meal.dietary} onChange={(e) => handleUpdate(setMeals, meal.id, 'dietary', e.target.value)} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">People</Label>
                  <div className="flex flex-wrap gap-2">
                    {crew.map(member => (
                      <Button
                        key={member.id}
                        variant={meal.people.includes(member.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdate(setMeals, meal.id, 'people', toggleArrayItem(meal.people, member.id))}
                      >
                        {member.name}
                      </Button>
                    ))}
                  </div>
                </div>

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

        {/* Transport Section */}
        {transports.map((transport, idx) => (
          <section key={transport.id} className="bg-card dark:bg-card-dark p-6 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Transport {idx + 1}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Vehicle Type</Label>
                  <Select value={transport.vehicle} onValueChange={(v) => handleUpdate(setTransports, transport.id, 'vehicle', v)}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectItem value="Van">Van (100€)</SelectItem>
                      <SelectItem value="Car">Car (50€)</SelectItem>
                      <SelectItem value="Truck">Equipment Truck (150€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Driver</Label>
                  <Select value={transport.driver} onValueChange={(v) => handleUpdate(setTransports, transport.id, 'driver', v)}>
                    <SelectTrigger className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                      {crew.map(member => (
                        <SelectItem key={member.id} value={member.name}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Gasoline Cost</Label>
                  <Input type="number" value={transport.gasolineCost} 
                    onChange={(e) => handleUpdate(setTransports, transport.id, 'gasolineCost', Number(e.target.value))} 
                    className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Passengers</Label>
                  <div className="flex flex-wrap gap-2">
                    {crew.map(member => (
                      <Button
                        key={member.id}
                        variant={transport.passengers.includes(member.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdate(setTransports, transport.id, 'passengers', toggleArrayItem(transport.passengers, member.id))}
                      >
                        {member.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Equipment Transported</Label>
                  <div className="flex flex-wrap gap-2">
                    {equipmentOptions.map(equip => (
                      <Button
                        key={equip.id}
                        variant={transport.equipment.includes(equip.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdate(setTransports, transport.id, 'equipment', toggleArrayItem(transport.equipment, equip.id))}
                      >
                        {equip.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="bg-muted dark:bg-muted-dark p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Total Cost:</span>
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      {calculateTransportCost(transport).toFixed(2)}€
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end">
          <Button size="lg">Save Plan</Button>
          <Button size="lg" variant="secondary">Export PDF</Button>
        </div>
      </div>
    </ContentLayout>
  );
}