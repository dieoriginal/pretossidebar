import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

// Equipment options with pricing in Euros
const cameraOptions = [
  { label: "FUJIFILM GFX 50s II", value: "fujifilm_gfx50s_ii", price: 100 },
  { label: "Blackmagic Pocket Cinema Camera 6K G2", value: "blackmagic_6k", price: 75 },
  { label: "SONY FX3", value: "sony_fx3", price: 110 },
  { label: "SONY FX30", value: "sony_fx30", price: 65 },
  { label: "Canon R6 Mark II", value: "canon_r6_mark_ii", price: 85 },
  { label: "Sony A7S III", value: "sony_a7s_iii", price: 100 },
  { label: "Sony a7 IV", value: "sony_a7_iv", price: 70 },
  { label: "Sony a6700", value: "sony_a6700", price: 50 },
  { label: "Sony A7 III", value: "sony_a7_iii", price: 50 },
  { label: "Sony A6500", value: "sony_a6500", price: 30 },
  { label: "Canon EOS R6", value: "canon_eos_r6", price: 60 },
  { label: "CANON EOS 6D MARK II", value: "canon_eos_6d_mark_ii", price: 40 },
  { label: "CANON EOS 70D Body", value: "canon_eos_70d", price: 15 },
  { label: "Canon 250D", value: "canon_250d", price: 20 },
  { label: "NIKON D850", value: "nikon_d850", price: 65 },
  { label: "NIKON Z6 II", value: "nikon_z6_ii", price: 60 },
  { label: "Nikon Z6", value: "nikon_z6", price: 45 },
  { label: "Nikon D750", value: "nikon_d750", price: 35 },
  { label: "Fujifilm X-T4", value: "fujifilm_xt4", price: 45 },
  { label: "Fujifilm X-T3", value: "fujifilm_xt3", price: 35 },
  { label: "FUJIFILM X-E4", value: "fujifilm_xe4", price: 25 },
  { label: "Panasonic GH6", value: "panasonic_gh6", price: 55 },
  { label: "Panasonic GH5", value: "panasonic_gh5", price: 40 },
];

const lensOptions = [
  { label: "Sony 10-18 mm f/4.0", value: "sony_10_18", price: 15 },
  { label: "Sigma 16-28mm f2.8 DG DN Sony-E", value: "sigma_16_28", price: 40 },
  { label: "SIGMA 10-18mm f/2.8 DC DN E-mount", value: "sigma_10_18", price: 25 },
  { label: "SIGMA 18-50mm f/2.8 DC DN - Sony E", value: "sigma_18_50", price: 20 },
  { label: "Sony 12-24mm f2.8 GM", value: "sony_12_24", price: 75 },
  { label: "Sony FE 14mm f1.8 GM", value: "sony_fe_14", price: 40 },
  { label: "Sony 16-35MM F2.8 GM II", value: "sony_16_35", price: 65 },
  { label: "Sony 24mm f/1.4 GM", value: "sony_24", price: 40 },
  { label: "Sony 24-70mm f/2.8 GM II", value: "sony_24_70", price: 65 },
];

const stabilizationOptions = [
  { label: "DJI RS 4 Pro Combo", value: "dji_rs4_pro", price: 50 },
  { label: "DJI RS 3 Pro Combo", value: "dji_rs3_pro", price: 40 },
  { label: "DJI RSC 2 Pro Combo", value: "dji_rsc2_pro", price: 30 },
  { label: "Zhiyun Weebill S", value: "zhiyun_weebill_s", price: 25 },
  { label: "Monopé Manfrotto com cabeça fluida", value: "manfrotto_monopod", price: 10 },
];

const lightingOptions = [
  { label: "Godox MG1200Bi", value: "godox_mg1200bi", price: 120 },
  { label: "NANLITE Forza 500B II", value: "nanlite_forza_500b", price: 60 },
  { label: "NANLITE 720B", value: "nanlite_720b", price: 70 },
  { label: "Aputure 600x Pro", value: "aputure_600x_pro", price: 110 },
  { label: "Nanlite Forza 300B Bicolor", value: "nanlite_forza_300b", price: 40 },
];

const outfitOptions = [
  { label: "DTF Transfer", value: "dtf_transfer", price: 11 },
  { label: "T-Shirt", value: "t_shirt", price: 7 },
  { label: "Anel Glitter", value: "anel_glitter", price: 3.5 },
  { label: "Pulseiras Chines", value: "pulseiras_chines", price: 3.5 },
  { label: "Pulseiras Sheind", value: "pulseiras_sheind", price: 0 },
];

