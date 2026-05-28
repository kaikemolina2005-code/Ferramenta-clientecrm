# 📋 PRÉ-DEPLOYMENT CHECKLIST

## 🔍 Verificação de Código

- [ ] Todas as dependências instaladas e atualizado `package-lock.json`
- [ ] Sem console.log em código de produção
- [ ] Sem TODO/FIXME comentários críticos
- [ ] Sem credenciais hardcoded
- [ ] TypeScript sem erros de compilação
- [ ] ESLint passing (se aplicável)
- [ ] Testes passando
- [ ] Sem warnings de security

## 🔐 Segurança

- [ ] JWT_SECRET alterado e forte (mín 32 caracteres)
- [ ] Database password forte
- [ ] Nenhuma credencial em .git
- [ ] CORS configurado para domínio correto
- [ ] Rate limiting ativado
- [ ] SQL injection prevention confirmado
- [ ] XSS prevention em lugar
- [ ] CSRF tokens implementados

## 🗄️ Database

- [ ] Migrations executadas
- [ ] Backup strategy definida
- [ ] Connection pooling configurado
- [ ] Índices criados para queries frequentes
- [ ] Backups automatizados testados
- [ ] Recovery procedure documentada

## 🌐 Networking & DNS

- [ ] Domínio registrado
- [ ] DNS records apontando para servidor correto
- [ ] A record: seu-dominio.com -> IP
- [ ] CNAME: www.seu-dominio.com -> seu-dominio.com
- [ ] SPF record para emails
- [ ] DKIM configured (se SendGrid)
- [ ] Firewall regras configuradas

## 🔒 SSL/TLS

- [ ] Certificado obtido (Let's Encrypt ou paid)
- [ ] Certificado válido por mais de 6 meses
- [ ] Auto-renewal configurado
- [ ] HTTPS redirecionando HTTP
- [ ] Certificado em local correto
- [ ] Permissões de arquivo corretas

## 📦 Docker & Containers

- [ ] Dockerfiles otimizados
- [ ] docker-compose.yml testado
- [ ] Environment variables corretas
- [ ] Volumes persistentes configurados
- [ ] Health checks implementados
- [ ] Resource limits definidos
- [ ] Restart policies configuradas

## 📊 Configuração de Produção

- [ ] .env.production preenchido
- [ ] NODE_ENV=production
- [ ] FRONTEND_URL correto
- [ ] DATABASE_URL correto
- [ ] API keys configuradas:
  - [ ] OPENAI_API_KEY
  - [ ] SENDGRID_API_KEY
  - [ ] WHATSAPP_*
- [ ] LOG_LEVEL apropriado (info/warn)

## 🔄 CI/CD

- [ ] GitHub secrets configurados
- [ ] Deploy script testado
- [ ] GitHub Actions workflow valido
- [ ] Notificações configuradas (Slack, etc)
- [ ] Rollback procedure documentado

## 📈 Performance

- [ ] Frontend build otimizado (gzip)
- [ ] Backend usando production build
- [ ] Database queries otimizadas
- [ ] Redis/caching se necessário
- [ ] CDN configurado (opcional)
- [ ] Compression ativada no Nginx

## 📡 Integrations

- [ ] WhatsApp webhook URL registrada
- [ ] WhatsApp test message enviada
- [ ] SendGrid API key validada
- [ ] Email template teste enviada
- [ ] OpenAI API testado
- [ ] Webhooks externos testados

## 📝 Logging & Monitoring

- [ ] Logging estruturado ativo
- [ ] Logs salvando em arquivo/remote
- [ ] Error tracking (Sentry, etc) configurado
- [ ] Uptime monitoring ativo
- [ ] Performance monitoring ativo
- [ ] Alertas configurados
- [ ] Dashboard de observabilidade

## 🧪 Testing

- [ ] Health check respondendo
- [ ] Login funcional
- [ ] Lead creation working
- [ ] Kanban board respondendo
- [ ] API endpoints all working
- [ ] WebSocket connection ok
- [ ] Emails sendo enviados
- [ ] WhatsApp integration tested

## 📱 Frontend

- [ ] Build completado sem erros
- [ ] Assets serving corretamente
- [ ] SPA routing funcionando
- [ ] API calls apontando para production
- [ ] Error pages configuradas
- [ ] 404 page customizada

## 🚀 Server Preparation

- [ ] Server atualizado (apt update/upgrade)
- [ ] SSH key-based auth configurado
- [ ] Root ssh desativado
- [ ] Firewall (ufw) ativo
- [ ] Fail2ban ou similar ativo
- [ ] Swap configurado
- [ ] Timezone correto
- [ ] NTP sincronizado

## 📞 Communication

- [ ] Team notificado de deployment
- [ ] Maintenance window scheduled (se necessário)
- [ ] Rollback procedure comunicado
- [ ] Support team preparado
- [ ] Status page criada
- [ ] On-call setup completo

## 🎯 Post-Deployment

- [ ] Smoke tests executados
- [ ] Logs verificados
- [ ] Performance baseline capturado
- [ ] User notification enviada
- [ ] Monitoring ativo
- [ ] 24h post-deploy check marcado

---

## 🚨 Critical Path Items

**OBRIGATÓRIO antes de deploy:**

1. ✅ `JWT_SECRET` alterado
2. ✅ `DATABASE_URL` correto
3. ✅ SSL/TLS certificate instalado
4. ✅ Health check respondendo 200
5. ✅ Database migrations executadas
6. ✅ WhatsApp webhook registrado
7. ✅ Environment variables validados
8. ✅ Backups configurados

---

## 📌 Sign-Off

- Developer: _________________ Data: _______
- DevOps: _________________ Data: _______
- QA: _________________ Data: _______
- Manager: _________________ Data: _______

---

**Documento criado:** 28/05/2026  
**Versão:** 1.0  
**Projeto:** ADVGD CRM  
