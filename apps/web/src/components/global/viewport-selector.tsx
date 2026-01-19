"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Monitor, Smartphone, Tablet, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ViewportPreset {
  name: string;
  width: number;
  height: number;
  icon: React.ReactNode;
  category: "mobile" | "tablet" | "desktop";
}

const VIEWPORT_PRESETS: ViewportPreset[] = [
  // Mobile
  { name: "iPhone SE", width: 375, height: 667, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  { name: "iPhone 12/13", width: 390, height: 844, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  { name: "iPhone 14 Pro Max", width: 430, height: 932, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  { name: "Samsung Galaxy S21", width: 360, height: 800, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  { name: "Pixel 5", width: 393, height: 851, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  { name: "Mobile Small", width: 320, height: 568, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  { name: "Mobile Large", width: 414, height: 896, icon: <Smartphone className="w-4 h-4" />, category: "mobile" },
  
  // Tablet
  { name: "iPad", width: 768, height: 1024, icon: <Tablet className="w-4 h-4" />, category: "tablet" },
  { name: "iPad Pro", width: 1024, height: 1366, icon: <Tablet className="w-4 h-4" />, category: "tablet" },
  { name: "Tablet Small", width: 600, height: 960, icon: <Tablet className="w-4 h-4" />, category: "tablet" },
  
  // Desktop
  { name: "Desktop Small", width: 1024, height: 768, icon: <Monitor className="w-4 h-4" />, category: "desktop" },
  { name: "Desktop Medium", width: 1280, height: 720, icon: <Monitor className="w-4 h-4" />, category: "desktop" },
  { name: "Desktop Large", width: 1920, height: 1080, icon: <Monitor className="w-4 h-4" />, category: "desktop" },
  { name: "Desktop XL", width: 2560, height: 1440, icon: <Monitor className="w-4 h-4" />, category: "desktop" },
  { name: "Full Screen", width: 0, height: 0, icon: <Monitor className="w-4 h-4" />, category: "desktop" },
];

const STORAGE_KEY = "viewport-preset";

export function ViewportSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<ViewportPreset | null>(null);
  const [customWidth, setCustomWidth] = useState<string>("");
  const [customHeight, setCustomHeight] = useState<string>("");
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Carregar preset salvo
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const preset = JSON.parse(saved);
        const found = VIEWPORT_PRESETS.find(p => p.name === preset.name);
        if (found) {
          setSelectedPreset(found);
          setIsActive(preset.active || false);
          if (preset.active) {
            applyViewport(found.width, found.height);
          }
        }
      } catch (e) {
        console.error("Erro ao carregar viewport:", e);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyViewport = (width: number, height: number) => {
    if (typeof window === 'undefined') return;
    
    if (width === 0 && height === 0) {
      // Full screen - remover restrições
      removeViewport();
      return;
    }

    // Aplicar viewport usando estilos no body e html
    const html = document.documentElement;
    const body = document.body;
    
    // Criar wrapper visual se não existir
    let wrapper = document.getElementById("viewport-visual-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "viewport-visual-wrapper";
      wrapper.style.cssText = `
        position: fixed;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: ${width}px;
        height: 100vh;
        pointer-events: none;
        border-left: 2px solid rgba(0,0,0,0.2);
        border-right: 2px solid rgba(0,0,0,0.2);
        box-shadow: 0 0 30px rgba(0,0,0,0.15);
        z-index: 9998;
      `;
      document.body.appendChild(wrapper);
    } else {
      wrapper.style.width = `${width}px`;
    }
    
    // Limitar largura do conteúdo
    body.style.maxWidth = `${width}px`;
    body.style.margin = '0 auto';
    body.style.position = 'relative';
    
    // Adicionar classe para indicar viewport ativo
    html.classList.add("viewport-active");
    html.setAttribute("data-viewport-width", width.toString());
  };

  const removeViewport = () => {
    if (typeof window === 'undefined') return;
    
    const wrapper = document.getElementById("viewport-visual-wrapper");
    if (wrapper) {
      wrapper.remove();
    }
    
    const body = document.body;
    body.style.maxWidth = '';
    body.style.margin = '';
    body.style.position = '';
    
    const html = document.documentElement;
    html.classList.remove("viewport-active");
    html.removeAttribute("data-viewport-width");
  };

  const handlePresetSelect = (presetName: string) => {
    const preset = VIEWPORT_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSelectedPreset(preset);
      // Aplicar automaticamente quando selecionar
      applyViewport(preset.width, preset.height);
      setIsActive(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preset, active: true }));
    }
  };

  const handleToggle = () => {
    const newActive = !isActive;
    setIsActive(newActive);
    
    if (newActive && selectedPreset) {
      applyViewport(selectedPreset.width, selectedPreset.height);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...selectedPreset, active: true }));
    } else {
      removeViewport();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...selectedPreset, active: false }));
    }
  };

  const handleCustomApply = () => {
    const width = parseInt(customWidth);
    const height = parseInt(customHeight);
    
    if (width > 0 && height > 0) {
      applyViewport(width, height);
      setIsActive(true);
      const customPreset: ViewportPreset = {
        name: `Custom (${width}x${height})`,
        width,
        height,
        icon: <Monitor className="w-4 h-4" />,
        category: "desktop",
      };
      setSelectedPreset(customPreset);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...customPreset, active: true }));
    }
  };

  const handleReset = () => {
    removeViewport();
    setIsActive(false);
    setSelectedPreset(null);
    setCustomWidth("");
    setCustomHeight("");
    localStorage.removeItem(STORAGE_KEY);
  };

  const mobilePresets = VIEWPORT_PRESETS.filter(p => p.category === "mobile");
  const tabletPresets = VIEWPORT_PRESETS.filter(p => p.category === "tablet");
  const desktopPresets = VIEWPORT_PRESETS.filter(p => p.category === "desktop");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed bottom-4 right-4 z-50 shadow-lg",
            isActive && "bg-primary text-primary-foreground"
          )}
          title="Seletor de Resolução/Viewport"
        >
          <Monitor className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Seletor de Resolução</DialogTitle>
          <DialogDescription>
            Escolhe uma resolução para testar a aplicação. Ideal para mobile, tablet ou desktop.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Presets Mobile */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Mobile
            </Label>
            <Select
              value={selectedPreset?.name || ""}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar resolução mobile" />
              </SelectTrigger>
              <SelectContent>
                {mobilePresets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    <div className="flex items-center gap-2">
                      {preset.icon}
                      <span>{preset.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {preset.width} × {preset.height}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Presets Tablet */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Tablet className="w-4 h-4" />
              Tablet
            </Label>
            <Select
              value={selectedPreset?.name || ""}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar resolução tablet" />
              </SelectTrigger>
              <SelectContent>
                {tabletPresets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    <div className="flex items-center gap-2">
                      {preset.icon}
                      <span>{preset.name}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {preset.width} × {preset.height}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Presets Desktop */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Desktop
            </Label>
            <Select
              value={selectedPreset?.name || ""}
              onValueChange={handlePresetSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar resolução desktop" />
              </SelectTrigger>
              <SelectContent>
                {desktopPresets.map((preset) => (
                  <SelectItem key={preset.name} value={preset.name}>
                    <div className="flex items-center gap-2">
                      {preset.icon}
                      <span>{preset.name}</span>
                      {preset.width > 0 && (
                        <span className="text-xs text-muted-foreground ml-auto">
                          {preset.width} × {preset.height}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Resolution */}
          <div className="space-y-2 border-t pt-4">
            <Label className="text-sm font-medium">Resolução Personalizada</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Largura"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Altura"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCustomApply}
              className="w-full"
              disabled={!customWidth || !customHeight}
            >
              Aplicar Personalizada
            </Button>
          </div>

          {/* Status e Controles */}
          {selectedPreset && (
            <div className="space-y-2 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Resolução Ativa:</span>
                <span className="font-medium">
                  {selectedPreset.width === 0 ? "Full Screen" : `${selectedPreset.width} × ${selectedPreset.height}`}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleToggle}
                  variant={isActive ? "default" : "outline"}
                  className="flex-1"
                >
                  {isActive ? "Desativar" : "Ativar"} Viewport
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="icon"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}



