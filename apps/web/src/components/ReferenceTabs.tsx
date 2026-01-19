"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";

type RefTab = {
  key: string;
  label: string;
  url: string;
  title: string;
};

const TABS: RefTab[] = [
  { key: "rimas", label: "Rimas", url: "https://www.rhymit.com/", title: "Rhymit" },
  { key: "dicionario", label: "Dicionário", url: "https://dicionario.priberam.org", title: "Dicionário Priberam" },
  { key: "antonimos", label: "Antónimos", url: "https://www.antonimos.com.br/", title: "Antónimos" },
  { key: "sinonimos", label: "Sinónimos", url: "https://www.sinonimos.com.br/", title: "Sinónimos" },
  { key: "lexico", label: "Léxico", url: "https://www.lexico.pt/", title: "Léxico" },
];

export default function ReferenceTabs() {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="rimas" className="flex-1 flex flex-col">
        <TabsList className="sticky top-0 z-10">
          {TABS.map((t) => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.key} value={t.key} className="flex-1 overflow-hidden">
            <div className="w-full h-full">
              <iframe
                src={t.url}
                className="w-full h-full rounded-lg border"
                loading="eager"
                referrerPolicy="no-referrer-when-downgrade"
                title={t.title}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
