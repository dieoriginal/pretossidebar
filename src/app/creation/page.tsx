"use client";

import { useState } from "react";
import { ContentLayout } from "@/app/(demo)/obraeurudita/page";
import { LiteraryStudio } from "@/app/(demo)/livros/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PdfDeconstructionOverlay } from "@/components/literature/PdfDeconstructionOverlay";
import { SpaLicenseDialog } from "@/components/literature/SpaLicenseDialog";
import { BookOpenText } from "lucide-react";

export default function CreationPage() {
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <ContentLayout title="Creation • Escrita Literária" showStepper={false} stepKey="literatureStep">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BookOpenText className="w-5 h-5" />
              Atelier de Escrita + Desconstrução de PDF + Licença SPA
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setPdfOpen(true)} className="gap-2">
              Abrir PDF (desconstruir)
            </Button>
            <SpaLicenseDialog />
          </CardContent>
        </Card>

        <LiteraryStudio />
      </div>

      <PdfDeconstructionOverlay open={pdfOpen} onOpenChange={setPdfOpen} />
    </ContentLayout>
  );
}















