"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const formSchema = z.object({
  tipo: z.enum(["Épica", "Elegia", "Ídilio", "Ode", "Tragédia", "Comédia"]),
  forma: z.string().min(2, "Forma é obrigatória"),
  tema: z.string().min(2, "Tema é obrigatório"),
  prologo: z.string(),
  parodos: z.string(),
  episodios: z.array(z.string()),
  exodo: z.string(),
  dicionarioPoetico: z.array(
    z.object({
      termo: z.string(),
      categoria: z.string(),
      significado: z.string()
    })
  )
});

export default function PoeticForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "Épica",
      forma: "Longa, narrativa, hexâmetro dactílico",
      tema: "Mitologia, heróis, guerra",
      prologo: "Exposição do conflito",
      parodos: "Entrada do coro",
      episodios: [
        "Ascensão do herói",
        "Erro trágico (hamartia)",
        "Virada de fortuna (peripeteia)",
        "Queda (catástrofe)",
        "Reconhecimento (anagnórise)"
      ],
      exodo: "Lições do coro",
      dicionarioPoetico: [
        { termo: "Fogo", categoria: "Prometeico", significado: "Rebelião/Iluminação" },
        { termo: "Lâmina", categoria: "Sacrifício", significado: "Ruptura/Iniciação" },
        { termo: "Abismo", categoria: "Nietzschiano", significado: "Vazio/Criação" }
      ]
    }
  });

  const { fields: episodioFields } = useFieldArray({ control: form.control, name: "episodios" });
  const { fields: dicionarioFields } = useFieldArray({ control: form.control, name: "dicionarioPoetico" });

  const onSubmit = (data) => console.log(data);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <Card className="max-w-4xl mx-auto shadow-xl dark:border-gray-700">
        <CardHeader className="border-b dark:border-gray-700">
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Arquitetura Poética
            <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-2">
              Passo {currentStep} de {totalSteps}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <TooltipProvider>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-lg">
                            Tipo de Obra
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                Escolha o sentimento intuitivo, poético e abstrato que deseja invocar
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-14 text-base">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Épica" className="text-base p-4">
                                <span className="font-semibold">Épica</span> - Longas narrativas mitológicas
                              </SelectItem>
                              <SelectItem value="Elegia" className="text-base p-4">
                                <span className="font-semibold">Elegia</span> - Lamentos e reflexões existenciais
                              </SelectItem>
                              <SelectItem value="Ídilio" className="text-base p-4">
                                <span className="font-semibold">Ídilio</span> - Beleza pastoral e simplicidade
                              </SelectItem>
                              <SelectItem value="Ode" className="text-base p-4">
                                <span className="font-semibold">Ode</span> - Celebração e exaltação lírica
                              </SelectItem>
                              <SelectItem value="Tragédia" className="text-base p-4">
                                <span className="font-semibold">Tragédia</span> - Conflito humano e destino inevitável
                              </SelectItem>
                              <SelectItem value="Comédia" className="text-base p-4">
                                <span className="font-semibold">Comédia</span> - Sátira social e crítica humorística
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="forma"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Forma Poética</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[100px] text-base"
                              placeholder="Descreva a estrutura métrica e formal..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tema"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Tema Central</FormLabel>
                          <FormControl>
                            <Input {...field} className="text-base h-14" placeholder="Ex: Mitologia, heróis, guerra..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="prologo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center gap-2">
                            Prólogo
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                Introdução da narrativa e conflito principal
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px] text-base"
                              placeholder="Exposição do conflito principal..."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parodos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center gap-2">
                            Parodos
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                Entrada do coro ou narrador coletivo
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px] text-base"
                              placeholder="Entrada do coro/narrador..."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Episódios Dramáticos</h3>
                      {episodioFields.map((field, index) => (
                        <FormField
                          key={field.id}
                          control={form.control}
                          name={`episodios.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="h-14 text-base"
                                  placeholder={`Episódio ${index + 1}`}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>

                    <FormField
                      control={form.control}
                      name="exodo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg flex items-center gap-2">
                            Êxodo
                            <Tooltip>
                              <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
                              <TooltipContent className="max-w-[300px]">
                                Conclusão da narrativa e lições finais
                              </TooltipContent>
                            </Tooltip>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              className="min-h-[120px] text-base"
                              placeholder="Resolução final e lições aprendidas..."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold mb-4">Lexicon Mitopoético</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Configure seu dicionário simbólico para criação poética
                    </p>
                    
                    {dicionarioFields.map((field, index) => (
                      <Card key={field.id} className="p-6 bg-gray-50 dark:bg-gray-800 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`dicionarioPoetico.${index}.termo`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Termo Simbólico</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Ex: Fogo" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`dicionarioPoetico.${index}.categoria`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Categoria</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Ex: Prometeico" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`dicionarioPoetico.${index}.significado`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Significado</FormLabel>
                                <FormControl>
                                  <Input {...field} placeholder="Ex: Rebelião/Iluminação" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" /> Voltar
                    </Button>
                  )}
                  
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="gap-2"
                    >
                      Próximo <ChevronRight className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Link href="http://localhost:3000/versificacao">
                        Iniciar Criação
                      </Link>
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </TooltipProvider>
        </CardContent>
      </Card>
    </div>
  );
}