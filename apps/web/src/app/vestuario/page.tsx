"use client"

import React from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"

type WardrobeItem = {
  id: string
  nameIt: string
  namePt: string
  tooltip: string
  photo?: string
}

type WardrobeSection = {
  key: string
  title: string
  subtitle?: string
  items: WardrobeItem[]
}

const foto = (q: string) =>
  // Imagem ilustrativa por palavra‑chave (Unsplash Source). Pode ser trocada por fotos próprias depois.
  `https://source.unsplash.com/640x480/?${encodeURIComponent(q)}`

const abbigliamento: WardrobeSection[] = [
  {
    key: "camicie",
    title: "Camicie e Maglieria",
    subtitle: "Camisas, t-shirts e malhas que compõem a base do visual",
    items: [
      { id: "camicia-classica", nameIt: "Camicia", namePt: "Camisa", tooltip: "Camisa de mangas compridas, formal ou casual, base para fatos e blazers.", photo: foto("dress shirt") },
      { id: "camicia-sportiva", nameIt: "Camicia sportiva", namePt: "Camisa desportiva", tooltip: "Modelos mais descontraídos, tecidos leves e padrões variados.", photo: foto("casual shirt") },
      { id: "camiseta", nameIt: "Maglietta", namePt: "T-shirt", tooltip: "Camiseta de malha, gola redonda (girocollo) ou em V.", photo: foto("tshirt white") },
      { id: "dolcevita", nameIt: "Dolcevita", namePt: "Gola alta", tooltip: "Malha com gola alta, elegante e versátil sob blazers.", photo: foto("turtleneck sweater") },
      { id: "cardigan", nameIt: "Cardigan", namePt: "Cardigã", tooltip: "Casaco de malha com abertura frontal, ótimo para camadas.", photo: foto("cardigan knit") },
    ],
  },
  {
    key: "giacche",
    title: "Giacche e Cappotti",
    subtitle: "Jaquetas e casacos que definem estrutura e presença",
    items: [
      { id: "giacca", nameIt: "Giacca", namePt: "Blazer/Casaco", tooltip: "Blazer de alfaiataria; último botão inferior deve ficar desabotoado.", photo: foto("blazer menswear") },
      { id: "doppiopetto", nameIt: "Giacca doppiopetto", namePt: "Casaco peito duplo", tooltip: "Casaco com duas fileiras de botões; presença clássica e imponente.", photo: foto("double breasted blazer") },
      { id: "cappotto", nameIt: "Cappotto", namePt: "Sobretudo", tooltip: "Casaco longo para clima frio; peça durável e atemporal.", photo: foto("overcoat wool") },
      { id: "mantello", nameIt: "Mantello", namePt: "Capa", tooltip: "Capa elegante para ocasiões formais ou de gala.", photo: foto("cape coat fashion") },
      { id: "impermeabile", nameIt: "Impermeabile", namePt: "Trench/Impermeável", tooltip: "Trench coat resistente à chuva, clássico e funcional.", photo: foto("trench coat") },
      { id: "giubbotto", nameIt: "Giubbotto", namePt: "Blusão", tooltip: "Casaco curto; pode ser em pele, ganga ou tecido técnico.", photo: foto("leather jacket mens") },
    ],
  },
  {
    key: "pantaloni-gonne",
    title: "Pantaloni e Gonne",
    subtitle: "Peças de baixo masculinas e femininas",
    items: [
      { id: "pantaloni-classici", nameIt: "Pantaloni", namePt: "Calças", tooltip: "Calças de alfaiataria; corte e queda precisos para elegância.", photo: foto("dress trousers") },
      { id: "jeans", nameIt: "Jeans", namePt: "Jeans", tooltip: "Calças de ganga/denim; do slim ao reto, versáteis no dia a dia.", photo: foto("jeans denim") },
      { id: "chino", nameIt: "Pantaloni chino", namePt: "Chino", tooltip: "Calça casual em sarja leve, entre o formal e o descontraído.", photo: foto("chino pants") },
      { id: "gonna", nameIt: "Gonna", namePt: "Saia", tooltip: "Peça feminina com inúmeras variações: lápis, plissada, midi, longa.", photo: foto("pleated skirt") },
      { id: "shorts", nameIt: "Pantaloncini", namePt: "Calções", tooltip: "Versões curtas; alfaiataria, cargo ou desportivo.", photo: foto("tailored shorts") },
    ],
  },
  {
    key: "completi-tute",
    title: "Completi e Tute",
    subtitle: "Fatos completos e peças de corpo inteiro",
    items: [
      { id: "abito", nameIt: "Abito / Completo", namePt: "Fato (terno)", tooltip: "Conjunto de jaqueta e calça; pode incluir colete (gilet).", photo: foto("mens suit three piece") },
      { id: "spezzato", nameIt: "Spezzato", namePt: "Spezzato (misto)", tooltip: "Jaqueta e calças de cores/tecidos diferentes para contraste.", photo: foto("blazer trousers outfit") },
      { id: "tuta-sportiva", nameIt: "Tuta sportiva", namePt: "Fato de treino", tooltip: "Conjunto desportivo de casaco e calça, confortável.", photo: foto("tracksuit fashion") },
      { id: "tutina", nameIt: "Tutina / Tuta intera", namePt: "Macacão", tooltip: "Peça única de corpo inteiro, elegante ou utilitária.", photo: foto("jumpsuit fashion") },
      { id: "vestito", nameIt: "Vestito / Abito", namePt: "Vestido", tooltip: "Do casual ao de gala (abito da sera), comprimentos diversos.", photo: foto("evening dress") },
      { id: "gilet", nameIt: "Gilet", namePt: "Colete", tooltip: "Peça do fato de três peças; último botão costuma ficar aberto.", photo: foto("waistcoat mens") },
    ],
  },
]

