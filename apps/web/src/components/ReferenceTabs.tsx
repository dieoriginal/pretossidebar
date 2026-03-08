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
    <div className="h-full flex flex-col min-h-0">
      <Tabs defaultValue="rimas" className="flex-1 flex flex-col min-h-0">
        <TabsList className="sticky top-0 z-10 w-full flex-wrap h-auto gap-1 p-1 bg-muted/50">
          {TABS.map((t) => (
            <TabsTrigger 
              key={t.key} 
              value={t.key}
              className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 flex-1 min-w-[60px]"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-1 min-h-0 overflow-hidden relative">
          {TABS.map((t) => (
            <TabsContent 
              key={t.key} 
              value={t.key} 
              className="absolute inset-0 m-0 data-[state=inactive]:hidden"
            >
              <div className="w-full h-full p-1">
                <iframe
                  src={t.url}
                  className="w-full h-full rounded-lg border bg-white"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={t.title}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
}
