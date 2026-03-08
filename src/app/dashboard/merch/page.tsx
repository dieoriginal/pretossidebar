"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import ControlRoomSidebar from "@/components/control-room-sider";
import Metronome from "@/components/admin-panel/estrofes/metronome";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

import { MapPin, Clock, Phone} from 'lucide-react';

import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetHeader, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useSidebar } from "@/hooks/use-sidebar";


import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import jsPDF from "jspdf";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  X,
  Plus,
  Trash2,
  Eye,
  FileText,
  Video,
  Image,
  Info,
  Save,
  LayoutGrid,
  LogOut,
  User,
  MenuIcon,
  PanelsTopLeft,
  ChevronLeft,
  ChevronDown,
  Dot,
  ShoppingCart,
  Package,
  TrendingUp,
  Euro,
  Calculator,
  BarChart3,
  Truck,
  Factory,
  Target,
  Users,
  Zap,
  Edit
} from "lucide-react";
import { Select } from "@/components/ui/select";
// import { debounce } from "lodash";
import {
  db,
  auth,
  syncProjectToCloud,
  saveProjectLocally,
  saveProjectToFirebase,
} from "@/lib/firebase";
import { salvarProjeto, carregarProjeto } from "@/lib/storage";
import { setCookie, getCookie } from "@/lib/cookies";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import RhymeItEmbed from "@/components/RhymeItEmbed";
import ReferenceTabs from "@/components/ReferenceTabs";
import { PanelRight, PanelRightClose } from "lucide-react";

import NarratologiaTab from "@/components/narratologia-tab";

import AccountStep from "@/steps/account";
import ContratualizacaoStep from "@/steps/contratualizacao";
import CustosFixosStep from "@/steps/custosfixos";
import DireitosAutoraisStep from "@/steps/direitosautorais";
import FilmagemStep from "@/steps/filmagem";
import FotografiaStep from "@/steps/fotografia";
import GravacaoStep from "@/steps/gravacao";
import LancamentoStep from "@/steps/lancamento";
import VideoEditChecklist from "@/steps/edicaodevideo";
import MonetizacaoStep from "@/steps/monetizacao";
import NarratologiaStep from "@/steps/narratologia";
import OrcamentoStep from "@/steps/orcamento";
import VestuarioStep from "@/steps/vestuario";
import TShirtTextBuckets from "@/components/merch/TShirtTextBuckets";

// Use static import to avoid dev chunk loading timeouts

// Interfaces para Merchandise
interface Product {
  id: string;
  name: string;
  type: 't-shirt' | 'hoodie' | 'cap' | 'poster' | 'vinyl' | 'cd' | 'sticker' | 'mug' | 'tote-bag' 
    | 'pulseira-silicone' | 'pulseira-tecido' 
    | 'pin-metalico-2d' | 'pin-metalico-2d-colorido' | 'pin-3d' | 'pin-impresso' | 'pin-ouro' | 'pin-prata'
    | 'porta-chaves-metalico' | 'porta-chaves';
  size?: string;
  color?: string;
  design: string;
  baseCost: number;
  productionCost: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  supplier: string;
  productionTime: number; // dias
  description: string;
  image?: File | string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: string;
  name: string;
  type: 'dtf' | 'sublimation' | 'embroidery' | 'vinyl' | 'printing' | 'manufacturing';
  contact: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  rating: number;
  deliveryTime: number; // dias
  minimumOrder: number;
  notes: string;
  isActive: boolean;
  website?: string;
  measurements?: {
    maxWidthCm: number | null;
    rollAvailable: boolean;
    commonSizesCm: Array<{
      widthCm: number | null;
      heightCm: number | null;
      note?: string;
    }>;
  };
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  orderDate: string;
  shippingDate?: string;
  trackingNumber?: string;
  notes?: string;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  products: number;
}

interface ProductionBatch {
  id: string;
  productId: string;
  quantity: number;
  startDate: string;
  endDate?: string;
  status: 'planned' | 'in-production' | 'completed' | 'cancelled';
  cost: number;
  notes: string;
}

