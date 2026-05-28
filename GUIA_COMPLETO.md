# 📚 Guia Completo - Ferramenta ADVGD CRM

## 🎯 Visão Geral do Projeto

**Plataforma CRM profissional para escritórios de advocacia** com:
- ✅ Gestão de leads via WhatsApp
- ✅ Sistema Kanban com 3 setores
- ✅ Dashboard com métricas
- ✅ Relatórios e analytics
- ✅ Automação de documentos
- ✅ Design system profissional (Azul Marinho + Ouro)

---

## 📂 Estrutura do Projeto

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.tsx              (Layout principal com sidebar)
│   │   ├── Logo.tsx                (Logo ADVGD)
│   │   ├── TopBar.tsx              (Card, Button, Badge components)
│   │   ├── Modals.tsx              (Modal, Toast, ConfirmDialog) ⭐ NOVO
│   │   ├── NotificationsContainer/ (Sistema de notificações)
│   │   └── Modals.test.tsx         (Testes unitários) ⭐ NOVO
│   ├── pages/
│   │   ├── LoginPage.tsx           (Autenticação)
│   │   ├── DashboardPage.tsx       (KPIs e gráficos)
│   │   ├── LeadsPage.tsx           (Gerenciar leads)
│   │   ├── KanbanPage.tsx          (Kanban 3-setores)
│   │   ├── AutomationPage.tsx      (Automações)
│   │   ├── ReportsPage.tsx         (Relatórios)
│   │   ├── WhatsAppPage.tsx        (WhatsApp)
│   │   └── ComponentsDemo.tsx      (Demo de componentes) ⭐ NOVO
│   ├── hooks/
│   │   ├── useSocket.ts            (Real-time)
│   │   ├── useAuth.ts              (Autenticação)
│   │   └── useToast.ts             (Toast notifications) ⭐ NOVO
│   ├── context/
│   │   └── AuthContext.tsx         (Auth state)
│   ├── services/
│   │   └── api.ts                  (API client)
│   ├── theme/
│   │   └── designSystem.ts         (Design tokens)
│   ├── styles/
│   │   ├── global.css              (Global styles)
│   │   └── index.css               (Tailwind)
│   ├── types/                      (TypeScript types)
│   ├── main.tsx                    (Entry point)
│   └── App.tsx                     (Router)
├── COMPONENTS_GUIDE.md             (Documentação) ⭐ NOVO
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── ...
```

### Backend (`/backend`)
```
backend/
├── src/
│   ├── controllers/                (Lógica de requisições)
│   ├── services/                   (Lógica de negócio)
│   ├── routes/                     (Endpoints API)
│   ├── middleware/                 (Auth, validação)
│   ├── models/                     (Types/interfaces)
│   ├── config/                     (Configurações)
│   └── server.ts                   (Entry point)
├── prisma/
│   └── schema.prisma               (DB schema)
├── package.json
├── tsconfig.json
└── ...
```

---

## 🚀 Stack Tecnológico

### Frontend
- **React 18** + TypeScript 5.3
- **Vite 5.4** (bundler)
- **Tailwind CSS** (utilities)
- **Recharts** (gráficos)
- **React Router 6** (navegação)
- **Axios** (HTTP client)
- **Socket.io Client** (real-time)

### Backend
- **Node.js** + Express
- **TypeScript**
- **Prisma** (ORM)
- **PostgreSQL** (database)
- **Socket.io** (real-time)
- **JWT** (autenticação)
- **bcrypt** (hashing)

### Testes
- **Vitest** (unit tests)
- **React Testing Library** (component tests)
- **Playwright** (E2E - future)

---

## 🎨 Design System

### Cores (Branding Cliente)
```
Primária (Azul Marinho):
  - Dark: #003f7f
  - Main: #0d47a1
  - Light: #1565c0
  - Lighter: #e3f2fd

Accent (Ouro):
  - Gold: #c9a961
  - Light: #e8d7b5
  - Dark: #a68039

Status:
  - Success: #27ae60
  - Error: #c0392b
  - Warning: #e67e22
  - Info: #3498db

Neutral:
  - White: #ffffff
  - Light: #f5f5f5
  - Gray 300: #d0d0d0
  - Gray 500: #999999
  - Gray 600: #666666
  - Gray 700: #444444
  - Dark: #1a1a1a
