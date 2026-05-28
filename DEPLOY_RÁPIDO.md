# 🚀 Guia Rápido de Deploy

## ⚡ Deploy em 3 Passos

### 1️⃣ Build Já Foi Feito ✅
```bash
# Pasta dist/ já está gerada em:
# c:\Users\Usuario\Downloads\Ferramenta ADVGD\frontend\dist\
```

### 2️⃣ Teste Local
```bash
cd frontend
npx serve -s dist
# Acesse: http://localhost:3000
```

### 3️⃣ Deploy em Produção (escolha uma opção)

---

## 📌 Opção 1: Vercel (Recomendado - Mais Fácil)

```bash
# 1. Instale Vercel CLI
npm i -g vercel

# 2. Autentique
vercel login

# 3. Deploy
cd frontend
vercel --prod

# Pronto! Seu app está online em https://seu-projeto.vercel.app
```

**Vantagens:**
- Deploy automático em cada push
- HTTPS gratuito
- CDN global
- Sem configuração de servidor
- Banco de dados grátis (Vercel Postgres)

---

## 📌 Opção 2: Render.com (Full Stack)

```bash
# 1. Criar conta em https://render.com
# 2. Conectar repositório GitHub
# 3. Criar novo Web Service
# 4. Selecionar branch para deploy
# 5. Configurar variáveis de ambiente
# 6. Deploy automático!
```

---

## 📌 Opção 3: Docker (Seu Servidor)

### Dockerfile
```dockerfile
FROM node:20-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Deploy
```bash
# Build image
docker build -t advgd-frontend .

# Run container
docker run -p 3000:3000 advgd-frontend

# Acesse: http://localhost:3000
```

---

## 🔐 Variáveis de Ambiente

Criar arquivo `.env.production` em `frontend/`:

```env
# API Connection
VITE_API_URL=https://seu-api.com.br
VITE_WS_URL=wss://seu-api.com.br

# (opcional) Analytics
VITE_GA_ID=G-XXXXXXXXXX
```

---

## ✅ Checklist Pré-Deploy

- [ ] Testar localmente com `serve -s dist`
- [ ] Validar que API está configurada corretamente
- [ ] HTTPS habilitado em produção
- [ ] Variáveis de ambiente configuradas
- [ ] Backend está rodando
- [ ] Banco de dados acessível
- [ ] Emails funcionando (se usar)
- [ ] WhatsApp integrado (se usar)

---

## 🔍 Verificação Pós-Deploy

### Abrir DevTools (F12) e verificar:

1. **Network Tab**: Sem erros 404
2. **Console**: Sem erros vermelhos
3. **Application**: Local Storage funciona
4. **Performance**: Carrega em < 3s

### Testes Funcionais:
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Leads aparecem
- [ ] Kanban funciona
- [ ] WhatsApp conecta
- [ ] Relatórios geram

---

## 🆘 Problemas Comuns

### Erro: "Cannot reach server"
```bash
# Verificar se backend está rodando
# Verificar VITE_API_URL está correto
# Verificar CORS no backend
```

### Erro: "Missing environment variables"
```bash
# Adicionar .env.production com todas as variáveis
# Fazer novo deploy
```

### Página em branco
```bash
# Abrir DevTools console (F12)
# Procurar por erros
# Fazer build novamente: npm run build
```

---

## 📊 Monitoramento Pós-Deploy

### Adicionar Sentry (Error Tracking)
```bash
npm install @sentry/react
```

### Adicionar Google Analytics
```bash
npm install gtag
```

---

## 🎯 Próximos Passos Após Deploy

1. **Usuários**: Criar contas iniciais
2. **Dados**: Importar dados existentes
3. **Treinamento**: Treinar usuários
4. **Support**: Configurar suporte ao cliente
5. **Backup**: Configurar backups automáticos
6. **Monitoramento**: Vigiar logs e performance

---

## 📞 Suporte

### Documentação Detalhada
- Ver `DEPLOYMENT.md` para opções completas
- Ver `OPTION3_SUMMARY.md` para detalhes técnicos

### Contato
- GitHub Issues
- Email de suporte
- Chat de desenvolvedor

---

## ✨ Sucesso!

Seu ADVGD CRM está online! 🎉

---

**Build Version**: 1.0.0  
**Status**: ✅ PRONTO PARA DEPLOY  
**Última Atualização**: 2024
