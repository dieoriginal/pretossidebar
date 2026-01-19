"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  X,
  Save,
  Folder,
  FolderOpen,
  MoreVertical,
  Eye,
  Copy,
  Tag,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Interfaces
export interface TShirtText {
  id: string;
  text: string;
  description?: string;
  tags?: string[];
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TShirtTextBucket {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  texts: TShirtText[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

interface TShirtTextBucketsProps {
  buckets?: TShirtTextBucket[];
  onBucketsChange?: (buckets: TShirtTextBucket[]) => void;
}

const defaultBuckets: TShirtTextBucket[] = [
  {
    id: "bucket-1",
    name: "Filosofia & Provocação",
    description: "Textos filosóficos e provocativos",
    color: "#001845",
    icon: "⚡",
    isActive: true,
    texts: [
      {
        id: "text-1",
        text: "TUDO QUE EU QUERO É FAZER DOS MEUS VÍCIOS IMORAIS E NÃO SER JULGADO",
        description: "Texto sobre autenticidade e não-julgamento",
        tags: ["filosofia", "autenticidade", "provocação"],
        isFavorite: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function TShirtTextBuckets({
  buckets: initialBuckets = defaultBuckets,
  onBucketsChange,
}: TShirtTextBucketsProps) {
  const [buckets, setBuckets] = useState<TShirtTextBucket[]>(initialBuckets);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTags, setFilterTags] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingBucket, setEditingBucket] = useState<TShirtTextBucket | null>(null);
  const [editingText, setEditingText] = useState<TShirtText | null>(null);
  const [showBucketDialog, setShowBucketDialog] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);

  // Atualizar buckets quando mudarem
  React.useEffect(() => {
    if (onBucketsChange) {
      onBucketsChange(buckets);
    }
  }, [buckets, onBucketsChange]);

  // Todos os textos de todos os buckets
  const allTexts = useMemo(() => {
    return buckets.flatMap((bucket) =>
      bucket.texts.map((text) => ({ ...text, bucketId: bucket.id, bucketName: bucket.name }))
    );
  }, [buckets]);

  // Textos filtrados
  const filteredTexts = useMemo(() => {
    let texts = allTexts;

    if (selectedBucket) {
      texts = texts.filter((t) => t.bucketId === selectedBucket);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      texts = texts.filter(
        (t) =>
          t.text.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filterTags.length > 0) {
      texts = texts.filter((t) =>
        filterTags.every((tag) => t.tags?.includes(tag))
      );
    }

    if (showFavoritesOnly) {
      texts = texts.filter((t) => t.isFavorite);
    }

    return texts;
  }, [allTexts, selectedBucket, searchQuery, filterTags, showFavoritesOnly]);

  // Todas as tags únicas
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    allTexts.forEach((text) => {
      text.tags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet).sort();
  }, [allTexts]);

  // Funções de Bucket
  const handleCreateBucket = (bucketData: Omit<TShirtTextBucket, "id" | "texts" | "createdAt" | "updatedAt">) => {
    const newBucket: TShirtTextBucket = {
      ...bucketData,
      id: `bucket-${Date.now()}`,
      texts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBuckets([...buckets, newBucket]);
    setShowBucketDialog(false);
    setEditingBucket(null);
  };

  const handleUpdateBucket = (id: string, updates: Partial<TShirtTextBucket>) => {
    setBuckets(
      buckets.map((bucket) =>
        bucket.id === id
          ? { ...bucket, ...updates, updatedAt: new Date().toISOString() }
          : bucket
      )
    );
    setEditingBucket(null);
    setShowBucketDialog(false);
  };

  const handleDeleteBucket = (id: string) => {
    if (confirm("Tem certeza que deseja deletar este bucket? Todos os textos serão removidos.")) {
      setBuckets(buckets.filter((bucket) => bucket.id !== id));
      if (selectedBucket === id) {
        setSelectedBucket(null);
      }
    }
  };

  // Funções de Texto
  const handleCreateText = (textData: Omit<TShirtText, "id" | "createdAt" | "updatedAt">, bucketId: string) => {
    const newText: TShirtText = {
      ...textData,
      id: `text-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setBuckets(
      buckets.map((bucket) =>
        bucket.id === bucketId
          ? {
              ...bucket,
              texts: [...bucket.texts, newText],
              updatedAt: new Date().toISOString(),
            }
          : bucket
      )
    );
    setShowTextDialog(false);
    setEditingText(null);
  };

  const handleUpdateText = (bucketId: string, textId: string, updates: Partial<TShirtText>) => {
    setBuckets(
      buckets.map((bucket) =>
        bucket.id === bucketId
          ? {
              ...bucket,
              texts: bucket.texts.map((text) =>
                text.id === textId
                  ? { ...text, ...updates, updatedAt: new Date().toISOString() }
                  : text
              ),
              updatedAt: new Date().toISOString(),
            }
          : bucket
      )
    );
    setEditingText(null);
    setShowTextDialog(false);
  };

  const handleDeleteText = (bucketId: string, textId: string) => {
    setBuckets(
      buckets.map((bucket) =>
        bucket.id === bucketId
          ? {
              ...bucket,
              texts: bucket.texts.filter((text) => text.id !== textId),
              updatedAt: new Date().toISOString(),
            }
          : bucket
      )
    );
  };

  const handleMoveText = (textId: string, fromBucketId: string, toBucketId: string) => {
    const bucket = buckets.find((b) => b.id === fromBucketId);
    const text = bucket?.texts.find((t) => t.id === textId);
    if (!text) return;

    // Remove do bucket original
    setBuckets(
      buckets.map((b) =>
        b.id === fromBucketId
          ? {
              ...b,
              texts: b.texts.filter((t) => t.id !== textId),
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );

    // Adiciona ao novo bucket
    setBuckets(
      buckets.map((b) =>
        b.id === toBucketId
          ? {
              ...b,
              texts: [...b.texts, { ...text, updatedAt: new Date().toISOString() }],
              updatedAt: new Date().toISOString(),
            }
          : b
      )
    );
  };

  const handleToggleFavorite = (bucketId: string, textId: string) => {
    handleUpdateText(bucketId, textId, {
      isFavorite: !buckets
        .find((b) => b.id === bucketId)
        ?.texts.find((t) => t.id === textId)?.isFavorite,
    });
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const selectedBucketData = buckets.find((b) => b.id === selectedBucket);

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buckets de Textos para T-Shirts</h2>
          <p className="text-sm text-muted-foreground">
            Organize e gerencie seus textos para camisetas em buckets temáticos
          </p>
        </div>
        <Dialog open={showBucketDialog} onOpenChange={setShowBucketDialog}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingBucket(null);
                setShowBucketDialog(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Novo Bucket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingBucket ? "Editar Bucket" : "Criar Novo Bucket"}
              </DialogTitle>
            </DialogHeader>
            <BucketForm
              bucket={editingBucket}
              onSubmit={(data) => {
                if (editingBucket) {
                  handleUpdateBucket(editingBucket.id, data);
                } else {
                  handleCreateBucket(data);
                }
              }}
              onCancel={() => {
                setShowBucketDialog(false);
                setEditingBucket(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar textos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
              {allTags.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Tag className="h-4 w-4 mr-2" />
                      Tags
                      {filterTags.length > 0 && (
                        <Badge className="ml-2">{filterTags.length}</Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="max-w-xs">
                    <ScrollArea className="h-64">
                      <div className="p-2 space-y-2">
                        {allTags.map((tag) => (
                          <label
                            key={tag}
                            className="flex items-center space-x-2 cursor-pointer p-2 hover:bg-accent rounded"
                          >
                            <input
                              type="checkbox"
                              checked={filterTags.includes(tag)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilterTags([...filterTags, tag]);
                                } else {
                                  setFilterTags(filterTags.filter((t) => t !== tag));
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm">{tag}</span>
                          </label>
                        ))}
                      </div>
                    </ScrollArea>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar com buckets */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buckets</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  <Button
                    variant={selectedBucket === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedBucket(null)}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Todos ({allTexts.length})
                  </Button>
                  {buckets.map((bucket) => (
                    <div
                      key={bucket.id}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-accent",
                        selectedBucket === bucket.id && "bg-accent"
                      )}
                    >
                      <Button
                        variant="ghost"
                        className="flex-1 justify-start"
                        onClick={() => setSelectedBucket(bucket.id)}
                      >
                        <span className="mr-2">{bucket.icon || "📁"}</span>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{bucket.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {bucket.texts.length} textos
                          </div>
                        </div>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingBucket(bucket);
                              setShowBucketDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBucket(bucket.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Deletar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Área principal com textos */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {selectedBucketData
                    ? `${selectedBucketData.name} (${filteredTexts.length})`
                    : `Todos os Textos (${filteredTexts.length})`}
                </CardTitle>
                <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingText(null);
                        setShowTextDialog(true);
                      }}
                      size="sm"
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Novo Texto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingText ? "Editar Texto" : "Criar Novo Texto"}
                      </DialogTitle>
                    </DialogHeader>
                    <TextForm
                      text={editingText}
                      buckets={buckets}
                      selectedBucket={selectedBucket}
                      onSubmit={(data, bucketId) => {
                        if (editingText && selectedBucket) {
                          handleUpdateText(selectedBucket, editingText.id, data);
                        } else {
                          handleCreateText(data, bucketId);
                        }
                      }}
                      onCancel={() => {
                        setShowTextDialog(false);
                        setEditingText(null);
                      }}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {filteredTexts.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum texto encontrado</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredTexts.map((item) => {
                      const bucket = buckets.find((b) => b.id === item.bucketId);
                      return (
                        <TextCard
                          key={item.id}
                          text={item}
                          bucketName={item.bucketName}
                          bucketColor={bucket?.color}
                          onEdit={() => {
                            setEditingText(item);
                            setShowTextDialog(true);
                          }}
                          onDelete={() => handleDeleteText(item.bucketId || "", item.id)}
                          onToggleFavorite={() =>
                            handleToggleFavorite(item.bucketId || "", item.id)
                          }
                          onCopy={() => handleCopyText(item.text)}
                          onMove={(toBucketId) =>
                            handleMoveText(item.id, item.bucketId || "", toBucketId)
                          }
                          buckets={buckets.filter((b) => b.id !== item.bucketId)}
                        />
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componente de Formulário de Bucket
function BucketForm({
  bucket,
  onSubmit,
  onCancel,
}: {
  bucket: TShirtTextBucket | null;
  onSubmit: (data: Omit<TShirtTextBucket, "id" | "texts" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(bucket?.name || "");
  const [description, setDescription] = useState(bucket?.description || "");
  const [color, setColor] = useState(bucket?.color || "#001845");
  const [icon, setIcon] = useState(bucket?.icon || "📁");

  return (
    <div className="space-y-4">
      <div>
        <Label>Nome do Bucket</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Filosofia & Provocação"
          required
        />
      </div>
      <div>
        <Label>Descrição (opcional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descreva o tema deste bucket..."
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Cor</Label>
          <div className="flex gap-2">
            <Input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-20 h-10"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#001845"
            />
          </div>
        </div>
        <div>
          <Label>Ícone</Label>
          <Input
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="📁 ou emoji"
            maxLength={2}
          />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (!name.trim()) return;
            onSubmit({ name, description: description || undefined, color, icon, isActive: true });
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}

// Componente de Formulário de Texto
function TextForm({
  text,
  buckets,
  selectedBucket,
  onSubmit,
  onCancel,
}: {
  text: TShirtText | null;
  buckets: TShirtTextBucket[];
  selectedBucket: string | null;
  onSubmit: (
    data: Omit<TShirtText, "id" | "createdAt" | "updatedAt">,
    bucketId: string
  ) => void;
  onCancel: () => void;
}) {
  const [bucketId, setBucketId] = useState(
    selectedBucket || buckets[0]?.id || ""
  );
  const [textContent, setTextContent] = useState(text?.text || "");
  const [description, setDescription] = useState(text?.description || "");
  const [tags, setTags] = useState(text?.tags?.join(", ") || "");
  const [isFavorite, setIsFavorite] = useState(text?.isFavorite || false);

  return (
    <div className="space-y-4">
      <div>
        <Label>Bucket</Label>
        <select
          value={bucketId}
          onChange={(e) => setBucketId(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        >
          {buckets.map((bucket) => (
            <option key={bucket.id} value={bucket.id}>
              {bucket.icon} {bucket.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>Texto *</Label>
        <Textarea
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          placeholder="TUDO QUE EU QUERO É FAZER DOS MEUS VÍCIOS IMORAIS E NÃO SER JULGADO"
          rows={4}
          required
          className="font-medium"
        />
      </div>
      <div>
        <Label>Descrição (opcional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descrição ou contexto do texto..."
          rows={2}
        />
      </div>
      <div>
        <Label>Tags (separadas por vírgula)</Label>
        <Input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="filosofia, autenticidade, provocação"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="favorite"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="favorite" className="cursor-pointer">
          Marcar como favorito
        </Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() => {
            if (!textContent.trim() || !bucketId) return;
            onSubmit(
              {
                text: textContent,
                description: description || undefined,
                tags: tags
                  ? tags.split(",").map((t) => t.trim()).filter(Boolean)
                  : undefined,
                isFavorite,
              },
              bucketId
            );
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </div>
  );
}

// Componente de Card de Texto
function TextCard({
  text,
  bucketName,
  bucketColor,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
  onMove,
  buckets,
}: {
  text: TShirtText & { bucketName?: string };
  bucketName?: string;
  bucketColor?: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
  onMove: (bucketId: string) => void;
  buckets: TShirtTextBucket[];
}) {
  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-shadow",
        text.isFavorite && "border-yellow-500 border-2"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {bucketName && (
              <Badge
                variant="outline"
                className="mb-2"
                style={{ borderColor: bucketColor || "#001845" }}
              >
                {bucketName}
              </Badge>
            )}
            <p className="font-medium text-lg whitespace-pre-wrap break-words mb-2">
              {text.text}
            </p>
            {text.description && (
              <p className="text-sm text-muted-foreground mb-2">{text.description}</p>
            )}
            {text.tags && text.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {text.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onToggleFavorite}>
                <Sparkles className="h-4 w-4 mr-2" />
                {text.isFavorite ? "Remover favorito" : "Marcar como favorito"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar texto
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              {buckets.length > 0 && (
                <>
                  <DropdownMenuItem disabled>Mover para:</DropdownMenuItem>
                  {buckets.map((bucket) => (
                    <DropdownMenuItem
                      key={bucket.id}
                      onClick={() => onMove(bucket.id)}
                    >
                      {bucket.icon} {bucket.name}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {text.isFavorite && (
          <div className="flex items-center text-yellow-500 text-sm">
            <Sparkles className="h-3 w-3 mr-1" />
            Favorito
          </div>
        )}
      </CardContent>
    </Card>
  );
}

