# 🎯 Sistema de Chamadas de IA para Venues - Guia Completo de Implementação

## 📋 Visão Geral

Este sistema permite que um agente de IA chame automaticamente venues para:
1. **Verificar disponibilidade** de datas para eventos
2. **Agendar datas** quando o venue confirma disponibilidade
3. **Atualizar automaticamente** o sistema de eventos com as informações confirmadas

Baseado no sistema de lembretes de consulta, mas adaptado para chamar venues em vez de clientes.

---

## 🏗️ Arquitetura do Sistema

```
n8n Workflow
    ↓
Google Calendar (ou API de Eventos)
    ↓
AI Agent (n8n) → Extrai dados do evento
    ↓
Retell AI → Chama o venue
    ↓
Venue responde → IA processa resposta
    ↓
Atualiza sistema (Google Calendar / API)
```

---

## 📦 Componentes Necessários

### 1. **n8n** (Workflow Automation)
- **Link**: https://n8n.io
- **Trial**: 14 dias grátis
- **Função**: Orquestrar todo o fluxo de automação

### 2. **Retell AI** (Voice AI Agent)
- **Link**: https://retellai.com
- **Conta grátis**: $10 de crédito
- **Função**: Fazer chamadas de voz com IA

### 3. **Google Calendar API** (Opcional)
- Para monitorar eventos que precisam de venues
- Ou usar a API do seu sistema de eventos

### 4. **OpenAI API** (Para o AI Agent no n8n)
- **Modelo recomendado**: GPT-4.1 ou GPT-4o-mini
- **Função**: Processar informações do evento e gerar prompts para o Retell

---

## 🚀 Passo a Passo: Configuração Completa

### **FASE 1: Configuração do n8n**

#### 1.1. Criar Conta e Workflow

1. Aceda a https://n8n.io
2. Crie conta (trial 14 dias)
3. Crie novo workflow: **"Venue Availability Caller"**

#### 1.2. Trigger: Schedule (Monitoramento Diário)

```
Node: Schedule Trigger
├─ Interval: Days
├─ Hour: 8:00 AM (ou hora desejada)
└─ Timezone: Europe/Lisbon
```

**Objetivo**: Executar diariamente para verificar eventos que precisam de venues confirmados.

#### 1.3. Node: Google Calendar (ou API de Eventos)

**Opção A - Google Calendar:**
```
Node: Google Calendar
├─ Operation: Get Many Events
├─ Calendar: [Seu calendário]
├─ After: {{ $now }}
└─ Before: {{ $now.plus({hours: 48}) }}
```

**Opção B - API do Seu Sistema:**
```
Node: HTTP Request
├─ Method: GET
├─ URL: https://seu-sistema.com/api/events/pending-venues
├─ Authentication: Bearer Token
└─ Response: Lista de eventos que precisam de venues
```

**Filtro de Eventos:**
- Eventos com `status: "draft"` ou `"pending"`
- Eventos com `venueId` mas sem `venueContact.confirmed`
- Eventos com data entre hoje e +48 horas

---

### **FASE 2: AI Agent no n8n (Processamento de Dados)**

#### 2.1. Node: AI Agent

```
Node: AI Agent
├─ Model: OpenAI GPT-4.1
├─ Mode: Defined Below
└─ System Message: [Ver abaixo]
```

#### 2.2. System Message para o AI Agent

```markdown
You are an AI assistant that processes event data and extracts venue contact information.

Your task:
1. Extract event details: name, date, time, capacity, type
2. Extract venue information: name, contact phone, contact name, contact email
3. Generate a structured JSON output with all necessary information for making a phone call

Output format must be JSON with these required fields:
- eventName (string)
- eventDate (string, ISO format)
- eventTime (string)
- eventCapacity (number)
- eventType (string)
- venueName (string)
- venuePhone (string) - REQUIRED for making calls
- venueContactName (string)
- venueEmail (string)
- eventDescription (string)
- preferredDates (array of strings) - Alternative dates if venue is unavailable

If venuePhone is missing or invalid, return error: "NO_PHONE_AVAILABLE"
```

#### 2.3. User Message (Prompt Dinâmico)

```
Appointment Description: {{ $json.description }}
Start Time: {{ $json.start }}
End Time: {{ $json.end }}
Venue Data: {{ $json.venue }}
```

#### 2.4. Structured Output Parser

