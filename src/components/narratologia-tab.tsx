"use client";

import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/* IMPORTS dos mesmos utilitários já usados em page.tsx */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Info } from "lucide-react";

// Schema de validação
const formSchema = z.object({
  narratemas: z.array(z.object({
    funcao: z.string(),
    exemplo: z.string()
  })),
  personagens: z.array(z.object({
    papel: z.string(),
    nome: z.string(),
    tracos: z.string(),
    simbolismo: z.string()
  }))
});

type FormValues = z.infer<typeof formSchema>;

// Dados padrão das 31 funções de Propp
const defaultNarratemas = [
  { funcao: "Afastamento", descricao: "Um membro da família se afasta de casa" },
  { funcao: "Proibição", descricao: "Algo é proibido ao herói" },
  { funcao: "Transgressão", descricao: "A proibição é violada" },
  { funcao: "Interrogatório", descricao: "O antagonista tenta obter informações" },
  { funcao: "Informação", descricao: "O antagonista recebe informações sobre a vítima" },
  { funcao: "Ardil", descricao: "O antagonista tenta enganar a vítima" },
  { funcao: "Cumplicidade", descricao: "A vítima é enganada e ajuda o antagonista" },
  { funcao: "Dano", descricao: "O antagonista causa dano a um membro da família" },
  { funcao: "Mediação", descricao: "A falta é revelada" },
  { funcao: "Início da reação", descricao: "O herói decide agir" },
  { funcao: "Partida", descricao: "O herói parte em busca" },
  { funcao: "Primeira função do doador", descricao: "O herói é testado" },
  { funcao: "Reação do Herói", descricao: "O herói reage ao doador" },
  { funcao: "Fornecimento", descricao: "O herói recebe um objeto mágico" },
  { funcao: "Deslocamento", descricao: "O herói é levado ao local da busca" },
  { funcao: "Combate", descricao: "O herói e o antagonista se enfrentam" },
  { funcao: "Marca", descricao: "O herói é marcado" },
  { funcao: "Vitória", descricao: "O antagonista é derrotado" },
  { funcao: "Reparação do dano", descricao: "O dano inicial é reparado" },
  { funcao: "Regresso", descricao: "O herói retorna" },
  { funcao: "Perseguição", descricao: "O herói é perseguido" },
  { funcao: "Salvamento", descricao: "O herói é salvo da perseguição" },
  { funcao: "Chegada incógnita", descricao: "O herói chega incógnito" },
  { funcao: "Pretensões infundadas", descricao: "Um falso herói faz pretensões" },
  { funcao: "Tarefa difícil", descricao: "Uma tarefa difícil é proposta" },
  { funcao: "Realização", descricao: "A tarefa é realizada" },
  { funcao: "Reconhecimento", descricao: "O herói é reconhecido" },
  { funcao: "Desmascaramento", descricao: "O falso herói é desmascarado" },
  { funcao: "Transfiguração", descricao: "O herói recebe uma nova aparência" },
  { funcao: "Castigo", descricao: "O antagonista é punido" },
  { funcao: "Casamento", descricao: "O herói se casa e ascende ao trono" }
];

