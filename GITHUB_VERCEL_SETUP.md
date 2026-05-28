# 🔗 GitHub + Vercel - Guia Completo de Setup

## 📌 O Que Vamos Fazer

```
Git: Versionamento
    ↓
GitHub: Repositório Online
    ↓
Vercel: Deploy Automático
    ↓
App Online com Deploy Automático em cada Push!
```

---

## 📝 Passo 1: Configurar Git Localmente

### 1.1 Verificar Git Instalado
```bash
git --version
```

Se não tiver instalado, baixar em: https://git-scm.com/download

### 1.2 Configurar Usuário Git (primeira vez)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

### 1.3 Inicializar Repositório
```bash
cd "c:\Users\Usuario\Downloads\Ferramenta ADVGD"
git init
git add .
git commit -m "Initial commit: ADVGD CRM - Production Ready"
```

**Resultado**: Git inicializado localmente ✅

---

## 🐙 Passo 2: Criar Repositório no GitHub

### 2.1 Criar Conta GitHub (se não tiver)
- Ir para: https://github.com/signup
- Email, senha, username
- Verificar email

### 2.2 Criar Novo Repositório
1. Fazer login em https://github.com
2. Clique em: **+ (canto superior) → New repository**
3. Preencher:
   - **Repository name**: `advgd-crm-frontend`
   - **Description**: ADVGD CRM - Advocacia Platform Frontend
   - **Visibility**: `Private` (recomendado) ou `Public`
   - **Initialize with**: Deixar vazio (vamos fazer push local)
4. Clique em: **Create repository**

**Resultado**: Repositório criado no GitHub ✅

### 2.3 Copiar URL do Repositório
Na página do repositório, clique em **Code** (verde)
Copiar URL HTTPS:
```
https://github.com/SEU_USUARIO/advgd-crm-frontend.git
```

---

## 🚀 Passo 3: Fazer Push para GitHub

### 3.1 Adicionar Remote
```bash
cd "c:\Users\Usuario\Downloads\Ferramenta ADVGD"
git remote add origin https://github.com/SEU_USUARIO/advgd-crm-frontend.git
git branch -M main
```

### 3.2 Fazer Push Inicial
```bash
git push -u origin main
```

**Ao ser perguntado por credentials:**
- GitHub mudou para PAT (Personal Access Token)
- Ir para: https://github.com/settings/tokens
- Gerar novo token (escopo: repo, workflow)
- Colar como senha

**Resultado**: Código está no GitHub! ✅

---

## 🔗 Passo 4: Conectar Vercel com GitHub

### 4.1 Abrir Vercel
- Ir para: https://vercel.com

### 4.2 Login/Signup com GitHub
- Clique em: **Continue with GitHub**
- Autorizar Vercel a acessar GitHub

### 4.3 Importar Projeto
1. Clique em: **Add New... → Project**
2. Selecione repositório: `advgd-crm-frontend`
3. Clique em: **Import**

### 4.4 Configurar Projeto
```
Framework Preset: Vite
Root Directory: frontend/
Build Command: npm run build
Output Directory: dist
```

Deixar como está (Vercel detecta automaticamente)

### 4.5 Adicionar Environment Variables
Clicar em: **Environment Variables**

Adicionar:
```
Name: VITE_API_URL
Value: http://localhost:3000
Environment: Production, Preview, Development
```

```
Name: VITE_WS_URL
Value: ws://localhost:3000
Environment: Production, Preview, Development
```

Clique em: **Add**

**Resultado**: Vercel conectado ao GitHub! ✅

---

## ✅ Passo 5: Deploy!

### 5.1 Fazer Deploy Inicial
1. No painel Vercel, clique em: **Deploy**
2. Aguardar build finalizar (2-3 minutos)
3. Clique na URL gerada

**Resultado**: App online! 🎉

### 5.2 Verificar Deploy
- Abra DevTools (F12)
- Console: Sem erros vermelhos
- Network: Sem 404s
- App funciona normalmente

---

## 🔄 Passo 6: Deploy Automático em Cada Push

### Como Funciona

```
1. Você faz mudança no código
    ↓
2. git add . && git commit -m "mudança"
    ↓
3. git push origin main
    ↓
4. GitHub recebe o push
    ↓
5. Vercel é notificado automaticamente
    ↓
6. Vercel faz build
    ↓
7. Vercel faz deploy
    ↓
8. App atualizado em produção! 🚀
```

### Fazer Teste