```json
{
  "type": "object",
  "properties": {
    "eventName": {
      "type": "string",
      "description": "Nome do evento"
    },
    "eventDate": {
      "type": "string",
      "description": "Data do evento (ISO format)"
    },
    "eventTime": {
      "type": "string",
      "description": "Horário do evento"
    },
    "eventCapacity": {
      "type": "number",
      "description": "Lotação necessária"
    },
    "eventType": {
      "type": "string",
      "description": "Tipo de evento"
    },
    "venueName": {
      "type": "string",
      "description": "Nome do venue"
    },
    "venuePhone": {
      "type": "string",
      "description": "Telefone do venue (formato internacional)"
    },
    "venueContactName": {
      "type": "string",
      "description": "Nome do contacto do venue"
    },
    "venueEmail": {
      "type": "string",
      "description": "Email do venue"
    },
    "eventDescription": {
      "type": "string",
      "description": "Descrição do evento"
    },
    "preferredDates": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Datas alternativas preferidas"
    }
  },
  "required": ["eventName", "eventDate", "venueName", "venuePhone"]
}
```

---

### **FASE 3: Configuração do Retell AI**

#### 3.1. Criar Conta no Retell AI

1. Aceda a https://retellai.com
2. Crie conta grátis ($10 de crédito)
3. Vá para **API Keys** → **Add** → Copie a API key

#### 3.2. Comprar Número de Telefone

1. Vá para **Phone Numbers**
2. Clique em **+ Add Number**
3. Selecione **Twilio** (ou Telenx)
4. Escolha código de área (ex: +351 para Portugal)
5. Custo: ~$2/mês (vem com $10 grátis)

#### 3.3. Criar Agente de Voz

1. Vá para **Agents** → **Create Agent**
2. Tipo: **Single Prompt Agent**
3. Nome: **"Venue Availability Agent"**

#### 3.4. Universal Prompt (Prompt Principal do Agente)

```markdown
You are an AI-powered voice assistant for [SUA EMPRESA/ARTISTA]. Your job is to call venues to check availability and schedule event dates.

**Your Identity:**
- Name: [Nome do assistente, ex: "Alex"]
- Company: [Sua empresa]
- Role: Event booking assistant

**Style & Guardrails:**
- Be professional, friendly, and concise
- Speak clearly and at a moderate pace
- Avoid repeating information unnecessarily
- If you don't understand something, ask for clarification
- Always confirm important details before ending the call

**Task Breakdown:**

**Step 1: Greeting & Identity Confirmation**
- Begin by saying: "Hi, am I speaking with [VENUE_CONTACT_NAME]?"
- If yes, proceed to Step 2
- If no, ask: "Could you please connect me with [VENUE_CONTACT_NAME] or the person responsible for event bookings?"
- Wait for response

**Step 2: Introduction & Purpose**
- Say: "Great, thank you. This is [ASSISTANT_NAME] from [COMPANY]. I'm calling to check availability for an upcoming event we'd like to host at [VENUE_NAME]."
- Wait for acknowledgment

**Step 3: Event Details**
- Provide event information:
  - Event name: [EVENT_NAME]
  - Event type: [EVENT_TYPE]
  - Preferred date: [EVENT_DATE] at [EVENT_TIME]
  - Expected capacity: [EVENT_CAPACITY] people
  - Brief description: [EVENT_DESCRIPTION]

**Step 4: Availability Check**
- Ask: "Is [EVENT_DATE] at [EVENT_TIME] available for this event?"
- Wait for response

**Step 5A: If Available**
- Confirm: "Perfect! So we're confirming [EVENT_DATE] at [EVENT_TIME] for [EVENT_NAME]?"
- Ask: "Are there any specific requirements or details we should know about?"
- If they mention requirements, note them
- End: "Thank you so much! We'll send a confirmation email to [VENUE_EMAIL] with all the details. Have a great day!"

**Step 5B: If Not Available**
- Ask: "I understand. What dates around that time would work for you?"
- Listen to alternative dates
- If alternative dates provided:
  - Confirm: "So [ALTERNATIVE_DATE] at [EVENT_TIME] would work for you?"
  - If yes, proceed to Step 5A
  - If no, ask for more options
- If no alternative dates:
  - Say: "I understand. Would it be possible to check your calendar and call us back, or should we try again next week?"
  - End call politely

**Step 6: Transfer to Human (if needed)**
- If venue asks complex questions you can't answer
- If venue wants to negotiate terms
- If venue requests to speak with someone else
- Use function: "transfer_call" with number: [HUMAN_CONTACT_NUMBER]

**Important Notes:**
- Always be polite and professional
- Don't make promises you can't keep
- If unsure about something, transfer to human
- Confirm all details before ending call
- Thank them for their time
```

#### 3.5. Functions (Funções do Agente)

**Function 1: End Call**
```
Name: end_call
Description: End the phone call when the conversation is complete
```

**Function 2: Transfer Call**
```
Name: transfer_call
Description: Transfer the call to a human agent
Parameters:
  - phone_number (string, required): Phone number to transfer to
```

#### 3.6. Knowledge Base (Opcional)

