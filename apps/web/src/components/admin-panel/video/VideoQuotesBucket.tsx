"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  X,
  Save,
  Copy,
  Star,
  StarOff,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  saveVideoQuote,
  getAllVideoQuotes,
  deleteVideoQuote,
  seedVideoQuotes,
  type PlaybookDB,
} from "@/lib/playbook-db";

type VideoQuote = PlaybookDB['videoQuotes']['value'];

export default function VideoQuotesBucket() {
  const [quotes, setQuotes] = useState<VideoQuote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAuthor, setFilterAuthor] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingQuote, setEditingQuote] = useState<VideoQuote | null>(null);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar quotes do banco de dados
  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      // Popular com quotes iniciais se o banco estiver vazio
      await seedVideoQuotes();
      const allQuotes = await getAllVideoQuotes();
      setQuotes(allQuotes);
    } catch (error) {
      console.error("Erro ao carregar quotes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar quotes
  const filteredQuotes = useMemo(() => {
    let filtered = quotes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (q) =>
          q.quote.toLowerCase().includes(query) ||
          q.author?.toLowerCase().includes(query) ||
          q.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    if (filterAuthor) {
      filtered = filtered.filter((q) => q.author === filterAuthor);
    }

    if (filterCategory) {
      filtered = filtered.filter((q) => q.category === filterCategory);
    }

    if (showFavoritesOnly) {
      filtered = filtered.filter((q) => q.isFavorite);
    }

    return filtered;
  }, [quotes, searchQuery, filterAuthor, filterCategory, showFavoritesOnly]);

  // Obter autores e categorias únicos
  const authors = useMemo(() => {
    const uniqueAuthors = new Set(
      quotes.map((q) => q.author).filter((a): a is string => !!a)
    );
    return Array.from(uniqueAuthors).sort();
  }, [quotes]);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(
      quotes.map((q) => q.category).filter((c): c is string => !!c)
    );
    return Array.from(uniqueCategories).sort();
  }, [quotes]);

  // Funções CRUD
  const handleCreateQuote = async (quoteData: Omit<VideoQuote, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newQuote = await saveVideoQuote(quoteData);
      setQuotes([...quotes, newQuote]);
      setShowQuoteDialog(false);
      setEditingQuote(null);
    } catch (error) {
      console.error("Erro ao criar quote:", error);
    }
  };

  const handleUpdateQuote = async (id: string, updates: Partial<VideoQuote>) => {
    try {
      const quote = quotes.find((q) => q.id === id);
      if (!quote) return;

      const updatedQuote = await saveVideoQuote({
        ...quote,
        ...updates,
        id,
      });
      setQuotes(quotes.map((q) => (q.id === id ? updatedQuote : q)));
      setEditingQuote(null);
      setShowQuoteDialog(false);
    } catch (error) {
      console.error("Erro ao atualizar quote:", error);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (confirm("Tem certeza que deseja deletar esta quote?")) {
      try {
        await deleteVideoQuote(id);
        setQuotes(quotes.filter((q) => q.id !== id));
      } catch (error) {
        console.error("Erro ao deletar quote:", error);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const quote = quotes.find((q) => q.id === id);
    if (quote) {
      await handleUpdateQuote(id, { isFavorite: !quote.isFavorite });
    }
  };

  const handleCopyQuote = (quote: VideoQuote) => {
    const text = quote.author
      ? `${quote.quote}\n— ${quote.author}`
      : quote.quote;
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Carregando quotes...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Quote className="h-6 w-6" />
              Bucket de Quotes para Edição de Vídeo
            </CardTitle>
            <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingQuote(null);
                    setShowQuoteDialog(true);
                  }}
                  className="bg-[#001845] hover:bg-[#001845]/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Quote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuote ? "Editar Quote" : "Adicionar Nova Quote"}
                  </DialogTitle>
                </DialogHeader>
                <QuoteForm
                  quote={editingQuote}
                  onSubmit={(data) => {
                    if (editingQuote) {
                      handleUpdateQuote(editingQuote.id, data);
                    } else {
                      handleCreateQuote(data);
                    }
                  }}
                  onCancel={() => {
                    setShowQuoteDialog(false);
                    setEditingQuote(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros e Busca */}
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar quotes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              >
                <Star className="h-4 w-4 mr-2" />
                Favoritos
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {authors.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Autor: {filterAuthor || "Todos"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterAuthor(null)}>
                      Todos
                    </DropdownMenuItem>
                    {authors.map((author) => (
                      <DropdownMenuItem
                        key={author}
                        onClick={() => setFilterAuthor(author)}
                      >
                        {author}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {categories.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Categoria: {filterCategory || "Todas"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilterCategory(null)}>
                      Todas
                    </DropdownMenuItem>
                    {categories.map((category) => (
                      <DropdownMenuItem
                        key={category}
                        onClick={() => setFilterCategory(category)}
                      >
                        {category}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {(filterAuthor || filterCategory || searchQuery) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFilterAuthor(null);
                    setFilterCategory(null);
                    setSearchQuery("");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>

          {/* Lista de Quotes */}
          <div className="space-y-3">
            {filteredQuotes.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Quote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>
                  {quotes.length === 0
                    ? "Nenhuma quote ainda. Adicione sua primeira quote!"
                    : "Nenhuma quote encontrada com os filtros aplicados."}
                </p>
              </div>
            ) : (
              filteredQuotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onEdit={() => {
                    setEditingQuote(quote);
                    setShowQuoteDialog(true);
                  }}
                  onDelete={() => handleDeleteQuote(quote.id)}
                  onToggleFavorite={() => handleToggleFavorite(quote.id)}
                  onCopy={() => handleCopyQuote(quote)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de Card de Quote
function QuoteCard({
  quote,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
}: {
  quote: VideoQuote;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
}) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-2 mb-2">
              <Quote className="h-5 w-5 text-[#001845] mt-1 flex-shrink-0" />
              <p className="text-base leading-relaxed italic text-gray-700 dark:text-gray-300">
                "{quote.quote}"
              </p>
            </div>
            {quote.author && (
              <p className="text-sm font-semibold text-[#001845] ml-7 mb-2">
                — {quote.author}
              </p>
            )}
            <div className="flex flex-wrap gap-2 ml-7 mt-2">
              {quote.category && (
                <Badge variant="secondary">{quote.category}</Badge>
              )}
              {quote.tags?.map((tag, idx) => (
                <Badge key={idx} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            {quote.notes && (
              <p className="text-xs text-gray-500 mt-2 ml-7">{quote.notes}</p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleFavorite}
              className="h-8 w-8 p-0"
            >
              {quote.isFavorite ? (
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ) : (
                <StarOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCopy}
              className="h-8 w-8 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Componente de Formulário de Quote
function QuoteForm({
  quote,
  onSubmit,
  onCancel,
}: {
  quote: VideoQuote | null;
  onSubmit: (data: Omit<VideoQuote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}) {
  const [quoteText, setQuoteText] = useState(quote?.quote || "");
  const [author, setAuthor] = useState(quote?.author || "");
  const [category, setCategory] = useState(quote?.category || "");
  const [tags, setTags] = useState(quote?.tags?.join(", ") || "");
  const [notes, setNotes] = useState(quote?.notes || "");
  const [isFavorite, setIsFavorite] = useState(quote?.isFavorite || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteText.trim()) return;

    onSubmit({
      quote: quoteText.trim(),
      author: author.trim() || undefined,
      category: category.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      notes: notes.trim() || undefined,
      isFavorite,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="quote">Quote *</Label>
        <Textarea
          id="quote"
          value={quoteText}
          onChange={(e) => setQuoteText(e.target.value)}
          placeholder="Cole ou digite a quote aqui..."
          className="min-h-[120px]"
          required
        />
      </div>

      <div>
        <Label htmlFor="author">Autor</Label>
        <Input
          id="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Ex: Bertolt Brecht, Aldous Huxley..."
        />
      </div>

      <div>
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Ex: Filosofia, Literatura, Política..."
        />
      </div>

      <div>
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Ex: filosofia, provocação, crítica social"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observações sobre esta quote..."
          className="min-h-[80px]"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isFavorite"
          checked={isFavorite}
          onChange={(e) => setIsFavorite(e.target.checked)}
          className="h-4 w-4"
        />
        <Label htmlFor="isFavorite" className="cursor-pointer">
          Marcar como favorito
        </Label>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-[#001845] hover:bg-[#001845]/90">
          <Save className="h-4 w-4 mr-2" />
          Salvar
        </Button>
      </div>
    </form>
  );
}

