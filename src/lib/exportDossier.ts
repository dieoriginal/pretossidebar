"use client";

import { jsPDF } from "jspdf";

/**
 * Exports the entire project as a comprehensive PDF dossier.
 * Includes: Song info, all lyrics with strophe context, cinematography,
 * narratology notes, and all step-level data available.
 */
export async function exportProjectDossier(
  songInfo: {
    title: string;
    artist: string;
    featuring: string[];
    producer: string;
  },
  strophes: any[],
  stepData: Record<string, any> | undefined,
  currentStep: number
) {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 14;

  const checkPage = (needed: number = 30) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addHeader = (text: string, size: number = 16) => {
    checkPage(size + 20);
    doc.setFontSize(size);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(text, margin, y);
    y += size + 8;
  };

  const addSubheader = (text: string) => {
    checkPage(24);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(text, margin, y);
    y += lineHeight + 4;
  };

  const addText = (text: string, indent: number = 0) => {
    checkPage(lineHeight + 4);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    for (const line of lines) {
      checkPage(lineHeight);
      doc.text(line, margin + indent, y);
      y += lineHeight;
    }
  };

  const addKeyValue = (key: string, value: string, indent: number = 0) => {
    if (!value || value === "undefined") return;
    checkPage(lineHeight + 2);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(`${key}:`, margin + indent, y);
    const keyWidth = doc.getTextWidth(`${key}: `);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    const remaining = maxWidth - indent - keyWidth - 5;
    const valLines = doc.splitTextToSize(value, remaining);
    doc.text(valLines[0] || "", margin + indent + keyWidth + 5, y);
    y += lineHeight;
    for (let i = 1; i < valLines.length; i++) {
      checkPage(lineHeight);
      doc.text(valLines[i], margin + indent + keyWidth + 5, y);
      y += lineHeight;
    }
  };

  const addSeparator = () => {
    checkPage(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  };

  const addPageFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(150, 150, 150);
      doc.text(
        `${songInfo.artist || "Artista"} — ${songInfo.title || "Projecto"} | Pág. ${i}/${totalPages}`,
        margin,
        pageHeight - 15
      );
      doc.text("AGORA — Dossier do Projecto", pageWidth - margin - 130, pageHeight - 15);
    }
  };

  // ===== COVER PAGE =====
  y = pageHeight / 3;
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(20, 20, 20);
  const titleText = songInfo.title?.toUpperCase() || "PROJECTO SEM TÍTULO";
  const titleLines = doc.splitTextToSize(titleText, maxWidth);
  for (const line of titleLines) {
    doc.text(line, pageWidth / 2, y, { align: "center" });
    y += 34;
  }

  y += 10;
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(songInfo.artist?.toUpperCase() || "ARTISTA", pageWidth / 2, y, {
    align: "center",
  });
  y += 24;

  if (songInfo.featuring?.length > 0) {
    doc.setFontSize(12);
    doc.text(
      `feat. ${songInfo.featuring.join(", ")}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 20;
  }

  if (songInfo.producer) {
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Produzido por ${songInfo.producer}`,
      pageWidth / 2,
      y,
      { align: "center" }
    );
    y += 20;
  }

  y += 40;
  doc.setFontSize(9);
  doc.setTextColor(130, 130, 130);
  doc.text("DOSSIER DO PROJECTO", pageWidth / 2, y, { align: "center" });
  y += 14;
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })}`,
    pageWidth / 2,
    y,
    { align: "center" }
  );

  // ===== PAGE 2: TABLE OF CONTENTS =====
  doc.addPage();
  y = margin;
  addHeader("ÍNDICE", 18);
  y += 10;
  const sections = [
    "1. Informações do Projecto",
    "2. Letra Completa",
    "3. Análise por Estrofe",
    "4. Cinematografia / Storyboard",
    "5. Dados dos Passos de Produção",
    "6. Notas Finais",
  ];
  for (const section of sections) {
    addText(section);
    y += 4;
  }

  // ===== SECTION 1: PROJECT INFO =====
  doc.addPage();
  y = margin;
  addHeader("1. INFORMAÇÕES DO PROJECTO");
  addSeparator();
  addKeyValue("Título", songInfo.title || "N/A");
  addKeyValue("Artista", songInfo.artist || "N/A");
  addKeyValue("Featuring", songInfo.featuring?.join(", ") || "Nenhum");
  addKeyValue("Produtor", songInfo.producer || "N/A");
  addKeyValue("Passo Atual", `${currentStep + 1} de 10`);
  addKeyValue("Data", new Date().toLocaleDateString("pt-PT"));

  // ===== SECTION 2: FULL LYRICS =====
  y += 20;
  addHeader("2. LETRA COMPLETA");
  addSeparator();

  strophes.forEach((strophe, sIdx) => {
    checkPage(40);
    addSubheader(`Estrofe ${sIdx + 1} — ${strophe.architecture || "Livre"}`);
    if (strophe.description) {
      addText(strophe.description, 10);
      y += 4;
    }

    strophe.verses?.forEach((verse: any) => {
      checkPage(lineHeight + 4);
      let lineText = verse.words
        ?.map((w: any) => w.text)
        .join(" ") || "";
      if (verse.adlib) lineText += `  (${verse.adlib})`;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(20, 20, 20);

      // Bold stressed words
      const words = lineText.split(" ");
      let x = margin + 15;
      for (const word of words) {
        checkPage(lineHeight);
        const isStressed = verse.words?.find(
          (w: any) => w.text === word && w.stressed
        );
        if (isStressed) {
          doc.setFont("helvetica", "bold");
        } else {
          doc.setFont("helvetica", "normal");
        }
        doc.text(word, x, y);
        x += doc.getTextWidth(word + " ");
        if (x > pageWidth - margin) {
          x = margin + 15;
          y += lineHeight;
          checkPage(lineHeight);
        }
      }
      y += lineHeight;

      // Verse has audio recording indicator
      if (verse.audioRecording) {
        doc.setFontSize(7);
        doc.setTextColor(200, 50, 50);
        doc.text("🎙 Gravação de flow disponível na app", margin + 15, y);
        doc.setTextColor(20, 20, 20);
        y += lineHeight;
      }
    });
    y += 10;
  });

  // ===== SECTION 3: PER-STROPHE ANALYSIS =====
  addHeader("3. ANÁLISE POR ESTROFE");
  addSeparator();

  strophes.forEach((strophe, sIdx) => {
    checkPage(60);
    addSubheader(`Estrofe ${sIdx + 1} — ${strophe.architecture || "Livre"}`);

    if (strophe.threeAct) addKeyValue("Estrutura em 3 Atos", strophe.threeAct, 10);
    if (strophe.musicSection) addKeyValue("Secção Musical", strophe.musicSection, 10);

    strophe.verses?.forEach((verse: any, vIdx: number) => {
      checkPage(80);
      const verseText = verse.words?.map((w: any) => w.text).join(" ") || "";
      addText(`Verso ${vIdx + 1}: ${verseText}`, 10);

      if (verse.voiceType) addKeyValue("Voz", verse.voiceType, 20);
      if (verse.figura) addKeyValue("Figura Literária", verse.figura, 20);
      if (verse.function) addKeyValue("Função", verse.function, 20);
      if (verse.technique) addKeyValue("Técnica", verse.technique, 20);
      if (verse.metaTool) addKeyValue("Meta-narrativa", verse.metaTool, 20);
      if (verse.persona) addKeyValue("Persona", verse.persona, 20);
      if (verse.threeAct) addKeyValue("3 Atos", verse.threeAct, 20);
      if (verse.tag) addKeyValue("Tag Rima", verse.tag, 20);
      if (verse.adlib) addKeyValue("Adlib", verse.adlib, 20);

      // Camera settings
      if (verse.cameraSettings) {
        const cs = verse.cameraSettings;
        if (cs.shotType) addKeyValue("Plano", cs.shotType, 20);
        if (cs.movement) addKeyValue("Movimento", cs.movement, 20);
        if (cs.location) addKeyValue("Localização", cs.location, 20);
        if (cs.sceneLabel) addKeyValue("Cena", cs.sceneLabel, 20);
        if (cs.resolution) addKeyValue("Resolução", cs.resolution, 20);
        if (cs.stabilization) addKeyValue("Estabilização", cs.stabilization, 20);
      }
      y += 6;
    });
    addSeparator();
  });

  // ===== SECTION 4: CINEMATOGRAPHY SUMMARY =====
  addHeader("4. CINEMATOGRAFIA / STORYBOARD");
  addSeparator();

  const allVerses = strophes.flatMap((s) => s.verses || []);
  const versesWithCamera = allVerses.filter((v: any) => v.cameraSettings);

  if (versesWithCamera.length === 0) {
    addText("Nenhuma configuração de cinematografia definida.");
  } else {
    versesWithCamera.forEach((verse: any, idx: number) => {
      checkPage(100);
      addSubheader(`Cena ${idx + 1}`);
      const text = verse.words?.map((w: any) => w.text).join(" ") || "";
      addText(`"${text}"`, 10);

      const cs = verse.cameraSettings;
      if (cs.shotType) addKeyValue("Tipo de Plano", cs.shotType, 15);
      if (cs.movement) addKeyValue("Movimento de Câmera", cs.movement, 15);
      if (cs.resolution) addKeyValue("Resolução", cs.resolution, 15);
      if (cs.stabilization) addKeyValue("Estabilização", cs.stabilization, 15);
      if (cs.location) addKeyValue("Localização", cs.location, 15);
      if (cs.intExt) addKeyValue("INT/EXT", cs.intExt, 15);
      if (cs.iso) addKeyValue("ISO", cs.iso, 15);
      if (cs.shutterSpeed) addKeyValue("Obturador", cs.shutterSpeed, 15);
      if (cs.ndFilter) addKeyValue("Filtro ND", cs.ndFilter, 15);
      if (cs.characters) addKeyValue("Personagens", cs.characters, 15);
      if (cs.props) addKeyValue("Adereços", cs.props, 15);
      if (cs.style) addKeyValue("Estilo", cs.style, 15);
      if (cs.specialEffects) addKeyValue("Efeitos Especiais", cs.specialEffects, 15);
      if (cs.sceneLabel) addKeyValue("Label da Cena", cs.sceneLabel, 15);
      y += 8;
    });
  }

  // ===== SECTION 5: STEP DATA =====
  addHeader("5. DADOS DOS PASSOS DE PRODUÇÃO");
  addSeparator();

  const stepNames: Record<string, string> = {
    maquete: "Maquete (Conceito)",
    narratologia: "Narratologia",
    gravacao: "Gravação",
    vestuario: "Vestuário",
    orcamento: "Orçamento e Aluguer",
    filmagem: "Filmagem",
    fotografia: "Fotografia",
    edicaodevideo: "Edição de Vídeo",
    contratualizacao: "Contratualização",
    direitosautorais: "Direitos Autorais",
    lancamento: "Lançamento",
    monetizacao: "Monetização",
    custosfixos: "Custos Fixos",
  };

  if (stepData && Object.keys(stepData).length > 0) {
    for (const [key, data] of Object.entries(stepData)) {
      if (!data || (typeof data === "object" && Object.keys(data).length === 0))
        continue;
      checkPage(40);
      addSubheader(stepNames[key] || key.toUpperCase());

      // Render step data as key-value pairs (handles nested objects)
      renderStepData(doc, data, margin, addKeyValue, addText, checkPage);
      y += 10;
      addSeparator();
    }
  } else {
    addText("Nenhum dado adicional dos passos registrado.");
  }

  // ===== SECTION 6: FINAL NOTES =====
  addHeader("6. NOTAS FINAIS");
  addSeparator();
  addText(
    "Este dossier foi gerado automaticamente pela aplicação AGORA. " +
    "Contém toda a informação do projecto musical, incluindo a letra, " +
    "análise literária, configurações de cinematografia e dados de cada " +
    "passo de produção. Partilhe este documento com a sua equipa para " +
    "manter todos alinhados durante o processo criativo."
  );
  y += 20;
  addText(
    `Total de estrofes: ${strophes.length} | ` +
    `Total de versos: ${allVerses.length} | ` +
    `Versos com gravação de flow: ${allVerses.filter((v: any) => v.audioRecording).length}`
  );

  // Add page footers
  addPageFooter();

  // Save
  const filename = `${songInfo.artist || "artista"}_${songInfo.title || "projecto"}_dossier.pdf`;
  doc.save(filename.replace(/\s+/g, "_").toLowerCase());
}

/** Recursively render step data object as key-value pairs in the PDF */
function renderStepData(
  doc: jsPDF,
  data: any,
  margin: number,
  addKeyValue: (key: string, value: string, indent?: number) => void,
  addText: (text: string, indent?: number) => void,
  checkPage: (needed?: number) => void,
  depth: number = 0
) {
  if (!data || typeof data !== "object") {
    if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
      addText(String(data), 10 + depth * 10);
    }
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item, idx) => {
      if (typeof item === "string" || typeof item === "number") {
        addText(`• ${item}`, 10 + depth * 10);
      } else if (typeof item === "object") {
        checkPage(20);
        addText(`Item ${idx + 1}:`, 10 + depth * 10);
        renderStepData(doc, item, margin, addKeyValue, addText, checkPage, depth + 1);
      }
    });
    return;
  }

  for (const [key, value] of Object.entries(data)) {
    // Skip internal/technical keys
    if (key.startsWith("_") || key === "id" || key === "key") continue;
    // Skip very long base64 strings (audio/image data)
    if (typeof value === "string" && value.length > 500) {
      addKeyValue(key, "[Dados binários — ver na app]", 10 + depth * 10);
      continue;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      addKeyValue(key, String(value), 10 + depth * 10);
    } else if (typeof value === "object" && value !== null) {
      checkPage(20);
      addText(`${key}:`, 10 + depth * 10);
      renderStepData(doc, value, margin, addKeyValue, addText, checkPage, depth + 1);
    }
  }
}
