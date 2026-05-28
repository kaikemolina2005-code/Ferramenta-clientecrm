# 🏛️ Advocacia CRM - Plataforma de Gestão para Escritórios

Plataforma CRM profissional desenvolvida especificamente para gerenciar operações de escritórios de advocacia, com foco em automação, integração e gestão inteligente de leads.

## 🎯 Principais Características

### 📊 Gestão de Leads
- Captura automática de leads via WhatsApp Business
- Categorização automática (Processo, BPC/LOAS, Aposentadoria, Consulta)
- Direcionamento inteligente para responsáveis
- Histórico completo de interações

### 📋 Kanban Inteligente
Três setores integrados:
- **Comercial**: Inicial → Consulta → Pagamento → Loss
- **Jurídico**: Inicial → Réplica → Etapas futuras
- **Administrativo**: Recurso → Perícia → Etapas futuras

### 🤖 Automação com IA
- Preenchimento automático de documentos
- Identificação de campos vazios
- Integração com OpenAI API
- Processamento de imagens e PDFs

### 📱 Integrações
- **WhatsApp Business API**: Sincronização de leads
- **OneDrive**: Armazenamento centralizado de documentos
- **OpenAI API**: Processamento inteligente de documentos

### 📊 Dashboard
- Métricas de performance
- Taxa de conversão
- CPC (Custo por Contato)
- Origem dos leads
- Conversões por responsável
- Design glassmorphism com tema azul escuro

## 🏗️ Arquitetura do Projeto

```
Ferramenta ADVGD/
├── frontend/                 # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── hooks/           # Custom hooks
│   │   ├── context/         # Context API
│   │   ├── services/        # Chamadas de API
│   │   ├── types/           # TypeScript types
│   │   └── styles/          # Estilos globais
│   └── package.json
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/     # Lógica de requisições
│   │   ├── services/        # Lógica de negócios
│   │   ├── routes/          # Definição de rotas
│   │   ├── middleware/      # Middlewares
│   │   ├── models/          # Modelos de dados
│   │   └── config/          # Configurações
│   ├── prisma/
│   │   └── schema.prisma    # Schema do banco
│   └── package.json
└── docker-compose.yml       # Orquestração de containers
```

## 🚀 Como Começar

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Docker (opcional)
- Chaves de API (OpenAI, WhatsApp Business, OneDrive)

### Instalação

1. **Clonar/Extrair projeto**
```bash
cd "Ferramenta ADVGD"
```

2. **Instalar dependências**
```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

3. **Configurar banco de dados**
```bash
# Usando Docker (recomendado)
docker-compose up -d

# Ou instalar PostgreSQL localmente
# Criar banco: advocacia_crm
```

4. **Configurar variáveis de ambiente**
```bash
# Backend
cd backend
cp .env.example .env
# Editar .env com suas credenciais
```

5. **Executar migrações**
```bash
npm run prisma:migrate
```

### Desenvolvimento

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Frontend estará disponível em: `http://localhost:5173`
Backend estará disponível em: `http://localhost:3000`

### Build para Produção

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
npm start
```

## 📝 Variáveis de Ambiente

Criar arquivo `.env` no diretório `backend/` com:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/advocacia_crm"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-..."
WHATSAPP_BUSINESS_PHONE_ID="..."
WHATSAPP_BUSINESS_ACCESS_TOKEN="..."
ONEDRIVE_CLIENT_ID="..."
ONEDRIVE_CLIENT_SECRET="..."
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

## 📦 Scripts Disponíveis

### Backend
- `npm run dev` - Desenvolvimento com hot reload
- `npm run build` - Build para produção
- `npm run prisma:migrate` - Criar migrações
- `npm run prisma:generate` - Gerar cliente Prisma
- `npm run prisma:studio` - Abrir Prisma Studio

### Frontend
- `npm run dev` - Desenvolvimento com Vite
- `npm run build` - Build otimizado
- `npm run preview` - Preview do build
- `npm run lint` - Verificar código

## 🎨 Design & Estilo

- **Framework CSS**: Tailwind CSS
- **Fonte**: Poppins
- **Tema**: Tons claros/cinza com azul escuro (#1e3a5f)
- **Efeito**: Glassmorphism (vidro fosco) nos cards
- **Cantos**: Arredondados (15px)

## 🔐 Segurança

- Autenticação JWT
- Senhas com bcrypt
- CORS habilitado
- Validação de entrada
- Tratamento de erros

## 🤝 Contribuindo

1. Crie uma branch para sua feature: `git checkout -b feature/AmazingFeature`
2. Commit suas mudanças: `git commit -m 'Add AmazingFeature'`
3. Push para a branch: `git push origin feature/AmazingFeature`
4. Abra um Pull Request

## 📄 Licença

Este projeto é propriedade privada. Todos os direitos reservados.

## 📧 Contato

Para dúvidas ou sugestões sobre o projeto, entre em contato.

---

**Desenvolvido com ❤️ para escritórios de advocacia**
