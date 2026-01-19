"use client";

import { useState } from "react";

type Props = {
  to?: string;
  subject?: string;
  templateText?: string;
};

export default function EmailCompose({ to = "", subject = "", templateText = "" }: Props) {
  const [recipients, setRecipients] = useState(to);
  const [subj, setSubj] = useState(subject);
  const [body, setBody] = useState(templateText);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const send = async () => {
    setSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ to: recipients, subject: subj, text: body })
      });
      if (!res.ok) throw new Error('send_failed');
      setStatus('Enviado ✅');
    } catch (e) {
      setStatus('Falha ao enviar');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-xs text-muted-foreground">Para</span>
          <input value={recipients} onChange={(e)=>setRecipients(e.target.value)} placeholder="email@dominio.pt" className="px-2 py-1 rounded border bg-background"/>
        </label>
        <label className="flex flex-col gap-1 md:col-span-1">
          <span className="text-xs text-muted-foreground">Assunto</span>
          <input value={subj} onChange={(e)=>setSubj(e.target.value)} placeholder="Proposta" className="px-2 py-1 rounded border bg-background"/>
        </label>
      </div>
      <label className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Mensagem</span>
        <textarea value={body} onChange={(e)=>setBody(e.target.value)} rows={6} className="px-2 py-1 rounded border bg-background" placeholder="Escreve aqui…"/>
      </label>
      <div className="flex items-center gap-2">
        <button onClick={send} disabled={sending || !recipients || !subj || !body} className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60">{sending ? 'A enviar…' : 'Enviar email'}</button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