const initialProduct: Product = {
  id: '',
  name: '',
  type: 't-shirt',
  size: 'M',
  color: 'Preto',
  design: '',
  baseCost: 0,
  productionCost: 0,
  sellingPrice: 0,
  stock: 0,
  minStock: 5,
  supplier: '',
  productionTime: 7,
  description: '',
  tags: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Dados de exemplo para merchandise
const productTypes = [
  // Roupas e Acessórios
  { value: 't-shirt', label: 'T-Shirt', icon: '👕', baseCost: 8 },
  { value: 'hoodie', label: 'Hoodie', icon: '🧥', baseCost: 25 },
  { value: 'cap', label: 'Boné', icon: '🧢', baseCost: 12 },
  { value: 'tote-bag', label: 'Tote Bag', icon: '👜', baseCost: 4 },
  
  // Pulseiras
  { value: 'pulseira-silicone', label: 'Pulseira de Silicone', icon: '💫', baseCost: 1.5 },
  { value: 'pulseira-tecido', label: 'Pulseira de Tecido', icon: '🎗️', baseCost: 1.2 },
  
  // Pins Personalizados
  { value: 'pin-metalico-2d', label: 'Pin Metálico 2D', icon: '📌', baseCost: 2.5 },
  { value: 'pin-metalico-2d-colorido', label: 'Pin Metálico 2D Colorido', icon: '🎨', baseCost: 3.5 },
  { value: 'pin-3d', label: 'Pin 3D com Relevos', icon: '🔺', baseCost: 4.5 },
  { value: 'pin-impresso', label: 'Pin Impresso', icon: '🖼️', baseCost: 2.0 },
  { value: 'pin-ouro', label: 'Pin de Ouro 18k', icon: '⭐', baseCost: 150 },
  { value: 'pin-prata', label: 'Pin de Prata 925', icon: '✨', baseCost: 45 },
  
  // Porta-chaves
  { value: 'porta-chaves-metalico', label: 'Porta-chaves Metálico', icon: '🔑', baseCost: 3.0 },
  { value: 'porta-chaves', label: 'Porta-chaves (Outros)', icon: '🗝️', baseCost: 2.5 },
  
  // Mídia e Impressos
  { value: 'poster', label: 'Poster', icon: '🖼️', baseCost: 3 },
  { value: 'vinyl', label: 'Vinyl', icon: '💿', baseCost: 15 },
  { value: 'cd', label: 'CD', icon: '💽', baseCost: 5 },
  { value: 'sticker', label: 'Sticker', icon: '🏷️', baseCost: 0.5 },
  { value: 'mug', label: 'Caneca', icon: '☕', baseCost: 6 },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const colors = ['Preto', 'Branco', 'Cinza', 'Azul', 'Vermelho', 'Verde', 'Amarelo', 'Rosa'];

const portugueseSuppliers: Supplier[] = [
  {
    id: 'impressaodtf',
    name: 'ImpressaoDTF',
    type: 'dtf',
    contact: 'Support',
    email: 'geral@impressaodtf.pt',
    phone: '',
    address: 'Zona Industrial da Maia I, Sector I, Rua de Raimundo Durães Magalhães, 203',
    city: 'Maia',
    postalCode: '4475-189',
    country: 'Portugal',
    website: 'https://impressaodtf.pt',
    rating: 4.7,
    deliveryTime: 3,
    minimumOrder: 1,
    notes: 'Impressão DTF a metro (57×100cm disponível). Envio para Portugal Continental.',
    isActive: true,
    measurements: {
      maxWidthCm: 57,
      rollAvailable: true,
      commonSizesCm: [
        { widthCm: 57, heightCm: 100, note: 'Formato referido no site (57×100 cm)' },
        { widthCm: 57, heightCm: 1000, note: 'Também disponível por metro linear — comprimento conforme encomenda' }
      ]
    }
  },
  {
    id: 'manuela_impressoes',
    name: 'Manuela Impressões',
    type: 'dtf',
    contact: 'Manuela Impressões Team',
    email: 'apoio@manuelaimpressoes.com',
    phone: '+351 913 446 343',
    address: 'Rua Antão de Almada 304',
    city: 'Rio Tinto / Gondomar',
    postalCode: '4435-013',
    country: 'Portugal',
    website: 'https://www.manuelaimpressoes.com',
    rating: 4.5,
    deliveryTime: 2,
    minimumOrder: 1,
    notes: 'Serviços de DTF e embalagens; “Preço a partir de” indicado no site — confirmar unidade (por metro/fatia).',
    isActive: true,
    measurements: {
      maxWidthCm: 58,
      rollAvailable: true,
      commonSizesCm: [
        { widthCm: 58, heightCm: 100, note: 'Largura útil até 58 cm (valor indicado no site)' },
        { widthCm: 58, heightCm: 1000, note: 'Normalmente vendido por metro linear — confirmar preço por unidade' }
      ]
    }
  },
  {
    id: 'copimaia',
    name: 'Copimaia',
    type: 'dtf',
    contact: 'Copimaia Team',
    email: 'geral@copimaia.pt',
    phone: '+351 221 155 186',
    address: 'Rua Doutor Carlos Felgueiras, 71, Loja 7',
    city: 'Maia',
    postalCode: '4470-157',
    country: 'Portugal',
    website: 'https://copimaia.pt',
    rating: 4.6,
    deliveryTime: 3,
    minimumOrder: 1,
    notes: 'Centro de impressão na Maia; DTF por metro linear e formatos A5/A4/A3.',
    isActive: true,
    measurements: {
      maxWidthCm: null,
      rollAvailable: true,
      commonSizesCm: [
        { widthCm: 14.8, heightCm: 21, note: 'A5 (exemplo de formato pequeno disponível)' },
        { widthCm: 21, heightCm: 29.7, note: 'A4' },
        { widthCm: 29.7, heightCm: 42, note: 'A3' },
        { widthCm: null, heightCm: 1000, note: 'DTF por metro linear — largura variável (confirmar largura máxima)' }
      ]
    }
  },
  {
    id: 'ncopias',
    name: 'NCópias',
    type: 'dtf',
    contact: 'NCópias Support',
    email: 'geral@ncopias.pt',
    phone: '+351 914 159 017',
    address: 'Rua Tomás Del-Negro 5',
    city: 'Lisboa',
    postalCode: '1750-105',
    country: 'Portugal',
    website: 'https://www.ncopias.pt',
    rating: 4.4,
    deliveryTime: 1,
    minimumOrder: 1,
    notes: 'Serviço 100% online; preço indicado de €5,00/m (largura máxima 29 cm) — bom para encomendas por metro, pese portes se vier do Sul.',
    isActive: true,
    measurements: {
      maxWidthCm: 29,
      rollAvailable: true,
      commonSizesCm: [
        { widthCm: 29, heightCm: 100, note: 'Preço indicado para 1 metro linear à largura máxima (29×100 cm)' },
        { widthCm: 29, heightCm: 1000, note: 'Venda por metro linear (comprimento à medida)' }
      ]
    }
  },
  {
    id: 'letscopy',
    name: "LET'S COPY",
    type: 'dtf',
    contact: "LET'S COPY",
    email: 'ajuda@letscopy.pt',
    phone: '+351 213 885 086',
    address: 'Av. Eng. Duarte Pacheco (Amoreiras) / lojas em Lisboa',
    city: 'Lisboa',
    postalCode: '1070-103',
    country: 'Portugal',
    website: 'https://letscopy.pt',
    rating: 4.3,
    deliveryTime: 2,
    minimumOrder: 1,
    notes: 'Tens usado; referência para pequenos e grandes formatos (várias lojas em Lisboa).',
    isActive: true,
    measurements: {
      maxWidthCm: null,
      rollAvailable: true,
      commonSizesCm: [
        { widthCm: 100, heightCm: 27, note: 'Formato que indicaste usar (100×27 cm)' },
        { widthCm: null, heightCm: null, note: 'Outros formatos disponíveis nas lojas — confirmar largura máxima se precisares de peças largas' }
      ]
    }
  },
];


const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Diepretty T-Shirt Preto',
    type: 't-shirt',
    size: 'M',
    color: 'Preto',
    design: 'Logo Diepretty Mercédes',
    baseCost: 8,
    productionCost: 3,
    sellingPrice: 25,
    stock: 50,
    minStock: 10,
    supplier: 'DTF Express Porto',
    productionTime: 3,
    description: 'T-shirt básica com logo do artista',
    tags: ['logo', 'básico', 'preto'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Diepretty Hoodie Cinza',
    type: 'hoodie',
    size: 'L',
    color: 'Cinza',
    design: 'Diepretty Underground',
    baseCost: 25,
    productionCost: 8,
    sellingPrice: 65,
    stock: 20,
    minStock: 5,
    supplier: 'Sublimação Lisboa',
    productionTime: 5,
    description: 'Hoodie premium com design exclusivo',
    tags: ['hoodie', 'premium', 'underground'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Configurações de produção
const productionSettings = {
  dtfCost: 2.5, // € por peça
  sublimationCost: 3.0, // € por peça
  embroideryCost: 5.0, // € por peça
  vinylCost: 1.5, // € por peça
  printingCost: 0.8, // € por peça
  shippingCost: 4.5, // € por encomenda
  packagingCost: 1.0, // € por encomenda
  profitMargin: 0.4, // 40% de margem
};

const orderStatuses = [
  { value: 'pending', label: 'Pendente', color: 'yellow' },
  { value: 'processing', label: 'Em Processamento', color: 'blue' },
  { value: 'shipped', label: 'Enviado', color: 'purple' },
  { value: 'delivered', label: 'Entregue', color: 'green' },
  { value: 'cancelled', label: 'Cancelado', color: 'red' },
];

const paymentStatuses = [
  { value: 'pending', label: 'Pendente', color: 'yellow' },
  { value: 'paid', label: 'Pago', color: 'green' },
  { value: 'refunded', label: 'Reembolsado', color: 'red' },
];

// Componentes de Merchandise
const ProductCard = ({ product, onEdit, onDelete, onToggleActive }: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
}) => {
  const productType = productTypes.find(t => t.value === product.type);
  const profit = product.sellingPrice - product.baseCost - product.productionCost;
  const profitMargin = ((profit / product.sellingPrice) * 100).toFixed(1);

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{productType?.icon}</span>
          <div>
            <h3 className="font-bold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600">{productType?.label} • {product.color} • {product.size}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
    </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-600">Stock</p>
          <p className={`font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-green-500'}`}>
            {product.stock} unidades
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Preço de Venda</p>
          <p className="font-bold text-lg">€{product.sellingPrice}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-600">Custo Base</p>
          <p className="font-semibold">€{product.baseCost}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Custo Produção</p>
          <p className="font-semibold">€{product.productionCost}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">Lucro</p>
          <p className="font-bold text-green-600">€{profit.toFixed(2)} ({profitMargin}%)</p>
        </div>
        <Badge variant={product.isActive ? "default" : "secondary"}>
          {product.isActive ? "Ativo" : "Inativo"}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-1">
        {product.tags.map((tag, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </Card>
  );
};

// Componente de Calculadora de Preços
const PriceCalculator = ({ product, onUpdate }: {
  product: Product;
  onUpdate: (product: Product) => void;
}) => {
  const [baseCost, setBaseCost] = useState(product.baseCost);
  const [productionCost, setProductionCost] = useState(product.productionCost);
  const [profitMargin, setProfitMargin] = useState(40);

  const calculateSellingPrice = () => {
    const totalCost = baseCost + productionCost;
    const profit = totalCost * (profitMargin / 100);
    return totalCost + profit;
  };

  const sellingPrice = calculateSellingPrice();

  useEffect(() => {
    const totalCost = baseCost + productionCost;
    const profit = totalCost * (profitMargin / 100);
    const computedSelling = Math.round((totalCost + profit) * 100) / 100;
    onUpdate({
      ...product,
      baseCost,
      productionCost,
      sellingPrice: computedSelling,
    });
  }, [baseCost, productionCost, profitMargin, onUpdate, product]);

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg mb-4">Calculadora de Preços</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Custo Base (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={baseCost}
            onChange={(e) => setBaseCost(Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Custo de Produção (€)</Label>
          <Input
            type="number"
            step="0.01"
            value={productionCost}
            onChange={(e) => setProductionCost(Number(e.target.value))}
          />
        </div>
        
        <div>
          <Label>Margem de Lucro (%)</Label>
          <Input
            type="number"
            value={profitMargin}
            onChange={(e) => setProfitMargin(Number(e.target.value))}
          />
        </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <div className="flex justify-between">
            <span>Custo Total:</span>
            <span className="font-bold">€{(baseCost + productionCost).toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Preço de Venda:</span>
            <span className="font-bold text-green-600">€{sellingPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Lucro:</span>
            <span className="font-bold text-blue-600">€{(sellingPrice - baseCost - productionCost).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Componente de Gestão de Stock
const StockManager = ({ product, onUpdate }: {
  product: Product;
  onUpdate: (product: Product) => void;
}) => {
  const [stock, setStock] = useState(product.stock);
  const [minStock, setMinStock] = useState(product.minStock);

  useEffect(() => {
    onUpdate({
      ...product,
      stock,
      minStock,
    });
  }, [stock, minStock, onUpdate, product]);

  const isLowStock = stock <= minStock;

  return (
    <Card className="p-4">
      <h3 className="font-bold text-lg mb-4">Gestão de Stock</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Stock Atual</Label>
          <Input
            type="number"
            value={stock}
            onChange={(e) => setStock(Number(e.target.value))}
            className={isLowStock ? "border-red-500" : ""}
          />
          {isLowStock && (
            <p className="text-red-500 text-sm mt-1">⚠️ Stock baixo!</p>
          )}
        </div>
        
        <div>
          <Label>Stock Mínimo</Label>
        <Input
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(Number(e.target.value))}
          />
                  </div>
        
        <div className="p-3 bg-gray-50 rounded">
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`font-bold ${isLowStock ? 'text-red-500' : 'text-green-500'}`}>
              {isLowStock ? 'Stock Baixo' : 'Stock OK'}
            </span>
                </div>
          <div className="flex justify-between">
            <span>Unidades disponíveis:</span>
            <span className="font-bold">{stock}</span>
            </div>
        </div>
      </div>
    </Card>
  );
};

// Componente de Dashboard de Vendas
const SalesDashboard = ({ salesData, orders }: {
  salesData: SalesData[];
  orders: Order[];
}) => {
  const totalRevenue = salesData.reduce((sum, data) => sum + data.revenue, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Receita Total</p>
            <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
          </div>
          <Euro className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total de Encomendas</p>
            <p className="text-2xl font-bold text-blue-600">{totalOrders}</p>
          </div>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Valor Médio por Encomenda</p>
            <p className="text-2xl font-bold text-purple-600">€{averageOrderValue.toFixed(2)}</p>
          </div>
          <TrendingUp className="h-8 w-8 text-purple-600" />
        </div>
      </Card>
    </div>
  );
};

// Componente de Formulário de Produto
const ProductForm = ({ product, onSave, onCancel }: {
  product: Product;
  onSave: (product: Product) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState(product);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {product.id ? 'Editar Produto' : 'Novo Produto'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome do Produto</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Diepretty T-Shirt Preto"
              required
            />
          </div>
          
          <div>
            <Label>Tipo de Produto</Label>
      <select
        title="Tipo de Produto"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full p-2 border rounded"
            >
              {productTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
              </option>
            ))}
          </select>
          </div>

          <div>
            <Label>Tamanho</Label>
      <select
        title="Tamanho"
              value={formData.size || ''}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {sizes.map((size) => (
                <option key={size} value={size}>{size}</option>
            ))}
          </select>
          </div>

          <div>
            <Label>Cor</Label>
      <select
        title="Cor"
              value={formData.color || ''}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full p-2 border rounded"
            >
              {colors.map((color) => (
                <option key={color} value={color}>{color}</option>
            ))}
          </select>
          </div>
          
          <div>
            <Label>Design</Label>
            <Input
              value={formData.design}
              onChange={(e) => setFormData({ ...formData, design: e.target.value })}
              placeholder="Ex: Logo Diepretty Mercédes"
            />
          </div>
          
          <div>
            <Label>Fornecedor</Label>
      <select
        title="Fornecedor"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full p-2 border rounded"
            >
              <option value="">Selecione um fornecedor</option>
              {portugueseSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name} - {supplier.type}
              </option>
            ))}
          </select>
        </div>
      </div>

        <div>
          <Label>Descrição</Label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Descrição do produto..."
          />
      </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Save className="h-4 w-4 mr-2" />
            {product.id ? 'Atualizar' : 'Criar'} Produto
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
              </Button>
            </div>
      </form>
    </Card>
  );
};

// Componente de Lista de Encomendas
const OrdersList = ({ orders, onUpdateStatus }: {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: string) => void;
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-4">Encomendas Recentes</h3>
      
      <div className="space-y-4">
        {orders.slice(-10).reverse().map((order) => {
          const statusInfo = orderStatuses.find(s => s.value === order.status);
          const paymentInfo = paymentStatuses.find(s => s.value === order.paymentStatus);
          
          return (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{order.customerName}</h4>
                  <p className="text-sm text-gray-600">{order.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">€{order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.orderDate).toLocaleDateString('pt-PT')}
          </p>
        </div>
    </div>
              
              <div className="flex gap-2 mb-3">
                <Badge 
                  variant="outline" 
                  className="border-yellow-500 text-yellow-700"
                >
                  {statusInfo?.label}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="border-green-500 text-green-700"
                >
                  {paymentInfo?.label}
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <select
                  title="Atualizar status da encomenda"
                  value={order.status}
                  onChange={(e) => onUpdateStatus(order.id, e.target.value)}
                  className="text-sm p-1 border rounded"
                >
                  {orderStatuses.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4" />
                </Button>
          </div>
        </div>
          );
        })}
      </div>
    </Card>
  );
};

// Funções de Merchandise
const calculateProfit = (product: Product) => {
  return product.sellingPrice - product.baseCost - product.productionCost;
};

const calculateProfitMargin = (product: Product) => {
  const profit = calculateProfit(product);
  return (profit / product.sellingPrice) * 100;
};

const generateOrderNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD${year}${month}${day}${random}`;
};

const exportProductsToCSV = (products: Product[]) => {
  const headers = ['Nome', 'Tipo', 'Tamanho', 'Cor', 'Stock', 'Preço', 'Custo Base', 'Custo Produção', 'Lucro', 'Fornecedor'];
  const csvContent = [
    headers.join(','),
    ...products.map(product => [
      product.name,
      product.type,
      product.size || '',
      product.color || '',
      product.stock,
      product.sellingPrice,
      product.baseCost,
      product.productionCost,
      calculateProfit(product).toFixed(2),
      product.supplier
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `produtos_diepretty_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Função para exportar relatório de merchandise
const exportMerchandiseReport = (products: Product[], orders: Order[]) => {
  const doc = new jsPDF('p', 'pt', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  let yPosition = margin;
  const lineHeight = 16;

  // Helper function to check page break
  const checkPageBreak = (heightNeeded: number) => {
    if (yPosition + heightNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, fontSize: number = 14) => {
    checkPageBreak(lineHeight + 10);
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text(title, margin, yPosition);
    yPosition += lineHeight + 5;
  };

  // Helper function to add info row
  const addInfoRow = (label: string, value: string) => {
    checkPageBreak(lineHeight);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(52, 73, 94);
    doc.text(`${label}:`, margin, yPosition);
    doc.setTextColor(44, 62, 80);
    doc.text(value, margin + 100, yPosition);
    yPosition += lineHeight;
  };

  // Header
  addSectionHeader('RELATÓRIO DE MERCHANDISE - DIEPRETY MERCÉDES', 18);
      yPosition += 20;

  // Summary
  addSectionHeader('Resumo Executivo', 14);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;

  addInfoRow('Receita Total', `€${totalRevenue.toFixed(2)}`);
  addInfoRow('Total de Produtos', totalProducts.toString());
  addInfoRow('Produtos Ativos', activeProducts.toString());
  addInfoRow('Produtos com Stock Baixo', lowStockProducts.toString());
  addInfoRow('Total de Encomendas', orders.length.toString());

  yPosition += 20;
  
  // Products section
  addSectionHeader('Catálogo de Produtos', 14);
  
  products.forEach((product, index) => {
    checkPageBreak(60);
    addInfoRow(`Produto ${index + 1}`, product.name);
    addInfoRow('Tipo', product.type);
    addInfoRow('Tamanho/Cor', `${product.size || 'N/A'} / ${product.color || 'N/A'}`);
    addInfoRow('Stock', `${product.stock} unidades`);
    addInfoRow('Preço de Venda', `€${product.sellingPrice}`);
    addInfoRow('Custo Total', `€${(product.baseCost + product.productionCost).toFixed(2)}`);
    addInfoRow('Lucro', `€${calculateProfit(product).toFixed(2)} (${calculateProfitMargin(product).toFixed(1)}%)`);
    addInfoRow('Fornecedor', product.supplier);
    yPosition += 10;
  });
  
  yPosition += 20;

  // Orders section
  addSectionHeader('Encomendas Recentes', 14);
  
  orders.slice(-10).forEach((order, index) => {
    checkPageBreak(40);
    addInfoRow(`Encomenda ${index + 1}`, order.customerName);
    addInfoRow('Email', order.customerEmail);
    addInfoRow('Valor', `€${order.total.toFixed(2)}`);
    addInfoRow('Status', order.status);
    addInfoRow('Data', new Date(order.orderDate).toLocaleDateString('pt-PT'));
    yPosition += 10;
  });

  doc.save(`relatorio_merchandise_diepretty_${new Date().toISOString().split('T')[0]}.pdf`);
};

// Dados de exemplo para encomendas
const sampleOrders: Order[] = [
  {
    id: '1',
    customerName: 'João Silva',
    customerEmail: 'joao@email.com',
    customerPhone: '+351 912 345 678',
    shippingAddress: 'Rua das Flores, 123, Porto',
    products: [
      { productId: '1', quantity: 2, price: 25 },
      { productId: '2', quantity: 1, price: 65 }
    ],
    subtotal: 115,
    shipping: 4.5,
    total: 119.5,
    status: 'shipped',
    paymentStatus: 'paid',
    orderDate: new Date().toISOString(),
    shippingDate: new Date().toISOString(),
    trackingNumber: 'PT123456789',
    notes: 'Cliente VIP'
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    customerEmail: 'maria@email.com',
    customerPhone: '+351 918 765 432',
    shippingAddress: 'Avenida da Liberdade, 456, Lisboa',
    products: [
      { productId: '1', quantity: 1, price: 25 }
    ],
    subtotal: 25,
    shipping: 4.5,
    total: 29.5,
    status: 'processing',
    paymentStatus: 'paid',
    orderDate: new Date(Date.now() - 86400000).toISOString(),
    notes: 'Primeira compra'
  }
];

const sampleSalesData: SalesData[] = [
  { date: '2024-01-01', revenue: 150, orders: 3, products: 5 },
  { date: '2024-01-02', revenue: 200, orders: 4, products: 7 },
  { date: '2024-01-03', revenue: 300, orders: 6, products: 10 },
  { date: '2024-01-04', revenue: 180, orders: 3, products: 6 },
  { date: '2024-01-05', revenue: 250, orders: 5, products: 8 }
];

/* ------------------ Navbar ------------------ */
interface NavbarProps {
  title: string;
}

function Navbar({ title }: NavbarProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setAudioUrl(URL.createObjectURL(file));
    }
  };

  return (
    <header className="sticky top-0 z-10 h-[89px] w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:shadow-secondary">
      <div className="mx-4 sm:mx-8 flex items-center justify-between">
        <div id="borda-esquerda" className="border border-transparent h-[59px] w-[141px] rounded-lg">
          <div id="borda-titulo" className="border border-transparent h-[39px] w-[121px] rounded-lg ml-18 mt-2.5">
            <div className="items-center ml-8">
              <h1 className="font-extrabold font-arial text-3xl tracking-tighter -m-1 italic">
                PRETOS
                <h1 className="text-lg -mt-4 italic tracking-widest">MUSIC</h1>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-1 justify-center">
          <div className="border h-[89px] w-full max-w-[1556px] rounded-lg flex">
            <div className="flex-1 p-4">
              <div className="flex items-center justify-center gap-4">
                {/* Audio Upload Section */}
                <div className="w-[120px] p-2 flex flex-col items-center justify-center rounded-lg bg-background/50 backdrop-blur">
                  <div className="relative w-full">
                    <input
                      aria-label="Upload audio file"
                      type="file"
                      accept=".wav, audio/*, */*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center">
                      Upload
                    </div>
                  </div>
                </div>

                {/* Audio Player Section */}
                <div className="flex-1 min-w-[400px] mx-2 rounded-lg p-2 mt-2 bg-background/50 backdrop-blur">
                  <div className="flex flex-col gap-1 w-full">
                    {/* File Name Display */}
                    {audioFile && (
                      <div className="text-sm font-medium text-center truncate">
                        {audioFile.name}
                      </div>
                    )}

                    <div className="flex items-center gap-1 w-full">
                      <audio ref={audioRef} src={audioUrl || ""} controls className="w-full h-8" />
                      <button onClick={() => audioRef.current?.play()} className="p-1 bg-green-500 text-white rounded-lg hover:bg-green-600">
                        ▶️
                      </button>
                      <button onClick={() => audioRef.current?.pause()} className="p-1 bg-red-500 text-white rounded-lg hover:bg-red-600">
                        ⏸️
                      </button>
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            audioRef.current.play();
                          }
                        }}
                        className="p-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        ⏮️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Metronome Section */}
                <div className="w-[120px] p-2 rounded-lg bg-background/50 backdrop-blur">
                  <Metronome />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <ModeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
/* ------------------ Merged ContentLayout ------------------ */
interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

interface Step {
  name: string;
  link: string;
  timeframe: string;
  description: string;
}

interface MultiStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

const MultiStepper: React.FC<MultiStepperProps> = ({ steps, currentStep, onStepClick }) => {
  // Use discrete grid spans to avoid inline styles for width
  const spanClasses = [
    "col-span-1",
    "col-span-2",
    "col-span-3",
    "col-span-4",
    "col-span-5",
    "col-span-6",
    "col-span-7",
    "col-span-8",
    "col-span-9",
    "col-span-10",
  ];
  const clampedIndex = Math.min(9, Math.max(0, currentStep));
  const progressSpanClass = spanClasses[clampedIndex];

  return (
    <div className="flex flex-col gap-4 w-full overflow-x-auto">
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden grid grid-cols-10">
        <div className={`h-full bg-primary transition-all duration-300 ${progressSpanClass}`} />
      </div>
      
      <div className="flex items-center justify-between relative">
        <div className="absolute left-[30%] top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />
        <div className="absolute left-[70%] top-0 h-full w-px bg-gray-300 dark:bg-gray-600" />
        
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center border text-sm font-medium transition-colors duration-300 ${
                        index <= currentStep
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                      }`}
                    >
                      {index + 1}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{step.description}</p>
                  </TooltipContent>
                </Tooltip>
              </button>
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-1 ${
                    index < currentStep ? "bg-primary" : "bg-gray-300 dark:bg-gray-600"
                  } mx-2`}
                ></div>
              )}
            </div>
            <span className="mt-2 text-xs text-center">{step.name}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-blue-100 dark:bg-blue-900">
              Mês 1 - Pré-Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Definir base sonora, conceito e letras</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-green-100 dark:bg-green-900">
              Mês 2 - Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Gravação, figurinos e filmagens</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="bg-purple-100 dark:bg-purple-900">
              Mês 3 - Pós-Produção
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Contratos, direitos autorais e lançamento</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

const LayoutDepthContext = React.createContext(0);

export function ContentLayout({ title, children }: ContentLayoutProps) {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;

  const depth = React.useContext(LayoutDepthContext);
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    { name: "Maquete", link: "/obraeurudita", timeframe: "Mês 1", description: "Definir conceito, moodboard, roteiro e tratamento" },
    { name: "Gravação", link: "/gravacao", timeframe: "Mês 1", description: "Agendar estúdio e gravar todas as faixas" },
    { name: "Vestuário", link: "/vestuario", timeframe: "Mês 2", description: "Produzir e provar figurinos para vídeo e material de imprensa" },
    { name: "Orçamento e Aluguer", link: "/orcamento", timeframe: "Mês 2", description: "Distribuir verba entre estúdio, equipe, figurino e reserva" },
    { name: "Filmagem", link: "/filmagem", timeframe: "Mês 2", description: "Executar gravação de vídeo" },
    { name: "Fotografia", link: "/fotografia", timeframe: "Mês 2", description: "Fotos" },
    { name: "Edição de Vídeo  ", link: "/videoclipe", timeframe: "Mês 2", description: "After Effects, Premiere, Davinci Resolve & Photoshop" },
    { name: "Contratualização", link: "/contratualizacao", timeframe: "Mês 3", description: "Fechar contratos com artistas, equipe, distribuidores e plataformas" },
    { name: "Direitos Autorais", link: "/direitosautorais", timeframe: "Mês 3", description: "Registrar obras, liberar samples e licenciar sincronizações" },
    { name: "Lançamento", link: "/lancamento", timeframe: "Mês 3", description: "Implementar distribuição digital, PR, marketing e monitorar resultados" },
    ];

  const stepComponents: Record<number, React.ComponentType<any>> = {
    0: () => null,
    1: GravacaoStep,
    2: VestuarioStep,
    3: OrcamentoStep,
    4: FilmagemStep,
    5: FotografiaStep,
    6: VideoEditChecklist,
    7: ContratualizacaoStep,
    8: DireitosAutoraisStep,
    9: LancamentoStep,
  };

  const ActiveStep = stepComponents[currentStep] ?? (() => null);
  if (depth > 0) {
    return <>{children}</>;
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <LayoutDepthContext.Provider value={depth + 1}>
      <TooltipProvider>
      <div className="w-full overflow-hidden transition-all duration-300">
        <Navbar title={title} />
        {/* Right test sidebar with Rhymit embed */}
 
        
        <AdminPanelLayout>
          <div className="w-full pt-8 pb-8 px-4 mx-auto max-w-[1800px]">
            <div className="p-4 items-center w-full">
              
            </div>

            {children}
          </div>
        </AdminPanelLayout>
      </div>
    </TooltipProvider>
    </LayoutDepthContext.Provider>
  );
}
/* ---------------- End Merged ContentLayout ---------------- */

/* ---------------- Admin-Panel helpers ---------------- */
// Footer
function Footer() {
  return (
    <div className="z-20 w-full bg-background/95 shadow backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-4 md:mx-8 flex h-14 items-center">
        <p className="text-xs md:text-sm leading-loose text-muted-foreground text-left">© PRETOS MUSIC 2025</p>
      </div>
    </div>
  );
}

// User Navigation (avatar dropdown)
function UserNav() {
  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="#" alt="Avatar" />
                  <AvatarFallback className="bg-transparent">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Perfil</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Diepretty Mercédes</p>
            <p className="text-xs leading-none text-muted-foreground">johndoe@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/obraeurudita" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/custosfixos" className="flex items-center">
              <LayoutGrid className="w-4 h-4 mr-3 text-muted-foreground" /> Custos&nbsp;Fixos
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="hover:cursor-pointer" asChild>
            <Link href="/account" className="flex items-center">
              <User className="w-4 h-4 mr-3 text-muted-foreground" /> Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="hover:cursor-pointer">
          <LogOut className="w-4 h-4 mr-3 text-muted-foreground" /> Sign&nbsp;out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Sidebar Toggle button
function SidebarToggle({ isOpen, setIsOpen }: { isOpen: boolean | undefined; setIsOpen?: () => void }) {
  return (
    <div className="invisible lg:visible absolute top-[12px] -right-[16px] z-20">
      <Button onClick={() => setIsOpen?.()} className="rounded-md w-8 h-8" variant="outline" size="icon">
        <ChevronLeft className={cn("h-4 w-4 transition-transform ease-in-out duration-700", isOpen === false ? "rotate-180" : "rotate-0")} />
      </Button>
    </div>
  );
}

// Sheet / menu for small screens
function SheetMenu() {
  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button className="flex justify-center items-center pb-2 pt-1" variant="link" asChild>
            <Link href="/obraeurudita" className="flex items-center gap-2">
              <PanelsTopLeft className="w-6 h-6 mr-1" />
              <SheetTitle className="font-bold text-lg">Brand</SheetTitle>
            </Link>
          </Button>
        </SheetHeader>
        <MenuComponent isOpen />
      </SheetContent>
    </Sheet>
  );
}

// Menu component (rhyme helper)
interface MenuProps { isOpen: boolean | undefined }
function MenuComponent({ isOpen }: MenuProps) {
  // ... (for brevity we invoke original Menu logic by calling getMenuList etc.)
  return <div></div>;
}

// Sidebar component
function Sidebar() {
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<{ syllable: string; count: number; words: string[] }[]>([]);
  const sidebarStore = useSidebar();
  if (!sidebarStore) return null;
  const { isOpen, toggleOpen, getOpenState, setIsHover, settings } = sidebarStore;
  const filterWords = (letter: string) => {
    const mock = [
      { syllable: "sa", count: 15, words: ["saber", "saco", "sagaz"] },
      { syllable: "se", count: 8, words: ["selva", "seda", "seguro"] },
      { syllable: "si", count: 5, words: ["sinal", "sino"] },
    ];
    setResults(mock);
  };

  return (
    <aside className={cn("fixed top-0 left-0 z-20 h-screen -translate-x-full lg:translate-x-0 transition-[width] ease-in-out duration-300", !getOpenState() ? "w-[90px]" : "w-96", settings.disabled && "hidden")}>    
      <SidebarToggle isOpen={isOpen} setIsOpen={toggleOpen} />
      <div onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} className="relative h-full flex flex-col px-3 py-4 overflow-y-auto shadow-md dark:shadow-zinc-800">
        <input type="text" value={filter} onChange={(e) => { setFilter(e.target.value); filterWords(e.target.value); }} placeholder="Filtrar por letra..." className="w-full p-2 border rounded mb-4" />
        {results.map((r, i) => (
          <div key={i} className={cn("mb-2 p-2 border rounded transition-all duration-300", r.words.length > 0 ? "h-auto" : "h-10")}> <div className="font-bold">{r.syllable} ({r.count})</div>{r.words.length > 0 && (<div className="mt-2">{r.words.map((w, idx) => (<span key={idx} className="mr-2">{w}</span>))}</div>)} </div>
        ))}
        <Button className={cn("transition-transform ease-in-out duration-300 mb-1", !getOpenState() ? "translate-x-1" : "translate-x-0")} variant="link" asChild>
          <Link href="/obraeurudita" className="flex items-center gap-2"><PanelsTopLeft className="w-6 h-6 mr-1" /><h1 className={cn("font-bold text-lg whitespace-nowrap transition-[transform,opacity,display] ease-in-out duration-300", !getOpenState() ? "-translate-x-96 opacity-0 hidden" : "translate-x-0 opacity-100")}>Rimas</h1></Link>
        </Button>
        <MenuComponent isOpen={getOpenState()} />
      </div>
    </aside>
  );
}

// Admin Panel Layout
function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const sidebarStore = useSidebar();
  if (!sidebarStore) return null;
  const { getOpenState, settings } = sidebarStore;
  return (
    <>

      <main className={cn("min-h-[calc(100vh_-_56px)] bg-zinc-50 dark:bg-zinc-900 transition-[margin-left] ease-in-out duration-300", !settings.disabled && (!getOpenState() ? "lg:ml-[70px]" : "lg:ml-64"))}>{children}</main>
      <footer className={cn("transition-[margin-left] ease-in-out duration-300", !settings.disabled && (!getOpenState() ? "lg:ml-[90px]" : "lg:ml-72"))}>
        <Footer />
      </footer>
    </>
  );
}

/* ---------------- End Admin-Panel helpers ---------------- */

const Dashboard = () => {
  const router = useRouter();
  const { settings } = useSidebar();
  const [activeTab, setActiveTab] = useState("produtos");
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [products, setProducts] = useState<Product[]>(sampleProducts);
  const [orders, setOrders] = useState<Order[]>(sampleOrders);
  const [salesData, setSalesData] = useState<SalesData[]>(sampleSalesData);
  const [suppliers, setSuppliers] = useState<Supplier[]>(portugueseSuppliers);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleAddProduct = () => {
    setEditingProduct(initialProduct);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (product.id) {
      // Update existing product
      setProducts(products.map(p => p.id === product.id ? product : p));
          } else {
      // Add new product
      const newProduct = {
        ...product,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProducts([...products, newProduct]);
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleToggleProductActive = (id: string) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: status as any } : order
    ));
  };

  const handleExportReport = () => {
    exportMerchandiseReport(products, orders);
  };

  const handleExportCSV = () => {
    exportProductsToCSV(products);
  };

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.isActive).length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock).length;

  return (
    <ContentLayout title="Merchandise Diepretty">
      {/* Right Sidebar - Reference Tools */}
      <aside
        className={cn(
          "fixed top-[89px] right-0 z-30 h-[calc(100vh-89px)] bg-background border-l shadow-lg transition-all duration-300 ease-in-out",
          isRightSidebarOpen ? "w-[420px] translate-x-0" : "w-0 translate-x-full"
        )}
      >
        {isRightSidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
              <h3 className="font-semibold text-sm">Ferramentas de Referência</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsRightSidebarOpen(false)}
                className="h-8 w-8 p-0"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-hidden p-2">
              <ReferenceTabs />
            </div>
          </div>
        )}
      </aside>

      {/* Toggle Button (when sidebar is closed) */}
      {!isRightSidebarOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsRightSidebarOpen(true)}
          className="fixed top-[100px] right-4 z-20 shadow-md gap-2"
        >
          <PanelRight className="h-4 w-4" />
          <span className="hidden sm:inline">Ferramentas</span>
        </Button>
      )}

      {/* Main Content - adjusted for sidebar */}
      <div className={cn(
        "w-full mx-auto px-4 transition-all duration-300",
        isRightSidebarOpen ? "max-w-[calc(100%-440px)] pr-4" : "max-w-[1800px]"
      )}>
        {/* Header Card */}
        <Card className="w-full mb-6">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold">Diepretty Mercédes</h1>
                  <p className="text-gray-600">Underground Artist • 3.4K Monthly Listeners • 4.5K IG Followers</p>
                          </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddProduct} className="gap-2">
                        <Plus className="h-4 w-4" />
                    Novo Produto
                      </Button>
                  <Button onClick={handleExportReport} variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Relatório PDF
                  </Button>
                  <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Exportar CSV
                            </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="produtos">Produtos</TabsTrigger>
                    <TabsTrigger value="encomendas">Encomendas</TabsTrigger>
                    <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
                    <TabsTrigger value="gestao-stock">Gestão Stock</TabsTrigger>
                    <TabsTrigger value="textos-camisetas">Textos Camisetas</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{totalProducts}</span> produtos • 
                    <span className="font-semibold text-green-600"> €{totalRevenue.toFixed(2)}</span> receita
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Dashboard de Vendas */}
        <SalesDashboard salesData={salesData} orders={orders} />
        
        {/* Formulário de Produto */}
        {showProductForm && editingProduct && (
        <Card className="w-full mb-6">
            <CardContent className="p-6">
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* ---------- RENDERIZAÇÃO CONDICIONADA DAS ABAS ---------- */}
        {activeTab === "produtos" && (
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onToggleActive={handleToggleProductActive}
                />
                ))}
              </div>
            </div>
        )}

        {activeTab === "encomendas" && (
          <div className="space-y-6 w-full">
            <OrdersList
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          </div>
        )}

