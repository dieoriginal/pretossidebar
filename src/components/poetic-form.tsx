"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

// 1. Schema de validação atualizado
const formSchema = z.object({
  tipo: z.enum(["Épica", "Elegia", "Ídilio", "Ode", "Tragédia", "Comédia"]),
  forma: z.string().min(2, "Forma é obrigatória"),
  tema: z.string().min(2, "Tema é obrigatório"),
  // Etapa 4: DRAMÁRGICA
  prologo: z.string(),
  parodos: z.string(),
  episodios: z.array(z.string()),
  exodo: z.string(),
  // Etapa 5: LEXICON MITOPOÉTICO
  dicionarioPoetico: z.array(
    z.object({
      termo: z.string(),
      categoria: z.string(),
      significado: z.string()
    })
  )
});

export type FormValues = z.infer<typeof formSchema>;

export default function PoeticForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo: "Épica",
      forma: "Longa, narrativa, hexâmetro dactílico",
      tema: "Mitologia, heróis, guerra",
      // Etapa 4 defaults
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
      // Etapa 5 defaults
      dicionarioPoetico: [
        { termo: "Fogo", categoria: "Prometeico", significado: "Rebelião/Iluminação" },
        { termo: "Lâmina", categoria: "Sacrifício", significado: "Ruptura/Iniciação" },
        { termo: "Abismo", categoria: "Nietzschiano", significado: "Vazio/Criação" }
      ]
    }
  });

  const { fields: episodioFields } = useFieldArray({
    control: form.control,
    name: "episodios"
  });
  const { fields: dicionarioFields } = useFieldArray({
    control: form.control,
    name: "dicionarioPoetico"
  });

  const onSubmit = (data: FormValues) => {
    console.log("Dados do formulário:", data);
    // Lógica de submissão aqui
  };

  // Renderização dos passos com inputs interativos
  const renderStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  // Passo 1: Tipo
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">1. Escolha o Tipo de Poesia</h2>
      <h4>Escolha o sentimento intuitivo e abstráto que desejas explorar hoje.</h4>
      <div className="form-group">
        <label className="block font-medium">Tipo:</label>
        <select {...form.register("tipo")} className="input-field border p-2 rounded w-full">
          <option value="Épica">Épica - são longas e detalham histórias de mitologia, heróis e batalhas.</option>
          <option value="Elegia">Elegia - poesia lírica mais curta, composta principalmente por versos dísticos (duas linhas), e geralmente trata de temas como lamento, reflexão sobre a vida, e muitas vezes sobre a morte ou a guerra.</option>
          <option value="Ídilio">Ídilio -  Poesias curtas e suaves, geralmente voltadas para a natureza, a vida simples e o campo. Elas têm um tom tranquilo e exploram a beleza do cotidiano rural.</option>
          <option value="Ode">Ode - uma poesia lírica estruturada e muitas vezes exaltada, onde se faz uma glorificação de algo ou alguém, como heróis, vitórias ou eventos notáveis.</option>
          <option value="Tragédia">Tragédia -  foco intenso no sofrimento humano e nas consequências do destino. O personagem principal geralmente enfrenta uma luta contra forças inevitáveis, como o destino, resultando em tragédia.</option>
          <option value="Comédia">Comédia - A comédia é uma forma de drama que usa o humor para abordar questões sociais, políticas e morais. Muitas vezes, há uma crítica ácida à sociedade e ao comportamento humano.</option>
        </select>
      </div>
      <div className="form-group">
        <label className="block font-medium">Forma:</label>
        <input
          {...form.register("forma")}
          className="input-field border p-2 rounded w-full"
          placeholder="Ex: Longa, narrativa, hexâmetro dactílico"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Tema:</label>
        <input
          {...form.register("tema")}
          className="input-field border p-2 rounded w-full"
          placeholder="Ex: Mitologia, heróis, guerra"
        />
      </div>
    </div>
  );

  // Passo 4: Arquitetura Dramárgica (Estrutura Clássica)
  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">4. Arquitetura Dramárgica (Estrutura Clássica)</h2>
      <div className="form-group">
        <label className="block font-medium" title="Aqui o usuário define a introdução da narrativa, apresentando o conflito principal que impulsionará a ação. É o ponto de partida onde se estabelece o tema e as motivações dos personagens.">Prólogo – Exposição do Conflito:</label>
        <input
          {...form.register("prologo")}
          className="input-field border p-2 rounded w-full"
          placeholder="Aqui o usuário define a introdução da narrativa, apresentando o conflito principal que impulsionará a ação."
        />
      </div>
      <div className="form-group">
        <label className="block font-medium" title="Esta seção representa a entrada do coro (ou narrador coletivo) que comenta ou reflete sobre os eventos. Serve para contextualizar a situação, introduzir o tom emocional e preparar o público para o que se seguirá.">Parodos – Entrada do Coro:</label>
        <input
          {...form.register("parodos")}
          className="input-field border p-2 rounded w-full"
          placeholder="Esta seção representa a entrada do coro que comenta ou reflete sobre os eventos."
        />
      </div>
      <div className="form-group">
        <label className="block font-medium" title="Esta parte é dividida em vários segmentos que compõem o desenvolvimento da ação:">Episódios:</label>
        {episodioFields.map((field, index) => (
          <input
            key={field.id}
            {...form.register(`episodios.${index}` as const)}
            className="input-field border p-2 rounded w-full mb-2"
            placeholder={`Episódio ${index + 1}: ${index === 0 ? "Inicia a ação propriamente dita, apresentando a evolução do conflito." : ""}`}
            title={index === 0 ? "Inicia a ação propriamente dita, apresentando a evolução do conflito." : ""}
          />
        ))}
      </div>
      <div className="form-group">
        <label className="block font-medium" title="A seção final que encerra a narrativa, proporcionando uma conclusão – seja um fechamento trágico ou uma resolução dos conflitos apresentados.">Êxodo:</label>
        <input
          {...form.register("exodo")}
          className="input-field border p-2 rounded w-full"
          placeholder="A seção final que encerra a narrativa, proporcionando uma conclusão."
        />
      </div>
    </div>
  );

  // Passo 5: Lexicon Mitopoético (Banco de Imagens)
  const renderStep5 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">5. Lexicon Mitopoético (Banco de Imagens)</h2>
      <h5>Nesta janela, você está configurando o Lexicon Mitopoético, que funciona como um banco de imagens e conceitos simbólicos para enriquecer suas criações artísticas ou narrativas.</h5>
      {dicionarioFields.map((field, index) => (
        <div key={field.id} className="space-y-2 border p-3 rounded mb-3">
          <div className="form-group">
            <label className="block font-medium" title="Ex: Mar - Categoria: Infinito/Primordial - Significado: Mistério/Transcendência (O mar pode simbolizar tanto a vastidão do inconsciente quanto o potencial ilimitado para transformação.)">Termo:</label>
            <input
              {...form.register(`dicionarioPoetico.${index}.termo` as const)}
              className="input-field border p-2 rounded w-full"
              placeholder="Ex: Fogo"
            />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="rounded-lg border-none mt-6 bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {renderStep()}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Voltar
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                Próximo
              </button>
            ) : (
              <a href="http://localhost:3000/versificacao" className="bg-green-600 text-white dark:bg-green-500 dark:text-black px-6 py-2 rounded inline-block font-extrabold">
                Escrever
              </a>
            )}
          </div>
          <div className="text-center text-sm text-gray-500">
            Passo {currentStep} de {totalSteps}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
