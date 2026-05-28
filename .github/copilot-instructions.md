<!-- copilot-instructions.md for Advocacia CRM -->

# Advocacia CRM - Instruções de Desenvolvimento

## Visão Geral do Projeto
Plataforma CRM profissional para escritórios de advocacia com:
- Gestão de leads via WhatsApp
- Sistema Kanban com 3 setores
- Automação de documentos com IA
- Integração OneDrive
- Dashboard com métricas
- Autenticação e controle de acesso

## Stack Tecnológico
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + Prisma + PostgreSQL
- **IA**: OpenAI API
- **Integrações**: WhatsApp Business API, Microsoft OneDrive API
- **Real-time**: Socket.io
- **Auth**: JWT + bcrypt

## Estrutura de Pastas

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas (Login, Dashboard, Kanban, etc)
│   ├── hooks/          # Custom React hooks
│   ├── context/        # Context API (Auth, etc)
│   ├── services/       # Chamadas de API
│   ├── types/          # TypeScript interfaces
│   └── styles/         # CSS global e Tailwind

backend/
├── src/
│   ├── controllers/    # Lógica de requisições
│   ├── services/       # Lógica de negócios (IA, APIs externas)
│   ├── routes/         # Definição de rotas
│   ├── middleware/     # Auth, validação, etc
│   ├── models/         # Tipos e interfaces
│   ├── config/         # Configurações
│   └── server.ts       # Entrada principal
├── prisma/
│   └── schema.prisma   # Schema do banco
```

## Configuração Inicial

### 1. Instalar Dependências
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Banco de Dados
```bash
# Iniciar PostgreSQL (Docker recomendado)
docker-compose up -d

# Criar e migrar banco
cd backend
npm run prisma:migrate
```

### 3. Variáveis de Ambiente
```bash
cd backend
cp .env.example .env
# Adicionar suas credenciais
```

### 4. Iniciar Desenvolvimento
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Próximas Etapas

1. **Implementar controladores de autenticação** em `backend/src/controllers/auth.ts`
2. **Implementar serviço de leads** em `backend/src/services/leadService.ts`
3. **Criar componentes Kanban** em `frontend/src/components/Kanban/`
4. **Integração em tempo real** com Socket.io
5. **Testes unitários e e2e**
6. **Deploy** em produção

## Padrões de Código

- Use TypeScript strict mode
- Nomes de componentes em PascalCase
- Nomes de funções/variáveis em camelCase
- Nomes de arquivos em kebab-case (exceto componentes)
- Sempre use tipos TypeScript explícitos
- Documente funções complexas com comentários

## Convenções de API

- RESTful endpoints
- Sempre retornar JSON
- Tratamento de erros consistente
- Autenticação via JWT em header Authorization

## Contato

Para dúvidas sobre requisitos, consulte o briefing completo no README.md.
