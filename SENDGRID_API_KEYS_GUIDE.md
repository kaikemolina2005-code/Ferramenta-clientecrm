# 🔐 SendGrid API Key Examples

## ⚠️ IMPORTANTE: Este é APENAS um exemplo educacional
```
NÃO USE as keys abaixo em produção real!
Use apenas para TESTE e DESENVOLVIMENTO!
```

---

## ✅ Como obter sua própria API Key:

### Passo 1: Criar conta SendGrid
```
1. Ir para: https://sendgrid.com/free
2. Sign up com:
   - Email: seu-email@gmail.com
   - Password: Minimo8Chars123!
3. Confirmar email
```

### Passo 2: Gerar API Key
```
1. Login em: https://app.sendgrid.com
2. Menu: Settings → API Keys
3. Clique: "Create API Key"
4. Nome: "ADVGD CRM Production"
5. Selecione: "Full Access"
6. Clique: "Create & Copy"
7. **COPIE a chave completa** (começa com SG.)
```

### Passo 3: Atualizar .env
```bash
# backend/.env

SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.sua-api-key-aqui-28-caracteres"
EMAIL_MODE="real"
```

---

## 📝 Formato da API Key SendGrid:

```
Prefixo:    SG.
Tamanho:    Aproximadamente 80-100 caracteres
Caracteres: Alfanuméricos + hífen (_)
Exemplo:    SG.4QJiOkGHqR3bKaXw_pLm9nZ-tU_v_aB-cD_eF_gH_iJ_kL_mN
```

---

## 🔄 Como Testar Sem API Real:

### Opção 1: Modo MOCK (Desenvolvimento)
```bash
# .env
EMAIL_MODE="mock"

# Resultado:
# Backend apenas faz LOG dos emails, sem enviar
# Perfeito para testes
# Sem custos!
```

### Opção 2: Mailtrap (Grátis - 100 emails/mês)
```bash
# 1. Criar conta: https://mailtrap.io
# 2. Copiar credenciais SMTP:

SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="your-user"
SMTP_PASSWORD="your-pass"
EMAIL_MODE="real"

# 3. Emails chegam em inbox de teste online
# 4. Visualizar em: https://mailtrap.io/inboxes
```

### Opção 3: Ethereal (Gratuito - Descontinuado)
```bash
# Antes você podia usar, mas SendGrid é melhor hoje
# Recomendação: Use SendGrid FREE (100 emails/dia)
```

---

## ✅ Estrutura de Email Enviado:

```
FROM: noreply@advgd.com.br (seu sender verificado)
TO: email-do-lead@gmail.com
SUBJECT: ✅ Recebemos seu contato - ADVGD
REPLY-TO: team@advgd.com.br

HEADERS:
- X-Mailer: Nodemailer (v6.9.x)
- X-SendGrid: Via SendGrid
- List-Unsubscribe: [opcional - adicionar depois]

BODY (HTML + Plain Text):
- Logo ADVGD
- Mensagem personalizada
- Link para Dashboard
- Rodapé com contato

TRACKING [OPCIONAL]:
- Open Tracking (desabilitado por padrão)
- Click Tracking (desabilitado por padrão)
```

---

## 🚀 Passos Finais:

```bash
# 1. Terminal 1 - Backend
cd backend
npm run dev

# 2. Terminal 2 - Frontend
cd frontend
npm run dev

# 3. Abrir: http://localhost:5173/leads

# 4. Criar novo lead com EMAIL REAL

# 5. Aguardar 2-5 segundos

# 6. Verificar email (ou Mailtrap/Ethereal)

# 7. Confirmar recebimento e formatação
```

---

## 🔗 Recursos Úteis:

- SendGrid Pricing: https://sendgrid.com/pricing/
- SendGrid Dashboard: https://app.sendgrid.com/
- SendGrid Docs: https://docs.sendgrid.com/
- API Reference: https://docs.sendgrid.com/api-reference/mail-send/mail-send
- Test Email: https://www.mailinator.com/

---

## ⚡ Troubleshooting Rápido:

| Erro | Causa | Solução |
|------|-------|---------|
| 535 Invalid | Credenciais erradas | Copiar API Key completa do SendGrid |
| 530 Auth required | EMAIL_MODE="real" mas sem chave | Adicionar SMTP_PASSWORD |
| Connection timeout | SMTP_HOST errado | Verificar: smtp.sendgrid.net |
| Email não chega | Remetente não verificado | Verificar EMAIL_FROM no SendGrid |
| Email na pasta SPAM | Falta DKIM/SPF | Adicionar registros DNS (SendGrid guia) |

---

## 📦 Próximos Passos:

Após email estar funcionando:

1. ✅ **Passo 7**: Form Webhooks → Auto-criar leads
2. ✅ **Passo 8**: Email Sequences → Automação de campaigns
3. ✅ **Passo 9**: Analytics → Rastrear aberturas e cliques
4. ✅ **Passo 10**: WhatsApp Integration → Mensagens automáticas

---

**Ultima atualização:** 28/05/2026 13:25 UTC
**Status:** ✅ Pronto para Usar
**Versão:** 1.0
