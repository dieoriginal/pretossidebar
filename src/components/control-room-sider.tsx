"use client";

import { useEffect, useState } from "react";

export default function ControlRoomSidebar() {
  const [formData, setFormData] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("controlRoomData");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem("controlRoomData", JSON.stringify(formData));
  }, [formData]);

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">Pressupostos</h2>
      
      {/* Multi-step form implementation */}
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-medium">Tema Central</label>
          <input
            value={formData.tema || ""}
            onChange={(e) => setFormData(d => ({...d, tema: e.target.value}))}
            className="w-full p-2 border rounded"
            placeholder="Ex: Hybris, Destino vs Livre-Arbítrio"
          />
        </div>

        <div>
          <label className="block mb-2 font-medium">Métrica</label>
          <select 
            value={formData.metrica || "alexandrino"}
            onChange={(e) => setFormData(d => ({...d, metrica: e.target.value}))}
            className="w-full p-2 border rounded"
          >
            <option value="dactílico">Dactílico</option>
            <option value="iâmbico">Iâmbico</option>
            <option value="trocaico">Trocaico</option>
            <option value="alexandrino">Alexandrino (12 sílabas)</option>
          </select>
        </div>

        <div>
          <label className="block mb-2 font-medium">Esquema de Rimas</label>
          <input
            value={formData.rima || "ABABCC"}
            onChange={(e) => setFormData(d => ({...d, rima: e.target.value}))}
            className="w-full p-2 border rounded"
            placeholder="Ex: ABABCC"
          />
        </div>

        {/* Add more form fields as needed */}
      </div>
    </div>
  );
}