export default function NarratologiaTab() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      narratemas: defaultNarratemas.map(narratema => ({
        funcao: narratema.funcao,
        exemplo: ""
      })),
      personagens: [
        {
          papel: "Herói",
          nome: "",
          tracos: "",
          simbolismo: ""
        }
      ]
    }
  });

  const { fields: narratemaFields } = useFieldArray({
    control: form.control,
    name: "narratemas"
  });

  const { fields: personagemFields } = useFieldArray({
    control: form.control,
    name: "personagens"
  });

  const onSubmit = (data: FormValues) => {
    console.log("Dados do formulário:", data);
    // Lógica de submissão aqui
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
    {/* 
      Exibe o conteúdo da Narratologia apenas quando a tab "narratologia" estiver ativa.
      Supondo que este componente é usado como <NarratologiaTab /> dentro de um sistema de <Tabs value={activeTab}>,
      e que o valor "narratologia" ativa esta tab.
      O conteúdo abaixo é a arquitetura Propp pedida.
    */}
    <Card className="max-w-7xl mx-auto shadow-2xl dark:border-gray-700">
      <CardHeader className="border-b dark:border-gray-700">
        <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Arquitetura Narrativa - Modelo Propp
        </CardTitle>
        <Button 
          type="button" 
          onClick={() => window.print()}
          className="no-print mt-4"
          variant="outline"
        >
          Imprimir em A4
        </Button>
      </CardHeader>
      <CardContent className="p-6 space-y-8">

        {/* Seção Técnica: Resumo e Mapeamentos */}
        <section>
          <h3 className="text-xl font-semibold mb-2">Resumo Técnico</h3>
          <p className="text-sm">
            Alinha as 31 funções de Propp com os três atos clássicos (Setup, Confrontação, Resolução)
            e com a estrutura do drama grego (Prelúdio, Prólogo, Parodos, Episódios, Êxodo, Epílogo).
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="min-w-full text-sm border-collapse">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Função</th>
                  <th className="border px-2 py-1">Descrição</th>
                  <th className="border px-2 py-1">Ato</th>
                  <th className="border px-2 py-1">Drama Grego</th>
                </tr>
              </thead>
              <tbody>
                {narratemaFields.map((_, idx) => (
                  <tr key={idx} className="odd:bg-gray-100 dark:odd:bg-gray-800">
                    <td className="border px-2 py-1">{idx + 1}. {defaultNarratemas[idx].funcao}</td>
                    <td className="border px-2 py-1 text-gray-600 dark:text-gray-300">
                      {defaultNarratemas[idx].descricao}
                    </td>
                    <td className="border px-2 py-1">{idx < 3 ? 'I' : idx < 11 ? 'II' : 'III'}</td>
                    <td className="border px-2 py-1">
                      {idx < 3 && 'Prólogo'}
                      {idx >= 3 && idx < 7 && 'Parodos'}
                      {idx >= 7 && idx < 19 && 'Episódios'}
                      {idx >= 19 && idx < 22 && 'Êxodo'}
                      {idx >= 22 && 'Epílogo'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <TooltipProvider>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
              {/* Seção de Narratemas */}
              <section>
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-amber-500 pl-4">
                  31 Funções Narrativas
                  <Tooltip>
                    <TooltipTrigger className="ml-2">
                      <Info className="h-5 w-5 inline-block" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[400px]">
                      Estrutura canônica identificada por Propp em contos folclóricos russos. 
                      Sequência padrão de eventos que compõem a jornada mítica.
                    </TooltipContent>
                  </Tooltip>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {narratemaFields.map((field, index) => (
                    <Card key={field.id} className="p-4 bg-white dark:bg-gray-800 shadow-sm">
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`narratemas.${index}.funcao`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="font-semibold flex items-center gap-2">
                                Função {index + 1}
                                <Tooltip>
                                  <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
                                  <TooltipContent className="max-w-[300px]">
                                    {defaultNarratemas[index]?.descricao}
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} className="font-mono" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`narratemas.${index}.exemplo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Exemplo Lírico</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={3}
                                  placeholder="Como isso se manifesta na letra?"
                                  className="text-sm"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Seção de Personagens */}
              <section>
                <h2 className="text-2xl font-bold mb-6 border-l-4 border-emerald-500 pl-4">
                  Arquétipos Proppianos
                  <Tooltip>
                    <TooltipTrigger className="ml-2">
                      <Info className="h-5 w-5 inline-block" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[400px]">
                      Papéis narrativos fundamentais e suas características simbólicas. 
                      Cada personagem deve cumprir funções específicas na trama.
                    </TooltipContent>
                  </Tooltip>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {personagemFields.map((field, index) => (
                    <Card key={field.id} className="p-6 bg-white dark:bg-gray-800 shadow-sm">
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name={`personagens.${index}.papel`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Papel Narrativo</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Herói">
                                    Herói (Buscador/Vítima) - Protagonista em uma missão, mostrando bravura ou lutas pessoais.
                                    Design Visual: Silhueta imponente, cores vibrantes (azul, dourado), acessórios simbólicos (espada, medalhão).
                                    Psicologia: Motivação clara (justiça, amor), medo de falhar, conflito interno entre dever e desejo.
                                  </SelectItem>
                                  <SelectItem value="Vilão">
                                    Vilão - Antagonista que desencadeia o conflito, muitas vezes usando engano ou disfarce.
                                    Design Visual: Formas angulares, cores escuras (preto, vermelho), marcas distintivas (cicatriz, tatuagem).
                                    Psicologia: Desejo de poder, medo de exposição, trauma de rejeição, orgulho excessivo.
                                  </SelectItem>
                                  <SelectItem value="Doador">
                                    Doador/Mentor - Fornece ajuda ou um objeto ao Herói quando ele se mostra digno.
                                    Design Visual: Vestes distintas, cores terrosas (marrom, verde), acessórios mágicos (cajado, amuleto).
                                    Psicologia: Sabedoria acumulada, medo de ser mal interpretado, desejo de guiar sem controlar.
                                  </SelectItem>
                                  <SelectItem value="Ajudante">
                                    Ajudante - Aliado leal que apoia ativamente o Herói em sua jornada.
                                    Design Visual: Formas arredondadas, cores quentes (laranja, amarelo), equipamento prático (mochila, corda).
                                    Psicologia: Lealdade incondicional, medo de ser deixado para trás, desejo de pertencer.
                                  </SelectItem>
                                  <SelectItem value="Princesa">
                                    Princesa (Objeto da Busca) - A meta ou recompensa da missão, representando o que o Herói busca.
                                    Design Visual: Silhueta graciosa, cores suaves (rosa, lilás), joias simbólicas (coroa, colar).
                                    Psicologia: Desejo de liberdade, medo de aprisionamento, conflito entre dever e individualidade.
                                  </SelectItem>
                                  <SelectItem value="Falso Herói">
                                    Falso Herói - Parece ajudar ou ser digno, mas trai o Herói e tenta tomar o crédito.
                                    Design Visual: Roupas impressionantes, cores enganosas (branco, prata), máscaras ou disfarces.
                                    Psicologia: Desejo de reconhecimento, medo de ser descoberto, inveja como motivação.
                                  </SelectItem>
                                  <SelectItem value="Despachante">
                                    Despachante - Envia o Herói em sua missão, revelando o problema ou dando o chamado à ação.
                                    Design Visual: Vestes formais, cores neutras (cinza, bege), objetos de comunicação (papiro, trombeta).
                                    Psicologia: Senso de dever, medo de falhar na transmissão, desejo de justiça.
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`personagens.${index}.nome`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                Nome Simbólico
                                <Tooltip>
                                  <TooltipTrigger><Info className="h-4 w-4" /></TooltipTrigger>
                                  <TooltipContent>
                                    Nome que revela natureza ou missão (ex: "Coração de Carvão")
                                  </TooltipContent>
                                </Tooltip>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: Andarilho das Brumas" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`personagens.${index}.tracos`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Traços Físicos/Psicológicos</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={3}
                                  placeholder="Descreva aparência, marcas distintivas, postura..."
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`personagens.${index}.simbolismo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Simbolismo Associado</FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  rows={2}
                                  placeholder="Objetos, cores, elementos naturais representativos..."
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    type="button"
                    onClick={() => form.setValue("personagens", [...form.getValues().personagens, {
                      papel: "Herói",
                      nome: "",
                      tracos: "",
                      simbolismo: ""
                    }])}
                    variant="secondary"
                  >
                    + Adicionar Personagem
                  </Button>
                </div>
              </section>

              <div className="mt-12 border-t pt-8 dark:border-gray-700">
                <Button type="submit" size="lg" className="w-full bg-indigo-600 hover:bg-indigo-700 text-lg">
                  Gerar Mapa Narrativo
                </Button>
              </div>
            </form>
          </Form>
        </TooltipProvider>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="w-8 h-8">
              <span className="text-sm">i</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Mapeamento Narrativo - Propp, Três Atos e Drama Grego</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Estrutura em Três Atos</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Ato I – Setup</h4>
                    <p className="text-sm">Funções 1-11: Afastamento, Proibição, Transgressão, Interrogatório, Informação, Ardil, Cumplicidade, Dano, Mediação, Início da reação, Partida</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Ato II – Confrontação</h4>
                    <p className="text-sm">Funções 12-19: Primeira função do doador, Reação do Herói, Fornecimento, Deslocamento, Combate, Marca, Vitória, Reparação do dano</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Ato III – Resolução</h4>
                    <p className="text-sm">Funções 20-31: Regresso, Perseguição, Salvamento, Chegada incógnita, Pretensões infundadas, Tarefa difícil, Realização, Reconhecimento, Desmascaramento, Transfiguração, Castigo, Casamento</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Estrutura do Drama Grego</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Prelúdio & Prólogo</h4>
                    <p className="text-sm">Funções 1-3: Afastamento, Proibição, Transgressão</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Parodos & Episódios</h4>
                    <p className="text-sm">Funções 4-19: Interrogatório até Reparação do dano</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Êxodo & Epílogo</h4>
                    <p className="text-sm">Funções 20-31: Regresso até Casamento</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Compressão para Música</h3>
                <div className="space-y-2">
                  <p className="text-sm">Estratégias para adaptar em 2 minutos:</p>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Agrupar funções por ato</li>
                    <li>Usar leitmotiv e refrões temáticos</li>
                    <li>Economia de linguagem poética</li>
                    <li>Estrutura musical: Intro (10s), Verso 1 (30s), Refrão (20s), Verso 2 (30s), Ponte (15s), Refrão (20s), Final (15s)</li>
                  </ul>
                </div>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Referências: Propp, Morphology of the Folktale; Three-act structure; Greek tragedy
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
    </div>
  );
}