Adicione informações sobre:
- Tipos de eventos que você organiza
- Requisitos técnicos comuns
- Condições de pagamento padrão
- FAQ sobre eventos

**Formato**: Texto manual, PDF, ou URL do seu website

#### 3.7. Configurações do Agente

```
Model: GPT-4.1 (ou GPT-4o-mini para economia)
Voice: [Escolha uma voz profissional]
Language: Portuguese (ou English)
Welcome Message: AI Initiates (AI começa a conversa)
```

#### 3.8. Outbound Calls

1. Vá para **Phone Numbers** → Selecione seu número
2. Em **Outbound Call Agent**, selecione: **"Venue Availability Agent"**
3. **Inbound Call Agent**: None (para agora)
4. **Make Outbound Call**: Enabled (após verificação de identidade)

**⚠️ Importante**: Se estiver nos EUA, precisa verificar identidade primeiro.

#### 3.9. Copiar Agent ID

1. Vá para **Agents** → Clique no seu agente
2. Copie o **Agent ID** (precisa para o workflow)

---

### **FASE 4: HTTP Request no n8n (Chamar Retell AI)**

#### 4.1. Node: HTTP Request

```
Node: HTTP Request
├─ Method: POST
├─ URL: https://api.retellai.com/create-phone-call
├─ Authentication: Generic Credential Type → Custom Auth
└─ Headers:
    ├─ Authorization: Bearer {{ $env.RETELL_API_KEY }}
    └─ Content-Type: application/json
```

#### 4.2. Credenciais (Custom Auth)

```
Name: Retell AI API
Type: Generic Credential Type → Custom Auth
Header Name: Authorization
Header Value: Bearer [SUA_API_KEY_RETELL]
```

**Como obter API Key:**
1. Retell AI Dashboard → **API Keys**
2. **Add** → Copie a key

#### 4.3. Body (JSON)

```json
{
  "from_number": "+351XXXXXXXXX",
  "to_number": "{{ $json.venuePhone }}",
  "override_agent_id": "AGENT_ID_AQUI",
  "retell_llm_dynamic_variables": {
    "EVENT_NAME": "{{ $json.eventName }}",
    "EVENT_DATE": "{{ $json.eventDate }}",
    "EVENT_TIME": "{{ $json.eventTime }}",
    "EVENT_CAPACITY": "{{ $json.eventCapacity }}",
    "EVENT_TYPE": "{{ $json.eventType }}",
    "VENUE_NAME": "{{ $json.venueName }}",
    "VENUE_CONTACT_NAME": "{{ $json.venueContactName }}",
    "VENUE_EMAIL": "{{ $json.venueEmail }}",
    "EVENT_DESCRIPTION": "{{ $json.eventDescription }}",
    "HUMAN_CONTACT_NUMBER": "+351XXXXXXXXX"
  }
}
```

**Variáveis dinâmicas**: Estas são passadas para o agente de voz durante a chamada.

---

### **FASE 5: Processamento de Respostas (Opcional - Avançado)**

#### 5.1. Webhook do Retell AI

Quando a chamada termina, o Retell pode enviar um webhook com:
- Status da chamada
- Transcrição
- Resultado (confirmado/não confirmado)
- Datas alternativas sugeridas

#### 5.2. Node: Webhook (Receber Resposta)

```
Node: Webhook
├─ Method: POST
├─ Path: venue-call-result
└─ Response: JSON com resultado
```

#### 5.3. Node: Process Result

Processar a resposta e atualizar:
- Google Calendar (marcar como confirmado)
- Sistema de eventos (atualizar `venueContact.confirmed`)
- Enviar email de confirmação

---

## 🔧 Integração com Seu Sistema

### Opção 1: Atualizar via API

```javascript
// Node: HTTP Request (Atualizar Evento)
POST https://seu-sistema.com/api/events/{eventId}/venue-confirmation
Body: {
  "venueId": "venue-123",
  "confirmed": true,
  "confirmedDate": "2025-01-15T14:00:00Z",
  "confirmedBy": "AI Agent",
  "notes": "Venue confirmed availability via AI call"
}
```

### Opção 2: Atualizar Google Calendar

```
Node: Google Calendar
├─ Operation: Update Event
├─ Event ID: {{ $json.eventId }}
└─ Description: [Adicionar nota de confirmação]
```

---

## 📝 Estrutura de Dados Necessária

### Evento (do seu sistema)
```typescript
{
  id: "event-123",
  name: "Concerto Intimista",
  date: "2025-01-15",
  time: "20:00",
  capacity: 50,
  type: "show",
  venue: {
    id: "venue-456",
    name: "Galeria Zé dos Bois",
    contactPhone: "+351 21 343 02 05",
    contactName: "João Silva",
    contactEmail: "reservas@zedosbois.org"
  },
  status: "draft",
  venueContact: {
    confirmed: false
  }
}
```

