"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Upload, 
  Music, 
  DollarSign,
  Tag,
  FileAudio,
  Plus,
  X,
  Info,
  Save,
  Trash2
} from "lucide-react";

interface LicenseTier {
  name: string; // e.g., "MP3 Lease", "WAV Lease", "Exclusive"
  price: number;
  description: string;
  includes: string[]; // e.g., ["Untagged MP3", "Commercial use"]
}

interface BeatData {
  title: string;
  description: string;
  genre: string;
  bpm: number;
  key: string;
  tags: string[];
  audioFile: File | null;
  coverArt: File | null;
  licenseTiers: LicenseTier[];
  price: number; // Base price
  isFree: boolean;
  producerName: string;
}

const MultiStepper: React.FC<{
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}> = ({ steps, currentStep, onStepClick }) => {
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col gap-4 w-full overflow-x-auto">
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div key={step.name} className="flex flex-col items-center flex-1 min-w-[80px]">
            <div className="flex items-center w-full">
              <button
                type="button"
                onClick={() => onStepClick && onStepClick(index)}
                className="flex items-center w-full focus:outline-none"
              >
                <Tooltip>
                  <TooltipTrigger>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-medium transition-colors duration-300 ${
                        index <= currentStep
                          ? "bg-primary text-white border-primary shadow-lg"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {step.icon}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              </button>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-1 border-t-2 ${
                    index < currentStep ? "bg-primary border-primary" : "bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-600"
                  } mx-2`}
                ></div>
              )}
            </div>
            <span className="mt-2 text-xs text-center font-medium">{step.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface Step {
  name: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  icon: React.ReactNode;
}

export default function BeatUploadPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [beatData, setBeatData] = useState<BeatData>({
    title: "",
    description: "",
    genre: "",
    bpm: 0,
    key: "",
    tags: [],
    audioFile: null,
    coverArt: null,
    licenseTiers: [],
    price: 0,
    isFree: false,
    producerName: "",
  });
  const [newTag, setNewTag] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const steps: Step[] = [
    { 
      name: "Info Básica", 
      description: "Detalhes do beat",
      status: "completed",
      icon: <Music className="w-4 h-4" />
    },
    { 
      name: "Upload", 
      description: "Arquivos de áudio e arte",
      status: "current",
      icon: <Upload className="w-4 h-4" />
    },
    { 
      name: "Licenças", 
      description: "Preços e tiers de licença",
      status: "upcoming",
      icon: <DollarSign className="w-4 h-4" />
    },
    { 
      name: "Tags & SEO", 
      description: "Tags e otimização",
      status: "upcoming",
      icon: <Tag className="w-4 h-4" />
    },
  ];

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "audio" | "cover") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "audio") {
        setBeatData(prev => ({ ...prev, audioFile: file }));
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setBeatData(prev => ({ ...prev, coverArt: file }));
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !beatData.tags.includes(newTag.trim())) {
      setBeatData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setBeatData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const addLicenseTier = () => {
    setBeatData(prev => ({
      ...prev,
      licenseTiers: [...prev.licenseTiers, { name: "", price: 0, description: "", includes: [] }]
    }));
  };

  const updateLicenseTier = (index: number, field: keyof LicenseTier, value: string | number | string[]) => {
    const newTiers = [...beatData.licenseTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setBeatData(prev => ({ ...prev, licenseTiers: newTiers }));
  };

  const removeLicenseTier = (index: number) => {
    setBeatData(prev => ({
      ...prev,
      licenseTiers: prev.licenseTiers.filter((_, i) => i !== index)
    }));
  };

  const handleUpload = async () => {
    // Simulate upload to backend
    // In real scenario, use FormData and fetch/axios to send to server
    if (!beatData.audioFile) {
      alert("Por favor, selecione um arquivo de áudio.");
      return;
    }

    const formData = new FormData();
    formData.append("title", beatData.title);
    formData.append("description", beatData.description);
    formData.append("genre", beatData.genre);
    formData.append("bpm", beatData.bpm.toString());
    formData.append("key", beatData.key);
    formData.append("tags", JSON.stringify(beatData.tags));
    formData.append("audio", beatData.audioFile);
    if (beatData.coverArt) formData.append("cover", beatData.coverArt);
    formData.append("licenseTiers", JSON.stringify(beatData.licenseTiers));
    formData.append("price", beatData.price.toString());
    formData.append("isFree", beatData.isFree.toString());
    formData.append("producerName", beatData.producerName);

    // Example fetch (replace with your backend endpoint)
    // await fetch("/api/upload-beat", {
    //   method: "POST",
    //   body: formData,
    // });

    alert("Beat uploaded successfully! (Simulated)");
    // Reset form if needed
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Info Básica
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Título do Beat</Label>
                <Input
                  id="title"
                  value={beatData.title}
                  onChange={(e) => setBeatData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Dark Trap Beat"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="producerName">Nome do Produtor</Label>
                <Input
                  id="producerName"
                  value={beatData.producerName}
                  onChange={(e) => setBeatData(prev => ({ ...prev, producerName: e.target.value }))}
                  placeholder="Ex: Diepretty Mercédes"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="genre">Gênero</Label>
                <Select
                  value={beatData.genre}
                  onValueChange={(value) => setBeatData(prev => ({ ...prev, genre: value }))}
                >
                  <SelectTrigger className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400">
                    <SelectValue placeholder="Selecionar gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hiphop">Hip-Hop</SelectItem>
                    <SelectItem value="trap">Trap</SelectItem>
                    <SelectItem value="rnb">R&B</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="edm">EDM</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bpm">BPM</Label>
                <Input
                  id="bpm"
                  type="number"
                  value={beatData.bpm}
                  onChange={(e) => setBeatData(prev => ({ ...prev, bpm: parseInt(e.target.value) || 0 }))}
                  placeholder="Ex: 140"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div>
                <Label htmlFor="key">Key</Label>
                <Input
                  id="key"
                  value={beatData.key}
                  onChange={(e) => setBeatData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="Ex: C Minor"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="isFree" 
                  checked={beatData.isFree} 
                  onCheckedChange={(checked) => setBeatData(prev => ({ ...prev, isFree: Boolean(checked) }))} 
                />
                <Label htmlFor="isFree">Beat Gratuito (Free Download)</Label>
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={beatData.description}
                onChange={(e) => setBeatData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o beat, mood, uso sugerido..."
                rows={4}
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
          </div>
        );

      case 1: // Upload
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="audioFile">Upload do Beat (Áudio)</Label>
                <Input
                  id="audioFile"
                  type="file"
                  accept="audio/*"
                  onChange={(e) => handleFileChange(e, "audio")}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                {previewUrl && (
                  <audio controls className="mt-2 w-full">
                    <source src={previewUrl} type="audio/mpeg" />
                    Seu navegador não suporta áudio.
                  </audio>
                )}
              </div>
              <div>
                <Label htmlFor="coverArt">Upload da Capa (Arte)</Label>
                <Input
                  id="coverArt"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "cover")}
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                {beatData.coverArt && (
                  <img 
                    src={URL.createObjectURL(beatData.coverArt)} 
                    alt="Preview" 
                    className="mt-2 w-32 h-32 object-cover rounded" 
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 2: // Licenças
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="basePrice">Preço Base (€)</Label>
              <Input
                id="basePrice"
                type="number"
                value={beatData.price}
                onChange={(e) => setBeatData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                placeholder="Preço inicial para licença básica"
                className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
              />
            </div>
            <div>
              <Label>Tiers de Licença</Label>
              <div className="space-y-4">
                {beatData.licenseTiers.map((tier, index) => (
                  <Card key={index} className="p-4 border-2 border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                      <Input
                        value={tier.name}
                        onChange={(e) => updateLicenseTier(index, "name", e.target.value)}
                        placeholder="Nome do Tier (ex: MP3 Lease)"
                      />
                      <Input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateLicenseTier(index, "price", parseInt(e.target.value) || 0)}
                        placeholder="Preço (€)"
                      />
                      <Textarea
                        value={tier.description}
                        onChange={(e) => updateLicenseTier(index, "description", e.target.value)}
                        placeholder="Descrição do que inclui"
                        rows={3}
                      />
                      <div>
                        <Label>Inclui:</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {tier.includes.map((item, i) => (
                            <Badge key={i} variant="secondary" className="flex items-center gap-1">
                              {item}
                              <X className="w-3 h-3 cursor-pointer" onClick={() => {
                                const newIncludes = tier.includes.filter((_, idx) => idx !== i);
                                updateLicenseTier(index, "includes", newIncludes);
                              }} />
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Input
                            placeholder="Adicionar item (ex: Untagged MP3)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                const newIncludes = [...tier.includes, e.currentTarget.value.trim()];
                                updateLicenseTier(index, "includes", newIncludes);
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeLicenseTier(index)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover Tier
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="outline"
                  onClick={addLicenseTier}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Tier de Licença
                </Button>
              </div>
            </div>
          </div>
        );

      case 3: // Tags & SEO
        return (
          <div className="space-y-6">
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addTag();
                      e.preventDefault();
                    }
                  }}
                  placeholder="Adicionar tag (ex: trap, dark)"
                  className="border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400"
                />
                <Button onClick={addTag} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Adicionar
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {beatData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div>Selecione uma etapa</div>;
    }
  };

  return (
    <TooltipProvider>
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Upload de Beats
          </h1>
          <p className="text-slate-600 dark:text-slate-300">
            Carregue seus instrumentais e configure licenças para venda no beatstore
          </p>
        </div>

        {/* Stepper */}
        <Card className="w-full mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold">Fluxo de Upload</h2>
                <Badge variant="outline" className="bg-green-100 dark:bg-green-900 border-2 border-green-300 dark:border-green-700">
                  {steps[currentStep].name}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <MultiStepper
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </CardContent>
        </Card>

        {/* Conteúdo do Step Atual */}
        <Card className="w-full mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold">{steps[currentStep].name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {steps[currentStep].description}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Botões de Navegação */}
        <Card className="w-full border-2 border-slate-200 dark:border-slate-700 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className="border-2 border-slate-200 dark:border-slate-700"
                >
                  Anterior
                </Button>
                <Button
                  onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white border-2 border-indigo-600"
                >
                  Próximo
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2 border-2 border-slate-200 dark:border-slate-700">
                  <Save className="w-4 h-4" />
                  Salvar Rascunho
                </Button>
                <Button onClick={handleUpload} className="gap-2 bg-green-600 hover:bg-green-700 text-white border-2 border-green-600">
                  <Upload className="w-4 h-4" />
                  Upload Final
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}