```bash
# 1. Fazer mudança simples
# Por exemplo, editar um título

# 2. Commitar
git add .
git commit -m "Updated title for testing"

# 3. Push
git push origin main

# 4. Ir para Vercel e ver deploy automático happening
# Vercel → Deployments → ver novo deploy sendo processado

# 5. Aguardar finalizar (1-2 minutos)

# 6. Refresh no navegador - mudança está lá! ✅
```

---

## 📊 Painel Vercel

### Guia de Navegação

**Deployments**
- Ver todos os deploys realizados
- Status de cada um (Building, Ready, Failed)
- Clique para ver logs detalhados

**Analytics**
- Performance do app
- Erros detectados
- Real User Monitoring

**Settings**
- Configurações do projeto
- Variáveis de ambiente
- Custom domains
- Build settings

**Git**
- Conectar/desconectar GitHub
- Branch settings
- Auto-deploy configurações

---

## 🎯 Workflow Completo

### Dia a Dia de Desenvolvimento

```bash
# 1. Trabalhar no código localmente
# Editar, testar com npm run dev

# 2. Quando pronto, fazer commit
git add .
git commit -m "Feature: Added new component"

# 3. Push para GitHub
git push origin main

# 4. Vercel detecta automaticamente
# Build inicia automaticamente
# Deploy automático

# 5. Pronto! Mudança está em produção 🚀
```

---

## 🌍 Adicionar Domínio Personalizado

### No Painel Vercel

1. Ir para: **Settings → Domains**
2. Clique em: **Add Domain**
3. Digite: `seu-dominio.com.br`
4. Escolha opção:
   - **Add it to a project**: Selecionar seu projeto
5. Seguir instruções de DNS
6. Apontar nameservers para Vercel (ou adicionar registros CNAME)

### Resultado
- App em: `https://seu-dominio.com.br`
- HTTPS automático com Let's Encrypt
- Certificado renova sozinho

---

## 🔐 Segurança & Boas Práticas

### ✅ Fazer
- Usar variáveis de ambiente
- Commits frequentes
- Pull requests para features grandes
- Testar localmente antes de push
- Usar branch `main` como produção

### ❌ Não Fazer
- Commitar .env com secrets
- Fazer push direto em main (sem teste)
- Deixar tokens em comentários
- Versionar node_modules
- Commitar dist/ (gerado automaticamente)

---

## 📋 Checklist Completo

- [ ] Git instalado
- [ ] Repositório GitHub criado
- [ ] Código fez push para GitHub
- [ ] Conta Vercel criada
- [ ] Repositório importado no Vercel
- [ ] Environment variables adicionadas
- [ ] Deploy inicial finalizado
- [ ] App acessível em vercel.app
- [ ] Deploy automático testado
- [ ] Domínio personalizado (opcional)

---

## 🆘 Troubleshooting

### Erro: "Permission denied (publickey)"
```bash
# Gerar SSH key
ssh-keygen -t ed25519 -C "seu.email@gmail.com"
# Adicionar em: GitHub Settings → SSH Keys
# Usar URL SSH ao invés de HTTPS
```

### Erro: "fatal: remote origin already exists"
```bash
# Remover remote anterior
git remote remove origin
# Adicionar novamente
git remote add origin URL_DO_REPO
```

### Build falha no Vercel
```bash
# Verificar logs
# Ir para: Vercel → Deployments → Build Logs
# Geralmente é .env ou dependência faltando
```

### Deploy não atualiza
```bash
# Forçar rebuild
# Ir para: Vercel → Deployments → Redeploy
```

---

## 🎓 Próximos Passos

1. ✅ Frontend deployado (GitHub + Vercel)
2. ⏳ Backend deploy no Render/Railway
3. ⏳ Conectar frontend ao backend
4. ⏳ Testes em staging
5. ⏳ Produção com domínio personalizado

---

## 📞 Links Úteis

- [GitHub Docs](https://docs.github.com)
- [Vercel Docs](https://vercel.com/docs)
- [Git Tutorial](https://git-scm.com/book/en/v2)
- [GitHub Desktop](https://desktop.github.com/) (GUI para Git)

---

## ✨ Resumo Final

**GitHub**: Versionamento e backup do código  
**Vercel**: Deploy automático e hosting  
**Resultado**: App profissional, online e atualizado automaticamente 🚀

---

**Status**: 🚀 PRONTO PARA COMEÇAR!  
**Tempo**: ~30 minutos (setup inicial)  
**Deploy**: ~5 minutos por release
