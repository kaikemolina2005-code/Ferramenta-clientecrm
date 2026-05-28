# 🚀 Configuração SendGrid em Produção - Guia Rápido

## ⚡ Passos Rápidos (5 minutos):

### 1️⃣ Criar Conta SendGrid (GRATUITA)
```
URL: https://sendgrid.com/pricing
1. Clique em "Start free"
2. Preencha:
   - Email: seu-email@gmail.com
   - Nome: ADVGD CRM
   - Senha: MínimoCom8Caracteres123!
3. Confirme email
```

### 2️⃣ Gerar API Key
```
No dashboard SendGrid:
1. Vá para: Settings → API Keys
2. Clique em "Create API Key"
3. Nome: "ADVGD CRM Production"
4. Permissões: Full Access (simplificar depois)
5. Copie a chave: SG.xxxxxxxxxxxx...
```

### 3️⃣ Atualizar .env no Backend
```bash
# Abrir: backend/.env
# Substitua a seção EMAIL:

SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASSWORD="SG.sua-api-key-completa-aqui"
EMAIL_FROM="noreply@advgd.com.br"
TEAM_EMAIL="team@advgd.com.br"
EMAIL_MODE="real"
```

### 4️⃣ Reiniciar Backend
```bash
# No terminal onde o backend está rodando:
# Pressione Ctrl+C
# Execute:
npm run dev
```

### 5️⃣ Testar Email Real
```bash
# No app ADVGD:
1. Acesse: http://localhost:5173/leads
2. Clique em "+ Novo Lead"
3. Preencha com dados reais:
   - Nome: Seu Nome
   - Email: seu-email-real@gmail.com
   - Telefone: 11999999999
4. Clique "Criar Lead"
5. **Verifique seu email** em alguns segundos!
```

---

## 📧 Exemplo de Email que você receberá:

```
DE: noreply@advgd.com.br
PARA: seu-email-real@gmail.com
ASSUNTO: ✅ Recebemos seu contato - ADVGD

CORPO:
Olá [Seu Nome]!

Obrigado por entrar em contato com ADVGD.

Seu pedido foi recebido e nossa equipe irá analisar 
sua solicitação em breve.

Link: http://localhost:5173/dashboard

Atenciosamente,
ADVGD - Plataforma de Gestão para Escritórios
```

---

## 🔑 Alternativa: Usar Mailtrap em Produção

Se preferir testar com **Mailtrap** (inbox real):

```bash
# 1. Criar conta: https://mailtrap.io
# 2. No inbox, copiar credenciais SMTP
# 3. Atualizar .env:

SMTP_HOST="smtp.mailtrap.io"
SMTP_PORT="2525"
SMTP_SECURE="false"
SMTP_USER="seu-user-mailtrap"
SMTP_PASSWORD="seu-pass-mailtrap"
EMAIL_MODE="real"

# 4. Reiniciar backend
# 5. Criar lead
# 6. Verificar em: https://mailtrap.io/inboxes
```

---

## ✅ Checklist de Teste:

- [ ] Criou conta SendGrid (ou Mailtrap)
- [ ] Gerou API Key
- [ ] Atualizou .env com credenciais reais
- [ ] Reiniciou backend (npm run dev)
- [ ] Criou novo lead via UI
- [ ] Recebeu email de confirmação
- [ ] Email contém HTML formatado corretamente
- [ ] Link do dashboard funciona
- [ ] Teste com múltiplos leads (validar que cada um recebe email)

---

## 🐛 Troubleshooting:

### ❌ Não recebi o email
```
1. Verificar se backend está rodando:
   - Terminal deve mostrar: "🚀 Server is running on port 3000"

2. Verificar logs do backend:
   - Deve exibir: "✉️ Email sent successfully: <ID>"
   - Ou: "❌ Email send error: [erro específico]"

3. Verificar .env:
   - EMAIL_MODE="real" ✓
   - SMTP_PASSWORD está correto? ✓
   - SMTP_HOST correto? ✓

4. Testar email manualmente:
   - Use: https://www.mailinator.com
   - Emails temporários para teste
```

### ❌ Erro: "Invalid credentials"
```
Solução:
- API Key do SendGrid expirou?
- Copie a chave completa (sem espaços)
- Teste via curl:
  curl --request POST \
    --url https://api.sendgrid.com/v3/mail/send \
    --header "authorization: Bearer SG.sua-key" \
    --header "Content-Type: application/json"
```

### ❌ Erro: "Authentication failed"
```
Solução:
1. Regerar API Key no SendGrid
2. Copiar chave COMPLETA (SG.xxxxx...)
3. Colar em .env sem espaços extras
4. Reiniciar backend
```

---

## 📊 Próximas Etapas Após Email Funcionar:

### ✅ Passo 7: Form Webhooks
- Receber formulários de websites
- Auto-criar leads via webhook
- Integração WhatsApp

### ✅ Passo 8: Email Sequences
- Enviar emails automáticos em cadeia
- Agendar envios para horários específicos
- Template dinâmicos por categoria de lead

### ✅ Passo 9: Analytics de Email
- Rastrear aberturas
- Rastrear cliques
- Relatórios de conversão

---

## 📞 Suporte SendGrid:

- Docs: https://docs.sendgrid.com
- API Reference: https://docs.sendgrid.com/api-reference
- Status: https://status.sendgrid.com
- Email Limit: 100 emails/dia (FREE)

---

**Data:** 28/05/2026
**Status:** 🟢 Pronto para Produção
**Tempo Estimado:** 5-10 minutos para configurar
