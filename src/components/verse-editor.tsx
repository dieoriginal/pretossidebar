// components/verse-editor.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Crosshair, Gauge, Palette, Ruler, Sparkles, Wand2 } from "lucide-react";

export function VerseControls({ formState, onParamChange }) {
  return (
    <div className="flex flex-wrap gap-4 p-4 border-b bg-muted/40">
      {/* Controles de Métrica */}
      <div className="flex items-center gap-2">
        <Ruler className="h-5 w-5 text-primary" />
        <Select
          value={formState.tipoMetrica}
          onValueChange={(v) => onParamChange('tipoMetrica', v)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Métrica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dactílico">Dactílico (épico)</SelectItem>
            <SelectItem value="iâmbico">Iâmbico (dramático)</SelectItem>
            <SelectItem value="trocaico">Trocaico (lírico)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Controles de Rima */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <Select
          value={formState.esquemaRima}
          onValueChange={(v) => onParamChange('esquemaRima', v)}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Rima" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ABAB">ABAB</SelectItem>
            <SelectItem value="ABBA">ABBA</SelectItem>
            <SelectItem value="AABB">AABB</SelectItem>
            <SelectItem value="Livre">Livre</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Balanço Apolíneo/Dionisíaco */}
      <div className="flex items-center gap-2 w-[240px]">
        <Gauge className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span>Apolíneo</span>
            <span>Dionisíaco</span>
          </div>
          <Slider 
            value={[formState.apolineo]}
            max={100}
            step={1}
            onValueChange={(v) => onParamChange('apolineo', v[0])}
          />
        </div>
      </div>

      {/* Arquétipo e Efeitos */}
      <div className="flex items-center gap-2">
        <Crosshair className="h-5 w-5 text-primary" />
        <Select
          value={formState.arquétipo}
          onValueChange={(v) => onParamChange('arquétipo', v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Arquétipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Prometeu">Prometeu</SelectItem>
            <SelectItem value="Édipo">Édipo</SelectItem>
            <SelectItem value="Antígona">Antígona</SelectItem>
            <SelectItem value="Medeia">Medeia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Botão de Estilo Avançado */}
      <Button 
        variant="ghost"
        size="sm"
        onClick={() => onParamChange('showAdvanced', !formState.showAdvanced)}
      >
        <Wand2 className="mr-2 h-4 w-4" />
        Estilo Poético
      </Button>
    </div>
  );
}

// Modifique o VerseCard para incluir os controles
function VerseCard({ index, formParams }) {
  const [localParams, setLocalParams] = useState(formParams);

  const handleParamChange = (param, value) => {
    setLocalParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  return (
    <div className="border p-4 rounded mb-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Estrofe {index}</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Palette className="mr-2 h-4 w-4" />
              Cor do Tema
            </Button>
          </div>
        </div>
        
        <VerseControls 
          formState={localParams}
          onParamChange={handleParamChange}
        />
      </div>

      {/* ... restante do componente existente ... */}
    </div>
  );
}