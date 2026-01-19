"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { jsPDF } from "jspdf";

type Service = {
    id: string;
    title: string;
    price: string; // display e.g. "desde €80"
    basePrice: number; // numeric used for orçamento
    sessionTime: string;
    recordingTime: string;
    features: string[];
    notes?: string;
};

const steps = [
    "Maquete (Beat + Gravação simples)",
    "Gravação oficial",
    "Filmagem",
    "Artwork (Fotografia)",
    "Edição de Vídeo (Premiere Pro + After Effects)",
    "Direitos Autorais e plataformas digitais",
    "Lançamento",
] as const;

const SERVICES_DEFAULT: Service[] = [
    {
        id: "maquete",
        title: "Maquete (Beat + Gravação simples)",
        price: "desde €110",
        basePrice: 110,
        sessionTime: "3 horas",
        recordingTime: "1 semana",
        features: [
            "Arranjo musical",
            "Beat (licença básica)",
            "Gravação de demo simples",
            "2 revisões",
        ],
    },
    {
        id: "gravacao-oficial",
        title: "Gravação oficial",
        price: "desde €150",
        basePrice: 150,
        sessionTime: "4 horas",
        recordingTime: "3–5 dias",
        features: ["Captação vocal/instrumental", "Direção artística", "Edição básica"],
    },
    {
        id: "filmagem",
        title: "Filmagem",
        price: "desde €350",
        basePrice: 350,
        sessionTime: "6–8 horas",
        recordingTime: "5–7 dias",
        features: ["Equipe técnica", "Iluminação e áudio", "Direção de set"],
    },
    {
        id: "artwork",
        title: "Artwork (Fotografia)",
        price: "desde €60",
        basePrice: 60,
        sessionTime: "—",
        recordingTime: "1–2 dias",
        features: ["Sessão fotográfica", "Edição de imagens", "Arte para plataformas"],
    },
    {
        id: "edicao-video",
        title: "Edição de Vídeo (Premiere Pro + After Effects)",
        price: "desde €150",
        basePrice: 150,
        sessionTime: "—",
        recordingTime: "3–7 dias",
        features: ["Montagem no Premiere Pro", "Motion Graphics no After Effects", "Correção de cor básica"],
    },
    {
        id: "direitos-autorais",
        title: "Direitos Autorais e plataformas digitais",
        price: "desde €90",
        basePrice: 90,
        sessionTime: "1 hora",
        recordingTime: "1 dia",
        features: ["Registo de obras", "ISRC/UPC", "Split sheets"],
    },
    {
        id: "lancamento",
        title: "Lançamento",
        price: "desde €120",
        basePrice: 120,
        sessionTime: "2 horas",
        recordingTime: "2–4 dias",
        features: ["Distribuição digital", "Pitching editorial", "Materiais promocionais"],
    },
];

