# 🚀 DEPLOYMENT EM PRODUÇÃO - ADVGD CRM

## 📋 Pré-Requisitos

### Infraestrutura

- [ ] Server Linux (Ubuntu 20.04+ ou semelhante)
- [ ] Docker & Docker Compose instalados
- [ ] Domínio configurado com DNS
- [ ] Certificado SSL/TLS (Let's Encrypt recomendado)
- [ ] PostgreSQL 16 (ou dentro do Docker)
- [ ] Nginx (ou outro proxy reverso)
- [ ] Git instalado no servidor

### Serviços Externos

- [ ] OpenAI API Key (para IA features)
- [ ] SendGrid API Key (para emails)
- [ ] WhatsApp Business API (configurada)
- [ ] Conta de hospedagem ou VPS

### Conhecimento Técnico

- [ ] Familiaridade com Docker
- [ ] Conhecimento básico de Linux/SSH
- [ ] Entendimento de SSL/TLS
- [ ] Git versionamento

---

## 🖥️ Opção 1: Deploy em VPS (DigitalOcean, Linode, AWS)

### 1. Preparar o Servidor

```bash
# Conectar via SSH
ssh root@seu-servidor-ip

# Atualizar sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker root

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Nginx
apt install -y nginx certbot python3-certbot-nginx

# Instalar Git
apt install -y git

# Criar diretório da aplicação
mkdir -p /app/advgd-crm
cd /app/advgd-crm
```

### 2. Clonar Repositório

```bash
# Clone o repositório
git clone https://seu-repositorio.git .

# Ou se usar SSH
git clone git@github.com:seu-usuario/advgd-crm.git .
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.production .env

# Editar variáveis
nano .env

# Valores importantes a mudar:
# - DB_PASSWORD: Senha forte
# - JWT_SECRET: Chave segura longa
# - FRONTEND_URL: seu-dominio.com
# - WHATSAPP_* : Suas credenciais
# - OPENAI_API_KEY: Sua chave
# - SENDGRID_API_KEY: Sua chave
```

### 4. Configurar SSL com Let's Encrypt

```bash
# Parar Nginx temporariamente
systemctl stop nginx

# Gerar certificado
certbot certonly --standalone -d seu-dominio.com -d www.seu-dominio.com

# Certificados ficarão em:
# /etc/letsencrypt/live/seu-dominio.com/

# Copiar para diretório do Nginx
mkdir -p /app/advgd-crm/nginx/ssl
sudo cp /etc/letsencrypt/live/seu-dominio.com/fullchain.pem /app/advgd-crm/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/seu-dominio.com/privkey.pem /app/advgd-crm/nginx/ssl/key.pem
```

### 5. Iniciar Aplicação com Docker

```bash
cd /app/advgd-crm

# Build das imagens
docker-compose build

# Iniciar serviços
docker-compose up -d

# Verificar se está rodando
docker-compose ps
# Saída esperada:
# NAME                COMMAND             STATUS
# advocacia_backend   node --loader...    Up (healthy)
# advocacia_frontend  serve -s dist       Up (healthy)
# advocacia_crm_db    postgres            Up (healthy)

# Ver logs
docker-compose logs -f backend
```

### 6. Configurar Nginx como Proxy Reverso

```bash
# Editar configuração Nginx
nano /etc/nginx/sites-available/advgd

# Adicionar:
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com www.seu-dominio.com;

    ssl_certificate /app/advgd-crm/nginx/ssl/cert.pem;
    ssl_certificate_key /app/advgd-crm/nginx/ssl/key.pem;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}

# Habilitar configuração
ln -s /etc/nginx/sites-available/advgd /etc/nginx/sites-enabled/

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx
```

### 7. Configurar Auto-Renewal de SSL

```bash
# Editar crontab
crontab -e

# Adicionar:
0 2 * * * certbot renew --quiet && systemctl reload nginx

# Ou usar systemd timer
systemctl enable certbot.timer
systemctl start certbot.timer
```

### 8. Database Backup Automático

```bash
# Criar script de backup
nano /app/advgd-crm/backup.sh

#!/bin/bash
BACKUP_DIR="/app/backups"
mkdir -p $BACKUP_DIR
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U advocacia_user advocacia_crm | gzip > $BACKUP_DIR/backup_$TIMESTAMP.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

# Fazer permissão executável
chmod +x /app/advgd-crm/backup.sh

# Adicionar ao crontab (executar diariamente às 3 AM)
crontab -e
# 0 3 * * * /app/advgd-crm/backup.sh
```

---

## 📊 Opção 2: Deploy em Heroku

### 1. Preparar Aplicação

```bash
# Instalar Heroku CLI
npm install -g heroku

# Fazer login
heroku login

# Criar app
heroku create advgd-crm

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:standard-0
```

### 2. Configurar Variáveis de Ambiente

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="sua-chave-secreta-aqui"
heroku config:set FRONTEND_URL="https://advgd-crm.herokuapp.com"
heroku config:set OPENAI_API_KEY="sua-chave-aqui"
heroku config:set SENDGRID_API_KEY="sua-chave-aqui"
heroku config:set WHATSAPP_WEBHOOK_TOKEN="seu-token-aqui"
```

### 3. Deploy

```bash
# Push para Heroku
git push heroku main

# Executar migrations
heroku run npm run prisma:migrate -a advgd-crm

# Ver logs
heroku logs --tail
```

---

## 🔍 Verificação Pós-Deploy

### Health Checks

```bash
# Verificar se backend está respondendo
curl https://seu-dominio.com/health

# Esperado:
# {"status":"ok","database":true}

# Verificar frontend
curl https://seu-dominio.com

# Esperado: HTML da aplicação React
```

### Database

```bash
# Conectar ao banco
docker-compose exec postgres psql -U advocacia_user -d advocacia_crm

# Ver tabelas
\dt

# Sair
\q
```

### Logs

```bash
# Ver logs do backend
docker-compose logs backend --tail 50

# Ver logs do Nginx
docker-compose logs nginx --tail 50

# Logs em tempo real
docker-compose logs -f
```

### Performance

```bash
# Ver uso de recursos
docker stats

# Ver tamanho dos containers
docker system df
```

---

## 🔐 Checklist de Segurança

- [ ] Mudar todas as senhas padrão
- [ ] Ativar HTTPS/SSL
- [ ] Configurar firewall
- [ ] Limitar acesso SSH
- [ ] Ativar rate limiting
- [ ] Configurar CORS corretamente
- [ ] Usar variáveis de ambiente para secrets
- [ ] Implementar logging e monitoring
- [ ] Configurar backups automáticos
- [ ] Fazer teste de penetração
- [ ] Usar secrets manager (AWS Secrets, etc)
- [ ] Ativar autenticação 2FA para admin
- [ ] Documentar procedimentos de segurança

---

## 🔄 CI/CD com GitHub Actions

### Setup Automático

1. Criar secrets no GitHub:

```
DEPLOY_HOST: seu-servidor-ip
DEPLOY_USER: seu-usuario
DEPLOY_KEY: sua-chave-ssh-privada
SLACK_WEBHOOK_URL: seu-webhook-slack (opcional)
SNYK_TOKEN: seu-token-snyk (opcional)
```

2. Push para `main` branch ativa pipeline:
   - ✅ Testes
   - ✅ Linting
   - ✅ Security scan
   - ✅ Deploy automático

---

## 📈 Monitoramento em Produção

### Alertas Recomendados

```bash
# CPU > 80%
# Memória > 85%
# Disco > 90%
# Erro rate > 1%
# Response time > 5s
# Database connection errors
```

### Ferramentas Recomendadas

- **Monitoring**: Prometheus, Grafana, New Relic
- **Logging**: ELK Stack, Sumo Logic, DataDog
- **Alertas**: PagerDuty, Opsgenie
- **APM**: New Relic, DataDog, Sentry

### Exemplo com Sentry (Error Tracking)

```bash
# Backend - adicionar Sentry
npm install @sentry/node

# Em src/server.ts:
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

---

## 🚨 Troubleshooting

### Backend não inicia

```bash
# Ver logs detalhados
docker-compose logs backend

# Verificar database
docker-compose exec postgres psql -U advocacia_user -d advocacia_crm -c "SELECT 1"

# Resetar migrations
docker-compose exec backend npm run prisma:migrate:reset
```

### Frontend em branco

```bash
# Verificar variáveis de ambiente
docker-compose exec frontend env | grep VITE

# Verificar build
docker-compose exec frontend ls -la /app/dist

# Reconstruir
docker-compose down frontend
docker-compose build frontend
docker-compose up frontend -d
```

### Erro no WhatsApp

```bash
# Validar token
curl -X GET http://localhost:3000/api/whatsapp/webhook \
  -G --data-urlencode "hub.mode=subscribe" \
  -G --data-urlencode "hub.verify_token=seu_token" \
  -G --data-urlencode "hub.challenge=test"

# Esperado: 200 com valor de challenge
```

---

## 📝 Documentação Importante

- [Docker Docs](https://docs.docker.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Nginx Docs](https://nginx.org/en/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)
- [React Production Deployment](https://react.dev/learn/production-grade-tools)

---

## 🎯 Próximos Passos Após Deploy

1. ✅ Configurar monitoring e alertas
2. ✅ Configurar backups automáticos
3. ✅ Documentar runbooks operacionais
4. ✅ Treinar equipe de suporte
5. ✅ Configurar disaster recovery
6. ✅ Implementar load balancing
7. ✅ Configurar CDN para assets estáticos
8. ✅ Monitorar performance e otimizar

---

## 📞 Suporte

Para dúvidas sobre deploy:
1. Verificar logs: `docker-compose logs`
2. Verificar health: `curl https://seu-dominio.com/health`
3. Consultar documentação do Docker
4. Verificar variáveis de ambiente

**Status:** ✅ **PRONTO PARA DEPLOY**

Data: 28/05/2026  
Versão: 1.0  
ADVGD CRM - Plataforma de Gestão para Escritórios de Advocacia
