# 🚀 Deploy no Vercel - Passo a Passo

## ⚡ Método 1: Com GitHub (Recomendado - Deploy Automático)

### Passo 1: Preparar Repositório GitHub

```bash
# 1. Inicializar Git (se ainda não tiver)
cd "c:\Users\Usuario\Downloads\Ferramenta ADVGD"
git init

# 2. Adicionar arquivo .gitignore (se não existir)
# Criar arquivo: .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production.local" >> .gitignore

# 3. Commitar arquivos
git add .
git commit -m "Initial commit: ADVGD CRM ready for Vercel deployment"

# 4. Criar repositório no GitHub
# Abrir: https://github.com/new
# Nome: advgd-crm-frontend
# Visibilidade: Private (recomendado)

# 5. Fazer push
git remote add origin https://github.com/SEU_USUARIO/advgd-crm-frontend.git
git branch -M main
git push -u origin main
```

### Passo 2: Conectar ao Vercel

1. **Abrir Vercel**: https://vercel.com
2. **Login**: Com conta GitHub
3. **Import Project**: Clique em "Import Project"
4. **Selecionar Repositório**: advgd-crm-frontend
5. **Configurar Projeto**:
   - Framework Preset: Vite
   - Root Directory: frontend/
   - Build Command: npm run build
   - Output Directory: dist

### Passo 3: Adicionar Variáveis de Ambiente

No painel do Vercel:
1. Ir para: **Settings → Environment Variables**
2. Adicionar:
   ```
   VITE_API_URL = https://seu-backend-api.com
   VITE_WS_URL = wss://seu-backend-api.com
   ```
3. Clicar em "Save"

### Passo 4: Deploy

1. Clicar em **"Deploy"**
2. Aguardar build finalizar (~2-3 minutos)
3. Acessar URL: `https://seu-projeto.vercel.app`

**Pronto! 🎉** Seu app está online!

---

## ⚡ Método 2: CLI (Deploy Manual Rápido)

### Instalação

```bash
# 1. Instalar Vercel CLI globalmente
npm install -g vercel

# 2. Autenticar
vercel login
# Abrir navegador e autorizar

# 3. Navegar para pasta frontend
cd "c:\Users\Usuario\Downloads\Ferramenta ADVGD\frontend"

# 4. Deploy!
vercel --prod
```

### Durante o Deploy

Responder às perguntas:
```
? Set up and deploy "~/frontend"? (Y/n) → Y
? Which scope do you want to deploy to? → Seu nome/organização
? Link to existing project? (y/N) → N (primeira vez)
? What's your project's name? → advgd-crm-frontend
? In which directory is your code located? → .
? Want to override the settings? (y/N) → N
```

**Pronto! 🎉**

---

## 🔧 Pós-Deploy: Configurar Domínio

### Adicionar Domínio Personalizado

1. No painel Vercel
2. Ir para: **Settings → Domains**
3. Clique em **"Add Domain"**
4. Digite seu domínio: `advgd-crm.com.br`
5. Seguir instruções de DNS
6. Aguardar propagação (até 48h)

### Configurar HTTPS (Automático)
- Vercel já usa Let's Encrypt
- HTTPS é ativado automaticamente
- Certificado renova automaticamente

---

## 📊 Monitorar Deploy

### No Painel Vercel

1. **Deployments**: Ver histórico de deploys
2. **Analytics**: Ver performance e erros
3. **Logs**: Ver erros em tempo real
4. **Settings**: Ajustar configurações

### Ver Logs de Build

```bash
# Localmente
vercel logs --prod
```

---

## 🔄 Deploy Automático com GitHub

### Fluxo Automático

```
Você faz push no GitHub
        ↓
Vercel detecta mudança
        ↓
Vercel faz build automaticamente
        ↓
Vercel faz deploy
        ↓
App atualizado em produção
```

### Desabilitar Deploy Automático

Se quiser controlar quando deploy:
1. Settings → Git
2. "Deploy on Push" → Desativar
3. Deploy manualmente quando necessário

---

## ✅ Checklist Pré-Deploy

- [ ] Arquivo vercel.json criado
- [ ] package.json com build script correto
- [ ] .env.example com variáveis necessárias
- [ ] Código está no GitHub
- [ ] Conta Vercel criada
- [ ] API backend está online
- [ ] Domínio configurado (opcional)

---

## 🆘 Troubleshooting

### Build Falha
**Erro**: `npm ERR! code ELIFECYCLE`
```bash
# Solução: Verificar vercel.json e tsconfig.json
# Fazer build localmente primeiro
npm run build
```

### Erro: "Cannot find module"
```bash
# Solução: Reinstalar dependências
rm package-lock.json
npm install
vercel --prod
```

### Variáveis de Ambiente Não Funcionam
```bash
# Verificar se prefixo é VITE_
# Exemplo: VITE_API_URL (correto)
#         API_URL (incorreto)

# Redeployar após adicionar variáveis
vercel --prod
```

### CORS Error
```bash
# Verificar VITE_API_URL no painel Vercel
# Deve apontar para URL real do backend
# Exemplo: https://api.seu-dominio.com
```

---

## 📈 Performance Otimizado

### Vercel oferece:
- ✅ CDN Global
- ✅ Compression automática (gzip/brotli)
- ✅ Image optimization
- ✅ Edge caching
- ✅ Auto-scaling

Seu app será **super rápido** automaticamente! 🚀

---

## 💰 Preços

- **Hobby** (Free): Ótimo para começar
  - 1 projeto
  - Deploy ilimitado
  - 100 GB/mês de bandwidth
  - Bom para testes

- **Pro** ($20/mês): Para produção
  - Projetos ilimitados
  - Prioridade de suporte
  - 1 TB/mês de bandwidth
  - Recomendado para apps reais

---

## 🎯 Próximas Etapas

1. ✅ Frontend deployado no Vercel
2. ⏳ Backend deploy no Render/Railway
3. ⏳ Conectar frontend ao backend
4. ⏳ Testar todas as funcionalidades
5. ⏳ Configurar domínio personalizado
6. ⏳ Setup monitoring (Sentry)

---

## 📞 Links Úteis

- [Vercel Docs](https://vercel.com/docs)
- [Vite + Vercel Guide](https://vitejs.dev/guide/ssr.html)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/custom-domains)

---

## ✨ Resultado Final

Após seguir estes passos:

```
✅ Frontend online em: https://seu-projeto.vercel.app
✅ HTTPS habilitado automaticamente
✅ Deploy automático com cada push
✅ Performance otimizado globalmente
✅ Pronto para produção real
```

**Tempo total**: ~15 minutos (primeira vez)

---

**Status**: 🚀 PRONTO PARA VERCEL  
**Próximo**: Siga o Método 1 ou 2 acima