const accessori: WardrobeSection[] = [
  {
    key: "cappelli",
    title: "Cappelli e Berretti",
    subtitle: "Chapéus e gorros que moldam o porte e a atitude",
    items: [
      { id: "fedora", nameIt: "Fedora", namePt: "Fedora", tooltip: "Chapéu clássico com aba média e copa vincada.", photo: foto("fedora hat") },
      { id: "panama", nameIt: "Panamá", namePt: "Panamá", tooltip: "Chapéu leve de fibra natural, ideal para clima quente.", photo: foto("panama hat") },
      { id: "trilby", nameIt: "Trilby", namePt: "Trilby", tooltip: "Semelhante ao fedora com aba mais curta e atitude moderna.", photo: foto("trilby hat") },
      { id: "cappello-cilindro", nameIt: "Cappello a cilindro", namePt: "Cartola", tooltip: "Topo alto e formal, presença teatral/clássica.", photo: foto("top hat") },
      { id: "bombetta", nameIt: "Bombetta", namePt: "Chapéu coco", tooltip: "Copa arredondada e rígida, ícone do século XX.", photo: foto("bowler hat") },
      { id: "berretto-baseball", nameIt: "Berretto da baseball", namePt: "Boné", tooltip: "Boné com pala; do desporto ao streetwear.", photo: foto("baseball cap") },
      { id: "basco", nameIt: "Basco", namePt: "Boina", tooltip: "Boina de lã, clássica europeia; versões militares e artísticas.", photo: foto("beret hat") },
      { id: "cuffia-lana", nameIt: "Cuffia di lana", namePt: "Gorro de lã", tooltip: "Gorro para frio; pode ser justo ou oversized.", photo: foto("knit beanie") },
      { id: "cloche", nameIt: "Cloche", namePt: "Cloche", tooltip: "Chapéu feminino de copa arredondada e aba curta, anos 20.", photo: foto("cloche hat vintage") },
    ],
  },
  {
    key: "borse",
    title: "Borse, Zaini e Valigie",
    subtitle: "Bolsas, mochilas e malas – utilidade e assinatura de estilo",
    items: [
      { id: "borsa", nameIt: "Borsa", namePt: "Bolsa", tooltip: "Categoria ampla: ombro, mão, tiracolo, clutch, tote, etc.", photo: foto("handbag leather") },
      { id: "pochette", nameIt: "Pochette", namePt: "Carteira de mão", tooltip: "Acessório de mão elegante; forte impacto visual em gala.", photo: foto("clutch bag woman") },
      { id: "valigetta", nameIt: "Valigetta", namePt: "Pasta/briefcase", tooltip: "Pasta rígida ou flexível para trabalho; pele de qualidade.", photo: foto("leather briefcase") },
      { id: "zaino", nameIt: "Zaino", namePt: "Mochila", tooltip: "Do urbano ao outdoor; atenção a materiais e ergonomia.", photo: foto("backpack urban leather") },
      { id: "borsone", nameIt: "Borsone sport", namePt: "Mala desportiva", tooltip: "Capacidade e robustez; ideal para viagem curta ou ginásio.", photo: foto("duffle bag") },
      { id: "secchiello", nameIt: "Borsa a secchiello", namePt: "Bolsa saco", tooltip: "Formato cilíndrico com fecho por cordão; feminino e prático.", photo: foto("bucket bag leather") },
    ],
  },
  {
    key: "calzature",
    title: "Calzature",
    subtitle: "Sapatos e botas – o fundamento do porte",
    items: [
      { id: "richelieu", nameIt: "Richelieu (Oxford)", namePt: "Oxford", tooltip: "Sapato social com atacadores fechados; formalidade máxima.", photo: foto("oxford shoes men") },
      { id: "derby", nameIt: "Derby", namePt: "Derby", tooltip: "Atacadores abertos; um pouco mais casual que o Oxford.", photo: foto("derby shoes men") },
      { id: "brogue", nameIt: "Brogue", namePt: "Brogue", tooltip: "Perfurações decorativas; do semi ao full brogue (wingtip).", photo: foto("brogue shoes wingtip") },
      { id: "chelsea", nameIt: "Stivaletto Chelsea", namePt: "Bota Chelsea", tooltip: "Bota de cano curto com elástico lateral; elegante e prática.", photo: foto("chelsea boots men") },
      { id: "stivale-militare", nameIt: "Stivale militare", namePt: "Bota militar", tooltip: "Robusta com sola tratorada e atacadores; atitude utilitária.", photo: foto("combat boots") },
      { id: "tacco", nameIt: "Scarpa con tacco", namePt: "Sapato de salto", tooltip: "Modelo feminino de salto; do stiletto ao bloco.", photo: foto("high heels stiletto") },
      { id: "sneaker", nameIt: "Sneaker / Zapatilla", namePt: "Ténis desportivo", tooltip: "Calçado desportivo/urbano; conforto e tecnologia.", photo: foto("sneakers modern") },
    ],
  },
  {
    key: "gioielli",
    title: "Gioielleria",
    subtitle: "Joias e adereços de impacto controlado",
    items: [
      { id: "anello-chevalier", nameIt: "Anello chevalier", namePt: "Anel de minguinho", tooltip: "Tradicional de sinete; iniciais ou brasão; unissexo moderno.", photo: foto("signet ring") },
      { id: "fede", nameIt: "Fede nuziale", namePt: "Aliança", tooltip: "Anel de casamento; simplicidade simbólica.", photo: foto("wedding ring closeup") },
      { id: "bracciale", nameIt: "Bracciale", namePt: "Pulseira", tooltip: "Metal, couro, contas; discreta ou protagonista.", photo: foto("bracelet men leather") },
      { id: "collana", nameIt: "Collana", namePt: "Colar", tooltip: "Do choker (gargantilha) às correntes longas com pingente.", photo: foto("necklace pendant") },
      { id: "gemelli", nameIt: "Gemelli", namePt: "Botões de punho", tooltip: "Fechos decorativos para punhos de camisa dupla.", photo: foto("cufflinks luxury") },
      { id: "fermacravatta", nameIt: "Fermacravatta", namePt: "Alfinete de gravata", tooltip: "Mantém a gravata alinhada; detalhe clássico masculino.", photo: foto("tie bar clip") },
    ],
  },
  {
    key: "altri",
    title: "Altri Accessori",
    subtitle: "Complementos funcionais e expressivos",
    items: [
      { id: "cintura", nameIt: "Cintura", namePt: "Cinto", tooltip: "Couro de qualidade; combinar com os sapatos; fivela como detalhe.", photo: foto("leather belt") },
      { id: "corsetto", nameIt: "Corsetto", namePt: "Corset/Cinta", tooltip: "Modelador de cintura; estética, suporte e construção de silhueta.", photo: foto("corset fashion") },
      { id: "pochette-tasca", nameIt: "Pochette da taschino", namePt: "Lenço de bolso", tooltip: "Toque de cor no bolso do blazer; nunca combinar com a gravata.", photo: foto("pocket square suit") },
      { id: "cravatta", nameIt: "Cravatta", namePt: "Gravata", tooltip: "Lisas, texturadas ou estampadas; nó adequado ao colarinho.", photo: foto("necktie suit") },
      { id: "pajarita", nameIt: "Papillon / Pajarita", namePt: "Laço/gravata borboleta", tooltip: "Formal clássico; preto em black tie, variações criativas no casual.", photo: foto("bow tie tuxedo") },
      { id: "bufanda", nameIt: "Bufanda / Sciarpa", namePt: "Cachecol/lenço", tooltip: "Lã, seda ou algodão; proteção e textura visual.", photo: foto("scarf wool") },
      { id: "occhiali", nameIt: "Occhiali", namePt: "Óculos", tooltip: "De grau ou de sol; armação molda o caráter do rosto.", photo: foto("sunglasses fashion") },
      { id: "guanti", nameIt: "Guanti", namePt: "Luvas", tooltip: "Curtas (matinée), médias (midi) ou longas (de ópera).", photo: foto("leather gloves") },
      { id: "orologio", nameIt: "Orologio da polso", namePt: "Relógio de pulso", tooltip: "Único acessório masculino permitido em gala (com aliança).", photo: foto("wristwatch classic") },
    ],
  },
]