### Venue (do seu sistema)
```typescript
{
  id: "venue-456",
  name: "Galeria Zé dos Bois",
  contactPhone: "+351 21 343 02 05",
  contactName: "João Silva",
  contactEmail: "reservas@zedosbois.org"
}
```

---

## 🎯 Fluxo Completo do Sistema

```
1. Trigger diário (8:00 AM)
   ↓
2. Buscar eventos pendentes (próximos 48h, sem venue confirmado)
   ↓
3. Para cada evento:
   ├─ Verificar se tem venuePhone
   ├─ Se sim → Processar com AI Agent
   ├─ Extrair dados estruturados
   └─ Chamar Retell AI
   ↓
4. Retell AI faz a chamada
   ├─ Confirma disponibilidade
   ├─ Agenda data (ou sugere alternativas)
   └─ Retorna resultado
   ↓
5. Atualizar sistema
   ├─ Marcar venue como confirmado
   ├─ Atualizar data (se mudou)
   └─ Enviar confirmação por email
```

---

## 💰 Custos Estimados

### Retell AI
- **Número de telefone**: ~$2/mês (Twilio)
- **Chamadas**: 
  - GPT-4.1: $0.045/minuto
  - GPT-4o-mini: $0.015/minuto
  - GPT-3.5: $0.01/minuto
- **Exemplo**: 10 chamadas de 3 minutos = ~$1.35 (GPT-4.1)

### OpenAI (n8n AI Agent)
- **GPT-4.1**: ~$0.01 por processamento
- **Exemplo**: 10 eventos = ~$0.10

### Total mensal (estimado)
- **50 chamadas/mês**: ~$10-15
- **100 chamadas/mês**: ~$20-30

---

## ✅ Checklist de Implementação

### Setup Inicial
- [ ] Criar conta n8n
- [ ] Criar conta Retell AI
- [ ] Comprar número de telefone
- [ ] Obter API keys (Retell + OpenAI)

### Configuração n8n
- [ ] Criar workflow "Venue Availability Caller"
- [ ] Configurar Schedule Trigger
- [ ] Configurar Google Calendar/API de eventos
- [ ] Configurar AI Agent com system message
- [ ] Configurar Structured Output Parser
- [ ] Configurar HTTP Request para Retell

### Configuração Retell AI
- [ ] Criar agente "Venue Availability Agent"
- [ ] Configurar Universal Prompt
- [ ] Adicionar functions (end_call, transfer_call)
- [ ] Configurar knowledge base (opcional)
- [ ] Ativar outbound calls
- [ ] Copiar Agent ID

### Testes
- [ ] Testar workflow com evento de teste
- [ ] Verificar se chamada é feita
- [ ] Testar cenário: venue disponível
- [ ] Testar cenário: venue não disponível
- [ ] Testar cenário: transferência para humano
- [ ] Verificar atualização no sistema

### Produção
- [ ] Ativar workflow (Live)
- [ ] Monitorar primeiras chamadas
- [ ] Ajustar prompts se necessário
- [ ] Configurar alertas/notificações

---

## 🚨 Troubleshooting

### Problema: Chamada não é feita
- Verificar se número de telefone está correto (formato internacional)
- Verificar se Agent ID está correto
- Verificar se API key está válida
- Verificar logs do n8n

### Problema: Agente não entende português
- Configurar language: Portuguese no Retell
- Ajustar prompt para português
- Testar com voz em português

### Problema: Venue não atende
- Retell AI tenta 1-2 vezes automaticamente
- Pode configurar retry no workflow
- Adicionar fallback para email

### Problema: Dados não atualizam
- Verificar se webhook está configurado
- Verificar se API de atualização está funcionando
- Verificar logs de erro

---

## 📚 Recursos Adicionais

### Documentação
- **n8n Docs**: https://docs.n8n.io
- **Retell AI Docs**: https://docs.retellai.com
- **Retell API Reference**: https://docs.retellai.com/api-reference

### Exemplos de Prompts
- Ver seção "Universal Prompt" acima
- Ajustar conforme seu tipo de evento
- Adicionar exemplos de conversação

### Melhorias Futuras
- Integração com WhatsApp (via Retell)
- Agendamento automático no Google Calendar
- Notificações por email/SMS
- Dashboard de estatísticas
- Multi-idioma (português/inglês)

---

## 🎓 Próximos Passos

1. **Implementar Fase 1-4** (Setup básico)
2. **Testar com 1-2 venues** (validação)
3. **Ajustar prompts** (baseado em resultados)
4. **Expandir para mais eventos** (escalar)
5. **Adicionar webhooks** (processamento de respostas)
6. **Criar dashboard** (monitoramento)

---

**Última atualização**: Janeiro 2025
**Versão**: 1.0


