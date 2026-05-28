# WhatsApp Business API Integration - Guia Completo

## 📱 Visão Geral

Sistema de integração com WhatsApp Business API para receber leads automaticamente através de mensagens de clientes. O bot de IA processa as mensagens e cria leads no CRM com categorização automática.

## 🏗️ Arquitetura

```
WhatsApp Business API
         ↓
  Webhook (POST)
         ↓
/api/whatsapp/webhook
         ↓
WhatsAppService
  ├─ processWebhook()      → Processa payload
  ├─ extractCategory()     → Categoriza mensagem
  └─ sendMessage()         → Responde cliente
         ↓
LeadService + Database
  ├─ Cria novo Lead
  ├─ Registra Activity
  └─ Envia confirmação
```

## 🔧 Configuração

### 1. Configurar Meta Business Account

1. Acesse [Meta Business Suite](https://business.facebook.com)
2. Vá para **Settings** → **Apps and assets** → **Apps**
3. Crie ou selecione uma aplicação
4. Configure **WhatsApp** como produto
5. Obtenha as credenciais necessárias:

```
WHATSAPP_BUSINESS_PHONE_ID="seu-phone-id"
WHATSAPP_BUSINESS_ACCESS_TOKEN="seu-access-token"
WHATSAPP_BUSINESS_ACCOUNT_ID="seu-account-id"
WHATSAPP_WEBHOOK_TOKEN="webhook_token_seguro_2026"
```

### 2. Configurar Webhook

1. Em `Meta Business Suite` → **WhatsApp** → **API Setup**
2. Configure o callback URL:
   ```
   https://seu-dominio.com/api/whatsapp/webhook
   ```
3. Configure o verify token (use o mesmo de `WHATSAPP_WEBHOOK_TOKEN`)
4. Selecione eventos para escutar:
   - `messages` ✅
   - `message_status` (opcional)
   - `message_template_status_update` (opcional)

### 3. Adicionar Variáveis de Ambiente

Edite `backend/.env`:

```env
# WhatsApp Business
WHATSAPP_BUSINESS_PHONE_ID="120126070123456"
WHATSAPP_BUSINESS_ACCESS_TOKEN="EAABa..."
WHATSAPP_BUSINESS_ACCOUNT_ID="102030405060708"
WHATSAPP_WEBHOOK_TOKEN="webhook_token_seguro_2026"
```

### 4. Testar Webhook

```bash
# GET - Validar webhook
curl -X GET "https://seu-dominio.com/api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=test_challenge&hub.verify_token=webhook_token_seguro_2026"

# POST - Simular mensagem
curl -X POST "https://seu-dominio.com/api/whatsapp/webhook" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "messaging_product": "whatsapp",
          "messages": [{
            "from": "5511999999999",
            "id": "wamid.123456",
            "timestamp": "1234567890",
            "type": "text",
            "text": { "body": "Olá, preciso de ajuda com meu processo judicial" }
          }],
          "contacts": [{
            "profile": { "name": "João Silva" },
            "wa_id": "5511999999999"
          }]
        }
      }]
    }]
  }'
```

## 📊 Fluxo de Recebimento de Mensagem

```
1. Cliente envia mensagem no WhatsApp
   ↓
2. WhatsApp Business API → POST /api/whatsapp/webhook
   ↓
3. validateWebhook() → Valida token
   ↓
4. receiveMessage() → Processa payload
   ↓
5. whatsappService.processWebhook()
   ├─ Extrai dados (telefone, nome, mensagem)
   └─ Detecta categoria (PROCESS, BPC_LOAS, RETIREMENT, CONSULTATION)
   ↓
6. Verifica Lead existente
   ├─ NÃO existe → Criar novo Lead
   │   ├─ Salvar no BD
   │   └─ Enviar mensagem de boas-vindas
   │
   └─ Existe → Apenas registrar activity
   ↓
7. Registrar Activity com detalhes da mensagem
   ↓
8. Responder ao WhatsApp (HTTP 200)
```

## 🎯 Categorização Automática

A mensagem é analisada para detectar a categoria:

| Categoria | Palavras-chave |
|-----------|-----------------|
| **PROCESS** | processo, ação, demanda, acompanhar, judicial |
| **BPC_LOAS** | bpc, loas, assistência |
| **RETIREMENT** | aposentad, previdenciário, inss |
| **CONSULTATION** | consult, orientação, dúvida (padrão) |

## 🔌 Endpoints da API

### GET /api/whatsapp/webhook
Validar webhook (chamado automaticamente pelo WhatsApp)

```bash
GET /api/whatsapp/webhook?hub.mode=subscribe&hub.challenge=CHALLENGE&hub.verify_token=TOKEN
```

### POST /api/whatsapp/webhook
Receber mensagens do WhatsApp

**Sem autenticação** - Chamado diretamente pelo WhatsApp

### GET /api/whatsapp/status
Obter status da conexão

```bash
curl -X GET http://localhost:3000/api/whatsapp/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Resposta
{
  "configured": true,
  "phoneNumberId": "120126070123456"
}
```

### POST /api/whatsapp/send-test
Enviar mensagem de teste

```bash
curl -X POST http://localhost:3000/api/whatsapp/send-test \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d {
    "phoneNumber": "5511999999999",
    "message": "Teste de mensagem"
  }
```

### GET /api/whatsapp/logs
Obter logs de mensagens recebidas

```bash
curl -X GET "http://localhost:3000/api/whatsapp/logs?limit=10&leadId=LEAD_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### GET /api/whatsapp/stats
Obter estatísticas de leads WhatsApp

```bash
curl -X GET http://localhost:3000/api/whatsapp/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Resposta
{
  "totalLeads": 42,
  "byStatus": [
    { "status": "INITIAL", "_count": 28 },
    { "status": "CONSULTING", "_count": 12 },
    { "status": "PAYMENT", "_count": 2 }
  ],
  "byCategory": [
    { "category": "CONSULTATION", "_count": 20 },
    { "category": "PROCESS", "_count": 15 },
    { "category": "RETIREMENT", "_count": 5 },
    { "category": "BPC_LOAS", "_count": 2 }
  ],
  "lastLeads": [...]
}
```

## 💻 Interface Frontend

Acesse em `http://localhost:5174/whatsapp` (com autenticação):

### Funcionalidades

✅ **Status de Conexão**
- Verifica se WhatsApp está configurado
- Mostra ID do número de telefone

✅ **Enviar Mensagem de Teste**
- Campo para número WhatsApp
- Campo de mensagem
- Envio e resposta em tempo real

✅ **Estatísticas**
- Total de leads recebidos
- Distribuição por status
- Distribuição por categoria
- Últimos leads criados

✅ **Logs de Mensagens**
- Últimas mensagens recebidas
- Informações do cliente
- Detalhes da mensagem
- Timestamp

## 📈 Dados Criados

Quando uma mensagem é recebida, o sistema cria:

### Lead
```typescript
{
  id: "cuid-uuid",
  whatsappId: "5511999999999",      // ID do WhatsApp
  name: "João Silva",                 // Nome do cliente
  cpf: "5511999999999",               // Temporário (será atualizado)
  phone: "5511999999999",
  category: "PROCESS",                // Detectada automaticamente
  status: "INITIAL",
  source: "WHATSAPP",
  createdAt: "2026-05-27T..."
}
```

### Activity
```typescript
{
  id: "cuid-uuid",
  userId: "admin-user-id",
  leadId: "lead-id",
  action: "whatsapp_message_received",
  details: {
    phoneNumber: "5511999999999",
    originalMessage: "Olá, preciso de ajuda",
    category: "PROCESS",
    timestamp: "1234567890"
  }
}
```

## 🧪 Teste Rápido (Sem Credenciais)

1. Acesse `http://localhost:5174/whatsapp`
2. Veja a interface carregando
3. Mostrará "Não configurado" até adicionar credenciais

## ⚠️ Limitações Atuais

- [x] Mensagens de texto
- [ ] Mensagens de mídia (imagem, vídeo, documento)
- [ ] Localização
- [ ] Contatos compartilhados
- [ ] Reações a mensagens
- [ ] Mensagens com template customizado

## 🐛 Troubleshooting

### Webhook não valida
- ✅ Verificar `WHATSAPP_WEBHOOK_TOKEN` igual em código e Meta
- ✅ URL pública e acessível
- ✅ Port forwarding se usar localhost

### Mensagens não recebidas
- ✅ Verificar `WHATSAPP_BUSINESS_ACCESS_TOKEN` válido
- ✅ Verificar `WHATSAPP_BUSINESS_PHONE_ID` correto
- ✅ Webhook deve responder com HTTP 200
- ✅ Verificar logs do backend

### Erro 403 Forbidden
- ✅ Token webhook incorreto
- ✅ CORS bloqueando requisição
- ✅ Autenticação JWT expirada (endpoints /stats, /logs, /send-test)

## 📝 Próximas Melhorias

1. **Suporte a Mídia** - Processar imagens e documentos
2. **Templates Customizados** - Respostas formatadas
3. **Fila de Mensagens** - Bull queue para confiabilidade
4. **Sincronização** - Sincronizar leads com WhatsApp
5. **Análise IA** - Claude/OpenAI para respostas automáticas
6. **Grupos** - Suporte a mensagens de grupo
7. **Broadcast** - Enviar mensagens em massa
8. **Analytics** - Dashboard de métricas

## 🔐 Segurança

- ✅ Validação de token webhook
- ✅ JWT obrigatório para endpoints autenticados
- ✅ Rate limiting (recomendado)
- ✅ HTTPS obrigatório em produção
- ✅ Secrets em variáveis de ambiente

## 📞 Suporte

Para dúvidas ou problemas:
1. Consulte logs do backend: `npm run dev`
2. Verifique `.env` configuration
3. Teste com cURL antes de integrar
4. Consulte [Documentação Meta](https://developers.facebook.com/docs/whatsapp)

