import { syncContacts } from "@/lib/sync-contacts";
import type { SyncContact } from "@/lib/sync-contacts";

export default function SyncLicensingPTPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Sync Licensing em Portugal — Guia Rápido</h1>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Entidades e Direitos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
          <li>Autores/Compositores: SPA (Sociedade Portuguesa de Autores) — PRO para direitos de execução/comunicação pública.</li>
          <li>Artistas Intérpretes: GDA — direitos conexos.</li>
          <li>Produtor Fonográfico: Audiogest — direitos de master; licenças de sincronização para gravação fonográfica.</li>
          <li>Licenças de sincronização exigem autorização do detentor do master e do editor (se houver), além de cue sheet.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Mercado e Contactos</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Broadcasters: RTP, SIC, TVI; plataformas: OPTO, RTP Play; publicidade: agências criativas e produtoras (ex.: Bar Ogilvy, Partners, Uzina, Take It Easy, Garage).</li>
          <li>Cinema e TV: produtoras (Plural, SP Televisão, Ukbar), estudios de pós (Lola, Indigo), festivais (IndieLisboa, DocLisboa).</li>
          <li>Brand content e digital: departamentos de marketing de marcas e produtoras de vídeo corporativo.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Masterclass & Recursos</h2>
        <div className="rounded-md border p-4 text-sm leading-relaxed">
          <p className="font-medium">Masterclass — The Music Business: Licensing & Sync</p>
          <p>Orador: Steve Bootland — A&R Rep (Circulate Music), Head of Sync (Leaky Sync), Director (The Portugal Music Scene)</p>
          <p>17h00 — Sessão de encerramento: Prof. Doutor Jorge Miguel Cecília Moniz — Licenciatura em Jazz e Música Moderna, Faculdade de Arquitetura e Artes, Universidade Lusíada (Lisboa)</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Sync Licensing Connections</h2>
        <div className="space-y-3">
          {syncContacts.map((c: SyncContact) => (
            <div key={c.id} className="rounded-md border p-4 space-y-2">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-gray-600">
                  {c.role}
                  {c.company ? ` — ${c.company}` : ""}
                </p>
              </div>
              {c.bio ? (
                <p className="text-sm leading-relaxed">{c.bio}</p>
              ) : null}
              <ul className="text-sm space-y-1">
                {c.email ? (
                  <li>
                    Email:{" "}
                    <a
                      href={`mailto:${c.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.email}
                    </a>
                  </li>
                ) : null}
                {c.phone ? (
                  <li>
                    Telefone:{" "}
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, "")}`}
                      className="text-blue-600 hover:underline"
                    >
                      {c.phone}
                    </a>
                  </li>
                ) : null}
                {c.linkedin ? (
                  <li>
                    LinkedIn:{" "}
                    <a
                      href={c.linkedin}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-600 hover:underline"
                    >
                      Perfil
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Posições que conseguem Sync (para anotar)</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
          <li><span className="font-medium">Music Supervisor (filmes/TV/streaming)</span> — seleciona, negocia e recomenda músicas para conteúdos narrativos.</li>
          <li><span className="font-medium">Supervisor de Sync / Licensing Manager</span> (labels/publishers) — autorizações de master e publishing; negociação.</li>
          <li><span className="font-medium">Agente de Sync</span> — representa catálogos curados; faz pitching ativo junto de supervisors e agências.</li>
          <li><span className="font-medium">A&amp;R (label/distribuidora)</span> — pode promover faixas internamente e abrir portas a oportunidades de sync.</li>
          <li><span className="font-medium">Music Editor</span> (pós-produção) — trabalha com o supervisor, sugere cortes e aprovações técnicas.</li>
          <li><span className="font-medium">Supervisor de Som / Re-recording Mixer</span> — influência técnica em escolhas finais (trailers, spots).</li>
          <li><span className="font-medium">Music Supervisor em Publicidade</span> (agências) — decide músicas para TV/digital em campanhas.</li>
          <li><span className="font-medium">Diretor Criativo / Produtor de Agência</span> — decisores criativos que podem solicitar licenças diretas.</li>
          <li><span className="font-medium">Coordenador de Licensing</span> (publishers) — coloca catálogos em pitch a supervisors.</li>
          <li><span className="font-medium">Music Libraries / Production Music</span> — licenças rápidas, grande volume (TV, reality, social).</li>
          <li><span className="font-medium">Audio Director / Supervisor de Jogos</span> — decide músicas para jogos e trailers de jogos.</li>
          <li><span className="font-medium">Trailer Houses / Supervisores de Trailers</span> — especialidade em trailers com música específica.</li>
          <li><span className="font-medium">Curadoria de Streaming</span> — não é sync direto, mas playlists editoriais geram atenção de supervisors.</li>
          <li><span className="font-medium">Showrunners / Produtores Executivos</span> — decisão em projetos independentes.</li>
          <li><span className="font-medium">Consultores de Sync / Boutique Agencies</span> — pequenas agências focadas em independentes.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Prioridade prática (quem contactar primeiro)</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Music Supervisors (filmes/TV)</li>
          <li>Agentes de Sync / Sync Managers</li>
          <li>Publishers / Licensing Managers</li>
          <li>Music Libraries (para volume/rapidez)</li>
          <li>Supervisores de Publicidade e Agências criativas</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Abordagens rápidas (copiar e colar)</h2>
        <details className="rounded-md border p-4 text-sm space-y-2">
          <summary className="font-medium cursor-pointer">Email curto — agente / supervisor</summary>
          <p>
            <span className="font-medium">Assunto:</span> Sync submission — [ARTISTA] — “[TÍTULO]” (stems + edits)
          </p>
          <p>
            Olá [Nome], sou [Nome/Artista]. Envio “[TÍTULO]” — [duração], BPM [xx], tom [X] — encaixa em [drama / spot / trailer]. Stems e cortes 30s/60s prontos. Link privado: [link] (pass: xxxx). Obrigado, [assinatura]
          </p>
        </details>
        <details className="rounded-md border p-4 text-sm space-y-2">
          <summary className="font-medium cursor-pointer">LinkedIn / DM</summary>
          <p>Olá [Nome], sou [Artista]. Tenho uma faixa (stems + 30s/60s) que pode encaixar no teu trabalho em [séries/ads]. Posso enviar link privado?</p>
        </details>
        <details className="rounded-md border p-4 text-sm space-y-2">
          <summary className="font-medium cursor-pointer">Submissão para Music Library</summary>
          <p>
            <span className="font-medium">Assunto:</span> Submission — [ARTISTA] — “[TÍTULO]” — Genre: [Género] — Mood: [tags]<br />
            Link privado + metadados (Título/BPM/Tom/Duração/ISRC/Splits/Versões). Controlamos master &amp; publishing (ou contacto de publishing: X).
          </p>
        </details>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Aprendizados práticos (de experiência real)</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm leading-relaxed">
          <li>Bibliotecas = volume e rapidez; agentes = alcance qualificado; majors/publishers = acesso interno.</li>
          <li>Organização é tudo: masters, instrumental/clean, stems, ISRC, splits, cue sheet, contratos base.</li>
          <li>Evita ceder &gt;50% do ganho de sync salvo forte contrapartida; cuidado com exclusividades longas.</li>
          <li>Estuda TV/filmes: vê créditos e descobre quem licencia para os projetos que queres atingir.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Materiais e Metadados</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Masters: WAV 24‑bit/48 kHz (ou 44.1 kHz), stems por grupos (vox, drums, bass, music), instrumental, versão curta (15/30/60s) quando aplicável.</li>
          <li>Metadados: ISRC, IPI/CAE, créditos (autor, intérprete, produtor), tempo, BPM, tonalidade, mood tags, contacto direto de licensing.</li>
          <li>Cue sheet: título, duração de uso, tipo (background/feature), timecodes, percentagens de autoria e editoras.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Modelos e Tarifas</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Publicidade: buyouts por território/duração (ex.: PT 1 ano TV+Online), versões cutdown têm ajustes; negociações variam por cliente.</li>
          <li>Cinema/TV: licença perpétua para a obra, negociação baseada em duração de uso, proeminência e orçamento da produção.</li>
          <li>Online/UGC: licenças mais acessíveis; considerar Content ID e whitelisting quando necessário.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Funil de Prospeção</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Definir catálogo com tags por mood/tempo/estilo e versões instrumentais.</li>
          <li>Preparar one‑pager e showreel (case studies se existirem).</li>
          <li>Mapear decisores (music supervisors, produtores, diretores criativos) e enviar apresentações curtas com links privados.</li>
          <li>Manter CRM simples (Kanban) e follow‑ups trimestrais com novidades.</li>
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Checklist de Entrega</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>WAV master + instrumental + stems (zipados).</li>
          <li>Planilha de metadados (CSV) e cue sheet template preenchível.</li>
          <li>Termos de licença propostos (território, duração, mídia) e contato.</li>
        </ul>
      </section>
    </div>
  );
}
