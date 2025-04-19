
IN THIS CODE :

"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import jsPDF from "jspdf";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X, Plus, Trash2, Eye, FileText, Video, Image } from "lucide-react";
import { analyzeMeter } from "@/lib/analyzeMeter";

interface Verse {
  id: number;
  words: { text: string; customColor?: string; stressed?: boolean }[];
  tag: string;
  media?: File | string;
  adlib?: string;
  voiceType?: string;
  cameraSettings?: {
    shotType: string;
    movement: string;
    resolution: string;
    stabilization: string;
    location: string;
  };
}

interface SelectedOptions {
  figures: string[];
  metric: string;
  architecture: string;
  voice: string;
  episode?: string;
}

interface SongInfo {
  title: string;
  featuring: string[];
}

const initialSongInfo: SongInfo = {
  title: "",
  featuring: [],
};

const literaryFigures = [
  { name: "Metáfora", description: "Comparação implícita entre duas coisas. Ex.: 'A vida é um sonho'." },
  { name: "Símile", description: "Comparação explícita usando 'como'. Ex.: 'Ele é forte como um touro'." },
  { name: "Hipérbole", description: "Exagero para enfatizar uma ideia. Ex.: 'Estou morrendo de fome'." },
  { name: "Ironia", description: "Dizer o oposto do que se quer expressar. Ex.: 'Que dia lindo!' (num dia chuvoso)." },
  { name: "Aliteração", description: "Repetição de sons consonantais. Ex.: 'O rato roeu a roupa do rei de Roma'." },
  { name: "Prosopopeia", description: "Atribuir características humanas a seres inanimados. Ex.: 'O sol sorriu para nós'." },
  { name: "Onomatopeia", description: "Palavras que imitam sons. Ex.: 'O relógio faz tic-tac'." },
  { name: "Eufemismo", description: "Suavização de uma expressão. Ex.: 'Ele partiu para um lugar melhor'." },
  { name: "Antítese", description: "Contraposição de ideias. Ex.: 'É um mar de rosas, mas também um deserto de espinhos'." },
  { name: "Paradoxo", description: "Ideias opostas que geram reflexão. Ex.: 'Menos é mais'." },
];

const voiceOptions = [
  { value: "low", label: "Voz Grave" },
  { value: "normal", label: "Voz Normal" },
  { value: "high", label: "Voz Aguda" },
];

const shotTypeOptions = [
  { value: "highAngle", label: "Plano alto / Ângulo alto" },
  { value: "lowAngle", label: "Plano baixo / Ângulo baixo" },
  { value: "dutchAngle", label: "Plano holandês / Ângulo inclinado" },
  { value: "eyeLevel", label: "Ao nível dos olhos" },
];

const episodeOptions = [
  "Ascensão do herói",
  "Erro trágico (hamartia)",
  "Virada de fortuna (peripeteia)",
  "Queda (catástrofe)",
  "Reconhecimento (anagnórise)",
  "Êxodo",
];

const featuringOptions = ["Zara G", "YuriNR5", "Sippinpurp", "YUZI", "YunLilo", "Yasz Dicko", "MAFIA73", "P. William", "Chaylan"];

const WordTag: React.FC<{
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  onRemove: () => void;
  rhymedColor?: string;
}> = ({ word, color, isRhymed, onChange, onColorChange, onRemove, rhymedColor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word.toUpperCase());

  const backgroundStyle = color
    ? { backgroundColor: color }
    : isRhymed && rhymedColor
    ? { backgroundColor: rhymedColor }
    : {};

  return (
    <div className="inline-flex items-center m-1 p-1 border rounded dark:text-white" style={backgroundStyle}>
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1 uppercase font-bold text-sm"
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase())}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
          onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
          autoFocus
        />
      ) : (
        <span 
          onClick={() => setIsEditing(true)} 
          className={`px-1 uppercase font-bold text-sm ${analyzeMeter(value).stressedSyllables?.[0] ? 'font-black' : ''}`}
        >
          {value || "___"}
        </span>
      )}
      <button onClick={onRemove} className="text-red-500 text-xs ml-1" title="Remover palavra">
        &times;
      </button>
      <input
        type="color"
        value={color || "#ffffff"}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-6 h-6 p-0 border-0 ml-1 cursor-pointer"
      />
    </div>
  );
};

const VerseTag: React.FC<{ tag: string; onChange: (newTag: string) => void }> = ({ tag, onChange }) => {
  const colorMapping: { [key: string]: string } = {
    A: "border-red-500",
    B: "border-blue-500",
    C: "border-lime-500",
    D: "border-yellow-500",
  };
  const borderColor = colorMapping[tag.toUpperCase()] || "border-gray-300";
  return (
    <select
      value={tag}
      onChange={(e) => onChange(e.target.value)}
      className={`w-16 text-center items-center py-2 border-2 rounded-full uppercase font-bold ${borderColor} bg-white dark:bg-slate-700 text-black dark:text-white`}
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  );
};

