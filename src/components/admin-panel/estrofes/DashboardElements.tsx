// app/components/DashboardElements.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";

const DashboardElements = () => {
  const sidebar = useSidebar();
  const [cards, setCards] = useState<number[]>([Date.now()]);

  if (!sidebar) return <div>Loading...</div>;

  const addNewCard = () => setCards(prev => [...prev, Date.now()]);
  const removeCard = () => setCards(prev => prev.slice(0, -1));

  return (
    <Card className="mb-6">
      <CardHeader>
        <Breadcrumb>
          <BreadcrumbList>
            {[
              "maquete",
              "Contextualização",
              "Versificação",
              "Gravação",
              "Cinematografia",
              "Orçamento e Aluguer",
              "Filmagens",
              "Contratualização",
              "Direitos Autorais",
              "Lançamento",
            ].map((item, index) => (
              <React.Fragment key={item}>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/${item.toLowerCase()}`} className="hover:text-primary">
                      {item}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {index < 9 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </CardHeader>
      <CardContent>
        <div>
          <Button onClick={addNewCard}>Add Card</Button>
          <Button onClick={removeCard}>Remove Card</Button>
          {/* Display the list of cards */}
          <div className="mt-4">
            {cards.map((card) => (
              <div key={card} className="p-4 border mb-2">
                Card ID: {card}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardElements;
