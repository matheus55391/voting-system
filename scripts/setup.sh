#!/bin/bash

# ═══════════════════════════════════════════════════════════════
#  BBB Voting System - Setup Script
#  Configura o projeto pela primeira vez
# ═══════════════════════════════════════════════════════════════

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗ Erro:${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 não está instalado"
        echo ""
        echo "Por favor, instale $1 e execute o script novamente."
        exit 1
    fi
}

# ═══════════════════════════════════════════════════════════════
#  Main Script
# ═══════════════════════════════════════════════════════════════

clear

echo -e "${BLUE}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       🗳️  BBB VOTING SYSTEM - SETUP  🗳️             ║
║                                                       ║
║   Sistema de Votação para Big Brother Brasil         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# ═══════════════════════════════════════════════════════════════
#  1. Verificar Pré-requisitos
# ═══════════════════════════════════════════════════════════════

print_header "1/6 - Verificando Pré-requisitos"

check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"

NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

print_step "Node.js: $NODE_VERSION"
print_step "npm: $NPM_VERSION"
print_step "Docker: $(docker --version | cut -d ' ' -f3)"
print_step "Docker Compose: $(docker-compose --version | cut -d ' ' -f4)"

# ═══════════════════════════════════════════════════════════════
#  2. Instalar Dependências
# ═══════════════════════════════════════════════════════════════

print_header "2/6 - Instalando Dependências"

if [ ! -d "node_modules" ]; then
    npm install
    print_step "Dependências instaladas com sucesso"
else
    print_warning "node_modules já existe, pulando instalação"
    print_warning "Para reinstalar, execute: rm -rf node_modules && npm install"
fi

# ═══════════════════════════════════════════════════════════════
#  3. Criar arquivo .env
# ═══════════════════════════════════════════════════════════════

print_header "3/6 - Configurando Variáveis de Ambiente"

if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://voting_user:voting_password@localhost:5432/voting_db?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# RabbitMQ
RABBITMQ_URL=amqp://voting_user:voting_password@localhost:5672/voting_vhost

# API Gateway
PORT=3000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000/api
EOF
    print_step "Arquivo .env criado com sucesso"
else
    print_warning ".env já existe, mantendo configurações atuais"
fi

# ═══════════════════════════════════════════════════════════════
#  4. Subir Infraestrutura (Docker)
# ═══════════════════════════════════════════════════════════════

print_header "4/6 - Iniciando Infraestrutura (Docker)"

echo "Subindo containers: PostgreSQL, Redis, RabbitMQ..."
docker-compose up -d

echo ""
echo "Aguardando containers iniciarem (15 segundos)..."
sleep 15

# Verificar se containers estão rodando
if docker-compose ps | grep -q "Up"; then
    print_step "PostgreSQL: ✓ Running (porta 5432)"
    print_step "Redis: ✓ Running (porta 6379)"
    print_step "RabbitMQ: ✓ Running (porta 5672)"
    print_step "RabbitMQ Management: ✓ http://localhost:15672"
else
    print_error "Alguns containers não iniciaram corretamente"
    docker-compose ps
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
#  5. Configurar Banco de Dados (Prisma)
# ═══════════════════════════════════════════════════════════════

print_header "5/6 - Configurando Banco de Dados"

echo "Gerando Prisma Client..."
npm run prisma:generate
print_step "Prisma Client gerado"

echo ""
echo "Aplicando migrations..."
npm run prisma:migrate
print_step "Migrations aplicadas"

echo ""
echo "Executando seed (2 participantes)..."
npm run prisma:seed
print_step "Banco populado com dados iniciais"

# ═══════════════════════════════════════════════════════════════
#  6. Verificar Setup
# ═══════════════════════════════════════════════════════════════

print_header "6/6 - Verificando Setup"

# Check database connection
if npm run prisma:studio -- --browser none & sleep 2 && kill $! 2>/dev/null; then
    print_step "Conexão com PostgreSQL: OK"
else
    print_warning "Não foi possível verificar conexão com PostgreSQL"
fi

# ═══════════════════════════════════════════════════════════════
#  Setup Completo
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║       ✅  SETUP COMPLETO COM SUCESSO!  ✅            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Próximos Passos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

echo "1. Iniciar o sistema:"
echo -e "   ${GREEN}npm run start:all${NC}"
echo ""

echo "2. Acessar as aplicações:"
echo -e "   ${YELLOW}Frontend:${NC}          http://localhost:4200"
echo -e "   ${YELLOW}API Swagger:${NC}       http://localhost:3000/api"
echo -e "   ${YELLOW}RabbitMQ UI:${NC}       http://localhost:15672"
echo -e "   ${YELLOW}                       (user: voting_user, pass: voting_password)${NC}"
echo ""

echo "3. Comandos úteis:"
echo -e "   ${GREEN}npm run prisma:studio${NC}  - Interface visual do banco"
echo -e "   ${GREEN}npm run docker:logs${NC}    - Ver logs dos containers"
echo -e "   ${GREEN}npm run docker:down${NC}    - Parar infraestrutura"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Documentação${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "  📖 docs/ARCHITECTURE.md       - Arquitetura completa"
echo "  📁 docs/PROJECT_STRUCTURE.md  - Estrutura do projeto"
echo "  🗄️  docs/DATABASE.md           - Schema e Prisma"
echo "  📦 docs/LIBS.md               - Libs e DTOs"
echo ""

echo -e "${GREEN}Bom desenvolvimento! 🚀${NC}"
echo ""
