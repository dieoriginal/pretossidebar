"use client";

import React, { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Rocket, AlertCircle, CheckCircle } from "lucide-react";

const registrationGroups = [
  {
    title: "Performance Rights Organizations",
    entities: ["BMI", "ASCAP", "SOCAN", "PRS", "GEMA"],
    description: "Essential for public performance royalties collection",
  },
  {
    title: "Publishing Administrators",
    entities: ["SONGTRUST", "HARRYFOX AGENCY", "MUSIXMATCH"],
    description: "Mechanical rights and sync licensing management",
  },
  {
    title: "Digital Distribution",
    entities: ["SOUNDCHANGE", "AUDIOGEST", "FUGA", "TUNECORE"],
    description: "Platform distribution and neighboring rights",
  },
  {
    title: "Lyrics & Metadata",
    entities: ["GENIUS", "LYRICFIND", "MUSIXMATCH"],
    description: "Lyric licensing and metadata management",
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
      <Breadcrumb>
        <BreadcrumbList>
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
              <Link href="/gravacao">Gravação</Link>
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
              <Link href="/orcamento">Orçamentalização</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/filmagem">Filmagens</Link>
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
              <Link href="/lançamendo">Lançamento</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="space-y-8">
        <div className="bg-slate-800 dark:bg-slate-900 p-6 rounded-lg border border-slate-700 dark:border-slate-600">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">Global Registration Progress</h2>
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
              Complete all registration checkboxes to enable monetization
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
            Proceed to Monetization
            {!allChecked && <span className="ml-2 text-yellow-200">({completedEntities}/{totalEntities})</span>}
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