function Section({ section }: { section: WardrobeSection }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold leading-tight">{section.title}</h2>
        {section.subtitle ? (
          <p className="text-sm text-muted-foreground">{section.subtitle}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {section.items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.photo ? (
              <div className="aspect-[4/3] w-full bg-muted/30 relative">
                {/* Fotos externas apenas para referência visual; substitua por assets próprios quando tiver. */}
                <Image
                  src={item.photo}
                  alt={`${item.namePt} (${item.nameIt})`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  unoptimized
                  priority={false}
                />
              </div>
            ) : null}
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-base">
                  <span className="font-semibold">{item.nameIt}</span>
                  <span className="ml-2 align-middle rounded bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    {item.namePt}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">Original em italiano + etiqueta em PT</CardDescription>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      aria-label={`O que é ${item.namePt}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border bg-background text-sm hover:bg-muted"
                    >
                      i
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs leading-relaxed">
                    {item.tooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  )
}

export default function VestuarioPage() {
  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Vestuário – Seduzione maschile con toni femminili</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo visual com nomes originais em italiano e tooltips em português. Explore as peças
          por categoria e combine elementos masculinos e femininos com elegância.
        </p>
      </header>

      <div className="space-y-8">
        <h2 className="text-lg font-semibold">Abbigliamento (Vestuário Principal)</h2>
        <Separator />
        {abbigliamento.map((s) => (
          <Section key={s.key} section={s} />
        ))}
      </div>

      <div className="space-y-8">
        <h2 className="text-lg font-semibold">Accessori</h2>
        <Separator />
        {accessori.map((s) => (
          <Section key={s.key} section={s} />
        ))}
      </div>

      <footer className="pt-8 text-xs text-muted-foreground">
        Dica: Limite-se a poucas joias e escolha materiais de qualidade (pelle, metalli preziosi, seta).
        Equilíbrio é tudo – ousar com medida cria sedução sem extravagância.
      </footer>
    </main>
  )
}
