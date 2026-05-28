# PASSO 10: Advanced Automation com Lead Scoring & Auto-Assignment

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Componentes](#componentes)
4. [Configuração](#configuração)
5. [API Endpoints](#api-endpoints)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Testes](#testes)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

**Passo 10** implementa um sistema avançado de automação para CRM de advocacia que:

- ✅ **Calcula scores de leads** (0-100) baseado em 9 fatores
- ✅ **Auto-atribui leads** a advogados baseado em workload e especialidade
- ✅ **Executa regras de automação** por triggers (score, categoria, status, etc)
- ✅ **Rebalanceia workload** entre team members
- ✅ **Dispara sequências de email** automaticamente
- ✅ **Mantém audit trail** de todas as operações

**Status:** ✅ COMPLETO E TESTADO

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                  HTTP REQUESTS (REST API)               │
├─────────────────────────────────────────────────────────┤
│  /api/automation/scoring/*                              │
│  /api/automation/assignment/*                           │
│  /api/automation/rules/*                                │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │  automationController │ (16 endpoints)
        └────────┬────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼────┐  ┌───▼────┐  ┌───▼────┐
│ Score  │  │Assignment│ │Rules│
│Service │  │Service   │ │Mgmt  │
└───┬────┘  └───┬────┘  └───┬────┘
    │           │           │
    └───┬───────┼───────┬───┘
        │       │       │
        ▼       ▼       ▼
  ┌─────────────────────────────┐
  │  automationEngine           │ (orquestra tudo)
  │  executeAutomation()        │
  │  executeScheduledAutomations()
  └─────────────────────────────┘
        │
        ├─► Prisma ORM
        │   └─► PostgreSQL
        │       ├─ AutomationRule
        │       ├─ AutomationLog
        │       ├─ UserWorkload
        │       └─ Lead (com scores)
        │
        └─► automationScheduler
            (executa a cada 5min)
```

---

## 📦 Componentes

### 1. **leadScoringService.ts** (360+ linhas)

Calcula qualidade de leads em escala 0-100.

**Fórmula de Score:**
```
baseScore (10) 
+ categoryScore (5-25)      // RETIREMENT/BPC_LOAS/PROCESS/CONSULTATION
+ sourceScore (5-20)         // WHATSAPP/WEBSITE/EMAIL/REFERRAL/OTHER
+ statusScore (0-35)         // Progresso: INITIAL → CONSULTING → QUALIFIED → PROPOSAL → CLOSED
+ documentScore (0-20)       // Documentos anexados
+ activityScore (0-15)       // Contatos, reuniões, propostas nos últimos 7 dias
+ emailScore (0-15)          // Email aberto/clicado em sequências
+ conversionScore (30)       // Se status=CLOSED, score final será 100
+ recencyScore (0-10)        // Atividade recente (últimas 24h = +10)
───────────────────
TOTAL: 0-100
```

**Métodos Principais:**

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `calculateLeadScore(leadId)` | Calcula score para um lead | `{score: number, factors: ScoringFactors}` |
| `recalculateAllScores()` | Recalcula todos leads | `{processed: number, updated: number}` |
| `getHighQualityLeads(minScore=70)` | Retorna leads > 70 | `Lead[]` |
| `getLowScoreLeads(maxScore=30)` | Retorna leads < 30 | `Lead[]` |
| `getScoreDistribution()` | Analytics de scores | `{excellent, good, medium, poor}` |
| `getLeadScoringDetails(leadId)` | Retorna fatores de score | `ScoringFactors` |
| `boostLeadScore(leadId, points, reason)` | Aumenta score manualmente | `Lead` |

**Exemplo de Retorno:**
```json
{
  "leadId": "uuid-123",
  "score": 75,
  "factors": {
    "categoryScore": 20,
    "sourceScore": 15,
    "statusScore": 25,
    "documentScore": 10,
    "activityScore": 5,
    "emailScore": 0,
    "conversionScore": 0,
    "recencyScore": 0,
    "baseScore": 10
  }
}
```

---

### 2. **autoAssignmentService.ts** (340+ linhas)

Atribui leads automaticamente a advogados.

**Algoritmo de Atribuição:**

1. **Validar lead:**
   - Não pode estar já atribuído a um responsável
   - Não pode ter status CLOSED ou PROPOSAL

2. **Encontrar melhor usuário:**
   - Filtrar por setor (LEGAL ou COMMERCIAL)
   - Filtrar por especialidade do lead
   - Escolher usuário com menor workload %
   - Usuário deve estar "Available"

3. **Atribuir:**
   - Atualizar `lead.responsibleId`
   - Criar kanban card no setor apropriado
   - Registrar em AutomationLog

**Métodos Principais:**

| Método | Descrição | Retorno |
|--------|-----------|---------|
| `autoAssignLead(leadId)` | Atribui um lead | `{success, leadId, assignedTo?, error?}` |
| `autoAssignMultipleLeads(leadIds[])` | Atribui batch | `{success, assigned, failed}[]` |
| `rebalanceAssignments()` | Move leads de usuários > 80% | `{reassigned: number}` |
| `findBestUserMatch(lead)` | Encontra melhor usuário | `User \| null` |
| `updateUserWorkload(userId)` | Atualiza utilização | `UserWorkload` |
| `initializeUserWorkload(userId, maxCapacity, specialties)` | Inicializa | `UserWorkload` |
| `listUserWorkloads()` | Lista workload de todos | `UserWorkload[]` |

**Setores (Kanban):**
- `LEGAL`: RETIREMENT, BPC_LOAS, PROCESS → primeira coluna "todo"
- `COMMERCIAL`: CONSULTATION → primeira coluna "todo"

---

### 3. **automationEngine.ts** (350+ linhas)

Orquestra todas as automações e executa regras.

**Triggers Suportados:**

| Trigger | Descrição |
|---------|-----------|
| `LEAD_CREATED` | Novo lead criado |
| `LEAD_SCORE_ABOVE` | Score > valor definido |
| `LEAD_SCORE_BELOW` | Score < valor definido |
| `LEAD_CONVERTED` | Lead convertido em proposta/contrato |
| `DAYS_WITHOUT_ACTION` | Lead sem atividade por X dias |
| `CATEGORY_MATCH` | Categoria = valor definido |
| `STATUS_CHANGE` | Status mudou para X |
| `MANUAL` | Execução manual |

**Ações Suportadas:**

| Ação | Descrição |
|------|-----------|
| `ASSIGN_TO_USER` | Atribuir a um usuário |
| `SEND_EMAIL` | Enviar email direto |
| `TRIGGER_SEQUENCE` | Disparar sequência de email |
| `UPDATE_STATUS` | Mudar status do lead |
| `ADD_TO_KANBAN` | Adicionar card no kanban |
| `NOTIFY_TEAM` | Notificar team (via socket.io) |
| `MARK_FOR_REVIEW` | Marcar para revisão manual |

**Métodos Principais:**

| Método | Descrição |
|--------|-----------|
| `executeAutomation(leadId, trigger)` | Executa automação para um lead |
| `executeScheduledAutomations()` | Processa todos os leads (chamado pelo scheduler a cada 5min) |
| `createAutomationRule(data)` | Cria nova regra |
| `listRules(isActive?)` | Lista regras (ativas/inativas) |
| `disableRule(ruleId)` | Desativa uma regra |
| `getAutomationLogs(leadId?, limit=50)` | Audit trail de execuções |

---

### 4. **automationScheduler.ts** (100+ linhas)

Executa automações em intervalos regulares (padrão: 5 minutos).

```typescript
class AutomationScheduler {
  start()          // Inicia processamento periódico
  stop()           // Para scheduler
}

// Exportado como singleton
export const automationScheduler = new AutomationScheduler({ intervalMinutes: 5 })
```

**Output no console:**
```
[11:14:11] ⚙️ Processando automações agendadas...
✅ Automações processadas: 4 leads, 0 erros
```

---

### 5. **Banco de Dados**

**Novas tabelas criadas:**

#### AutomationRule
```sql
CREATE TABLE "AutomationRule" (
  id: UUID (PK)
  name: String (unique)
  description: String?
  trigger: enum (LEAD_CREATED, LEAD_SCORE_ABOVE, ...)
  triggerValue: String?
  action: enum (ASSIGN_TO_USER, SEND_EMAIL, ...)
  actionValue: String?
  sequenceId: UUID? (FK EmailSequence)
  isActive: Boolean (default: true)
  priority: Int (1-10, higher = executa primeiro)
  createdAt: DateTime
  updatedAt: DateTime
)
```

#### AutomationLog
```sql
CREATE TABLE "AutomationLog" (
  id: UUID (PK)
  leadId: UUID (FK Lead)
  ruleId: UUID? (FK AutomationRule)
  trigger: enum
  action: enum
  status: enum (PENDING, EXECUTED, FAILED, CANCELLED)
  result: JSON
  error: String?
  createdAt: DateTime
)
```

#### UserWorkload
```sql
CREATE TABLE "UserWorkload" (
  id: UUID (PK)
  userId: UUID (FK User, unique)
  maxCapacity: Int (capacidade máxima de leads)
  activeLeads: Int (leads em progresso)
  utilization: Float (0-100%, baseado em activeLeads/maxCapacity)
  specialties: JSON (array de categorias de especialidade)
  isAvailable: Boolean (disponível para novas atribuições?)
  updatedAt: DateTime
)
```

#### Lead (campos adicionados)
```sql
-- Existing fields...

-- New fields for Passo 10:
score: Int?                      -- Score do lead (0-100)
scoreUpdatedAt: DateTime?        -- Quando o score foi calculado
scoringFactors: JSON?            -- Detalhes da fórmula de score
autoAssignedAt: DateTime?        -- Quando foi auto-atribuído
lastActivityAt: DateTime?        -- Última atividade
daysWithoutActivity: Int?        -- Dias sem atividade
```

---

## ⚙️ Configuração

### 1. **Variáveis de Ambiente** (.env)

```bash
# Existing
DATABASE_URL=postgresql://postgres:Presanegra1.@localhost:5432/advocacia_crm
FRONTEND_URL=http://localhost:5173
JWT_SECRET=seu_jwt_secret_aqui
EMAIL_MODE=mock

# Novo - Automation (opcional)
AUTOMATION_INTERVAL_MINUTES=5        # Intervalo do scheduler
AUTOMATION_BATCH_SIZE=100            # Leads por batch no scheduler
AUTOMATION_ENABLE_AUTO_ASSIGN=true   # Ativar auto-assignment
AUTOMATION_ENABLE_SCORING=true       # Ativar scoring
```

### 2. **Inicialização do Banco**

```bash
# Migrar schema
npm run prisma:migrate

# Popular com dados de teste (cria 4 leads + 3 regras)
npm run prisma:seed
```

### 3. **Iniciar Backend**

```bash
cd backend
npm run dev

# Output esperado:
# 🚀 Server is running on port 3000
# 🕐 Sequence Scheduler iniciado (intervalo: 1min)
# ⚙️ Automation Scheduler iniciado (intervalo: 5min)
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000/api/automation
```

### A. Scoring Endpoints

#### 1. GET `/scoring/all`
Retorna distribution de scores.

**Response:**
```json
{
  "success": true,
  "data": {
    "excellent": 2,    // scores 80-100
    "good": 1,         // scores 60-79
    "medium": 1,       // scores 40-59
    "poor": 0,         // scores < 40
    "average": 73.5,
    "total": 4
  }
}
```

#### 2. GET `/scoring/:leadId`
Obtém score e detalhes de um lead.

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid-123",
    "name": "Ana Costa",
    "score": 75,
    "factors": {
      "baseScore": 10,
      "categoryScore": 20,
      "sourceScore": 15,
      "statusScore": 25,
      "documentScore": 0,
      "activityScore": 5,
      "emailScore": 0,
      "conversionScore": 0,
      "recencyScore": 0
    }
  }
}
```

#### 3. POST `/scoring/recalculate`
Recalcula todos os scores.

**Response:**
```json
{
  "success": true,
  "count": 4,
  "data": {
    "processed": 4,
    "updated": 4
  }
}
```

#### 4. GET `/scoring/high-quality?minScore=70`
Retorna leads com score > minScore (padrão: 70).

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    { "id": "uuid-1", "name": "Ana Costa", "score": 75 },
    { "id": "uuid-2", "name": "Pedro Oliveira", "score": 65 }
  ]
}
```

#### 5. GET `/scoring/low-score?maxScore=30`
Retorna leads com score < maxScore.

**Response:**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

#### 6. POST `/scoring/:leadId/boost`
Aumenta score manualmente.

**Body:**
```json
{
  "points": 10,
  "reason": "Lead muito interessado"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid-123",
    "oldScore": 65,
    "newScore": 75,
    "boostReason": "Lead muito interessado"
  }
}
```

---

### B. Assignment Endpoints

#### 1. POST `/assignment/assign`
Auto-atribui um lead.

**Body:**
```json
{
  "leadId": "uuid-123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid-123",
    "assignedTo": "João Advogado",
    "userId": "user-uuid-1",
    "reason": "Melhor match: especialidade PROCESS, 40% utilização"
  }
}
```

#### 2. POST `/assignment/assign-multiple`
Auto-atribui múltiplos leads.

**Body:**
```json
{
  "leadIds": ["uuid-1", "uuid-2", "uuid-3"]
}
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "leadId": "uuid-1", "assignedTo": "João Advogado", "success": true },
    { "leadId": "uuid-2", "assignedTo": "Maria Atendente", "success": true },
    { "leadId": "uuid-3", "success": false, "error": "Lead já atribuído" }
  ]
}
```

#### 3. POST `/assignment/rebalance`
Rebalanceia atribuições (move leads de usuários > 80%).

**Response:**
```json
{
  "success": true,
  "data": {
    "reassigned": 2,
    "details": [
      { "leadId": "uuid-1", "from": "João (85%)", "to": "Maria (45%)" },
      { "leadId": "uuid-2", "from": "João (80%)", "to": "Staff (60%)" }
    ]
  }
}
```

#### 4. GET `/workload`
Lista workload de todos os usuários.

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "userId": "user-1",
      "name": "João Advogado",
      "maxCapacity": 25,
      "activeLeads": 10,
      "utilization": 40,
      "specialties": ["PROCESS", "RETIREMENT", "BPC_LOAS"],
      "isAvailable": true
    },
    {
      "userId": "user-2",
      "name": "Maria Atendente",
      "maxCapacity": 20,
      "activeLeads": 12,
      "utilization": 60,
      "specialties": ["CONSULTATION", "BPC_LOAS"],
      "isAvailable": true
    }
  ]
}
```

#### 5. PUT `/workload/:userId/capacity`
Atualiza capacidade máxima de um usuário.

**Body:**
```json
{
  "maxCapacity": 30
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user-1",
    "newCapacity": 30,
    "currentUtilization": 33  // agora 10/30
  }
}
```

---

### C. Rules Endpoints

#### 1. POST `/rules/create`
Cria nova regra de automação.

**Body:**
```json
{
  "name": "Auto-assign high scores",
  "description": "Atribuir automaticamente leads com score > 70",
  "trigger": "LEAD_SCORE_ABOVE",
  "triggerValue": "70",
  "action": "ASSIGN_TO_USER",
  "isActive": true,
  "priority": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rule-uuid",
    "name": "Auto-assign high scores",
    "trigger": "LEAD_SCORE_ABOVE",
    "action": "ASSIGN_TO_USER",
    "createdAt": "2025-05-28T11:14:00Z"
  }
}
```

#### 2. GET `/rules?isActive=true`
Lista regras (opcionalmente filtradas).

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "rule-1",
      "name": "Auto-assign high scores",
      "trigger": "LEAD_SCORE_ABOVE",
      "action": "ASSIGN_TO_USER",
      "isActive": true,
      "priority": 10
    },
    {
      "id": "rule-2",
      "name": "Mark low scores for review",
      "trigger": "LEAD_SCORE_BELOW",
      "action": "MARK_FOR_REVIEW",
      "isActive": true,
      "priority": 5
    }
  ]
}
```

#### 3. DELETE `/rules/:ruleId`
Desativa uma regra.

**Response:**
```json
{
  "success": true,
  "data": {
    "ruleId": "rule-uuid",
    "disabled": true
  }
}
```

---

### D. Execution Endpoints

#### 1. POST `/execute`
Executa automação manualmente para um lead.

**Body:**
```json
{
  "leadId": "uuid-123",
  "trigger": "MANUAL"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "leadId": "uuid-123",
    "executedRules": 2,
    "details": [
      { "ruleId": "rule-1", "action": "ASSIGN_TO_USER", "status": "EXECUTED" },
      { "ruleId": "rule-2", "action": "SEND_EMAIL", "status": "EXECUTED" }
    ]
  }
}
```

#### 2. POST `/execute-scheduled`
Executa automação para todos os leads (normalmente chamado pelo scheduler).

**Response:**
```json
{
  "success": true,
  "data": {
    "processed": 4,
    "executed": 3,
    "failed": 0,
    "errors": []
  }
}
```

#### 3. GET `/logs?leadId=uuid&limit=10`
Obtém audit trail de automações.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "log-1",
      "leadId": "uuid-123",
      "ruleId": "rule-1",
      "trigger": "LEAD_SCORE_ABOVE",
      "action": "ASSIGN_TO_USER",
      "status": "EXECUTED",
      "result": { "assignedTo": "João Advogado" },
      "createdAt": "2025-05-28T11:14:00Z"
    }
  ]
}
```

---

## 📚 Exemplos de Uso

### Exemplo 1: Criar Lead → Score Calculado → Auto-atribuído

```bash
# 1. Criar novo lead via webhook
curl -X POST http://localhost:3000/api/webhooks/lead \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente Novo",
    "phone": "11987654321",
    "category": "RETIREMENT",
    "source": "WHATSAPP"
  }'

# Response: { leadId: "uuid-new", status: "INITIAL" }

# 2. Scheduler executa em 5 minutos (automático)
# → Score calculado: baseScore(10) + categoryScore(20) = 30 inicial
# → Se score > 70 na próxima execução, auto-atribui

# 3. Ou executar manualmente:
curl -X POST http://localhost:3000/api/automation/execute \
  -H "Content-Type: application/json" \
  -d '{"leadId": "uuid-new", "trigger": "MANUAL"}'

# Response: { assignedTo: "João Advogado", score: 30 }
```

### Exemplo 2: Verificar Score de um Lead

```bash
curl http://localhost:3000/api/automation/scoring/uuid-123

# Response:
# {
#   "leadId": "uuid-123",
#   "name": "Ana Costa",
#   "score": 75,
#   "factors": { categoryScore: 20, sourceScore: 15, ... }
# }
```

### Exemplo 3: Criar Regra de Automação

```bash
curl -X POST http://localhost:3000/api/automation/rules/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Enviar email para high-scores",
    "trigger": "LEAD_SCORE_ABOVE",
    "triggerValue": "80",
    "action": "SEND_EMAIL",
    "actionValue": "template_congratulations",
    "priority": 10
  }'
```

### Exemplo 4: Boost Manual de Score

```bash
curl -X POST http://localhost:3000/api/automation/scoring/uuid-123/boost \
  -H "Content-Type: application/json" \
  -d '{
    "points": 20,
    "reason": "Cliente mencionou urgência - quer resolver rápido"
  }'

# Response: { oldScore: 55, newScore: 75 }
```

---

## 🧪 Testes

### Testes Manuais Recomendados

#### Teste 1: Scoring Funciona
```bash
# 1. Verificar distribuição de scores
curl http://localhost:3000/api/automation/scoring/all
# Esperado: { excellent: 2, good: 1, medium: 1, poor: 0 }

# 2. Obter score de um lead
curl http://localhost:3000/api/automation/scoring/[leadId]
# Esperado: Score 0-100 com factors detalhados
```

#### Teste 2: Auto-assignment Funciona
```bash
# 1. Criar novo lead (sem responsável)
# POST /api/leads { name, phone, category, source }

# 2. Executar auto-assign
curl -X POST http://localhost:3000/api/automation/assignment/assign \
  -H "Content-Type: application/json" \
  -d '{"leadId": "[novo-leadId]"}'

# 3. Verificar se foi atribuído
curl http://localhost:3000/api/leads/[leadId]
# Esperado: { responsibleId: "user-uuid" }
```

#### Teste 3: Regras Executam
```bash
# 1. Criar regra
curl -X POST http://localhost:3000/api/automation/rules/create \
  -d '{"name": "Test rule", "trigger": "LEAD_CREATED", "action": "MARK_FOR_REVIEW"}'

# 2. Criar novo lead
curl -X POST http://localhost:3000/api/leads ...

# 3. Verificar logs
curl http://localhost:3000/api/automation/logs?leadId=[leadId]
# Esperado: Regra executada, status: "EXECUTED"
```

#### Teste 4: Scheduler Roda
```bash
# 1. Ver logs do backend (em outro terminal)
npm run dev

# 2. Aguardar 5 minutos
# Esperado no console:
# [HH:MM:SS] ⚙️ Processando automações agendadas...
# ✅ Automações processadas: 4/4 leads, 0 erros
```

---

## 🐛 Troubleshooting

### Problema 1: "Automation Scheduler iniciado" mas nada acontece

**Diagnóstico:**
- Verificar se há leads no banco: `GET /api/leads`
- Verificar se há regras ativas: `GET /api/automation/rules?isActive=true`
- Verificar logs: `GET /api/automation/logs?limit=10`

**Solução:**
```bash
# 1. Garantir dados de teste
npm run prisma:seed

# 2. Verificar regras ativas
curl http://localhost:3000/api/automation/rules?isActive=true

# 3. Executar manualmente
curl -X POST http://localhost:3000/api/automation/execute-scheduled
```

### Problema 2: Auto-assignment não funciona

**Diagnóstico:**
- Lead já tem responsável? → `lead.responsibleId` não é null
- Usuários têm workload? → `GET /api/automation/workload`
- Lead status é CLOSED/PROPOSAL? → Não atribui

**Solução:**
```bash
# 1. Verificar workload de usuários
curl http://localhost:3000/api/automation/workload

# 2. Se vazio, inicializar:
npm run prisma:seed

# 3. Criar lead sem responsável
curl -X POST http://localhost:3000/api/leads \
  -d '{"name": "Test", "phone": "11999999999", "category": "PROCESS", "source": "WHATSAPP"}'

# 4. Executar auto-assign
curl -X POST http://localhost:3000/api/automation/assignment/assign \
  -d '{"leadId": "[leadId]"}'
```

### Problema 3: TypeScript errors ao iniciar backend

**Erro típico:**
```
Error: Cannot find module './scheduler/automationScheduler.js'
```

**Solução:**
- Verificar se arquivo existe: `backend/src/scheduler/automationScheduler.ts`
- Reconstruir: `npm run build` ou reiniciar `npm run dev`

### Problema 4: Score sempre igual para todos os leads

**Diagnóstico:**
- Leads têm status/categoria diferente? Se tudo é INITIAL/PROCESS, scores serão similares
- Documentos anexados? → Campo `documents.length` afeta score

**Solução:**
```bash
# Criar leads variados
curl -X POST http://localhost:3000/api/leads -d '{ ..., "category": "BPC_LOAS", "status": "CONSULTING" }'
curl -X POST http://localhost:3000/api/leads -d '{ ..., "category": "RETIREMENT", "status": "QUALIFIED" }'

# Recalcular scores
curl -X POST http://localhost:3000/api/automation/scoring/recalculate
```

---

## 📊 Métricas e Monitoramento

### KPIs Recomendados

| Métrica | Endpoint | Frequência |
|---------|----------|-----------|
| Média de score | `GET /scoring/all` | Diário |
| Taxa de auto-assignment | `GET /automation/logs?action=ASSIGN_TO_USER` | Diário |
| Regras falhadas | `GET /automation/logs?status=FAILED` | Em tempo real |
| Workload médio | `GET /workload` | Hora a hora |
| Leads sem score | `SELECT COUNT(*) FROM leads WHERE score IS NULL` | Diário |

### Dashboard Recomendado

```
┌─────────────────────────────────────────┐
│ 📊 Automation Dashboard                 │
├─────────────────────────────────────────┤
│ Score médio:        73.5/100            │
│ Leads atribuídos:   4/4 (100%)         │
│ Regras executadas:  12 (últimas 24h)  │
│ Erros:              0                   │
│                                         │
│ Workload:                               │
│  João Advogado:     10/25 (40%) ▂▂▃    │
│  Maria Atendente:   12/20 (60%) ▂▃▄    │
└─────────────────────────────────────────┘
```

---

## 🚀 Próximas Evoluções (Passo 11+)

- [ ] Machine Learning para scoring (importância dinâmica dos fatores)
- [ ] Integração com WhatsApp para auto-responder baseado em score
- [ ] A/B testing de regras de automação
- [ ] Webhook para sistemas externos (CRM, ERP)
- [ ] Dashboard de real-time com Socket.io
- [ ] Predictions de taxa de conversão
- [ ] Email inteligente baseado em comportamento do lead

---

## 📝 Referência Rápida

### Comandos úteis:

```bash
# Backend
cd backend
npm run dev                    # Inicia com live reload
npm run prisma:migrate       # Aplica migrações
npm run prisma:seed          # Popula com dados de teste
npm run build                # Build TypeScript

# Testes
curl http://localhost:3000/api/automation/scoring/all
curl http://localhost:3000/api/automation/workload
curl http://localhost:3000/api/automation/rules

# Database
npx prisma studio           # Abre UI Prisma
npx prisma migrate diff     # Ver mudanças
```

---

**Versão:** 1.0  
**Data:** 2025-05-28  
**Status:** ✅ Production Ready
