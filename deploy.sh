#!/bin/bash

# ════════════════════════════════════════════════════════════
# ADVGD CRM - Production Deployment Script
# ════════════════════════════════════════════════════════════

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi
    log_success "Docker encontrado"
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose não está instalado"
        exit 1
    fi
    log_success "Docker Compose encontrado"
    
    # Check .env file
    if [ ! -f ".env.production" ]; then
        log_error ".env.production não encontrado"
        log_warning "Copie .env.example para .env.production e configure as variáveis"
        exit 1
    fi
    log_success "Arquivo .env.production encontrado"
}

# Build Docker images
build_images() {
    log_info "Building Docker images..."
    docker-compose build --no-cache
    log_success "Imagens built com sucesso"
}

# Start services
start_services() {
    log_info "Iniciando serviços..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Aguardando serviços ficarem prontos..."
    sleep 10
    
    log_success "Serviços iniciados"
}

# Run database migrations
run_migrations() {
    log_info "Executando migrations do banco..."
    docker-compose exec -T backend npm run prisma:migrate
    log_success "Migrations executadas com sucesso"
}

# Seed database (optional)
seed_database() {
    log_info "Populando banco com dados iniciais..."
    # Se tiver seed script
    # docker-compose exec -T backend npm run prisma:seed
    log_success "Banco populado (skip se não houver seed)"
}

# Health checks
health_checks() {
    log_info "Executando health checks..."
    
    # Check backend
    log_info "Verificando backend..."
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        log_success "Backend respondendo"
    else
        log_warning "Backend pode estar iniciando ainda"
    fi
    
    # Check database
    log_info "Verificando database..."
    if docker-compose exec -T postgres pg_isready -U advocacia_user > /dev/null 2>&1; then
        log_success "Database respondendo"
    else
        log_error "Database não está respondendo"
        exit 1
    fi
    
    # Check frontend
    log_info "Verificando frontend..."
    if curl -f http://localhost:5173 > /dev/null 2>&1; then
        log_success "Frontend respondendo"
    else
        log_warning "Frontend pode estar compilando"
    fi
}

# Show status
show_status() {
    log_info "Status dos containers:"
    docker-compose ps
    
    log_info "URLs de acesso:"
    echo -e "${BLUE}Frontend: http://localhost:5173${NC}"
    echo -e "${BLUE}Backend: http://localhost:3000${NC}"
    echo -e "${BLUE}API Docs: http://localhost:3000/api${NC}"
    echo -e "${BLUE}PgAdmin: http://localhost:5050${NC}"
}

# Show logs
show_logs() {
    log_info "Mostrando últimas linhas de log..."
    docker-compose logs --tail 20
}

# Cleanup
cleanup() {
    log_info "Limpando..."
    # docker-compose down (comentado para manter services rodando)
    log_success "Limpeza concluída"
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║   ADVGD CRM - Production Deployment Script            ║"
    echo "║   Versão 1.0                                          ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    # Trap errors
    trap cleanup EXIT
    
    # Execute steps
    check_prerequisites
    echo ""
    
    build_images
    echo ""
    
    start_services
    echo ""
    
    health_checks
    echo ""
    
    run_migrations
    echo ""
    
    seed_database
    echo ""
    
    show_status
    echo ""
    
    log_success "✨ Deployment concluído com sucesso!"
    log_info "Use 'docker-compose logs -f' para ver logs em tempo real"
}

# Execute main
main
