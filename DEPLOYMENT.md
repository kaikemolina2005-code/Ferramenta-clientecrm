# Guia de Deployment - ADVGD CRM

## 📋 Visão Geral
Este documento descreve como realizar o build de produção e deploy da aplicação ADVGD CRM em um ambiente de produção.

## ✅ Status Atual

### Frontend - COMPLETO ✓
- [x] Design System implementado (Navy #003f7f, Gold #c9a961)
- [x] Todas as 6 páginas estilizadas
- [x] Componentes reutilizáveis (Card, Button, Badge)
- [x] Novos componentes (Modal, Toast, ConfirmDialog)
- [x] Mobile responsiveness
- [x] Build de produção gerado em `dist/`

### Backend - PRONTO
- Aguardando compilação TypeScript
- PostgreSQL configurado
- Prisma ORM pronto
- Socket.io para real-time
- Integração WhatsApp Business API
- Automação com IA (OpenAI)

## 🚀 Processo de Build

### Frontend
```bash
cd frontend
npm install  # Se não tiver feito
npm run build
```

**Resultado:**
- Pasta `dist/` gerada com aplicação otimizada
- 3 arquivos principais:
  - `index.html` - Arquivo HTML principal
  - `assets/index-[hash].css` - Stylesheet compilado (25.28 kB, 5.01 kB gzipped)
  - `assets/index-[hash].js` - JavaScript bundle (750.63 kB, 213.85 kB gzipped)

### Backend
```bash
cd backend
npm install  # Se não tiver feito
npm run build  # Se tiver script de build
```

## 📦 Distribuição de Arquivos

### Estrutura para Produção
```
production/
├── frontend/
│   ├── dist/          # Pasta completa do frontend compilado
│   └── package.json   # Para referência de versões
└── backend/
    ├── src/           # Código TypeScript
    ├── dist/          # Código compilado (se houver)
    ├── prisma/        # Schema do banco
    ├── .env.prod      # Variáveis de ambiente
    └── package.json
```

## 🔧 Variáveis de Ambiente

### Frontend (.env.production)
```
VITE_API_URL=https://api.seu-dominio.com
VITE_WS_URL=wss://api.seu-dominio.com
```

### Backend (.env.production)
```
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=sua_chave_secreta_super_segura

# OpenAI
OPENAI_API_KEY=sk-...

# WhatsApp
WHATSAPP_TOKEN=seu_token_whatsapp
WHATSAPP_BUSINESS_ACCOUNT_ID=seu_business_account_id
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id

# Email
SMTP_HOST=smtp.seu-provedor.com
SMTP_PORT=587
SMTP_USER=seu_email
SMTP_PASSWORD=sua_senha

# Ambiente
NODE_ENV=production
PORT=3000
```

## 🌐 Opções de Deployment

### Opção 1: Vercel (Recomendado para Frontend)
```bash
# Frontend com Vercel
npm install -g vercel
cd frontend
vercel --prod
```

### Opção 2: Render ou Railway (Full Stack)
```bash
# Conectar repositório Git
# Configurar variáveis de ambiente
# Deploy automático em cada push
```

### Opção 3: VPS / Servidor Próprio
```bash
# Frontend - Serve com Node.js
npm install -g serve
cd dist
serve -s . -l 3000

# Ou com Nginx
# Copiar dist/ para /var/www/advgd-frontend
# Configurar reverse proxy
```

### Opção 4: Docker (Recomendado)
```dockerfile
# Dockerfile para Frontend
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

```bash
docker build -t advgd-frontend .
docker run -p 3000:3000 advgd-frontend
```

## 📊 Performance

### Tamanho dos Assets
- CSS: 5.01 kB (gzipped)
- JavaScript: 213.85 kB (gzipped)
- Total: ~220 kB transferência

### Recomendações
Para reduzir o tamanho do bundle:
1. Implementar code-splitting com `React.lazy()`
2. Usar dynamic imports para páginas menos usadas
3. Remover dependências não utilizadas
4. Considerar usar `React.memo` para componentes pesados

## 🔒 Checklist de Segurança

- [ ] Variáveis de ambiente em `.env.local` (não commitadas)
- [ ] JWT_SECRET é aleatória e forte
- [ ] HTTPS ativado em produção
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] SQL Injection prevenido (Prisma faz isso automaticamente)
- [ ] CSRF tokens implementados se necessário
- [ ] Senhas hasheadas com bcrypt
- [ ] Validação de entrada em todos os endpoints

## 🧪 Testes Pré-Deployment

```bash
# Frontend
npm run build  # Verificar se compila sem erros
npm run preview  # Preview de produção localmente

# Backend
npm run dev  # Testar localmente
# Executar testes unitários (quando implementados)
npm run test
```

## 📝 Logs e Monitoramento

### Frontend
- Usar Sentry ou similar para rastrear erros
- Google Analytics para rastrear uso

### Backend
- Winston ou Bunyan para logging estruturado
- PM2 para gerenciamento de processos
- Monitoramento de banco de dados
- Alertas para erros críticos

## 🆘 Troubleshooting

### Build falha
```bash
# Limpar cache e reinstalar
rm -rf node_modules dist
npm install
npm run build
```

### Erros de CORS
- Verificar VITE_API_URL
- Validar headers CORS no backend
- Usar proxy se necessário

### Performance lenta
- Verificar size do bundle
- Usar Chrome DevTools para profiling
- Implementar lazy loading

## 📞 Próximas Etapas

1. **Build Backend**: Compilar código TypeScript do backend
2. **Testes**: Executar testes unitários e e2e
3. **Staging**: Deploy em ambiente de staging
4. **Validação**: Validar todas as funcionalidades
5. **Produção**: Deploy em produção com monitoramento

## 📚 Referências

- [Vite Build Guide](https://vitejs.dev/guide/build.html)
- [Express Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Prisma Deployment](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-to-production)
- [React Performance](https://react.dev/reference/react/lazy)

---

**Última atualização**: {{DATE}}
**Versão Frontend**: 1.0.0
**Status**: Pronto para Deploy