{activeTab === "fornecedores" && (
  <div className="space-y-6 w-full">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {suppliers.map((supplier) => (
        <Card key={supplier.id} className="p-4 h-fit">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg truncate">{supplier.name}</h3>
              <p className="text-sm text-gray-600 capitalize">{supplier.type}</p>
            </div>
            <Badge variant="outline" className="flex-shrink-0 ml-2">
              ⭐ {supplier.rating}
            </Badge>
          </div>
          
          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{supplier.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span>{supplier.deliveryTime} dias</span>
            </div>
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3 flex-shrink-0" />
              <span>Mín: {supplier.minimumOrder} un</span>
            </div>
            {supplier.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{supplier.phone}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  </div>
)}

        {activeTab === "analytics" && (
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total de Produtos</p>
                    <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Produtos Ativos</p>
                    <p className="text-2xl font-bold text-green-600">{activeProducts}</p>
                      </div>
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Stock Baixo</p>
                    <p className="text-2xl font-bold text-red-600">{lowStockProducts}</p>
                  </div>
                  <Target className="h-8 w-8 text-red-600" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Receita Total</p>
                    <p className="text-2xl font-bold text-green-600">€{totalRevenue.toFixed(2)}</p>
                </div>
                  <Euro className="h-8 w-8 text-green-600" />
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "gestao-stock" && (
          <div className="space-y-6 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="space-y-4">
                  <Card className="p-4">
                    <h3 className="font-bold text-lg mb-4">{product.name}</h3>
                    <StockManager
                      product={product}
                      onUpdate={(updatedProduct) => {
                        setProducts(products.map(p => 
                          p.id === updatedProduct.id ? updatedProduct : p
                        ));
                      }}
                    />
                  </Card>
                  
                  <Card className="p-4">
                    <PriceCalculator
                      product={product}
                      onUpdate={(updatedProduct) => {
                        setProducts(products.map(p => 
                          p.id === updatedProduct.id ? updatedProduct : p
                        ));
                      }}
                    />
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "textos-camisetas" && (
          <div className="space-y-6 w-full">
            <TShirtTextBuckets />
          </div>
        )}

        <Card className="sticky bottom-0 mt-6">
          <CardContent className="p-4 flex justify-between">
            <div className="flex gap-4">
              <Button
                onClick={handleExportReport}
                variant="secondary"
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Relatório PDF
              </Button>

              <Button
                onClick={handleExportCSV}
                variant="secondary"
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Exportar CSV
              </Button>

              <Button
                onClick={handleAddProduct}
                variant="default"
                className="bg-green-500 hover:bg-green-600 gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Produto
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Total: {totalProducts} produtos</span>
              <span>•</span>
              <span>Ativos: {activeProducts}</span>
              <span>•</span>
              <span>Stock baixo: {lowStockProducts}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
};

export default Dashboard;
