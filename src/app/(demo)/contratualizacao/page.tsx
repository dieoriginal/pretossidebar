// pages/videoform.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { Button } from "@/components/ui/button";

interface ProductionTeamMember {
  id: number;
  productionType: "Música" | "Vídeo";
  role: string;
  payment: number;
  videoRole: string; // only applicable for video production
}

export default function VideoFormPage() {
  const [teamMembers, setTeamMembers] = useState<ProductionTeamMember[]>([
    {
      id: Date.now(),
      productionType: "Música",
      role: "",
      payment: 0,
      videoRole: "",
    },
  ]);

  const addNewMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        productionType: "Música",
        role: "",
        payment: 0,
        videoRole: "",
      },
    ]);
  };

  const removeMember = (id: number) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
  };

  const updateMember = (
    id: number,
    key: keyof ProductionTeamMember,
    value: any
  ) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === id ? { ...member, [key]: value } : member
      )
    );
  };

  // Calculate total payroll budget dynamically from all team members' payments.
  const totalBudget = useMemo(() => {
    return teamMembers.reduce((acc, member) => acc + member.payment, 0);
  }, [teamMembers]);

  return (
    <ContentLayout title="Equipe de Produção">
     
      <div className="pt-4 space-y-8">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Tipo de Produção */}
              <div className="flex flex-col">
                <label htmlFor={`productionType-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Tipo de Produção:
                </label>
                <select
                  id={`productionType-${member.id}`}
                  value={member.productionType}
                  onChange={(e) =>
                    updateMember(
                      member.id,
                      "productionType",
                      e.target.value as "Música" | "Vídeo"
                    )
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                >
                  <option value="Música">Música</option>
                  <option value="Vídeo">Vídeo</option>
                </select>
              </div>

              {/* Função */}
              <div className="flex flex-col">
                <label htmlFor={`role-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Função:
                </label>
                <input
                  type="text"
                  id={`role-${member.id}`}
                  value={member.role}
                  onChange={(e) => updateMember(member.id, "role", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Ex: Produtor, Diretor, etc."
                />
              </div>

              {/* Valor a Pagar */}
              <div className="flex flex-col">
                <label htmlFor={`payment-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Valor a Pagar (EUR):
                </label>
                <input
                  type="number"
                  id={`payment-${member.id}`}
                  value={member.payment}
                  onChange={(e) =>
                    updateMember(member.id, "payment", parseFloat(e.target.value))
                  }
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Ex: 100"
                />
              </div>

              {/* Função no Vídeo (only for video production) */}
              {member.productionType === "Vídeo" && (
                <div className="flex flex-col">
                  <label htmlFor={`videoRole-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                    Função no Vídeo:
                  </label>
                  <input
                    type="text"
                    id={`videoRole-${member.id}`}
                    value={member.videoRole}
                    onChange={(e) =>
                      updateMember(member.id, "videoRole", e.target.value)
                    }
                    className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                    placeholder="Ex: Diretor de Fotografia, Editor, etc."
                  />
                </div>
              )}

              {/* Modelo de Contrato (locked) */}
              <div className="flex flex-col">
                <label htmlFor={`contract-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Modelo de Contrato:
                </label>
                <input
                  type="text"
                  id={`contract-${member.id}`}
                  value="Contrato de Prestação de Serviço"
                  disabled
                  className="border p-2 rounded bg-gray-200 dark:bg-gray-600 dark:text-gray-400"
                />
              </div>

              {/* Remove button */}
              <div className="flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => removeMember(member.id)}
                >
                  Remover Membro
                </Button>
              </div>
            </div>
          </div>
        ))}

        {/* Total Budget Summary */}
        <div className="border rounded p-4 shadow-md flex items-center justify-between bg-white dark:bg-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Orçamento Total</h2>
            <p className="text-xl text-gray-700 dark:text-gray-300">{totalBudget.toFixed(2)} €</p>
          </div>
        </div>

        {/* Buttons for adding a new member and proceeding */}
        <div className="flex justify-center gap-4 mt-4">
          <Button onClick={addNewMember} className="bg-blue-500 text-white">
            Adicionar Membro
          </Button>
          <Button
            onClick={() => (window.location.href = "/direitosautorais")}
            className="bg-green-500 text-white"
          >
            Proseguir para Direitos Autorais
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
