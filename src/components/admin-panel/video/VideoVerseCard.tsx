import React, { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import jsPDFInvoiceTemplate from "jspdf-invoice-template";

// HEAD OPTIONS
const hairstyleOptions = [
  { label: "Tinta Preta", value: "tintapreta", price: 6 },
  { label: "Relaxing", value: "moderno", price: 9 },
  { label: "Retoque", value: "criativo", price: 5 },
];

const glassesOptions = [
  { label: "Sem Óculos", value: "sem_oculos", price: 0 },
  { label: "Com Óculos Estilosos", value: "com_oculos", price: 15 },
];

const headWearOptions = [
  { label: "Gorro Personalizado", value: "gorro_personalizado", price: 5 },
  { label: "Gorro", value: "gorro", price: 3 },
  { label: "Babushka", value: "babushka", price: 4 },
  { label: "Russian Headwear", value: "russian_headwear", price: 6 },
  { label: "Militar Camoflage", value: "militar_camoflage", price: 7 },
];

// UPPER OPTIONS
const superiorOptions = [
  { label: "Let's Copy DTF", value: "dtf", price: 11 },
  { label: "Tshirt Vazia", value: "brincos", price: 9 },
  { label: "Balmacan Personalizada", value: "balmacan", price: 5 },
  { label: "Colete", value: "colete", price: 15 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Chains Personalizado", value: "chainspersonalizados", price: 560 },
  { label: "Gravata Ascot", value: "gravata_ascot", price: 10 },
];

// LOWER OPTIONS (Pants)
const pantsOptions = [
  { label: "Custom Pants", value: "custom_pants", price: 20 },
  { label: "Zara Pants", value: "zara_pants", price: 25 },
  { label: "Pants Chain", value: "pants_chain", price: 10 },
];

// FEET OPTIONS (Shoes)
const shoesOptions = [
  { label: "Zara Boots", value: "zara_boots", price: 40 },
  { label: "Bershka Boots", value: "bershka_boots", price: 35 },
];

// ACCESSORY OPTIONS
const neckAccessoryOptions = [
  { label: "Nenhum", value: "nenhum", price: 0 },
  { label: "Cravat de Seda", value: "cravat", price: 4 },
  { label: "Correntes", value: "correntes", price: 130 },
];

const braceletOptions = [
  { label: "Glitter Bracelet (€3.50)", value: "glitter_bracelet", price: 3.5 },
  { label: "Personalized Bracelet", value: "personalized_bracelet", price: 15 },
];

const watchOptions = [
  { label: "Watch", value: "watch", price: 20 },
];

const beltOptions = [
  { label: "TRIPARTE BELT", value: "triparte_belt", price: 30 },
];

const WardrobePlanningPage = () => {
  // State for each section
  const [selectedHairstyles, setSelectedHairstyles] = useState<string[]>([]);
  const [selectedGlasses, setSelectedGlasses] = useState<string[]>([]);
  const [selectedHeadWear, setSelectedHeadWear] = useState<string[]>([]);
  const [selectedSuperior, setSelectedSuperior] = useState<string[]>([]);
  const [selectedPants, setSelectedPants] = useState<string[]>([]);
  const [selectedShoes, setSelectedShoes] = useState<string[]>([]);
  const [selectedNeckAccessories, setSelectedNeckAccessories] = useState<string[]>([]);
  const [selectedBracelets, setSelectedBracelets] = useState<string[]>([]);
  const [selectedWatch, setSelectedWatch] = useState<string[]>([]);
  const [selectedBelt, setSelectedBelt] = useState<string[]>([]);

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
  const toggleHeadWear = (value: string) =>
    toggleSelection(value, selectedHeadWear, setSelectedHeadWear);
  const toggleSuperior = (value: string) =>
    toggleSelection(value, selectedSuperior, setSelectedSuperior);
  const togglePants = (value: string) =>
    toggleSelection(value, selectedPants, setSelectedPants);
  const toggleShoes = (value: string) =>
    toggleSelection(value, selectedShoes, setSelectedShoes);
  const toggleNeckAccessory = (value: string) =>
    toggleSelection(value, selectedNeckAccessories, setSelectedNeckAccessories);
  const toggleBracelet = (value: string) =>
    toggleSelection(value, selectedBracelets, setSelectedBracelets);
  const toggleWatch = (value: string) =>
    toggleSelection(value, selectedWatch, setSelectedWatch);
  const toggleBelt = (value: string) =>
    toggleSelection(value, selectedBelt, setSelectedBelt);

  // Function to add a custom item
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
    sumSelected(selectedHeadWear, headWearOptions);
    sumSelected(selectedSuperior, superiorOptions);
    sumSelected(selectedPants, pantsOptions);
    sumSelected(selectedShoes, shoesOptions);
    sumSelected(selectedNeckAccessories, neckAccessoryOptions);
    sumSelected(selectedBracelets, braceletOptions);
    sumSelected(selectedWatch, watchOptions);
    sumSelected(selectedBelt, beltOptions);

    customItems.forEach((item) => {
      total += item.price;
    });

    return total;
  }, [
    selectedHairstyles,
    selectedGlasses,
    selectedHeadWear,
    selectedSuperior,
    selectedPants,
    selectedShoes,
    selectedNeckAccessories,
    selectedBracelets,
    selectedWatch,
    selectedBelt,
    customItems,
  ]);

  // Create summary object for display
  const wardrobeSummary = useMemo(() => {
    return {
      head: {
        hairstyles: selectedHairstyles,
        glasses: selectedGlasses,
        headWear: selectedHeadWear,
      },
      upper: selectedSuperior,
      lower: selectedPants,
      feet: selectedShoes,
      accessories: {
        neckAccessories: selectedNeckAccessories,
        bracelets: selectedBracelets,
        watch: selectedWatch,
        belt: selectedBelt,
      },
      customItems,
      totalPrice,
    };
  }, [
    selectedHairstyles,
    selectedGlasses,
    selectedHeadWear,
    selectedSuperior,
    selectedPants,
    selectedShoes,
    selectedNeckAccessories,
    selectedBracelets,
    selectedWatch,
    selectedBelt,
    customItems,
    totalPrice,
  ]);

  // Function to handle export of invoice using jsPDFInvoiceTemplate
  const handleExportInvoice = () => {
    const invoiceItems = [];
    let serial = 1;

    // Helper to push found items from a category
    const pushItems = (selectedArray, options, categoryLabel) => {
      selectedArray.forEach((val) => {
        const option = options.find((item) => item.value === val);
        if (option) {
          invoiceItems.push({
            serial: serial++,
            description: `${categoryLabel}: ${option.label}`,
            quantity: 1,
            price: option.price,
            tax: 0,
          });
        }
      });
    };

    pushItems(selectedHairstyles, hairstyleOptions, "Cabelo");
    pushItems(selectedGlasses, glassesOptions, "Óculos");
    pushItems(selectedHeadWear, headWearOptions, "Head Wear");
    pushItems(selectedSuperior, superiorOptions, "Parte Superior");
    pushItems(selectedPants, pantsOptions, "Pants");
    pushItems(selectedShoes, shoesOptions, "Shoes");
    pushItems(selectedNeckAccessories, neckAccessoryOptions, "Neck Accessories");
    pushItems(selectedBracelets, braceletOptions, "Bracelet");
    pushItems(selectedWatch, watchOptions, "Watch");
    pushItems(selectedBelt, beltOptions, "Belt");

    // Also add custom items
    customItems.forEach((item) => {
      invoiceItems.push({
        serial: serial++,
        description: `Custom (${item.category}): ${item.name}`,
        quantity: 1,
        price: item.price,
        tax: 0,
      });
    });

    const propsObject = {
      outputType: "blob", // Alternatively: "save"
      returnJsPDFDocObject: true,
      fileName: "fatura.pdf",
      orientationLandscape: false,
      logo: {
        src: "https://via.placeholder.com/150", // Replace with your logo
        type: "PNG",
        width: 50,
        height: 50,
      },
      business: {
        name: "Wardrobe Planning Inc.",
        address: "123 Fashion Ave",
        phone: "123-456-7890",
        email: "info@wardrobe.com",
      },
      contact: {
        label: "Cliente",
        name: "Nome do Cliente",
        address: "",
        phone: "",
        email: "",
      },
      invoice: {
        label: "Fatura",
        num: new Date().getTime().toString(),
        date: new Date().toLocaleDateString(),
      },
      invoice_items: invoiceItems,
      additionalRows: [
        {
          col1: "Total Estimado",
          col2: `€${totalPrice.toFixed(2)}`,
        },
      ],
      footer: "Obrigado pela sua compra!",
    };

    // Use the default export function (this avoids the "undefined" error)
    jsPDFInvoiceTemplate.default(propsObject);
  };

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">Outfit</h1>
      <p>Selecione ou personalize os itens do seu vestuário para o videoclip</p>

      <div className="grid grid-cols-1 gap-6">
        {/* HEAD Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">HEAD 🧢</h2>
          <Label className="mb-2 block">Cabelo</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {hairstyleOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedHairstyles.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleHairstyle(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          <Label className="mb-2 block">Óculos</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {glassesOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedGlasses.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleGlasses(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          <Label className="mb-2 block">Head Wear</Label>
          <div className="flex flex-wrap gap-4">
            {headWearOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedHeadWear.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleHeadWear(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* UPPER Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">UPPER 👕</h2>
          <Label className="mb-2 block">Parte Superior</Label>
          <div className="flex flex-wrap gap-4">
            {superiorOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedSuperior.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleSuperior(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* LOWER Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">LOWER 👖</h2>
          <Label className="mb-2 block">Pants</Label>
          <div className="flex flex-wrap gap-4">
            {pantsOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedPants.includes(option.value) ? "default" : "outline"
                }
                onClick={() => togglePants(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* FEET Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">FEET 👟</h2>
          <Label className="mb-2 block">Shoes</Label>
          <div className="flex flex-wrap gap-4">
            {shoesOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedShoes.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleShoes(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
        </div>

        {/* ACCESSORIES Section */}
        <div className="border rounded p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">ACCESSORIES ⌚📿</h2>
          <Label className="mb-2 block">Neck Accessories</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {neckAccessoryOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedNeckAccessories.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleNeckAccessory(option.value)}
              >
                {option.label} {option.price > 0 && `(€${option.price})`}
              </Button>
            ))}
          </div>
          <Label className="mb-2 block">Bracelets</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {braceletOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedBracelets.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleBracelet(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
          <Label className="mb-2 block">Watch</Label>
          <div className="flex flex-wrap gap-4 mb-4">
            {watchOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedWatch.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleWatch(option.value)}
              >
                {option.label} (€{option.price})
              </Button>
            ))}
          </div>
          <Label className="mb-2 block">Belt</Label>
          <div className="flex flex-wrap gap-4">
            {beltOptions.map((option) => (
              <Button
                key={option.value}
                variant={
                  selectedBelt.includes(option.value) ? "default" : "outline"
                }
                onClick={() => toggleBelt(option.value)}
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

      {/* Summary Section */}
      <div className="border rounded p-4 shadow-md flex flex-col gap-4">
        <h2 className="text-2xl font-bold">Resumo do Vestuário</h2>
        <pre className="text-sm whitespace-pre-wrap">
          {JSON.stringify(wardrobeSummary, null, 2)}
        </pre>
        <div className="text-xl font-bold">Total Estimado: €{totalPrice.toFixed(2)}</div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => (window.location.href = "/filmagem")}>
            Confirmar Vestuário
          </Button>
          <Button variant="outline" onClick={handleExportInvoice}>
            EXPORTAR FATURA
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WardrobePlanningPage;
