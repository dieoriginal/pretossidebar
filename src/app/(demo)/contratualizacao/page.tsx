// pages/videoform.tsx
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/instrumental">Instrumental</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/contextualizacao">Contextualização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/versificacao">Versificação</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/cinematografia">Cinematografia</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/orcamento">Orçamento</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/filmagem">Filmagem</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/contratualizacao">Contratualização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/direitosautorais">Direitos Autorais</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/monetizacao">Monetização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/lancamento">Lançamento</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="pt-4 space-y-8">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-gray-100 p-4 rounded-md shadow-sm">
            <div className="flex flex-col gap-4">
              {/* Tipo de Produção */}
              <div className="flex flex-col">
                <label htmlFor={`productionType-${member.id}`} className="mb-2">
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
                  className="border p-2 rounded"
                >
                  <option value="Música">Música</option>
                  <option value="Vídeo">Vídeo</option>
                </select>
              </div>

              {/* Função */}
              <div className="flex flex-col">
                <label htmlFor={`role-${member.id}`} className="mb-2">
                  Função:
                </label>
                <input
                  type="text"
                  id={`role-${member.id}`}
                  value={member.role}
                  onChange={(e) => updateMember(member.id, "role", e.target.value)}
                  className="border p-2 rounded"
                  placeholder="Ex: Produtor, Diretor, etc."
                />
              </div>

              {/* Valor a Pagar */}
              <div className="flex flex-col">
                <label htmlFor={`payment-${member.id}`} className="mb-2">
                  Valor a Pagar (EUR):
                </label>
                <input
                  type="number"
                  id={`payment-${member.id}`}
                  value={member.payment}
                  onChange={(e) =>
                    updateMember(member.id, "payment", parseFloat(e.target.value))
                  }
                  className="border p-2 rounded"
                  placeholder="Ex: 100"
                />
              </div>

              {/* Função no Vídeo (only for video production) */}
              {member.productionType === "Vídeo" && (
                <div className="flex flex-col">
                  <label htmlFor={`videoRole-${member.id}`} className="mb-2">
                    Função no Vídeo:
                  </label>
                  <input
                    type="text"
                    id={`videoRole-${member.id}`}
                    value={member.videoRole}
                    onChange={(e) =>
                      updateMember(member.id, "videoRole", e.target.value)
                    }
                    className="border p-2 rounded"
                    placeholder="Ex: Diretor de Fotografia, Editor, etc."
                  />
                </div>
              )}

              {/* Modelo de Contrato (locked) */}
              <div className="flex flex-col">
                <label htmlFor={`contract-${member.id}`} className="mb-2">
                  Modelo de Contrato:
                </label>
                <input
                  type="text"
                  id={`contract-${member.id}`}
                  value="Contrato de Prestação de Serviço"
                  disabled
                  className="border p-2 rounded bg-gray-200"
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
        <div className="border rounded p-4 shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Orçamento Total</h2>
            <p className="text-xl">{totalBudget.toFixed(2)} €</p>
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
