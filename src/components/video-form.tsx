º
"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";

// 1. Schema de validação atualizado
const formSchema = z.object({
  temaCentral: z.string().min(2, "Tema central é obrigatório"),
  arquétipo: z.enum(["Prometeu", "Édipo", "Antígona", "Medeia"]),
  apolineo: z.number().min(0).max(100),
  dionisíaco: z.number().min(0).max(100),
  efeitoDesejado: z.array(z.enum(["Catarse", "Anagnórise", "Peripécia"])),
  tipoMetrica: z.enum(["dactílico", "iâmbico", "trocaico"]),
  silabasPorLinha: z.number().min(1).max(20),
  posicaoCesura: z.number().min(0).max(20),
  esquemaRima: z.string(),
  enjambement: z.number().min(0).max(1),
  // Etapa 3: SONORA
  aliteracaoConsoante: z.string(),
  aliteracaoFrequencia: z.number().min(0),
  assonanciaVogal: z.string(),
  assonanciaPadrao: z.string(),
  onomatopeias: z.array(z.string()),
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
  ),
  // Etapa 6: VALIDAÇÃO
  testeSilabas: z.boolean(),
  testeAliteracao: z.boolean(),
  testeAssonancia: z.boolean(),
  impactoEmocional: z.number().min(0).max(10),
  instrucoesFinais: z.string()
});

export type FormValues = z.infer<typeof formSchema>;