const Dashboard: React.FC = () => {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;
  const [activeTab, setActiveTab] = useState("versos");
  const [verses, setVerses] = useState<Verse[][]>([]);
  const [songInfo, setSongInfo] = useState<SongInfo>(initialSongInfo);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    figures: [],
    metric: "trocaico",
    architecture: "Prólogo",
    voice: "normal",
  });
  const [locations, setLocations] = useState<string[]>([]);
  const [fullLyrics, setFullLyrics] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleAddVerse = (stropheIndex: number, words: string[]) => {
    const newVerse: Verse = {
      id: Date.now(),
      words: words.map(text => ({ 
        text: text.toUpperCase(), 
        stressed: analyzeMeter(text.toUpperCase()).stressedSyllables?.[0], 
      })),
      tag: ["A", "B", "C", "D"][verses[stropheIndex]?.length % 4] || "A",
      cameraSettings: {
        shotType: "eyeLevel",
        movement: "pan",
        resolution: "4k",
        stabilization: "tripod",
        location: "",
      },
    };
    setVerses(prev => {
      const newVerses = [...prev];
      newVerses[stropheIndex] = [...(newVerses[stropheIndex] || []), newVerse];
      return newVerses;
    });
  };

  const handleWordUpdate = (stropheIndex: number, verseIndex: number, newWords: Verse["words"]) => {
    setVerses(prev => {
      const newVerses = [...prev];
      newVerses[stropheIndex][verseIndex].words = newWords.map(word => ({
        ...word,
        text: word.text.toUpperCase(),
        stressed: analyzeMeter(word.text.toUpperCase()).stressedSyllables?.[0]
      }));
      return newVerses;
    });
  };

  const handleAnalyze = async () => {
    const lines = verses.flatMap(strophe => 
      strophe.map(verse => verse.words.map(word => word.text).join(" "))
    );
    try {
      const result = await analyzeMeter(lines);
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error analyzing meter:", error);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yPosition = 20;
    
    doc.setFontSize(18);
    doc.text(songInfo.title.toUpperCase(), 10, yPosition);
    yPosition += 10;
    if(songInfo.featuring.length > 0) {
      doc.setFontSize(12);
      doc.text(`FEATURING: ${songInfo.featuring.join(", ")}`, 10, yPosition);
      yPosition += 10;
    }

    doc.setFontSize(12);
    verses.forEach((strophe, stropheIndex) => {
      doc.text(`Estrofe ${stropheIndex + 1}`, 10, yPosition);
      yPosition += 10;
      strophe.forEach(verse => {
        let line = verse.words.map(word => word.stressed ? `**${word.text}**` : word.text).join(" ");
        if(verse.adlib) line += ` (${verse.adlib.toUpperCase()})`;
        doc.text(line, 15, yPosition);
        yPosition += 10;
        
        if(yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = 20;
        }
      });
      yPosition += 5;
    });
    
    doc.save(`${songInfo.title || 'poema'}.pdf`);
  };

  const exportStoryboard = async () => {
    const doc = new jsPDF();
    let yPosition = 20;

    const versesFlat = verses.flat();
    for (const [index, verse] of versesFlat.entries()) {
      if(verse.cameraSettings) {
        // Add media preview
        if(verse.media instanceof File) {
          if(verse.media.type.startsWith("image")) {
            const imgData = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(verse.media as File);
            });
            doc.addImage(imgData, 'JPEG', 15, yPosition, 50, 30);
            yPosition += 35;
          }
        }

        doc.setFontSize(14);
        doc.text(`CENA ${index + 1} - ${verse.words.map(w => w.text).join(" ")}`, 10, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        doc.text(`Tipo de Plano: ${shotTypeOptions.find(opt => opt.value === verse.cameraSettings?.shotType)?.label || ''}`, 15, yPosition);
        yPosition += 8;
        doc.text(`Movimento: ${verse.cameraSettings.movement.toUpperCase()}`, 15, yPosition);
        yPosition += 8;
        doc.text(`Resolução: ${verse.cameraSettings.resolution.toUpperCase()}`, 15, yPosition);
        yPosition += 8;
        doc.text(`Estabilização: ${verse.cameraSettings.stabilization.toUpperCase()}`, 15, yPosition);
        yPosition += 8;
        doc.text(`Localização: ${verse.cameraSettings.location.toUpperCase()}`, 15, yPosition);
        yPosition += 15;
        
        if(yPosition > 280) {
          doc.addPage();
          yPosition = 20;
        }
      }
    }

    doc.save('storyboard.pdf');
  };

  return (
    <ContentLayout title="Dashboard">
      <AdminPanelLayout rightSidebar={<Sidebar />}>
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <Input 
                placeholder="TÍTULO DA MÚSICA"
                value={songInfo.title}
                onChange={(e) => setSongInfo(prev => ({...prev, title: e.target.value.toUpperCase()}))}
                className="text-2xl font-bold uppercase border border-gray-300"
              />
              
              <div className="flex gap-2 flex-wrap">
                {featuringOptions.map(artist => (
                  <Button
                    key={artist}
                    variant={songInfo.featuring.includes(artist) ? "default" : "outline"}
                    onClick={() => setSongInfo(prev => ({
                      ...prev,
                      featuring: prev.featuring.includes(artist)
                        ? prev.featuring.filter(a => a !== artist)
                        : [...prev.featuring, artist]
                    }))}
                    size="sm"
                  >
                    {artist}
                  </Button>
                ))}
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="versos">Versificação</TabsTrigger>
                  <TabsTrigger value="cinematografia">Cinematografia</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
        </Card>

        {activeTab === "versos" && (
          <div className="space-y-6">
            {verses.map((strophe, stropheIndex) => (
              <Card key={stropheIndex} className="p-6">
                <div className="flex justify-between mb-4">
                  <h3 className="text-xl font-bold">Estrofe {stropheIndex + 1}</h3>
                  <Button variant="destructive" onClick={() => setVerses(prev => prev.filter((_, i) => i !== stropheIndex))}>
                    Remover Estrofe
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label>Figuras Literárias</Label>
                    <div className="flex flex-wrap gap-2">
                      {literaryFigures.map(figure => (
                        <Button
                          key={figure.name}
                          variant={selectedOptions.figures.includes(figure.name) ? "default" : "outline"}
                          onClick={() => setSelectedOptions(prev => ({
                            ...prev,
                            figures: prev.figures.includes(figure.name)
                              ? prev.figures.filter(f => f !== figure.name)
                              : [...prev.figures, figure.name]
                          }))}
                          size="sm"
                        >
                          {figure.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Arquitetura Dramática</Label>
                    <div className="flex flex-col gap-2">
                      <select
                        value={selectedOptions.architecture}
                        onChange={(e) => setSelectedOptions(prev => ({
                          ...prev,
                          architecture: e.target.value,
                          episode: e.target.value === "Episódios" ? episodeOptions[0] : undefined
                        }))}
                        className="w-full p-2 border rounded"
                      >
                        <option>Prólogo</option>
                        <option>Parodos</option>
                        <option>Episódios</option>
                        <option>Êxodo</option>
                      </select>
                      
                      {selectedOptions.architecture === "Episódios" && (
                        <select
                          value={selectedOptions.episode}
                          onChange={(e) => setSelectedOptions(prev => ({...prev, episode: e.target.value}))}
                          className="w-full p-2 border rounded"
                        >
                          {episodeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold text-black dark:text-white">Métrica Selecionada:</Label>
                      <p className="capitalize text-black dark:text-white">{selectedOptions.metric}</p>
                    </div>
                    <div>
                      <Label className="font-bold text-black dark:text-white">Voz Selecionada:</Label>
                      <p className="text-black dark:text-white">{voiceOptions.find(v => v.value === selectedOptions.voice)?.label}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="font-bold text-black dark:text-white">Figuras Ativas:</Label>
                      <p className="text-black dark:text-white">{selectedOptions.figures.join(", ") || "Nenhuma figura selecionada"}</p>
                    </div>
                  </div>
                </div>

                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={({active, over}) => {
                    if(over && active.id !== over.id) {
                      setVerses(prev => {
                        const newVerses = [...prev];
                        const oldIndex = newVerses[stropheIndex].findIndex(v => v.id === active.id);
                        const newIndex = newVerses[stropheIndex].findIndex(v => v.id === over.id);
                        newVerses[stropheIndex] = arrayMove(newVerses[stropheIndex], oldIndex, newIndex);
                        return newVerses;
                      });
                    }
                  }}
                >
                  <SortableContext items={strophe.map(v => v.id)}>
                    {strophe.map((verse, verseIndex) => (
                      <div key={verse.id} className="p-4 mb-4 border rounded-lg">
                        <div className="flex gap-4 mb-4">
                          <VerseTag tag={verse.tag} onChange={(newTag) => {
                            setVerses(prev => {
                              const newVerses = [...prev];
                              newVerses[stropheIndex][verseIndex].tag = newTag;
                              return newVerses;
                            });
                          }} />

                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="ADLIB (OPCIONAL)"
                              value={verse.adlib || ""}
                              onChange={(e) => {
                                setVerses(prev => {
                                  const newVerses = [...prev];
                                  newVerses[stropheIndex][verseIndex].adlib = e.target.value.toUpperCase();
                                  return newVerses;
                                });
                              }}
                            />
                            <select
                              value={verse.voiceType}
                              onChange={(e) => {
                                setVerses(prev => {
                                  const newVerses = [...prev];
                                  newVerses[stropheIndex][verseIndex].voiceType = e.target.value;
                                  return newVerses;
                                });
                              }}
                              className="w-full p-2 border rounded"
                            >
                              {voiceOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {verse.words.map((word, wordIndex) => (
                            <WordTag
                              key={wordIndex}
                              word={word.text}
                              isRhymed={wordIndex === verse.words.length - 1}
                              onChange={(newWord) => {
                                const newWords = [...verse.words];
                                newWords[wordIndex].text = newWord;
                                handleWordUpdate(stropheIndex, verseIndex, newWords);
                              }}
                              onColorChange={(newColor) => {
                                setVerses(prev => {
                                  const newVerses = [...prev];
                                  newVerses[stropheIndex][verseIndex].words[wordIndex].customColor = newColor;
                                  return newVerses;
                                });
                              }}
                              onRemove={() => {
                                const newWords = verse.words.filter((_, i) => i !== wordIndex);
                                handleWordUpdate(stropheIndex, verseIndex, newWords);
                              }}
                            />
                          ))}
                          <Button 
                            onClick={() => {
                              const newWords = [...verse.words, { text: "" }];
                              handleWordUpdate(stropheIndex, verseIndex, newWords);
                            }}
                            size="sm"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>

                <div className="flex gap-4 mt-4">
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      placeholder="Digite o verso..."
                      className="border p-2 rounded flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const target = e.target as HTMLInputElement;
                          handleAddVerse(stropheIndex, target.value.split(" "));
                          target.value = "";
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAddVerse(stropheIndex, ["Novo", "Verso"])}
                    >
                      Adicionar Verso
                    </Button>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        Adicionar Letra Completa
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Inserir Letra Completa</DialogTitle>
                      </DialogHeader>
                      <textarea
                        value={fullLyrics}
                        onChange={(e) => setFullLyrics(e.target.value)}
                        className="w-full h-64 p-2 border rounded"
                        placeholder="Cada linha será um verso"
                      />
                      <Button onClick={() => {
                        const lines = fullLyrics.split('\n').filter(l => l.trim());
                        setVerses(prev => [...prev, lines.map(line => ({
                          id: Date.now() + Math.random(),
                          words: line.split(' ').map(text => ({ 
                            text: text.toUpperCase(),
                            stressed: analyzeMeter(text.toUpperCase()).stressedSyllables?.[0]
                          })),
                          tag: "A",
                          cameraSettings: {
                            shotType: "eyeLevel",
                            movement: "pan",
                            resolution: "4k",
                            stabilization: "tripod",
                            location: "",
                          }
                        }))]);
                        setFullLyrics("");
                      }}>
                        Aplicar
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button onClick={handleAnalyze} variant="default">
                      Analisar Métrica
                    </Button>
                    {showAnalysis && (
                      <Button
                        onClick={() => {
                          setShowAnalysis(false);
                          setAnalysisResult(null);
                        }}
                        variant="destructive"
                      >
                        Ocultar Métrica
                      </Button>
                    )}
                  </div>
                  {showAnalysis && analysisResult && (
                    <div className="mt-2 p-4 border rounded">
                      <p className="text-sm font-semibold">
                        Métrica: {analysisResult.meter}
                      </p>
                      {analysisResult.original_lines.map((line: string, idx: number) => (
                        <div key={idx} className="mt-1 p-2 border rounded">
                          <p className="text-sm">
                            Linha {idx + 1}: {line} (Total de sílabas: {analysisResult.word_details[idx].total_syllables})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.word_details[idx].details.map(
                              (
                                detail: {
                                  word: string;
                                  syllable_breakdown: string;
                                  scansion: string;
                                  syllable_count: number;
                                },
                                wIdx: number
                              ) => (
                                <div key={wIdx} className="text-xs p-1 border rounded">
                                  <div>{detail.word}</div>
                                  <div className="font-mono">
                                    {detail.syllable_breakdown} ({detail.scansion})
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}

            <Button onClick={() => setVerses(prev => [...prev, []])}>
              Nova Estrofe
            </Button>
          </div>
        )}

        {activeTab === "cinematografia" && (
          <div className="space-y-6">
            {verses.flat().map((verse, index) => (
              <Card key={verse.id} className="p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label>Mídia de Referência</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-48 flex items-center justify-center">
                      {verse.media ? (
                        verse.media instanceof File ? (
                          verse.media.type.startsWith("video") ? (
                            <video controls className="max-h-44">
                              <source src={URL.createObjectURL(verse.media)} />
                            </video>
                          ) : (
                            <img src={URL.createObjectURL(verse.media)} className="max-h-44" />
                          )
                        ) : null
                      ) : (
                        <span className="text-gray-500">Arraste arquivo aqui</span>
                      )}
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={(e) => {
                          if(e.target.files?.[0]) {
                            setVerses(prev => prev.map(strophe => 
                              strophe.map(v => 
                                v.id === verse.id ? {...v, media: e.target.files![0]} : v
                              )
                            ));
                          }
                        }}
                        className="hidden"
                        id={`media-${verse.id}`}
                      />
                      <label htmlFor={`media-${verse.id}`} className="cursor-pointer p-2 hover:bg-gray-100 rounded">
                        <Video size={24} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Configurações de Filmagem</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo de Plano</Label>
                          <select
                            value={verse.cameraSettings?.shotType}
                            onChange={(e) => {
                              setVerses(prev => prev.map(strophe => 
                                strophe.map(v => 
                                  v.id === verse.id ? {
                                    ...v,
                                    cameraSettings: {...v.cameraSettings!, shotType: e.target.value}
                                  } : v
                                )
                              ));
                            }}
                            className="w-full p-2 border rounded"
                          >
                            {shotTypeOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label>Movimento de Câmera</Label>
                          <select
                            value={verse.cameraSettings?.movement}
                            onChange={(e) => {
                              setVerses(prev => prev.map(strophe => 
                                strophe.map(v => 
                                  v.id === verse.id ? {
                                    ...v,
                                    cameraSettings: {...v.cameraSettings!, movement: e.target.value}
                                  } : v
                                )
                              ));
                            }}
                            className="w-full p-2 border rounded"
                          >
                            <option value="pan">Panorâmica</option>
                            <option value="tilt">Tilt</option>
                            <option value="dolly">Travelling</option>
                            <option value="zoom">Zoom</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Localização</Label>
                      <Input
                        value={verse.cameraSettings?.location}
                        onChange={(e) => {
                          setVerses(prev => prev.map(strophe => 
                            strophe.map(v => 
                              v.id === verse.id ? {
                                ...v, 
                                cameraSettings: {...v.cameraSettings!, location: e.target.value}
                              } : v
                            )
                          ));
                          if(e.target.value && !locations.includes(e.target.value)) {
                            setLocations(prev => [...prev, e.target.value]);
                          }
                        }}
                        list={`locations-${verse.id}`}
                      />
                      <datalist id={`locations-${verse.id}`}>
                        {locations.map(loc => (
                          <option key={loc} value={loc} />
                        ))}
                      </datalist>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                  <p className="text-sm font-semibold">Verso:</p>
                  <p className="uppercase">
                    {verse.words.map(word => word.text).join(" ")}
                    {verse.adlib && <span className="text-gray-500"> ({verse.adlib})</span>}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Card className="sticky bottom-0 mt-6">
          <CardContent className="p-4 flex justify-between">
            <div className="flex gap-4">
              <Button onClick={exportToPDF}>
                <FileText className="mr-2" /> Exportar PDF
              </Button>
              {activeTab === "cinematografia" && (
                <Button onClick={exportStoryboard} variant="outline">
                  <Video className="mr-2" /> Exportar Storyboard
                </Button>
              )}
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary">
                  <Eye className="mr-2" /> Pré-visualizar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[90vh]">
                <div className="overflow-auto">
                  {verses.map((strophe, index) => (
                    <div key={index} className="mb-8">
                      <h3 className="text-xl font-bold mb-4">Estrofe {index + 1}</h3>
                      {strophe.map((verse, vIndex) => (
                        <div key={vIndex} className="mb-4">
                          <p className="font-bold uppercase">
                            {verse.words.map((word, wordIndex) => (
                              <span 
                                key={wordIndex} 
                                style={{ color: word.customColor }}
                                className={word.stressed ? "font-black" : ""}
                              >
                                {word.text}{" "}
                              </span>
                            ))}
                            {verse.adlib && <span className="text-gray-500">({verse.adlib})</span>}
                          </p>
                          {activeTab === "cinematografia" && (
                            <div className="mt-2 text-sm text-gray-600">
                              <p>Plano: {verse.cameraSettings?.shotType}</p>
                              <p>Movimento: {verse.cameraSettings?.movement}</p>
                              <p>Local: {verse.cameraSettings?.location}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </AdminPanelLayout>
    </ContentLayout>
  );
};

export default Dashboard;
---------

I want this specific iterations:

1. Th eADLIB and Voz type are on top of the verse, which takes alot of space, i just want the in the righ corner of the card, as like a pormenor, do need to take too much space

2. you removed the possibility of removing each individual verse with the "X" icon or button, i want that and another one that clean all words;

3. you removed the sortability, before you could switch verses orientation vertically to make more sence: code reference:

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { VerseTag } from "./VerseTag";
import { WordTag } from "./WordTag";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface SortableVerseLineProps {
  id: number;
  verse: { 
    words: { text: string; customColor?: string }[]; 
    tag: string;
    adlib?: string;
  };
  onDelete: (id: number) => void;
  onTagChange: (id: number, newTag: string) => void;
  onWordChange: (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => void;
  onWordColorChange: (id: number, index: number, newColor: string) => void;
  onAdlibChange?: (id: number, newAdlib: string) => void; // Tornar opcional
}

export function SortableVerseLine({
  id,
  verse,
  onDelete,
  onTagChange,
  onWordChange,
  onWordColorChange,
  onAdlibChange = () => {}, // Função padrão
}: SortableVerseLineProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: transform ? CSS.Transform.toString(transform) : "",
    transition,
    position: "relative",
  };

  // Vibrant colors for the rhymed (last) word
  const bgColorMapping: { [key: string]: string } = {
    A: "#dc2626", // red-600
    B: "#2563eb", // blue-600
    C: "#65a30d", // lime-600
    D: "#ca8a04", // yellow-600
  };
  const rhymedBgColor = bgColorMapping[verse.tag.toUpperCase()] || "#2563eb";

  // Update word text at a given index
  const updateWordAtIndex = (index: number, newText: string) => {
    const updatedWords = [...verse.words];
    updatedWords[index] = { ...updatedWords[index], text: newText };
    onWordChange(id, updatedWords);
  };

  // Insert a new empty word after a given index (-1 inserts at beginning)
  const handleInsertWord = (index: number) => {
    const updatedWords = [...verse.words];
    updatedWords.splice(index + 1, 0, { text: "" });
    onWordChange(id, updatedWords);
  };

  // Remove word at a given index
  const handleRemoveWord = (index: number) => {
    const updatedWords = [...verse.words];
    updatedWords.splice(index, 1);
    onWordChange(id, updatedWords);
  };

  return (
    <div ref={setNodeRef} style={style} className="border p-2 rounded mb-2">
      {/* ADLIB input in the top-right corner */}
      <input
        type="text"
        placeholder="ADLIB..."
        value={verse.adlib || ""}
        onChange={(e) => onAdlibChange(id, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className="absolute font-extrabold top-1 right-1 text-sm p-2 border-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Drag handle and verse tag */}
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-move">
          <VerseTag tag={verse.tag} onChange={(newTag) => onTagChange(id, newTag)} />
        </div>

        <div className="flex flex-wrap items-center gap-1">
          {/* Insert button before the first word */}
          <button
            onClick={() => handleInsertWord(-1)}
            className="text-green-500 text-xs px-1"
            title="Inserir palavra no início"
          >
            +
          </button>

          {verse.words.map((wordObj, idx) => (
            <React.Fragment key={idx}>
              <WordTag
                word={wordObj.text}
                color={wordObj.customColor}
                isRhymed={idx === verse.words.length - 1}
                onChange={(newWord) => updateWordAtIndex(idx, newWord)}
                onColorChange={(newColor) => onWordColorChange(id, idx, newColor)}
                onRemove={() => handleRemoveWord(idx)}
                rhymedColor={idx === verse.words.length - 1 ? rhymedBgColor : undefined}
              />
              {/* Insert button between words */}
              <button
                onClick={() => handleInsertWord(idx)}
                className="text-green-500 text-xs px-1"
                title="Inserir nova palavra aqui"
              >
                +
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Delete verse button */}
      <div className="mt-1 text-right">
        <Button variant="ghost" size="icon" onClick={() => onDelete(id)} title="Deletar estrofe">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

please put the sortability back

4. in arquitetura dramaturgica.

add also all the usable/arsenal elements, like: epilogo, prefácio, pósfacio and more if im missing one:

add tooltips or (i )(information)) button that displays with a good ui the meaning of each one, or you can add instructions when the user serlect one dramaturagical option on the display of selected items, explaining brifly wjat the user will do in this specific estrofe, and a ver mais option that actually shows the whole definicion:

Qual a diferença entre prólogo, epílogo, prefácio e posfácio?
Rodrigo Capoia
abril 11, 2025
Dicas de escrita
A estrutura de um livro vai além do seu texto principal, sendo composta por diversas partes. Esses elementos ajudam a complementar a obra e aprofundar o envolvimento do leitor. Alguns dos mais conhecidos, mas também mais mal utilizados, são o prólogo, o epílogo, o posfácio e o prefácio. 

Apesar dos nomes semelhantes entre si, esses textos possuem funções e posições completamente distintas em um livro.

Justamente por soarem similares, muitos leitores e até mesmo autores os confundem, colocando um no lugar do outro.

Apesar de não serem obrigatórios, elevam o valor de uma obra, permitindo ao leitor um maior entendimento acerca de seus temas, personagens, enredo e contexto. Pensando nessa importância, explicaremos as diferenças entre eles, suas finalidades e onde se encontram na estrutura de um livro.

Continue conosco e aprenda a diferenciá-los!

Índice do artigo
Qual a diferença entre prólogo, epílogo, prefácio e posfácio?
Prólogo: introduzindo o enredo
Passo-a-passo de como criar um prólogo
Exemplos de Prólogos Famosos na Literatura Mundial
Prólogo de “Romeu e Julieta” (William Shakespeare)
Prólogo de “Dom Quixote” (edições comentadas)
Epílogo: fechando o enredo
Passo-a-passo de como fazer um epílogo
Exemplos de Epílogos Famosos da Literatura Mundial
Epílogo de “O Senhor dos Anéis” (J.R.R. Tolkien)
Epílogo de “Dom Casmurro” (Machado de Assis)
Prefácio: apresentação da obra
Passo-a-passo de como fazer um prefácio
Posfácio: considerações finais sobre a obra
Passo-a-passo de como fazer um posfácio
Elementos para a estrutura de um livro
Prólogo: introduzindo o enredo
O termo prólogo surgiu do grego, prólogos, que significa “escrito preliminar”. Provém da antiguidade, no teatro grego, para dar nome à introdução dos temas que seriam apresentados na peça, ditos por um ator em nome do dramaturgo.

Na literatura, é utilizado para descrever o texto que serve como uma abertura para a história, antes do primeiro capítulo propriamente dito. É uma introdução ao tema, mundo, personagens e trama do livro, já inserindo o leitor na história, mas fora do enredo propriamente dito.

Sua maior função é ambientar os leitores, apresentando o tom e perspectiva da obra. Contextualiza o leitor dentro da narrativa, fornecendo informações importantes para o entendimento da história, podendo também apresentar os dilemas, assuntos e reflexões que serão abordados na trama.

Como o primeiro ponto de contato com a história do livro, tem também o objetivo de ser envolvente, capturando a atenção e curiosidade do leitor. Em gêneros de suspense, por exemplo, o prólogo pode ser a cena do assassinato que será investigado no decorrer da história, incitando os leitores a descobrirem o que aconteceu.

Pode conter uma cena que se passa antes da história começar de fato, um acontecimento paralelo à trama ou até mesmo algo que irá acontecer no decorrer da história. Não tem mínimo ou máximo de páginas, mas na maioria das vezes é breve e escrito pelo próprio autor.

Muitas vezes, há uma mudança entre o narrador desse texto e do restante do livro. Assim, também expande as perspectivas do livro, podendo trazer informações que o próprio protagonista desconhece.

Esse elemento dita as expectativas para o livro, tem um vínculo com a história e serve como um ponto de partida interessante para o leitor. Quando bem utilizado, enriquece a experiência de leitura, oferecendo uma introdução envolvente e natural à história que se desenrolará.

Para escrever um bom prólogo, é necessário muito planejamento. É recomendável, inclusive, apenas escrever essa parte do livro depois que todo o resto já estiver finalizado, mesmo que seja uma cena cronologicamente anterior. Assim, a coesão com o restante da história é garantida.

Passo-a-passo de como criar um prólogo
Estabeleça o Tom e o Clima: O prólogo deve definir o tom e o clima da história. Ele deve dar aos leitores uma ideia do que esperar em termos de estilo, atmosfera e temas. Use a linguagem, as imagens e a ambientação para criar o clima certo.
Introduza Elementos Essenciais: Apresente personagens, cenários, conflitos ou eventos cruciais que serão relevantes para a história principal. Isso ajuda a preparar o leitor para o que está por vir e desperta a curiosidade.
Seja Conciso: Um prólogo não deve ser muito longo. Ele deve ser breve e direto ao ponto, fornecendo apenas as informações necessárias para preparar o cenário para a história principal. Evite detalhes excessivos que possam sobrecarregar o leitor.
Mantenha a Relevância: O prólogo deve ser relevante para a história principal. Ele não deve ser uma cena aleatória ou desconectada que não contribui para o enredo geral. Certifique-se de que o prólogo esteja intimamente ligado à história que está por vir.
Desperte o Interesse: O prólogo deve despertar o interesse do leitor e deixá-lo querendo saber mais. Ele deve apresentar um mistério, um conflito ou uma pergunta que o leitor queira ver resolvido. Use o prólogo para fisgar o leitor e fazê-lo querer continuar lendo.
 
Exemplos de Prólogos Famosos na Literatura Mundial
Para ilustrar o uso de prólogos e epílogos, podemos citar alguns exemplos notáveis na literatura:

Prólogo de “Romeu e Julieta” (William Shakespeare)
O prólogo em forma de soneto antecipa o destino trágico dos amantes, criando uma atmosfera de suspense e fatalidade.

Romeu e Julieta - Exemplos e Prólogo

Prólogo de “Dom Quixote” (edições comentadas)
Muitas edições comentadas de “Dom Quixote” incluem um prólogo escrito por um especialista, que apresenta o contexto histórico, literário e cultural da obra, bem como as suas principais interpretações e influências.

Dom quixote - exemplos de prólogo

Epílogo: fechando o enredo
Epílogo é o antônimo do prólogo, ou seja, o oposto. O termo epílogo também tem origem no teatro grego, significando “conclusão”. Era utilizado para denominar a última fala de um ator ao final da peça, na qual retomava os assuntos abordados e se despedia do público.

Nos livros, denomina o texto que vem após o final da história principal, mas que ainda tem conexão com ela. É um encerramento para a história, oferecendo uma visão adicional sobre o destino dos personagens e as consequências dos eventos narrados.

Tem como função oferecer um desfecho mais completo, saciando a curiosidade de saber o que acontece depois do “felizes para sempre”. Propicia a sensação de resolução, estendendo um pouco mais o tempo do leitor com o livro e fechando a história de um modo mais satisfatório.

Também pode ser usado para amarrar as pontas soltas que ficaram pendentes no decorrer da trama. Assim, a história tem uma conclusão mais redonda, fazendo com que o leitor saia da leitura sem perguntas não respondidas.

Em séries de livros, esse elemento pode ser empregado para inserir um gancho para a próxima obra, plantando curiosidade no leitor. Outro modo de utilizar esse recurso é trazendo reflexões sobre a obra e seus impactos na vida dos personagens, retomando os temas principais do livro.

Esse texto pode conter uma cena que se passa no futuro dos personagens ou ir até mais longe, mostrando seus filhos ou netos. Também é comum haver uma mudança no ponto de vista narrativo, oferecendo uma outra perspectiva sobre a história.

Como o prólogo, não há um mínimo ou máximo de páginas, mas também costuma não se estender muito. O papel desse elemento é ser uma despedida da história, então é importante não enrolar com detalhes desnecessários e deixar que a história se finalize.

Escrever um epílogo eficiente também demanda uma dose de planejamento, principalmente no caso de séries literárias. É preciso saber equilibrar bem para entregar uma conclusão interessante, coerente e ao mesmo tempo satisfatória aos leitores.

Passo-a-passo de como fazer um epílogo
Resolva Pontas Soltas: O epílogo deve resolver quaisquer pontas soltas que possam ter restado da história principal. Ele deve amarrar quaisquer fios soltos e fornecer um senso de encerramento para o leitor.
Mostre o Que Aconteceu Depois: O epílogo deve mostrar o que aconteceu com os personagens após o término da história principal. Ele pode fornecer vislumbres de seu futuro, mostrar como eles mudaram ou revelar as consequências de suas ações.
Evite Introduzir Novos Conflitos: O epílogo não deve introduzir novos conflitos ou problemas que não foram resolvidos na história principal. Ele deve ser uma extensão natural do final e não deve deixar o leitor com mais perguntas do que respostas.
Seja Conciso: Assim como o prólogo, o epílogo deve ser conciso. Ele deve fornecer apenas as informações necessárias para concluir a história e não deve se prolongar desnecessariamente.
Mantenha a Relevância: O epílogo deve ser relevante para a história principal. Ele não deve ser uma cena aleatória ou desconectada que não contribui para o enredo geral. Certifique-se de que o epílogo esteja intimamente ligado à história que foi contada.
Deixe uma Impressão Duradoura: O epílogo deve deixar uma impressão duradoura no leitor. Ele deve ser memorável e deixar o leitor satisfeito com o final da história. Use o epílogo para reforçar os temas da história, fornecer uma mensagem final ou simplesmente dar ao leitor um último vislumbre dos personagens que ele passou a amar.
 
Exemplos de Epílogos Famosos da Literatura Mundial
Vamos a alguns exemplos de epílogos famosos de obras que ganharam grande relevância na literatura moderna.

Epílogo de “O Senhor dos Anéis” (J.R.R. Tolkien)
O epílogo mostra o retorno de Frodo à Terra Média, mas também a sua partida para as Terras Imortais, simbolizando o fim de uma era.

Senhor dos Anéis - Exemplos e Prólogo

Epílogo de “Dom Casmurro” (Machado de Assis)
O epílogo, que consiste nos últimos dois capítulos do livro, apresenta as reflexões de Dom Casmurro sobre a sua vida e as suas memórias, revelando a sua obsessão com a dúvida sobre a traição de Capitu e a sua incapacidade de superar o passado.

Dom Casmurro, exemplo de epílogo

guia completo como escrever um livro
Prefácio: apresentação da obra
Muito confundido com o prólogo, o termo prefácio tem origem do latim, sendo a junção das palavras prae (antes) e efatio (dito), significando “antes dito”. Sendo assim, é aquilo que é dito antes da história.

Serve como uma apresentação da obra, removida de sua história ou conteúdo principal. Ele é colocado antes do prólogo na estrutura do livro. Esse elemento não faz parte da narrativa, sendo mais voltado para explicações e reflexões sobre o processo de escrita em si.

Sua função é contextualizar o livro, não sua narrativa. Ou seja, traz informações sobre a criação da obra, as motivações do autor e a relevância do tema abordado. Ele prepara o leitor, esclarecendo intenções e orientando o entendimento da obra.

Serve para inserir o leitor no processo de desenvolvimento da escrita, tornando sua compreensão da obra mais profunda e multifacetada. Em livros clássicos, por exemplo, normalmente há um prefácio que explica o contexto histórico no qual foram escritos, sua importância para a literatura e uma breve biografia do autor. 

Caso seja escrito pelo próprio autor, é uma conversa direta com o leitor, uma oportunidade para explicar as inspirações e o porquê do livro. Em obras de não-ficção, como livros acadêmicos e de carreira, é comum utilizar este espaço para apresentar as qualificações e motivações pessoais do autor.

Também pode ser desenvolvido por alguém convidado, como um colega escritor ou um familiar. No caso de livros renomados, pode-se trazer um acadêmico que estudou a obra à fundo para apresentá-la aos novos leitores, trazendo não só informações como curiosidades sobre o livro, seu período de escrita e seu escritor.

Não é um lugar para fazer promessas grandiosas sobre a obra, colocar informações que não agregam à compreensão do leitor ou fazer uma dedicatória. Não há limite de páginas, mas não deve ser cansativo ou maçante.

Um bom prefácio oferece algo de valor aos seus leitores, enriquecendo a compreensão da obra como um todo. Ao explicar o momento, inspirações e ideias iniciais para o livro, também instiga o leitor, que fica curioso para descobrir como tudo isso irá se traduzir para a obra.

Passo-a-passo de como fazer um prefácio
Apresente o Livro: O prefácio deve começar apresentando o livro ao leitor. Descreva brevemente o tema, o propósito e o público-alvo do livro. Isso ajudará o leitor a entender o contexto e as expectativas da obra.
Compartilhe a Inspiração: Conte um pouco sobre a inspiração por trás do livro. Explique o que motivou você a escrever sobre esse tema e quais experiências ou ideias o levaram a criar essa obra. Isso adiciona um toque pessoal e conecta o leitor ao autor.
Explique o Processo: Se houver algo interessante sobre o processo de escrita ou pesquisa do livro, compartilhe-o no prefácio. Isso pode incluir desafios superados, descobertas inesperadas ou colaborações importantes.
Agradeça: Use o prefácio para agradecer às pessoas que o apoiaram durante a criação do livro. Mencione editores, revisores, amigos, familiares ou qualquer pessoa que tenha contribuído para o sucesso da obra.
Destaque a Importância: Explique por que o tema do livro é importante e relevante para o leitor. Mostre como a obra pode contribuir para o conhecimento, a compreensão ou a transformação pessoal do leitor.
Defina as Expectativas: O prefácio pode ser usado para definir as expectativas do leitor em relação ao livro. Informe sobre o estilo de escrita, a estrutura da obra e os principais argumentos ou temas que serão abordados.
Convide à Leitura: Finalize o prefácio convidando o leitor a mergulhar na leitura do livro. Incentive-o a explorar as ideias, a refletir sobre os temas e a aproveitar a jornada que a obra oferece.
 
Posfácio: considerações finais sobre a obra
Similar ao prefácio, pode ser considerado seu antônimo. O termo também tem origem no latim, sendo a junção das palavras post (depois) e efatio (dito), significando “depois dito”. Dessa maneira, é aquilo que vem após a história.

É uma conclusão para a obra, oferecendo uma análise, retomada, reflexões ou comentários sobre o que foi abordado no decorrer do livro. Na ordem dos elementos, vem depois do epílogo. Portanto, não é uma continuação da história, estando removido do texto principal.

Sua principal função é oferecer uma retrospectiva sobre o livro, discutindo seus impactos, implicações culturais ou até mesmo recepção crítica. Como o prefácio, oferece contexto sobre o livro, trazendo informações que estão fora do âmbito narrativo, sobre processo de escrita, momento histórico e vida do autor.

Diferente do prefácio, porém, o posfácio pode abordar a fundo algumas escolhas narrativas, discutir o final com mais abertura e esclarecer qualquer questão sobre o desenvolvimento da obra. É uma oportunidade para refletir e retomar a narrativa, ao invés de apresentá-la.

Em livros clássicos, é comum trazer especialistas para falar sobre o impacto da obra na época que foi lançada e suas influências na literatura atual. Com essas informações, o leitor se despede da leitura com uma compreensão mais aprofundada sobre seu contexto histórico e cultural.

Também pode ser o momento para o autor escancarar seu processo de escrita para o leitor, trazendo rascunhos, versões cortadas e finais alternativos. Assim, oferece informações relevantes sobre a construção da obra e a perspectiva do próprio autor sobre sua criação.

Não há nenhum limite de páginas, mas não deve ser muito extenso, cansativo ou maçante. Afinal, o conteúdo principal já acabou, essas são informações extras que devem ser interessantes ou necessárias para o entendimento da obra.

Um posfácio eficaz fornece uma compreensão aprofundada sobre a obra e seu desenvolvimento para o leitor, balanceando informação e interesse. Quando bem realizado, faz com que o livro se torne mais tridimensional, inserindo-o em um contexto e concluindo a obra satisfatoriamente.

Passo-a-passo de como fazer um posfácio
Reflexão sobre a Obra: Comece o posfácio com uma reflexão sobre a obra em si. Analise os principais temas, as mensagens centrais e os objetivos que você tinha ao escrevê-la. Compartilhe sua perspectiva sobre o que a obra representa e o que você espera que ela provoque nos leitores.
Contextualização Adicional: Use o posfácio para fornecer informações adicionais sobre o contexto da obra. Explique o que o inspirou a escrever sobre esse tema, quais foram suas fontes de pesquisa e como você abordou o processo de criação. Isso pode enriquecer a compreensão do leitor e adicionar camadas de significado à obra.
Agradecimentos e Reconhecimentos: Aproveite o posfácio para agradecer às pessoas que o apoiaram durante a criação da obra. Mencione editores, revisores, amigos, familiares ou qualquer pessoa que tenha contribuído para o sucesso do projeto. Reconheça o valor de sua colaboração e expresse sua gratidão.
Considerações Finais: Use o posfácio para compartilhar suas considerações finais sobre a obra. Explique o que você aprendeu ao escrevê-la, como ela o transformou como autor e quais são suas esperanças para o futuro da obra. Isso pode adicionar um toque pessoal e emocional ao posfácio.
Conexão com o Leitor: O posfácio é uma oportunidade de se conectar com o leitor em um nível mais profundo. Compartilhe suas emoções, suas dúvidas e suas expectativas em relação à obra. Convide o leitor a refletir sobre os temas abordados e a compartilhar suas próprias experiências e perspectivas.
Chamada à Ação: Finalize o posfácio com uma chamada à ação. Incentive o leitor a continuar explorando os temas abordados na obra, a compartilhar suas ideias com outras pessoas e a aplicar o que aprendeu em sua própria vida. Isso pode inspirar o leitor a agir e a fazer a diferença no mundo.
 
 
Elementos para a estrutura de um livro
Como você pode ver, cada elemento do livro tem sua importância e função. Apesar de não serem obrigatórios para a construção de um livro, podem agregar muito à obra, fazendo com que o leitor se envolva mais com a leitura.

Esperamos que, a partir desse conteúdo, as diferenças entre prólogo, epílogo, prefácio e posfácio tenham se tornado mais evidentes para você. Com esse conhecimento, você tem mais ferramentas para desenvolver esses elementos em seu próprio livro!

Quando terminar de lapidar esses elementos em seu livro, não deixe de nos enviar seu original finalizado. Assim que recebermos seu material, mandaremos uma avaliação editorial gratuita e uma proposta de publicação personalizada para você e sua obra.

Continue acompanhando o Blog da Viseu para mais dicas de escrita, publicação e entrevistas com autores. Nos vemos no próximo conteúdo!


prólogo
substantivo masculino
1.
teatro
em uma peça teatral, cena ou monólogo iniciais, em que ger. são dados elementos precedentes ou elucidativos da trama que se vai desenrolar.
2.
história do teatro
no antigo teatro grego, a primeira parte da tragédia, em forma de diálogo entre personagens ou monólogo, na qual se fazia a exposição do tema da tragédia.
---

5. IN THE OLD VERSE MECHANISM THE LAST WORD WAS COLORED , I WANT TO KEEP THAT TOO, PLEASE BASED ON THE REFERENCE CODE, BRING IT BACK


6. THIS THIS IS REALLY PISSING ME OFF IM ALMOST BREAKING MY COMPUTER FOR THIS AND KILL MYSELF DSO PLEEEEEEEEEEEEEEEEEAAASEE DO THIS :

WHE I ADD A VERSE/SENTENCE, WHEN I WANT TO REMOVE A SPECIFIC WORD AN CLICK THE X (DELETE WORD) BUTTON IT REMOS ALWAYS THE LAST WORD OF THE SENTENCE AND NOT THE INTENED ONE.

i.E: vERSE ADDED: EU COMO MUITO BEM SEMPRE, WHEN GO TO REMOVE, LETS SAY MUITO, AND PRESS THE X OF MUITO, IT REMOVES THE "SEMPRE", EU COMO MUITO BEM , THEM I DO AGIN ON MUITO AND IT REMOVES "BEM", NO, I JUST WANT THE INTENDED WORD TO GO THAT IT,

ALSO IF POSSIBLE INSIDE THE SAME CODE, I WANT ALSO SORTABILITY HORIZONTALLY, 

I.E: vERSE ADDED: EU COMO MUITO BEM SEMPRE, I WANT TO BE ABLE TO SWAP A WORD HORIZONTALLY AND THE PUSSH SEMPRE IN FRONT OF COMO, AND IT STAYS, "EU COMO SEMPRE MUITO BEM" U GET ME?


7. I WANT THE SCROLL TO AUTOMATICALLY FOLLOW THE CREATED ESTROFES SO I DONT HAVE TO CONSTANTLY GO DOWN AS I CREATE NEW ESTROFES OR ANY CARD THAT CAN BE ADDED MORE MORE AND MORE


8. ON THE ADICIONAR LETRA COMPLETA, I LOVE THAT FEATURE, BUT I WANT THAT THE SCANNED WHOLE RHYME CAN BE DEVIDED INTO ESTROFES AUTOMATICALLY TOO, AND THATS HOW WE WILL DO: WHEN THE USER PASTE THE LYRICS, IF THERE IS EMPTY LINES, LIKE A EMPTY LINE THAT IS NOMALLY USED TO SEPARATE ESTRFES, IF THE PASTED LIRIC CONTAINS THOSES EMPTY LINES, THAT MEANS THAT IS THE TRIGGER THAT A NEW ESTROFE YOU BE CREATED, TO AVOID A CLUTTER IN THE SAME ESTROFE

9. I WANT THAT THE Figuras Literárias TO BE ESTROEFE ORIENTED WHICH IS ALREADY GOOD SO NO TOUCHING, BUT I ALSO WANT THE USER TO CHOOSE THE RIGHT FIGURA FOR EACH VERSE, JUST LIKE HE CAN CHOOSE ITS VOICE.

10. IN THE PDF, INCLUD AS MUCH DETAIS POSSIBLE, LIKE THE VOICE TYPE TOO, AND THE CHOSEN : Figuras Literárias
Metáfora
Símile
Hipérbole
Ironia
Aliteração
Prosopopeia
Onomatopeia
Eufemismo
Antítese
Paradoxo
Arquitetura Dramática

Prólogo
Métrica Selecionada:
trocaico

Voz Selecionada:
Voz Normal

Figuras Ativas:
Nenhuma figura selecionada


11: HERE IS THE REFERENCE CODE WHERE TH EOLD REMOVED FEATURES USED TO BE:

"use client";

import React, { useState, ChangeEvent } from "react";
import Link from "next/link";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSidebar } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { analyzeMeter } from "@/lib/analyzeMeter";
import { Input } from "@/components/ui/input";

/* ------------------- VerseTag Component -------------------
   Renders a select dropdown with options A, B, C, D.
   The dropdown has increased padding and rounded corners,
   and its border color is determined by the selected tag.
--------------------------------------------------------------- */
function VerseTag({
  tag,
  onChange,
}: {
  tag: string;
  onChange: (newTag: string) => void;
}) {
  const colorMapping: { [key: string]: string } = {
    A: "border-red-500",
    B: "border-blue-500",
    C: "border-lime-500",
    D: "border-yellow-500",
  };
  const borderColor = colorMapping[tag.toUpperCase()] || "border-gray-300";
  return (
    <select
      value={tag}
      onChange={(e) => onChange(e.target.value)}
      className={`w-12 text-center text-base px-3 py-2 border-2 ${borderColor} rounded-full`}
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>
  );
}

/* ------------------- WordTag Component -------------------
   Renders each word as an editable tag.
   • Clicking the text toggles editing.
   • A small color picker is always visible so the user
     can change the background color.
   • If a custom color is set, it overrides the default.
   • For the rhymed (last) word, if no custom color is set,
     it falls back to the VerseTag’s matching color.
------------------------------------------------------------- */
function WordTag({
  word,
  color,
  isRhymed,
  onChange,
  onColorChange,
  rhymedColor,
}: {
  word: string;
  color?: string;
  isRhymed: boolean;
  onChange: (newWord: string) => void;
  onColorChange: (newColor: string) => void;
  rhymedColor?: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(word);

  const effectiveColor = color
    ? color
    : isRhymed && rhymedColor
    ? rhymedColor
    : "#e5e7eb"; // Tailwind's gray-200

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setIsEditing(false);
      onChange(value);
    }
  };

  return (
    <div
      className="inline-flex items-center m-1 p-1 border rounded cursor-pointer"
      style={{ backgroundColor: effectiveColor }}
    >
      {isEditing ? (
        <input
          className="bg-transparent outline-none px-1"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            onChange(value);
          }}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      ) : (
        <span onClick={() => setIsEditing(true)} className="px-1">
          {value}
        </span>
      )}
      <input
        type="color"
        value={color || "#ffffff"}
        onChange={(e) => onColorChange(e.target.value)}
        className="w-6 h-6 p-0 border-0 ml-1 cursor-pointer"
      />
    </div>
  );
}

/* ------------------- SortableVerseLine Component -------------------
   Renders a draggable verse line. It uses a VerseTag select for
   the label and maps over an array of word objects.
   Each word is rendered as a WordTag. The last word (rhymed) gets a
   background matching the VerseTag’s color if not customized.
------------------------------------------------------------------------- */
function SortableVerseLine({
  id,
  verse,
  onDelete,
  onTagChange,
  onWordChange,
  onWordColorChange,
}: {
  id: number;
  verse: { words: { text: string; customColor?: string }[]; tag: string };
  onDelete: (id: number) => void;
  onTagChange: (id: number, newTag: string) => void;
  onWordChange: (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => void;
  onWordColorChange: (
    id: number,
    index: number,
    newColor: string
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });
  const style = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : "",
    transition,
  };

  const bgColorMapping: { [key: string]: string } = {
    A: "#ef4444", // red-500
    B: "#3b82f6", // blue-500
    C: "#84cc16", // lime-500
    D: "#eab308", // yellow-500
  };
  const rhymedBgColor =
    bgColorMapping[verse.tag.toUpperCase()] || "#3b82f6"; // default blue

  const updateWordAtIndex = (index: number, newText: string) => {
    const updatedWords = [...verse.words];
    updatedWords[index] = { ...updatedWords[index], text: newText };
    onWordChange(id, updatedWords);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between border p-2 rounded"
    >
      <div className="flex items-center gap-2">
        <div {...listeners} {...attributes} className="cursor-move">
          <VerseTag
            tag={verse.tag}
            onChange={(newTag) => onTagChange(id, newTag)}
          />
        </div>
        <div className="flex flex-wrap">
          {verse.words.map((wordObj, idx) => (
            <WordTag
              key={idx}
              word={wordObj.text}
              color={wordObj.customColor}
              isRhymed={idx === verse.words.length - 1}
              onChange={(newWord) => updateWordAtIndex(idx, newWord)}
              onColorChange={(newColor) => onWordColorChange(id, idx, newColor)}
              rhymedColor={
                idx === verse.words.length - 1 ? rhymedBgColor : undefined
              }
            />
          ))}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={() => onDelete(id)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

/* ------------------- AddNewVerseInline Component -------------------
   Renders an inline input. When the user presses Enter,
   the input text is split into words and saved as an array of word objects.
------------------------------------------------------------------------- */
function AddNewVerseInline({
  addNewVerse,
}: {
  addNewVerse: (words: { text: string; customColor?: string }[]) => void;
}) {
  const [verseText, setVerseText] = useState("");
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && verseText.trim() !== "") {
      const words = verseText
        .split(" ")
        .filter((w) => w.length > 0)
        .map((w) => ({ text: w }));
      addNewVerse(words);
      setVerseText("");
    }
  };

  return (
    <input
      type="text"
      value={verseText}
      onChange={(e) => setVerseText(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Digite o verso e pressione Enter"
      className="border p-2 rounded w-full"
    />
  );
}

/* ------------------- VerseCard Component -------------------
   Manages an array of verses. Each verse now has:
     - words: an array of { text, customColor }
     - tag: a letter (A, B, C, or D)
   New verses get their default tag by cycling through A, B, C, D.
----------------------------------------------------------------- */
function VerseCard({ index }: { index: number }) {
  const [verses, setVerses] = useState<
    { id: number; words: { text: string; customColor?: string }[]; tag: string }[]
  >([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState<boolean>(false);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const pointerSensor = useSensor(PointerSensor);
  const sensors = useSensors(keyboardSensor, pointerSensor);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setVerses((prev) => {
        const oldIndex = prev.findIndex((v) => v.id === active.id);
        const newIndex = prev.findIndex((v) => v.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const defaultTagCycle = ["A", "B", "C", "D"];
  const addNewVerse = (words: { text: string; customColor?: string }[]) => {
    const newTag = defaultTagCycle[verses.length % defaultTagCycle.length];
    const newVerse = { id: Date.now(), words, tag: newTag };
    setVerses((prev) => [...prev, newVerse]);
  };

  const deleteVerse = (id: number) => {
    setVerses((prev) => prev.filter((v) => v.id !== id));
  };

  const updateVerseWords = (
    id: number,
    newWords: { text: string; customColor?: string }[]
  ) => {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, words: newWords } : v))
    );
  };

  const updateVerseTag = (id: number, newTag: string) => {
    setVerses((prev) =>
      prev.map((v) => (v.id === id ? { ...v, tag: newTag } : v))
    );
  };

  const updateWordColor = (
    id: number,
    index: number,
    newColor: string
  ) => {
    setVerses((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const updatedWords = [...v.words];
          updatedWords[index] = {
            ...updatedWords[index],
            customColor: newColor,
          };
          return { ...v, words: updatedWords };
        }
        return v;
      })
    );
  };

  async function handleAnalyze() {
    const lines = verses.map((verse) =>
      verse.words.map((w) => w.text).join(" ")
    );
    try {
      const result = await analyzeMeter(lines);
      setAnalysisResult(result);
      setShowAnalysis(true);
    } catch (error) {
      console.error("Error analyzing meter:", error);
    }
  }

  return (
    <div className="border p-4 rounded mb-4">
      <h2 className="text-xl font-bold mb-2">Estrofe {index}</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      >
        <SortableContext
          items={verses.map((v) => v.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {verses.map((verse) => (
              <SortableVerseLine
                key={verse.id}
                id={verse.id}
                verse={verse}
                onDelete={deleteVerse}
                onTagChange={updateVerseTag}
                onWordChange={updateVerseWords}
                onWordColorChange={updateWordColor}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <div className="mt-4">
        <AddNewVerseInline addNewVerse={addNewVerse} />
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex gap-2">
          <Button onClick={handleAnalyze} className="bg-green-500 text-white">
            Analyze Meter
          </Button>
          {showAnalysis && (
            <Button
              onClick={() => {
                setShowAnalysis(false);
                setAnalysisResult(null);
              }}
              className="bg-red-500 text-white"
            >
              Hide Meter
            </Button>
          )}
        </div>
        {showAnalysis && analysisResult && (
          <div className="mt-2">
            <p className="text-sm font-semibold">
              Meter: {analysisResult.meter}
            </p>
            {analysisResult.original_lines.map((line: string, idx: number) => (
              <div key={idx} className="mt-1 p-2 border rounded">
                <p className="text-sm">
                  Line {idx + 1}: {line} (Total syllables:{" "}
                  {analysisResult.word_details[idx].total_syllables})
                </p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.word_details[idx].details.map(
                    (
                      detail: {
                        word: string;
                        syllable_breakdown: string;
                        scansion: string;
                        syllable_count: number;
                      },
                      wIdx: number
                    ) => (
                      <div key={wIdx} className="text-xs p-1 border rounded">
                        <div>{detail.word}</div>
                        <div className="font-mono">
                          {detail.syllable_breakdown} ({detail.scansion})
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------- DashboardPage Component -------------------
   Manages multiple stanzas (VerseCards).
------------------------------------------------------------------- */
export default function DashboardPage() {
  const sidebar = useSidebar();
  if (!sidebar) return <div>Loading...</div>;
  const { settings, setSettings } = sidebar;
  const [cards, setCards] = useState<number[]>([Date.now()]);
  const addNewCard = () => {
    setCards((prev) => [...prev, Date.now()]);
  };
  const removeCard = () => {
    setCards((prev) => (prev.length ? prev.slice(0, prev.length - 1) : prev));
  };

  return (
    <ContentLayout title="Dashboard">
      <AdminPanelLayout rightSidebar={<Sidebar />}>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Versificaçao</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <TooltipProvider>
          <div className="flex gap-6 mt-6">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is-hover-open"
                    onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                    checked={settings.isHoverOpen}
                  />
                  <Label htmlFor="is-hover-open">Abertura Subtíl</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Quando encostares o Mouse à esquerda, a barra de lado
                  mostrar-se-á.
                </p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="disable-sidebar"
                    onCheckedChange={(x) => setSettings({ disabled: x })}
                    checked={settings.disabled}
                  />
                  <Label htmlFor="disable-sidebar">Desativar Sidebar</Label>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Esconder a sidebar</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="pt-4 gap-4">
          {cards.map((cardId, idx) => (
            <VerseCard key={cardId} index={idx + 1} />
          ))}
          <div className="flex justify-center gap-4">
            <Button onClick={addNewCard} className="bg-blue-500 text-white">
              Add New Estrofe
            </Button>
            <Button onClick={removeCard} className="bg-red-500 text-white">
              Remove Last Estrofe
            </Button>
          </div>
        </div>
      </AdminPanelLayout>
    </ContentLayout>
  );
}




-------
SAME RULES: 
SAME RULES:
I want you to migrate ALL imports, consts, interfaces, logic, and UI into ONE single standalone component file. I want EVERYTHING needed to run the component in that file — all hooks, styles, logic, UI, helper functions — everything. Do not leave anything external.

Do this without changing the frontend behavior or visual output.

And listen:
DO NOT SKIP ANYTHING.
DO NOT use // the rest of the logic, /* component here */, ...rest, or any placeholder. I want THE WHOLE RAW CODE of the component, top to bottom.

Write the full code with the actual component name as a title, and make sure it's copy-paste ready with no dependencies hidden or missing.

This is a migration/refactor task — I need it CLEAN, ABSOLUTE, FULL. I don't care how long the code is, output the entire code block without summarizing.

You are allowed to increase output length if needed.

After this part, I also want a new addition: each verse I add should automatically generate a new cinematographic block, visually distinct, and optionally include a 5-second reference video or image (even placeholder is fine) to show what should be displayed visually during that verse. Treat each verse as its own cinematographic shot, not just text.

Got it? Now go. No skipping.
FULL MIGRATION PROMPT (USE EXACTLY THIS STRUCTURE):

1. I want to migrate everything (interfaces, constants, logic, handlers, and utility functions) that VerseCard and all other related components need into one file: `Dashboard.tsx`. That includes:
   - All needed `imports`
   - All `interfaces`, `types`, and `constants`
   - All `handlers`, `functions`, and `state logic`

2. The goal is: one self-contained component file (`Dashboard.tsx`) that fully renders the app exactly like before. **No visual or frontend logic change**. 100% identical to how it looks now, but all logic is centralized.

3. IMPORTANT RULES:
   - No snippet skipping. I want the **full code** of each component, including `VerseCard`, `Dashboard`, or any other helper component it needs.
   - Don’t say things like:  
     `// ...rest of the logic`  
     `// Remaining JSX`  
     Or even: `{/* UI elements here */}`  
     I want the actual, literal, working code.

4. All helper components must also be inlined inside the `Dashboard.tsx` file (for now).

5. After each verse is added, I want it to **auto-write** itself (like the "live update" from Cinematografia's documentation).
   - Additionally, I want to assign a reference media (5s video or a picture placeholder) with each verse.
   - Each verse will have a **different visual** presentation style.
   - Example: `VerseCard` dynamically updates the UI with new visuals and media.

6. FINAL OUTPUT:
   - A single `.tsx` file (`Dashboard.tsx`)
   - All code included.
   - Fully working, no errors.
   - Nothing is omitted or abbreviated.

7. Don't explain anything. Just give me the **full code**, top to bottom.




when fixed please give me the whole full raw code, i really struggle when you ad "xxx keep the same imports or codes", and that is prone to break the code even more, just giveme the full code so i just copy and paste, no skip lines or snippets, whole fixed code with the included features, Move the imports to the dashboard, the conts and interfasces, everything EVRYTHING needed to achive 3 on 1 component, everything looks good, make this migration withouth changing anything frontend visually, and please gvie me the whole code, dont do those xxx remain the same, I WANT THE WHOLE FUCKING CODE SO I JUST COPY AND PASTE WITH NO ERROR, dont please do things like:   // ... rest of the VerseCard logic ...,       {/* VerseCard UI elements here */} or any other thing like that, actually put the component an draw code of the fucking components , no skipping with me give me the RAW FULL CODE NO SKIPS, OTHERVISE IT LOOKS UNFINISHED, THATS WHY I GAVE YOU THE WHOLE CODES, WHY U NOT DOING THE SAME WITH ME , DONT ALTER NOTHING IN THE UI I LOVE THE CODE, JUST DO THE CINEMATOGRAFIA THING IM ASKING SPECIFICALLY