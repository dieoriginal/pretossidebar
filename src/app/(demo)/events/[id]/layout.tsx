// app/events/[id]/layout.tsx
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { ReactNode } from "react";

export default function EventLayout({ children, params }: { children: ReactNode; params: { id: string } }) {
  const base = `/events/${params.id}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
        

        <Dialog> {/* Fluxograma de Execução de Eventos*/}
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" className="w-8 h-8">
                    <span className="text-sm">i</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[800px] max-h-[80vh] overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>Fluxograma Final — Produção de Evento Musical</DialogTitle>
                  </DialogHeader>
                  <div
                    className="space-y-4 overflow-y-auto pr-2"
                    style={{ maxHeight: '60vh' }}
                  >
                    <p>
                      Um fluxograma sequencial para planear, produzir e executar um evento musical. Está organizado nas 6 etapas profissionais, com ações práticas (contactos, emails, riders, soundcheck, promoção) integradas em cada etapa.
                    </p>
                    <div>
                      <h3 className="font-semibold mb-2">1) Concepção & Programação</h3>
                      <ol className="list-decimal pl-6 space-y-2">
                        <li><strong>Lista de artistas/DJs</strong> - Fazer uma lista inicial dos artistas e DJs que desejas convidar para o evento.</li>
                        <li><strong>Contacto inicial</strong> - Contactar os artistas: explicar que estás a planear um evento na(s) data(s) X (ainda não confirmada) e pedir disponibilidade.</li>
                        <li><strong>Duração dos sets</strong> - Indicar o tempo estimado que queres que cada artista toque (ex.: 45 min, 60 min, DJ set 2h).</li>
                        <li><strong>Exigências técnicas</strong> - Perguntar sobre necessidades básicas: rider técnico, transporte e alojamento.</li>
                        <li><strong>Formato do evento</strong> - Decidir o formato: one-night, mini-tour, festival, industry day, beat battles, etc.</li>
                        <li><strong>Headliner & meta de público</strong> - Definir o(s) artista(s) principal(is) e as metas de público.</li>
                        <li><strong>Lista com links</strong> - Preparar uma lista dos artistas convidados com links (Instagram, Spotify, YouTube) para anexar ao email de proposta.</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">2) Comercial & Financeiro</h3>
                      <ol className="list-decimal pl-6 space-y-2" start={4}>
                        <li><strong>Estruturar pacotes de bilhetes</strong> - Definir tipos (ex.: early-bird, normal, porta) e políticas de preço com possíveis aumentos faseados.</li>
                        <li><strong>Abrir pré-venda</strong> - Ativar presale nas plataformas (ex.: Resident Advisor, Eventbrite) e confirmar com a venue se aceitam bilhetes vendidos externamente.</li>
                        <li><strong>Procurar patrocínios/parcerias</strong> - Abordar promotores, universidades e marcas locais para apoio ou colaboração.</li>
                        <li><strong>Modelo de pagamento aos artistas</strong> - Decidir entre flat fee (ex.: 100€–150€), percentagem da bilheteira, ou divisão flexível conforme contribuição (como no modelo Daydream). Incluir no email à venue pergunta sobre preferência de modelo (flat vs percentagem).</li>
                      </ol>
                    </div>

                    <div>
                      <h3 className="font-semibold mb-2">3) Planeamento Operacional</h3>
                      <ol className="list-decimal pl-6 space-y-2" start={8}>
                        <li>Arranjar contactos da programação / email geral da venue.</li>
                        <li>Perguntar horários de abertura/fecho do espaço para montar a timetable.</li>
                        <li>
                          No email de proposta para a venue, incluir:
                          <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Data preferida + alternativas (ou perguntar disponibilidade para sexta/sábado no mês X).</li>
                            <li>Texto curto a explicar o conceito e a vibe do evento.</li>
                            <li>Lista de artistas/DJs com links.</li>
                            <li>Pergunta sobre deal/cache e se têm técnico de som, luz e pessoal na bilheteira.</li>
                          </ul>
                        </li>
                        <li>Negociar técnicos (som, luz), segurança e bilheteira — ou planear contratar pessoal externo (pode ser mais barato).</li>
                        <li>Recolher riders técnicos, bios e fotos dos artistas.</li>
                        <li>Enviar riders ao técnico de som e bios/fotos ao responsável de comunicação da venue.</li>
                        <li>Definir logística: transportes, alojamento, alimentação e horários de chegada dos artistas.</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">4) Preparação Técnica</h3>
                      <ol className="list-decimal pl-6 space-y-2" start={15}>
                        <li>Reservar equipamento (PA, amplificadores, backline, iluminação) com base no rider.</li>
                        <li>Perguntar aos artistas quanto tempo precisam para soundcheck.</li>
                        <li>Agendar soundcheck com a venue e com o técnico de som (confirmar início/fim).</li>
                        <li>Preparar infra de streaming (se aplicável): encoders, uplink/backup.</li>
                        <li>Fazer design do cartaz, clipes promocionais e assets para redes (fazer versões quadrada, story, banner para site).</li>
                        <li>Contactar videógrafos e fotógrafos; combinar brief e horários.</li>
                        <li>Criar e distribuir um cronograma provisório (timetable draft) para artistas e equipa.</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">5) Execução do Evento</h3>
                      <ol className="list-decimal pl-6 space-y-2" start={22}>
                        <li>Montagem do palco, sistema de som e luz.</li>
                        <li>Credenciação da equipa e artistas.</li>
                        <li>Estar presente desde o início do soundcheck até ao fim do evento (ou designar um responsável).</li>
                        <li>Gestão de FOH, monitor, palco, backline, áreas VIP e bilheteira.</li>
                        <li>Enviar a Timetable oficial a toda a equipa (artists, técnicos, segurança, bilheteira, videógrafos).</li>
                        <li>Monitorizar streaming/PPV em tempo real e ter suporte técnico disponível.</li>
                        <li>Gerir vendas de bilhetes físicas/online e merch.</li>
                      </ol>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-2">6) Pós-produção & Comercialização</h3>
                      <ol className="list-decimal pl-6 space-y-2" start={29}>
                        <li>Recolher filmagens e fotos — ingest e edição de highlights / VOD.</li>
                        <li>Publicar VOD/PPV se aplicável; criar pacotes pós-evento (VOD + fotos).</li>
                        <li>Reconciliar receitas: bilhetes, bar (se aplicável), merch.</li>
                        <li>Preparar relatório de KPIs para patrocinadores (vendas, público, alcance digital, clippings).</li>
                        <li>Pagamentos finais a artistas e fornecedores; dividir lucros conforme acordado.</li>
                        <li>Follow-up com artistas, venue e patrocinadores; levantar aprendizados e road map para próximos eventos.</li>
                      </ol>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
        </header>

        <main className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm dark:shadow-slate-900/20 p-6 border border-slate-200 dark:border-slate-700">
          {children}
        </main>
      </div>
    </div>
  );
}
