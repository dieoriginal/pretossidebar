"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { Button } from "@/components/ui/button";

export default function ShootingDayPage() {
  const [locations, setLocations] = useState([{ 
    id: Date.now(), 
    date: "", // Adicionando data
    time: "", 
    address: "", 
    scenes: "",
    equipment: ""
  }]);

  const [meals, setMeals] = useState([{ 
    id: Date.now(), 
    date: "", // Adicionando data
    time: "", 
    type: "", 
    menu: "",
    dietaryNotes: ""
  }]);

  const [transports, setTransports] = useState([{ 
    id: Date.now(), 
    date: "", // Adicionando data
    vehicle: "", 
    departure: "", 
    passengers: "",
    route: ""
  }]);

  // Location handlers
  const addLocation = () => setLocations([...locations, { 
    id: Date.now(), 
    date: "", // Adicionando data
    time: "", 
    address: "", 
    scenes: "",
    equipment: ""
  }]);

  const removeLocation = () => {
    if (locations.length > 1) setLocations(locations.slice(0, -1));
  };

  // Meal handlers
  const addMeal = () => setMeals([...meals, { 
    id: Date.now(), 
    date: "", // Adicionando data
    time: "", 
    type: "", 
    menu: "",
    dietaryNotes: ""
  }]);

  const removeMeal = () => {
    if (meals.length > 1) setMeals(meals.slice(0, -1));
  };

  // Transport handlers
  const addTransport = () => setTransports([...transports, { 
    id: Date.now(), 
    date: "", // Adicionando data
    vehicle: "", 
    departure: "", 
    passengers: "",
    route: ""
  }]);

  const removeTransport = () => {
    if (transports.length > 1) setTransports(transports.slice(0, -1));
  };

  // Generic update handlers
  const handleUpdate = (setter: Function, id: number, field: string, value: string) => {
    setter((prev: any[]) => 
      prev.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <ContentLayout title="Planejamento de Dia de Filmagem">
    

      <div className="pt-4 space-y-8">
        {/* Locations Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Locais de Filmagem</h2>
          <div className="space-y-4">
            {locations.map((location, idx) => (
              <div key={location.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Local {idx + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Data</label>
                    <input
                      type="date"
                      value={location.date}
                      onChange={(e) => handleUpdate(setLocations, location.id, 'date', e.target.value)}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Horário</label>
                    <input
                      type="time"
                      value={location.time}
                      onChange={(e) => handleUpdate(setLocations, location.id, 'time', e.target.value)}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Endereço</label>
                    <input
                      type="text"
                      value={location.address}
                      onChange={(e) => handleUpdate(setLocations, location.id, 'address', e.target.value)}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Endereço completo"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button onClick={addLocation} className="bg-blue-600 hover:bg-blue-700">
                + Adicionar Local
              </Button>
              <Button 
                onClick={removeLocation} 
                className="bg-red-600 hover:bg-red-700"
                disabled={locations.length <= 1}
              >
                - Remover Local
              </Button>
            </div>
          </div>
        </section>

        {/* Meals Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Refeições</h2>
          <div className="space-y-4">
            {meals.map((meal, idx) => (
              <div key={meal.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Refeição {idx + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo</label>
                    <select
                      value={meal.type}
                      onChange={(e) => handleUpdate(setMeals, meal.id, 'type', e.target.value)}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Café da Manhã">BBGrill</option>
                      <option value="Almoço">Glovo</option>
                      <option value="Jantar">Bolt</option>
                      <option value="Lanche">Fast Food</option>
                      <option value="Lanche">Tupperware</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button onClick={addMeal} className="bg-blue-600 hover:bg-blue-700">
                + Adicionar Refeição
              </Button>
              <Button 
                onClick={removeMeal} 
                className="bg-red-600 hover:bg-red-700"
                disabled={meals.length <= 1}
              >
                - Remover Refeição
              </Button>
            </div>
          </div>
        </section>

        {/* Transportation Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Transporte</h2>
          <div className="space-y-4">
            {transports.map((transport, idx) => (
              <div key={transport.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Transporte {idx + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo de Veículo</label>
                    <select
                      value={transport.vehicle}
                      onChange={(e) => handleUpdate(setTransports, transport.id, 'vehicle', e.target.value)}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Selecione...</option>
                      <option value="Van"></option>
                      <option value="Carro Executivo">Carro Executivo</option>
                      <option value="Ônibus">Ônibus</option>
                      <option value="Caminhão de Equipamentos">Caminhão de Equipamentos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Número de Passageiros</label>
                    <input
                      type="number"
                      value={transport.passengers}
                      onChange={(e) => handleUpdate(setTransports, transport.id, 'passengers', e.target.value)}
                      className="w-full p-2 border rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Quantidade de passageiros"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-4 mt-4">
              <Button onClick={addTransport} className="bg-blue-600 hover:bg-blue-700">
                + Adicionar Transporte
              </Button>
              <Button 
                onClick={removeTransport} 
                className="bg-red-600 hover:bg-red-700"
                disabled={transports.length <= 1}
              >
                - Remover Transporte
              </Button>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg">
            Salvar Planejamento
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg"
            onClick={() => window.location.href = "/"}
          >
            Ir para o Lançamento
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}