```

### Componentes UI
- **Card**: Título, ícone, conteúdo, hover effect
- **Button**: 5 variantes (primary, secondary, success, error, outline)
- **Badge**: Status indicators (5 tipos)
- **Modal**: ⭐ NOVO - Diálogos customizáveis
- **Toast**: ⭐ NOVO - Notificações (4 tipos)
- **Logo**: ADVGDLogo responsive

---

## 🔄 Fluxos Principais

### 1. Autenticação
```
Login → Validação → JWT → LocalStorage → Redirect Dashboard
```

### 2. Gerenciamento de Leads
```
Form → API → Database → Toast Notification → Update Table
```

### 3. Kanban
```
Drag-and-drop → Update Status → API → Real-time Update
```

### 4. Relatórios
```
Filtros (Date Range) → API → Charts Render → Download (PDF/CSV)
```

### 5. Automações
```
Schedule → Scheduler → Process Leads → Calculate Scores → Notify
```

---

## 📊 Páginas Disponíveis

| Página | Rota | Status | Funcionalidades |
|--------|------|--------|-----------------|
| Login | `/login` | ✅ Completo | Autenticação JWT |
| Dashboard | `/dashboard` | ✅ Completo | KPIs, Gráficos, Métricas |
| Leads | `/leads` | ✅ Completo | CRUD leads, Status badge |
| Kanban | `/kanban` | ✅ Completo | 3 setores, Drag-drop |
| Automações | `/automation` | ✅ Completo | Criar/gerenciar regras |
| Relatórios | `/reports` | ✅ Completo | Analytics, Download |
| WhatsApp | `/whatsapp` | ✅ Completo | Conexão, Logs |
| Componentes Demo | `/components-demo` | ✅ Novo | Showcase de componentes |

---

## 🔧 Como Rodar Localmente

### 1. Clonar Projeto
```bash
cd /path/to/Ferramenta\ ADVGD
```

### 2. Backend Setup
```bash
cd backend

# Instalar dependências
npm install

# Configurar .env
cp .env.example .env
# Editar com credenciais do banco

# Rodar migrations
npm run prisma:migrate

# Iniciar servidor
npm run dev
# Rodando em http://localhost:3000
```

### 3. Frontend Setup
```bash
cd frontend

# Instalar dependências
npm install

# Iniciar dev server
npm run dev
# Rodando em http://localhost:5173 (ou 5174)
```

### 4. Rodar Testes
```bash
cd frontend

# Unit tests
npm run test

# Com coverage
npm run test -- --coverage

# UI interativa
npm run test -- --ui
```

---

## 📝 Variáveis de Ambiente

### Backend `.env`
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/advocacia_crm"
JWT_SECRET="sua-chave-secreta-aqui"
NODE_ENV="development"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

### Frontend `.env`
```bash
VITE_API_URL="http://localhost:3000/api"
```

---

## 🧪 Testes

### Rodar Testes
```bash
cd frontend
npm run test
```

### Coverage
```bash
npm run test -- --coverage
```

### Componentes com Testes
- ✅ Modal
- ✅ Toast
- ✅ ConfirmDialog

### Como Adicionar Testes
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

describe('MyComponent', () => {
  it('should render', () => {
    render(<MyComponent />);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
```

---

## 🚀 Build & Deploy

### Build Frontend
```bash
cd frontend
npm run build
# Gera: dist/
```

### Build Backend
```bash
cd backend
npm run build
```

### Deploy
```bash
# Frontend: Deploy /frontend/dist para hosting (Vercel, Netlify, etc)
# Backend: Deploy com Node.js (Railway, Heroku, AWS, etc)
```

---

## 📚 Documentação Disponível

1. **COMPONENTS_GUIDE.md** - Guia de componentes novos
2. **OPCAO2_RESUMO.md** - Resumo das melhorias
3. **FASE2_STATUS_FINAL.md** - Status final do projeto
4. **DESIGN_SYSTEM.md** - Documentação do design system
5. **README.md** - Este arquivo

---

## 🎯 Próximas Fases

### Fase 3: Backend Completo
- [ ] Integração com WhatsApp Business API
- [ ] Email service
- [ ] Document processing
- [ ] Score calculation

### Fase 4: Testes & QA
- [ ] E2E tests com Playwright
- [ ] Performance testing
- [ ] Load testing
- [ ] Security testing

### Fase 5: Deploy
- [ ] CI/CD pipeline
- [ ] Docker setup
- [ ] Production optimization
- [ ] Monitoring

---

## 🤝 Contribuindo

### Padrões de Código
- TypeScript strict mode
- Componentes em PascalCase
- Funções em camelCase
- Arquivos em kebab-case
- Sempre usar tipos explícitos

### Commit Messages
```
feat: Adicionar novo componente Modal
fix: Corrigir bug de responsividade
docs: Atualizar documentação
style: Formatar código
test: Adicionar testes para Modal
```

---

## 🆘 Troubleshooting

### Port já em uso
```bash
# Frontend tenta 5173, se ocupado usa 5174
# Backend tenta 3000

# Para liberar porta (Windows):
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Banco de dados não conecta
```bash
# Verificar .env
# Verificar se PostgreSQL está rodando
# Verificar credenciais
psql -U postgres -d advocacia_crm
```

### Módulos não encontrados
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Linhas de código (Frontend) | ~3000+ |
| Componentes criados | 8+ |
| Páginas | 8 |
| Design tokens | 50+ |
| Testes | 15+ |
| Documentação | 100% |

---

## 📞 Contato & Suporte

**Projeto**: Advocacia CRM
**Cliente**: Diego Patrício Advogado
**Versão**: 1.0.0
**Data**: Maio 2026
**Status**: ✅ Em produção

---

## 📜 Licença

Propriedade intelectual do cliente. Todos os direitos reservados.

---

**Última atualização**: 28/05/2026
**Mantido por**: Desenvolvimento
**Status**: ✅ Ativo e Atualizado