export default function Page() {
    const [activeStep, setActiveStep] = useState(0);
    const [svcList, setSvcList] = useState<Service[]>(() => {
        try {
            const saved = localStorage.getItem("av-prices-v2-av7steps")
            if (saved) return JSON.parse(saved) as Service[]
        } catch {}
        return SERVICES_DEFAULT
    })
    const [clientName, setClientName] = useState<string>("Yasmine")
    const [selected, setSelected] = useState<Record<string, boolean>>({
        maquete: true,
        "gravacao-oficial": true,
        filmagem: true,
        artwork: true,
        "edicao-video": true,
        "direitos-autorais": true,
        lancamento: true,
    })
    const [includeCowriting, setIncludeCowriting] = useState<boolean>(false)
    const [cowritingPrice, setCowritingPrice] = useState<number>(30)
    const [vatPercent, setVatPercent] = useState<number>(0)
    const [discreetMode, setDiscreetMode] = useState<boolean>(false)
    const [showEdit, setShowEdit] = useState<boolean>(false)

    const nextStep = () => setActiveStep((s) => Math.min(s + 1, svcList.length - 1));
    const prevStep = () => setActiveStep((s) => Math.max(s - 1, 0));

    const svc = svcList[activeStep];

    function savePricesToLocal(prices: Service[]) {
        try { localStorage.setItem("av-prices-v2-av7steps", JSON.stringify(prices)) } catch {}
    }

    const subtotal = Object.entries(selected)
        .filter(([id, on]) => on)
        .map(([id]) => svcList.find(s => s.id === id)?.basePrice || 0)
        .reduce((a, b) => a + b, 0) + (includeCowriting ? cowritingPrice : 0)
    const vatAmount = Math.round(subtotal * (vatPercent / 100))
    const total = subtotal + vatAmount

    const selectedServices = useMemo(() => svcList.filter(s => selected[s.id]), [svcList, selected])

    function generateContractPdf() {
        const doc = new jsPDF({ unit: "pt", format: "a4" })
        const marginX = 48
        let y = 64
        const line = (txt: string, size = 12, bold = false) => {
            doc.setFont("helvetica", bold ? "bold" : "normal")
            doc.setFontSize(size)
            doc.text(txt, marginX, y)
            y += size + 8
        }

        // Header
        line("Contratualização de Serviços Audiovisuais", 18, true)
        line(`Cliente: ${clientName}`, 12)
        line(`Data: ${new Date().toLocaleDateString()}`, 12)
        y += 8
        line("Serviços contratados:", 14, true)
        selectedServices.forEach((s, i) => {
            line(`${i + 1}. ${s.title} — €${s.basePrice}`, 12)
        })
        if (includeCowriting) line(`• Co-writing (versificação) — €${cowritingPrice}`, 12)

        y += 8
        line(`Subtotal: €${subtotal}`, 12)
        line(`IVA (${vatPercent}%): €${vatAmount}`, 12)
        line(`Total: €${total}`, 14, true)

        y += 12
        line("Termos essenciais:", 14, true)
        const terms = [
            "1. Os serviços serão prestados conforme descrito acima.",
            "2. Entregas e prazos indicados podem variar conforme aprovação criativa.",
            "3. Direitos autorais: créditos e licenças conforme acordado entre as partes.",
            "4. Pagamentos: 50% no agendamento e 50% na entrega, salvo acordo específico.",
        ]
        terms.forEach(t => line(t, 11))

        y += 24
        line("Assinaturas:", 12, true)
        y += 32
        line("______________________________", 12)
        line("Cliente", 10)
        y += 24
        line("______________________________", 12)
        line("Prestador (Pretos FTM)", 10)

        const safeName = clientName?.trim() ? clientName.trim().replace(/\s+/g, "_") : "cliente"
        doc.save(`Contrato_Audiovisual_${safeName}.pdf`)
    }

    return (
        <div className="container mx-auto p-6">
            <Card>
                <CardHeader>
                    <div className="mb-4">
                        <h1 className="text-3xl font-bold">Serviços de Audiovisual</h1>
                        <p className="text-muted-foreground mt-1">
                            Negócio de produção audiovisual — Serviços pagos (produção paga)
                        </p>
                    </div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {steps.map((item, index) => (
                                <React.Fragment key={item}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            <Link
                                                href={`#${svcList[index % svcList.length].id}`}
                                                className={`transition-colors ${
                                                    index === activeStep ? "text-primary font-semibold" : "hover:text-primary"
                                                }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setActiveStep(index);
                                                }}
                                            >
                                                {item}
                                            </Link>
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {index < steps.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="mt-2 text-sm text-muted-foreground">
                        Etapa {activeStep + 1} de {svcList.length}
                    </div>

                    {/* Orçamento rápido */}
                    <div className="mt-4 grid gap-3 border-t pt-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Artista</span>
                                <input className="h-8 px-2 border rounded" value={clientName} onChange={(e)=> setClientName(e.target.value)} aria-label="Nome do artista" placeholder="Nome do artista" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-sm flex items-center gap-1">
                                    <input type="checkbox" checked={discreetMode} onChange={(e)=> setDiscreetMode(e.target.checked)} /> Esconder CTAs
                                </label>
                                <label className="text-sm flex items-center gap-1">
                                    IVA %
                                    <input type="number" className="h-8 w-20 px-2 border rounded" value={vatPercent} onChange={(e)=> setVatPercent(Number(e.target.value)||0)} />
                                </label>
                                <Button variant="outline" onClick={()=> setShowEdit(true)}>Editar preços</Button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                {svcList.map(s => (
                                    <label key={`sel-${s.id}`} className="flex items-center justify-between border rounded px-3 py-2">
                                        <span className="text-sm font-medium">{s.title}</span>
                                        <span className="flex items-center gap-3">
                                            <span className="text-sm text-muted-foreground">€{s.basePrice}</span>
                                            <input type="checkbox" checked={!!selected[s.id]} onChange={(e)=> setSelected(prev => ({...prev, [s.id]: e.target.checked}))} />
                                        </span>
                                    </label>
                                ))}
                                {/* Extra opcional: Co-writing */}
                                <label className="flex items-center justify-between border rounded px-3 py-2">
                                    <span className="text-sm">Co-writing (versificação)</span>
                                    <span className="flex items-center gap-2">
                                        <input type="number" className="h-8 w-20 px-2 border rounded" value={cowritingPrice} onChange={(e)=> setCowritingPrice(Number(e.target.value)||0)} />
                                        <input type="checkbox" checked={includeCowriting} onChange={(e)=> setIncludeCowriting(e.target.checked)} />
                                    </span>
                                </label>
                            </div>
                            <div className="space-y-2">
                                <div className="border rounded p-3">
                                    <div className="flex items-center justify-between text-sm mb-1"><span>Subtotal</span><span>€{subtotal}</span></div>
                                    <div className="flex items-center justify-between text-sm mb-1"><span>IVA</span><span>€{vatAmount}</span></div>
                                    <div className="flex items-center justify-between text-base font-semibold"><span>Total</span><span>€{total}</span></div>
                                    <div className="text-xs text-muted-foreground mt-2">preço base (packs e parceria preço+% disponíveis)</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6">
                    <div id={svc.id} className="flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div>
                                <h3 className="text-2xl font-bold">{svc.title}</h3>
                                <p className="text-muted-foreground mt-1">
                                    Explore os detalhes, preços e tempos desta etapa.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-semibold">{svc.price}</div>
                                <div className="text-xs text-muted-foreground">preço base (packs e parceria preço+% disponíveis)</div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">Inclui</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                        {svc.features.map((feat, i) => (
                                            <li key={i}>{feat}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <h4 className="font-semibold mb-2">Detalhes</h4>
                                    <div className="space-y-2 text-sm">
                                        <p>⏱ Tempo de sessão: {svc.sessionTime}</p>
                                        <p>🕒 Entrega/turnaround: {svc.recordingTime}</p>
                                        <p>🎛 Equipamento profissional incluído</p>
                                        <p>👥 Suporte técnico dedicado</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-between items-center">
                            <Button variant="outline" onClick={prevStep} disabled={activeStep === 0}>
                                Voltar
                            </Button>
                            <div className="flex gap-2">
                                {!discreetMode && (
                                  <Button variant="outline" asChild>
                                      <a href={`mailto:booking@studio.com?subject=${encodeURIComponent(`Orçamento: ${clientName}`)}&body=${encodeURIComponent(`Olá,\n\nArtista: ${clientName}\nServiços: ${Object.entries(selected).filter(([,on])=>on).map(([id])=> svcList.find(s=>s.id===id)?.title).join(", ")}\nCo-writing: ${includeCowriting?`Sim (+€${cowritingPrice})`:`Não`}\nSubtotal: €${subtotal}\nIVA: €${vatAmount}\nTotal: €${total}\n\nNotas: `)}`}>
                                          Solicitar Orçamento
                                      </a>
                                  </Button>
                                )}
                                {activeStep === svcList.length - 1 && (
                                  <Button variant="secondary" onClick={generateContractPdf}>
                                    Gerar PDF Contratualização
                                  </Button>
                                )}
                                <Button onClick={nextStep}>
                                    {activeStep === svcList.length - 1 ? "Finalizar" : "Próximo"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editar preços Modal */}
            {showEdit && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-background border rounded shadow-lg w-[min(700px,92vw)] max-h-[80vh] overflow-auto p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold">Editar preços (base)</div>
                            <Button variant="ghost" onClick={()=> setShowEdit(false)}>Fechar</Button>
                        </div>
                        <div className="grid gap-2">
                            {svcList.map((s, idx) => (
                                <div key={`edit-${s.id}`} className="flex items-center justify-between gap-3 border rounded px-3 py-2">
                                    <div className="text-sm font-medium truncate">{s.title}</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">€</span>
                                                                                <input type="number" className="h-8 w-24 px-2 border rounded" value={s.basePrice} aria-label={`Preço base de ${s.title}`} placeholder="Preço"
                                           onChange={(e)=> {
                                             const val = Number(e.target.value)||0
                                             setSvcList(list => list.map((it,i)=> i===idx ? ({...it, basePrice: val, price: `desde €${val}`}) : it))
                                           }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                            <Button variant="outline" onClick={()=> { setSvcList(SERVICES_DEFAULT); savePricesToLocal(SERVICES_DEFAULT) }}>Repor defaults</Button>
                            <Button onClick={()=> { savePricesToLocal(svcList); setShowEdit(false) }}>Guardar</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}