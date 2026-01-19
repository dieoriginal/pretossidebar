"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";

import { Button } from "@/components/ui/button";
import jsPDF from 'jspdf';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { pt } from "date-fns/locale";

interface ProductionTeamMember {
  id: number;
  productionType: "Música" | "Vídeo";
  role: string;
  nome: string;
  payment: number;
  videoRole: string;
  agreement: boolean;
  cidade: string;
  dataContrato: string;
  prazoPagamento: string;
  dataInicio: string;
  dataTermino: string;
  nomeEmpresa: string;
  nifEmpresa: string;
  moradaEmpresa: string;
  nomePrestador: string;
  nifPrestador: string;
  moradaPrestador: string;
  ibanPrestador: string;
  bancoPrestador: string;
}

export default function VideoFormPage() {
  const [teamMembers, setTeamMembers] = useState<ProductionTeamMember[]>([
    {
      id: Date.now(),
      productionType: "Música",
      role: "",
      nome: "",
      payment: 0,
      videoRole: "",
      agreement: false,
      cidade: "",
      dataContrato: "",
      prazoPagamento: "",
      dataInicio: "",
      dataTermino: "",
      nomeEmpresa: "",
      nifEmpresa: "",
      moradaEmpresa: "",
      nomePrestador: "",
      nifPrestador: "",
      moradaPrestador: "",
      ibanPrestador: "",
      bancoPrestador: ""
    },
  ]);

  const addNewMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        productionType: "Música",
        role: "",
        nome: "",
        payment: 0,
        videoRole: "",
        agreement: false,
        cidade: "",
        dataContrato: "",
        prazoPagamento: "",
        dataInicio: "",
        dataTermino: "",
        nomeEmpresa: "",
        nifEmpresa: "",
        moradaEmpresa: "",
        nomePrestador: "",
        nifPrestador: "",
        moradaPrestador: "",
        ibanPrestador: "",
        bancoPrestador: ""
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

  const totalBudget = useMemo(() => {
    return teamMembers.reduce((acc, member) => acc + member.payment, 0);
  }, [teamMembers]);

  const generateContractPDF = (member: ProductionTeamMember) => {
    const doc = new jsPDF();
    
    doc.setFontSize(12);
    let yPosition = 10;
    
    doc.setFontSize(16);
    doc.text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', 10, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text('Cláusula 1.ª - Partes Contratantes', 10, yPosition);
    yPosition += 7;
    doc.text(`Contratante: ${member.nomeEmpresa}, NIF: ${member.nifEmpresa}, Morada: ${member.moradaEmpresa}`, 10, yPosition);
    yPosition += 7;
    doc.text(`Prestador de Serviços: ${member.nome}, NIF: ${member.nifPrestador}, Morada: ${member.moradaPrestador}`, 10, yPosition);
    yPosition += 10;
    
    doc.text('Cláusula 2.ª - Objeto', 10, yPosition);
    yPosition += 7;
    doc.text(`O prestador ${member.nome} se compromete a realizar serviços de ${member.role} para a produção de ${member.productionType.toLowerCase()}.`, 10, yPosition);
    if (member.productionType === "Vídeo") {
      yPosition += 7;
      doc.text(`Função específica no vídeo: ${member.videoRole}`, 10, yPosition);
    }
    yPosition += 10;
    
    doc.text('Cláusula 3.ª - Duração', 10, yPosition);
    yPosition += 7;
    doc.text(`Início: ${member.dataInicio}`, 10, yPosition);
    yPosition += 7;
    doc.text(`Término: ${member.dataTermino}`, 10, yPosition);
    yPosition += 10;
    
    doc.text('Cláusula 4.ª - Obrigações do Prestador', 10, yPosition);
    yPosition += 7;
    doc.text('1. Executar o serviço com diligência e profissionalismo.', 10, yPosition);
    yPosition += 7;
    doc.text('2. Manter sigilo sobre informações confidenciais.', 10, yPosition);
    yPosition += 10;
    
    doc.text('Cláusula 5.ª - Obrigações do Contratante', 10, yPosition);
    yPosition += 7;
    doc.text('1. Fornecer os meios necessários para execução dos serviços.', 10, yPosition);
    yPosition += 7;
    doc.text('2. Efetuar o pagamento conforme cláusula 6.', 10, yPosition);
    yPosition += 10;
    
    doc.text('Cláusula 6.ª - Remuneração', 10, yPosition);
    yPosition += 7;
    doc.text(`Valor total: ${member.payment}€`, 10, yPosition);
    yPosition += 7;
    doc.text('Forma de pagamento: Transferência bancária', 10, yPosition);
    yPosition += 7;
    doc.text(`Prazo de pagamento: ${member.prazoPagamento}`, 10, yPosition);
    yPosition += 10;
    
    doc.text(`Feito em ${member.cidade}, ${member.dataContrato}.`, 10, yPosition);
    yPosition += 10;
    doc.text('___________________________', 10, yPosition);
    doc.text('Contratante', 10, yPosition + 5);
    doc.text('___________________________', 100, yPosition);
    doc.text('Prestador de Serviços', 100, yPosition + 5);
    
    const dataContratoFormatada = format(member.dataContrato, 'yyyyMMdd', { locale: pt });
    const fileName = `${member.nome.replace(/\s+/g, '_')}_contrato_prestacao_servico_${dataContratoFormatada}.pdf`;
    doc.save(fileName);
  };

  return (
    <ContentLayout title="Equipe de Produção">
      <div className="pt-4 space-y-8">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm">
            <div className="flex flex-col gap-4">
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

              <div className="flex flex-col">
                <label htmlFor={`nome-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Nome:
                </label>
                <input
                  type="text"
                  id={`nome-${member.id}`}
                  value={member.nome}
                  onChange={(e) => updateMember(member.id, "nome", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Nome completo"
                />
              </div>

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

              <div className="flex flex-col">
                <label htmlFor={`nomeEmpresa-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Nome da Empresa:
                </label>
                <input
                  type="text"
                  id={`nomeEmpresa-${member.id}`}
                  value={member.nomeEmpresa}
                  onChange={(e) => updateMember(member.id, "nomeEmpresa", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Nome da empresa contratante"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor={`nifEmpresa-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  NIF da Empresa:
                </label>
                <input
                  type="text"
                  id={`nifEmpresa-${member.id}`}
                  value={member.nifEmpresa}
                  onChange={(e) => updateMember(member.id, "nifEmpresa", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="NIF da empresa"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor={`moradaEmpresa-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Morada da Empresa:
                </label>
                <input
                  type="text"
                  id={`moradaEmpresa-${member.id}`}
                  value={member.moradaEmpresa}
                  onChange={(e) => updateMember(member.id, "moradaEmpresa", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Morada da empresa"
                />
              </div>


              <div className="flex flex-col">
                <label htmlFor={`nifPrestador-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  NIF do Prestador:
                </label>
                <input
                  type="text"
                  id={`nifPrestador-${member.id}`}
                  value={member.nifPrestador}
                  onChange={(e) => updateMember(member.id, "nifPrestador", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="NIF do prestador"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor={`moradaPrestador-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Morada do Prestador:
                </label>
                <input
                  type="text"
                  id={`moradaPrestador-${member.id}`}
                  value={member.moradaPrestador}
                  onChange={(e) => updateMember(member.id, "moradaPrestador", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Morada do prestador"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor={`ibanPrestador-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  IBAN do Prestador:
                </label>
                <input
                  type="text"
                  id={`ibanPrestador-${member.id}`}
                  value={member.ibanPrestador}
                  onChange={(e) => updateMember(member.id, "ibanPrestador", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="IBAN do prestador"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor={`bancoPrestador-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Banco do Prestador:
                </label>
                <input
                  type="text"
                  id={`bancoPrestador-${member.id}`}
                  value={member.bancoPrestador}
                  onChange={(e) => updateMember(member.id, "bancoPrestador", e.target.value)}
                  className="border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                  placeholder="Banco do prestador"
                />
              </div>

              <div className="flex items-center">
                <label htmlFor={`agreement-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                  Assinatura SPAUTORES Obrigatória
                </label>
                <input
                  type="checkbox"
                  id={`agreement-${member.id}`}
                  checked={member.agreement}
                  onChange={(e) => updateMember(member.id, "agreement", e.target.checked)}
                  className="ml-2"
                />
              </div>

              {['dataContrato', 'dataInicio', 'dataTermino'].map((field) => (
                <div key={field} className="flex flex-col">
                  <label htmlFor={`${field}-${member.id}`} className="mb-2 text-gray-700 dark:text-gray-300">
                    {field === 'dataContrato' ? 'Data do Contrato' : 
                     field === 'dataInicio' ? 'Data de Início' : 'Data de Término'}:
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {member[field as keyof ProductionTeamMember] ? 
                         format(member[field as keyof ProductionTeamMember] as Date, 'PPP', { locale: pt }) : 
                         <span>Escolha uma data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={member[field as keyof ProductionTeamMember] as Date}
                        onSelect={(date) => updateMember(member.id, field as keyof ProductionTeamMember, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}

              {/* Remove button */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="destructive"
                  onClick={() => removeMember(member.id)}
                >
                  Remover Membro
                </Button>
                <Button
                  onClick={() => generateContractPDF(member)}
                >
                  Gerar Contrato
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