const FilmingBudgetPage = () => {
  // Equipment selections
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedLens, setSelectedLens] = useState("");
  const [selectedStabilization, setSelectedStabilization] = useState("");
  const [selectedLighting, setSelectedLighting] = useState("");
  const [selectedOutfits, setSelectedOutfits] = useState<string[]>([]);

  // Custom items state: list of items
  const [customItems, setCustomItems] = useState<{ label: string; price: number }[]>([]);
  // Temporary state for new custom item inputs
  const [newCustomLabel, setNewCustomLabel] = useState("");
  const [newCustomPrice, setNewCustomPrice] = useState<number>(0);

  // Calculate the total budget based on all selected items
  const totalBudget = useMemo(() => {
    let sum = 0;
    const camera = cameraOptions.find((opt) => opt.value === selectedCamera);
    const lens = lensOptions.find((opt) => opt.value === selectedLens);
    const stabilization = stabilizationOptions.find((opt) => opt.value === selectedStabilization);
    const lighting = lightingOptions.find((opt) => opt.value === selectedLighting);

    if (camera) sum += camera.price;
    if (lens) sum += lens.price;
    if (stabilization) sum += stabilization.price;
    if (lighting) sum += lighting.price;

    // Ensure selectedOutfits is an array
    const outfitsArray = Array.isArray(selectedOutfits) ? selectedOutfits : [];
    outfitsArray.forEach((outfit) => {
      const outfitOption = outfitOptions.find((opt) => opt.value === outfit);
      if (outfitOption) sum += outfitOption.price;
    });

    // Sum custom items prices
    const customSum = customItems.reduce((acc, item) => acc + item.price, 0);
    sum += customSum;

    return sum;
  }, [selectedCamera, selectedLens, selectedStabilization, selectedLighting, selectedOutfits, customItems]);

  // Handler to add a new custom item
  const handleAddCustomItem = () => {
    if (newCustomLabel.trim() !== "" && newCustomPrice > 0) {
      setCustomItems((prev) => [...prev, { label: newCustomLabel, price: newCustomPrice }]);
      setNewCustomLabel("");
      setNewCustomPrice(0);
    }
  };

  // Handler to remove a custom item by index
  const handleRemoveCustomItem = (index: number) => {
    setCustomItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">
        Orçamentalização
      </h1>
      <h5>Adicione todos os custos necessários para realização das filmagens.
      </h5>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Camera Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Câmera</h2>
          <Label className="mb-2 block">Selecione a Câmera</Label>
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma câmera" />
            </SelectTrigger>
            <SelectContent>
              {cameraOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.price} €)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lens Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Lente</h2>
          <Label className="mb-2 block">Selecione a Lente</Label>
          <Select value={selectedLens} onValueChange={setSelectedLens}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione uma lente" />
            </SelectTrigger>
            <SelectContent>
              {lensOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.price} €)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stabilization Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Estabilização</h2>
          <Label className="mb-2 block">Selecione o Sistema</Label>
          <Select value={selectedStabilization} onValueChange={setSelectedStabilization}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um sistema" />
            </SelectTrigger>
            <SelectContent>
              {stabilizationOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.price} €)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lighting Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Iluminação</h2>
          <Label className="mb-2 block">Selecione o Equipamento</Label>
          <Select value={selectedLighting} onValueChange={setSelectedLighting}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o equipamento" />
            </SelectTrigger>
            <SelectContent>
              {lightingOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.price} €)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Outfit Section */}
        

        {/* Custom Items Section */}
        <div className="border rounded p-4 shadow-sm md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Itens Personalizados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label className="mb-2 block">Nome do Item</Label>
              <input
                type="text"
                value={newCustomLabel}
                onChange={(e) => setNewCustomLabel(e.target.value)}
                className="border rounded p-2 w-full"
                placeholder="Nome do item"
              />
            </div>
            <div>
              <Label className="mb-2 block">Preço do Item</Label>
              <input
                type="number"
                value={newCustomPrice}
                onChange={(e) => setNewCustomPrice(parseFloat(e.target.value))}
                className="border rounded p-2 w-full"
                placeholder="Preço do item"
              />
            </div>
            <div>
              <Button onClick={handleAddCustomItem} className="w-full">
                Adicionar Item
              </Button>
            </div>
          </div>
          {customItems.length > 0 && (
            <ul className="mt-4 space-y-2">
              {customItems.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center border rounded p-2"
                >
                  <span>
                    {item.label} ({item.price} €)
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveCustomItem(index)}
                  >
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Budget Summary */}
      <div className="border rounded p-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Orçamento Total</h2>
          <p className="text-xl">{totalBudget} €</p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = "/filmagem"}>
          Confirmar Orçamento
        </Button>
        <h1> <a href="https://rentacamera.pt/" target="_blank" rel="noopener noreferrer" className="text-blue-500">rentacamera.pt</a></h1>
      </div>
    </div>
  );
};

export default FilmingBudgetPage; 