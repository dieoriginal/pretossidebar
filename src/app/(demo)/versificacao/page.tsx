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

const featuringOptions = ["Zara G", "YuriNR5", "Sippinpurp", "YUZI", "YunLilo"];

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
                className="text-2xl font-bold uppercase border-none"
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