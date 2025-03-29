// pages/videoform.tsx
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

const musicRegistrationEntities = [
  "AUDIOGEST",
  "SPAUTORES",
  "GDA",
  "SONGTRUST",
  "SOUNDCHANGE",
  "LYRICFIND",
  "MUSIXMATCH",
  "HARRYFOX AGENCY",
  "BMI",
  "ASCAP",
  "MEDIABASE",
  "GENIUS",
];

export default function MusicRegistrationChecklistPage() {
  const [checkedEntities, setCheckedEntities] = useState<Record<string, boolean>>(
    musicRegistrationEntities.reduce((acc, entity) => {
      acc[entity] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleEntity = (entity: string) => {
    setCheckedEntities((prev) => ({
      ...prev,
      [entity]: !prev[entity],
    }));
  };

  const allChecked = Object.values(checkedEntities).every(Boolean);

  return (
    <ContentLayout title="Music Registration Checklist">
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
              <Link href="/music-registration">Music Registration</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="pt-4">
        <h1 className="text-3xl font-bold mb-4">Music Registration Checklist</h1>
        <p className="mb-6">
          Please complete your music registration by checking off the following platforms:
        </p>
        <ul className="space-y-4">
          {musicRegistrationEntities.map((entity) => (
            <li key={entity} className="flex items-center">
              <input
                type="checkbox"
                id={entity}
                checked={checkedEntities[entity]}
                onChange={() => toggleEntity(entity)}
                className="mr-2 h-5 w-5"
              />
              <label htmlFor={entity} className="text-lg">
                {entity}
              </label>
            </li>
          ))}
        </ul>

        <div className="flex justify-center gap-4 mt-8">
          <Button
            onClick={() => (window.location.href = "/monetizacao")}
            className="bg-green-500 text-white"
            disabled={!allChecked}
          >
            Proceguir à Monetização
          </Button>
        </div>
      </div>
    </ContentLayout>
  );
}
