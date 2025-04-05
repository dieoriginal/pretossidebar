"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Rocket, AlertCircle, CheckCircle } from "lucide-react";

const registrationGroups = [
  {
    title: "Organizações de Direitos de Performance",
    entities: ["SAUTORES", "SONGTRUST"],
    description: "Essencial para a coleta de royalties de performance pública",
  },
  {
    title: "Administradores de Publicação",
    entities: ["Songtrust", "Harryfox Agency", "FundaçÃo GDA"],
    description: "Gestão de direitos mecânicos e licenciamento de sincronização",
  },
  {
    title: "Distribuição Digital",
    entities: ["DistroKid", "Soundcloud For Artists", "Audiogest ISRC"],
    description: "Distribuição em plataformas e direitos conexos",
  },
  {
    title: "Letras & Metadados",
    entities: ["Genius", "LyricFind", "MusixMatch"],
    description: "Licenciamento de letras e gestão de metadados",
  },
];

export default function MusicRegistrationChecklistPage() {
  const [checkedEntities, setCheckedEntities] = useState<Record<string, boolean>>(
    registrationGroups.flatMap((g) => g.entities).reduce((acc, entity) => ({ ...acc, [entity]: false }), {})
  );

  const totalEntities = registrationGroups.flatMap((g) => g.entities).length;
  const completedEntities = Object.values(checkedEntities).filter(Boolean).length;
  const completionPercentage = Math.round((completedEntities / totalEntities) * 100);
  const allChecked = completedEntities === totalEntities;

  const toggleEntity = (entity: string) => {
    if (!checkedEntities[entity] && entity === "GEMA") {
      if (!confirm("Have you verified GEMA's specific requirements for German territories?")) return;
    }
    setCheckedEntities((prev) => ({ ...prev, [entity]: !prev[entity] }));
  };

  return (
    <ContentLayout title="Music Registration Gateway">
    

      <div className="space-y-8">
        <div className="bg-slate-800 dark:bg-slate-900 p-6 rounded-lg border border-slate-700 dark:border-slate-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Registro Global da Música</h2>
            <Badge variant="outline" className="border-purple-400 text-purple-400 text-lg">
              {completedEntities}/{totalEntities}
            </Badge>
          </div>
          <Progress value={completionPercentage} className="h-3 bg-slate-700 dark:bg-slate-600" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrationGroups.map((group) => {
            const groupProgress = group.entities.filter((e) => checkedEntities[e]).length;
            const groupComplete = groupProgress === group.entities.length;
            return (
              <div
                key={group.title}
                className={`p-6 rounded-lg border-2 ${
                  groupComplete ? "border-green-500/30 bg-green-900/10 dark:bg-green-800/20" : "border-slate-700 bg-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{group.title}</h3>
                    <p className="text-slate-400 dark:text-slate-300 text-sm">{group.description}</p>
                  </div>
                  <Badge variant={groupComplete ? "default" : "outline"}>
                    {groupComplete ? (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    ) : (
                      `${groupProgress}/${group.entities.length}`
                    )}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {group.entities.map((entity) => (
                    <div
                      key={entity}
                      className={`flex items-center space-x-3 p-3 rounded-md ${
                        checkedEntities[entity]
                          ? "bg-green-900/20 border border-green-400/30 dark:bg-green-800/20"
                          : "bg-slate-700 dark:bg-slate-800"
                      }`}
                    >
                      <Checkbox
                        id={entity}
                        checked={checkedEntities[entity]}
                        onCheckedChange={() => toggleEntity(entity)}
                        className="h-5 w-5 border-2 data-[state=checked]:border-green-400"
                      />
                      <label
                        htmlFor={entity}
                        className={`text-sm ${
                          checkedEntities[entity] ? "text-green-300 line-through" : "text-slate-300 dark:text-slate-200"
                        }`}
                      >
                        {entity}
                        {entity === "GEMA" && <span className="text-red-400 ml-2">*</span>}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {!allChecked && (
          <Alert variant="destructive" className="border-red-500/30">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Action Required</AlertTitle>
            <AlertDescription>
              Só podes ir ao próximo paço com um ISWC e ISRC português.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            onClick={() => (window.location.href = "/monetizacao")}
            className="bg-purple-600 hover:bg-purple-700"
            disabled={!allChecked}
          >
            <Rocket className="mr-2 h-4 w-4" />
            Ir para o Lançamento
            {!allChecked && <span className="ml-2 text-yellow-200">({completedEntities}/{totalEntities})</span>}
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