export default function VideoForm() {
  // Total de 7 passos (1 e 2 originais, 3 a 6 dos "ore" e 7 instruções finais)
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      temaCentral: "",
      arquétipo: "Prometeu",
      apolineo: 50,
      dionisíaco: 50,
      efeitoDesejado: [],
      tipoMetrica: "trocaico",
      silabasPorLinha: 12,
      posicaoCesura: 6,
      esquemaRima: "ABABCC",
      enjambement: 0.3,
      // Etapa 3 defaults
      aliteracaoConsoante: "m",
      aliteracaoFrequencia: 3,
      assonanciaVogal: "ó",
      assonanciaPadrao: "cíclico",
      onomatopeias: ["estrondo", "rugir", "crepitar"],
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
      ],
      // Etapa 6 defaults
      testeSilabas: true,
      testeAliteracao: true,
      testeAssonancia: true,
      impactoEmocional: 8,
      instrucoesFinais: ""
    }
  });

  // Para campos dinâmicos (arrays)
  const { fields: onomatopeiaFields } = useFieldArray({
    control: form.control,
    name: "onomatopeias"
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
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      case 7: return renderStep7();
      default: return null;
    }
  };

  // Passo 1: Núcleo Trágico
  const renderStep1 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">1. Definição do Núcleo Trágico</h2>
      <div className="form-group">
        <label className="block font-medium">Tema Central:</label>
        <input
          {...form.register("temaCentral")}
          className="input-field border p-2 rounded w-full"
          placeholder="Ex: Hybris, Destino vs Livre-Arbítrio"
        />
        {form.formState.errors.temaCentral && (
          <span className="text-red-500">{form.formState.errors.temaCentral.message}</span>
        )}
      </div>
      {/* Outros campos do passo 1 conforme necessário */}
    </div>
  );

  // Passo 2: Engenharia Métrica
  const renderStep2 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">2. Engenharia Métrica</h2>
      <div className="form-group">
        <label className="block font-medium">Tipo de Métrica:</label>
        <select {...form.register("tipoMetrica")} className="input-field border p-2 rounded w-full">
          <option value="dactílico">Dactílico</option>
          <option value="iâmbico">Iâmbico</option>
          <option value="trocaico">Trocaico</option>
        </select>
      </div>
      {/* Outros campos do passo 2 conforme necessário */}
    </div>
  );

  // Passo 3: Anatomia Sonora (Camada Fonética)
  const renderStep3 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">3. Anatomia Sonora (Camada Fonética)</h2>
      <div className="form-group">
        <label className="block font-medium">Aliteração - Consoante:</label>
        <input
          {...form.register("aliteracaoConsoante")}
          className="input-field border p-2 rounded w-full"
          placeholder="Ex: m"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Aliteração - Frequência (por verso):</label>
        <input
          type="number"
          {...form.register("aliteracaoFrequencia", { valueAsNumber: true })}
          className="input-field border p-2 rounded w-full"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Assonância - Vogal:</label>
        <input
          {...form.register("assonanciaVogal")}
          className="input-field border p-2 rounded w-full"
          placeholder="Ex: ó"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Assonância - Padrão:</label>
        <input
          {...form.register("assonanciaPadrao")}
          className="input-field border p-2 rounded w-full"
          placeholder="Ex: cíclico"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Onomatopeias:</label>
        {onomatopeiaFields.map((field, index) => (
          <input
            key={field.id}
            {...form.register(`onomatopeias.${index}` as const)}
            className="input-field border p-2 rounded w-full mb-2"
            placeholder={`Onomatopeia ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );

  // Passo 4: Arquitetura Dramárgica (Estrutura Clássica)
  const renderStep4 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">4. Arquitetura Dramárgica (Estrutura Clássica)</h2>
      <div className="form-group">
        <label className="block font-medium">Prólogo:</label>
        <input
          {...form.register("prologo")}
          className="input-field border p-2 rounded w-full"
          placeholder="Exposição do conflito"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Parodos:</label>
        <input
          {...form.register("parodos")}
          className="input-field border p-2 rounded w-full"
          placeholder="Entrada do coro"
        />
      </div>
      <div className="form-group">
        <label className="block font-medium">Episódios:</label>
        {episodioFields.map((field, index) => (
          <input
            key={field.id}
            {...form.register(`episodios.${index}` as const)}
            className="input-field border p-2 rounded w-full mb-2"
            placeholder={`Episódio ${index + 1}`}
          />
        ))}
      </div>
      <div className="form-group">
        <label className="block font-medium">Êxodo:</label>
        <input
          {...form.register("exodo")}
          className="input-field border p-2 rounded w-full"
          placeholder="Lições do coro"
        />
      </div>
    </div>
  );

  // Passo 5: Lexicon Mitopoético (Banco de Imagens)
  const renderStep5 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">5. Lexicon Mitopoético (Banco de Imagens)</h2>
      {dicionarioFields.map((field, index) => (
        <div key={field.id} className="space-y-2 border p-3 rounded mb-3">
          <div className="form-group">
            <label className="block font-medium">Termo:</label>
            <input
              {...form.register(`dicionarioPoetico.${index}.termo` as const)}
              className="input-field border p-2 rounded w-full"
              placeholder="Ex: Fogo"
            />
          </div>
          <div className="form-group">
            <label className="block font-medium">Categoria:</label>
            <input
              {...form.register(`dicionarioPoetico.${index}.categoria` as const)}
              className="input-field border p-2 rounded w-full"
              placeholder="Ex: Prometeico"
            />
          </div>
          <div className="form-group">
            <label className="block font-medium">Significado:</label>
            <input
              {...form.register(`dicionarioPoetico.${index}.significado` as const)}
              className="input-field border p-2 rounded w-full"
              placeholder="Ex: Rebelião/Iluminação"
            />
          </div>
        </div>
      ))}
    </div>
  );

  // Passo 6: Processo de Validação (Testes de Sonoridade)
  const renderStep6 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">6. Processo de Validação (Testes de Sonoridade)</h2>
      <div className="form-group flex items-center space-x-4">
        <input type="checkbox" {...form.register("testeSilabas")} className="w-4 h-4" />
        <label className="font-medium">Teste de Sílabas</label>
      </div>
      <div className="form-group flex items-center space-x-4">
        <input type="checkbox" {...form.register("testeAliteracao")} className="w-4 h-4" />
        <label className="font-medium">Teste de Aliteração</label>
      </div>
      <div className="form-group flex items-center space-x-4">
        <input type="checkbox" {...form.register("testeAssonancia")} className="w-4 h-4" />
        <label className="font-medium">Teste de Assonância</label>
      </div>
      <div className="form-group">
        <label className="block font-medium">Impacto Emocional (0 a 10):</label>
        <input
          type="number"
          {...form.register("impactoEmocional", { valueAsNumber: true })}
          className="input-field border p-2 rounded w-full"
        />
      </div>
    </div>
  );

  // Passo 7: Instruções Finais
  const renderStep7 = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">7. Instruções Finais</h2>
      <div className="form-group">
        <label className="block font-medium">Observações ou Instruções:</label>
        <textarea
          {...form.register("instrucoesFinais")}
          className="input-field border p-2 rounded w-full"
          placeholder="Adicione quaisquer observações ou instruções finais..."
          rows={4}
        />
      </div>
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
              <a href="http://localhost:3000/dashboard" className="bg-green-600 text-white px-6 py-2 rounded inline-block">
                Gerar Poema
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
