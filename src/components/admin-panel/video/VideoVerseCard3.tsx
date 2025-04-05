import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  id: string;
  label: string;
  options: Option[];
  onSelect?: (value: string) => void;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  id,
  label,
  options,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Option | null>(options[0]); // Definindo a opção padrão

  const handleSelect = (option: Option) => {
    setSelected(option);
    setIsOpen(false);
    if (onSelect) {
      onSelect(option.value);
    }
  };

  return (
    <div className="relative">
      <label htmlFor={id} className="block text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-left bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {selected ? selected.label : "Selecione uma opção"}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-gray-100"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface VideoVerseCard3Props {
  index: number;
}

const shotTypeOptions: Option[] = [
  { value: "highAngle", label: "Plano alto / Ângulo alto - Câmera posicionada acima do sujeito, olhando para baixo. Efeito: Faz o sujeito parecer fraco ou pequeno. Exemplo: Uma criança sendo repreendida por um adulto." },
  { value: "lowAngle", label: "Plano baixo / Ângulo baixo - Câmera posicionada abaixo do sujeito, olhando para cima. Efeito: Faz o sujeito parecer poderoso ou intimidador. Exemplo: Um super-herói em pé antes da ação." },
  { value: "dutchAngle", label: "Plano holandês / Ângulo inclinado - Câmera inclinada para o lado. Efeito: Cria desconforto, tensão ou distorção. Exemplo: Usado em filmes de terror para indicar que algo está errado." },
  { value: "eyeLevel", label: "Ao nível dos olhos - Câmera ao nível dos olhos do sujeito. Efeito: Perspectiva neutra, natural e equilibrada. Exemplo: Uma cena de conversa casual." },
  { value: "birdEyeView", label: "Vista de pássaro - Câmera diretamente acima do sujeito, olhando para baixo. Efeito: Oferece uma visão divina ou estratégica. Exemplo: Uma cena de crime mostrada de cima." },
  { value: "shoulderLevel", label: "Ao nível do ombro - Câmera posicionada nos ombros do personagem. Efeito: Enquadramento ligeiramente dominante ou neutro. Exemplo: Usado frequentemente em diálogos." },
  { value: "hipLevel", label: "Ao nível do quadril - Câmera posicionada na altura do quadril. Efeito: Bom para ação, mostrando mãos ou armas. Exemplo: Confrontos clássicos de cowboys em faroestes." },
  { value: "kneeLevel", label: "Ao nível do joelho - Câmera posicionada na altura do joelho. Efeito: Destaca o movimento da parte inferior do corpo, cenas de ação. Exemplo: Um personagem entrando na cena dramaticamente." },
  { value: "groundLevel", label: "Ao nível do chão - Câmera colocada no chão. Efeito: Adiciona profundidade, frequentemente usada para tensão. Exemplo: Uma pessoa caminhando por uma selva com um predador ao fundo." },
];

const camMovementOptions: Option[] = [
  { value: "zoom", label: "Zoom" },
  { value: "pan", label: "Panorâmica" },
  { value: "tilt", label: "Tilt" },
  { value: "pedestal", label: "Pedestal" },
  { value: "dolly", label: "Travelling" },
  { value: "tracking", label: "Plano sequência em movimento" },
  { value: "highAngle", label: "Plano alto" },
  { value: "mediumShot", label: "Plano médio" },
  { value: "shoulderLevel", label: "Plano ombro" },
  { value: "lowAngle", label: "Plano baixo" },
  { value: "rackFocus", label: "Foco Seletivo" },
  { value: "aerial", label: "Aéreo" },
  { value: "dollyZoom", label: "Efeito Vertigo" },
  { value: "establishing", label: "Estabelecimento" },
  { value: "arc", label: "Movimento em arco" },
  { value: "eyeLevel", label: "Ao nível dos olhos" },
  { value: "handheld", label: "Câmera na mão" },
  { value: "pov", label: "Primeira pessoa" },
  { value: "truck", label: "Travelling lateral" },
  { value: "crane", label: "Com grua" },
  { value: "craneJib", label: "Grua/Jib" },
  { value: "cutaway", label: "Corte" },
  { value: "hipLevel", label: "Quadril" },
  { value: "longShot", label: "Plano geral" },
];

const resolutionOptions: Option[] = [
  { value: "4k - 120FPS", label: "4K - 120FPS" }, // Opção padrão
  { value: "4k", label: "4K" },
  { value: "1080p", label: "1080p" },
];

const stabilizationOptions: Option[] = [
  { value: "gimbal", label: "Gimbal" },
  { value: "tripod", label: "Tripé" },
  { value: "tripodOverhead", label: "Tripé Overhead" },
  { value: "slider", label: "Slider" },
  { value: "drone", label: "Drone" },
  { value: "iphone", label: "iPhone" },
];

const VideoVerseCard2: React.FC<VideoVerseCardProps> = ({ index }) => {
  const [tags, setTags] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [verseInput, setVerseInput] = useState(""); // Novo estado para o verso

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue && tags.length < 3) {
        setTags([...tags, inputValue]);
        setInputValue("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="border border-gray-200 dark:border-gray-600 p-6 rounded-lg shadow-sm mb-6 bg-white dark:bg-gray-800">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Verse {index}
      </h3>

      <div className="col-span-2">
          <Label htmlFor={`verseInput-${index}`} className="block text-gray-700 dark:text-gray-300 mb-1">
            Verso Abordado
          </Label>
          <Input
            id={`verseInput-${index}`}
            type="text"
            maxLength={100}
            value={verseInput}
            placeholder="Insira o verso que está sendo abordado"
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            onChange={(e) => setVerseInput(e.target.value)}
          />
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DropdownSelect
          id={`shotType-${index}`}
          label="Tipo de Shot"
          options={shotTypeOptions}
        />
     
        <DropdownSelect
          id={`camMovement-${index}`}
          label="Movimento da Câmera"
          options={camMovementOptions}
        />
        <DropdownSelect
          id={`resolution-${index}`}
          label="Resolução"
          options={resolutionOptions}
        />
        <DropdownSelect
          id={`stabilization-${index}`}
          label="Estabilização"
          options={stabilizationOptions}
        />
        <div className="col-span-2">
          <Label htmlFor={`sceneContext-${index}`} className="block text-gray-700 dark:text-gray-300 mb-1">
            Contexto da Cena
          </Label>
          <Input
            id={`sceneContext-${index}`}
            type="text"
            maxLength={50}
            placeholder="Descreva a cena (máx. 50 caracteres)"
            className="border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>
        <div className="col-span-2">
          <Label htmlFor={`focusContext-${index}`} className="block text-gray-700 dark:text-gray-300 mb-1">
            Foco da Cena
          </Label>
          <div className="flex flex-wrap border border-gray-300 dark:border-gray-600 rounded px-3 py-2 w-full bg-white dark:bg-gray-800">
            <Input
              id={`focusContext-${index}`}
              type="text"
              maxLength={50}
              value={inputValue}
              placeholder="Adicione um foco e pressione Enter"
              className="border-0 focus:ring-0 w-full bg-transparent text-gray-900 dark:text-gray-100"
              onKeyDown={handleKeyDown}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <div className="flex flex-wrap mt-2">
              {tags.map((tag, index) => (
                <span key={index} className="bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 mr-2 flex items-center">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-2 text-red-500">x</button>
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoVerseCard3;
