import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

// Options with pricing for each category
const hairstyleOptions = [
  { label: "Tinta Preta", value: "tintapreta", price: 6 },
  { label: "Relaxing", value: "moderno", price: 9 },
  { label: "Retoque", value: "criativo", price: 5 },
];

const glassesOptions = [
  { label: "Sem Óculos", value: "sem_oculos", price: 0 },
  { label: "Com Óculos Estilosos", value: "com_oculos", price: 15 },
];

const neckAccessoryOptions = [
  { label: "Nenhum", value: "nenhum", price: 0 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Chains Personalizado", value: "chainspersonalizados", price: 560 },
];

const accessoryOptions = [
  { label: "Grillz Open Face", value: "grillz", price: 50 },
  { label: "Brincos Científicos", value: "brincos", price: 90 },
  { label: "Gorro", value: "gorro", price: 5},
  { label: "Shein Kit", value: "sheinkit", price: 20 },
  { label: "Relógio", value: "relogio", price: 20 },
  { label: "Luvas", value: "luvas", price: 6 },
  { label: "Luvas The North Face", value: "luvasnf", price: 20 },

];

const superiorOptions = [
  { label: "Let's Copy DTF", value: "dtf", price: 11 },
  { label: "Tshirt Vazia", value: "brincos", price: 9 },
  { label: "Balmacan Personalizada", value: "balmacan", price: 5},
  { label: "Colete", value: "colete", price: 15 },
  { label: "Colete", value: "colete", price: 15 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Chains Personalizado", value: "chainspersonalizados", price: 560 },
  { label: "Gravata Ascot", value: "gravata_ascot", price: 10 },
  { label: "Fivela de Cintura", value: "fivela_cintura", price: 20 },
  { label: "Cinto de Couro", value: "cinto_couro", price: 30 },
];

const inferiorOptions = [
  { label: "Let's Copy DTF", value: "dtf", price: 11 },
  { label: "Tshirt Vazia", value: "brincos", price: 9 },
  { label: "Balmacan Personalizada", value: "balmacan", price: 5},
  { label: "Colete", value: "colete", price: 15 },
  { label: "Luvas", value: "luvas", price: 6 },
  { label: "Luvas The North Face", value: "luvasnf", price: 20 },


];

const WardrobePlanningPage = () => {
  // Multi-select states for predefined categories
  const [selectedHairstyles, setSelectedHairstyles] = useState<string[]>([]);
  const [selectedGlasses, setSelectedGlasses] = useState<string[]>([]);
  const [selectedNeckAccessories, setSelectedNeckAccessories] = useState<string[]>([]);
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  // State for custom item addition
  const [customItems, setCustomItems] = useState<{ name: string; category: string; price: number }[]>([]);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [customPrice, setCustomPrice] = useState("");

  // Toggle helper for multi-selection
  const toggleSelection = (
    value: string,
    selected: string[],
    setSelected: (arr: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setSelected(selected.filter((item) => item !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  // Specific toggle handlers for each category
  const toggleHairstyle = (value: string) =>
    toggleSelection(value, selectedHairstyles, setSelectedHairstyles);
  const toggleGlasses = (value: string) =>
    toggleSelection(value, selectedGlasses, setSelectedGlasses);
  const toggleNeckAccessory = (value: string) =>
    toggleSelection(value, selectedNeckAccessories, setSelectedNeckAccessories);
  const toggleAccessory = (value: string) =>
    toggleSelection(value, selectedAccessories, setSelectedAccessories);

  // Function to add a custom item (name, category, and price)
  const addCustomItem = (name: string, category: string, price: string) => {
    const priceNumber = parseFloat(price);
    if (!isNaN(priceNumber)) {
      setCustomItems((prev) => [...prev, { name, category, price: priceNumber }]);
    }
  };

  const handleAddCustomItem = () => {
    if (customName && customCategory && customPrice) {
      addCustomItem(customName, customCategory, customPrice);
      setCustomName("");
      setCustomCategory("");
      setCustomPrice("");
    }
  };

  // Calculate the total price based on all selections and custom items
  const totalPrice = useMemo(() => {
    let total = 0;

    // Sum function for selected options
    const sumSelected = (
      selected: string[],
      options: { value: string; price: number }[]
    ) => {
      selected.forEach((val) => {
        const found = options.find((item) => item.value === val);
        if (found) total += found.price;
      });
    };

    sumSelected(selectedHairstyles, hairstyleOptions);
    sumSelected(selectedGlasses, glassesOptions);
    sumSelected(selectedNeckAccessories, neckAccessoryOptions);
    sumSelected(selectedAccessories, accessoryOptions);

    customItems.forEach((item) => {
      total += item.price;
    });

    return total;
  }, [selectedHairstyles, selectedGlasses, selectedNeckAccessories, selectedAccessories, customItems]);

  // Create summary object for display
  const wardrobeSummary = useMemo(() => {
    return {
      hairstyles: selectedHairstyles,
      glasses: selectedGlasses,
      neckAccessories: selectedNeckAccessories,
      accessories: selectedAccessories,
      customItems,
      totalPrice,
    };
  }, [selectedHairstyles, selectedGlasses, selectedNeckAccessories, selectedAccessories, customItems, totalPrice]);

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Outfit</h1>
      <h5>Selecione ou personalize os itens do seu vestuário para o videoclip</h5>

      <div className="grid grid-cols-1 gap-6">
        {/* Hairstyle Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Cabelo</h2>
          <Label className="mb-2 block">Selecione os Penteados</Label>
          <div className="flex flex-wrap gap-4">
            {hairstyleOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedHairstyles.includes(option.value) ? "default" : "outline"}
                onClick={() => toggleHairstyle(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* Glasses Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Óculos</h2>
          <Label className="mb-2 block">Selecione as Opções de Óculos</Label>
          <div className="flex flex-wrap gap-4">
            {glassesOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedGlasses.includes(option.value) ? "default" : "outline"}
                onClick={() => toggleGlasses(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* Neck Accessory Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Acessórios de Pescoço</h2>
          <Label className="mb-2 block">Selecione Cravat, Scarf ou Nenhum</Label>
          <div className="flex flex-wrap gap-4">
            {neckAccessoryOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedNeckAccessories.includes(option.value) ? "default" : "outline"}
                onClick={() => toggleNeckAccessory(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* Accessories Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Acessórios</h2>
          <Label className="mb-2 block">Selecione os Acessórios Adicionais</Label>
          <div className="flex flex-wrap gap-4">
            {accessoryOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedAccessories.includes(option.value) ? "default" : "outline"}
                onClick={() => toggleAccessory(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        
        {/* Superior Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Parte Superior</h2>
          <Label className="mb-2 block">Selecione os Acessórios Adicionais</Label>
          <div className="flex flex-wrap gap-4">
            {superiorOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedAccessories.includes(option.value) ? "default" : "outline"}
                onClick={() => toggleAccessory(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Item Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Adicionar Item Personalizado</h2>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Nome do Item"
            className="border rounded p-2 w-full mb-2"
          />
          <input
            type="text"
            value={customCategory}
            onChange={(e) => setCustomCategory(e.target.value)}
            placeholder="Categoria"
            className="border rounded p-2 w-full mb-2"
          />
          <input
            type="number"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="Preço"
            className="border rounded p-2 w-full mb-2"
          />
          <Button onClick={handleAddCustomItem}>Adicionar Item</Button>
        </div>
      </div>

      {/* Summary / Confirmation */}
      <div className="border rounded p-4 shadow-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Resumo do Vestuário</h2>
        <pre className="text-sm whitespace-pre-wrap">
          {JSON.stringify(wardrobeSummary, null, 2)}
        </pre>
        <div className="text-xl font-bold">Total Estimado: €{totalPrice.toFixed(2)}</div>
        <Button variant="outline" onClick={() => window.location.href = "/filmagem"}>
          Confirmar Vestuário
        </Button>
      </div>
    </div>
  );
};

export default WardrobePlanningPage;
