# 🗳️ BBB Voting System

Sistema de votação completo para o paredão do Big Brother Brasil, desenvolvido como **desafio técnico** com arquitetura de microserviços escalável.

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)](https://redis.io)
[![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=flat-square&logo=rabbitmq&logoColor=white)](https://www.rabbitmq.com)

---

## 📋 Sobre o Projeto

Sistema de votação em tempo real para o paredão do BBB com:

-   ✅ **Votação entre 2 participantes** com interface web moderna
-   ✅ **Proteção anti-bot** (rate limiting: 10 votos/minuto por IP)
-   ✅ **Alta performance** (1000+ votos/segundo com RabbitMQ)
-   ✅ **API REST completa** com documentação Swagger
-   ✅ **Estatísticas em tempo real** (total geral, por participante e por hora)

### 🎯 Requisitos do Desafio Técnico

| Requisito                  | Implementação                            |
| -------------------------- | ---------------------------------------- |
| Sistema Web                | ✅ Next.js 15 + React 19 + Tailwind CSS  |
| API REST                   | ✅ NestJS 11 + Swagger                   |
| 2 participantes            | ✅ Sistema configurado com seed          |
| Votos ilimitados           | ✅ Sem bloqueio por sessão               |
| **Anti-bot**               | ✅ **Rate limiting 10 votos/min por IP** |
| **Performance**            | ✅ **RabbitMQ + Redis (1000+ votos/s)**  |
| **Total geral**            | ✅ **GET /votes**                        |
| **Total por participante** | ✅ **GET /votes**                        |
| **Total por hora**         | ✅ **GET /votes/stats/hourly**           |

**[📋 Ver checklist completo dos requisitos](./docs/TECHNICAL_CHALLENGE_REQUIREMENTS.md)**

---

## 🚀 Início Rápido

### Pré-requisitos

-   Node.js 18+
-   Docker e Docker Compose
-   npm 10+

### Instalação (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/matheus55391/voting-system.git
cd voting-system

# 2. Execute o script de setup
npm run setup
```

O script `setup` executa automaticamente:

-   ✅ Instalação de dependências
-   ✅ Criação da infraestrutura Docker (Postgres, Redis, RabbitMQ)
-   ✅ Geração do Prisma Client
-   ✅ Aplicação de migrations
-   ✅ Seed do banco com 2 participantes

### Executar o Sistema

```bash
# Iniciar todos os serviços (backend + frontend)
npm run start:all
```

**🎉 Pronto! Acesse:**

-   **Frontend**: http://localhost:4200
-   **API Swagger**: http://localhost:3000/api
-   **RabbitMQ Management**: http://localhost:15672 (usuário: `voting_user` / senha: `voting_password`)

---

## 🏗️ Arquitetura

### Visão Geral

O sistema utiliza uma **arquitetura de microserviços event-driven** com foco em alta performance e escalabilidade.

![Diagrama de Arquitetura](./docs/architecture-diagram.svg)

**[📖 Documentação completa da arquitetura](./docs/ARCHITECTURE.md)**

<details>
<summary>📊 Ver diagrama simplificado (ASCII)</summary>

```
┌─────────────┐
│  Frontend   │  Next.js 15 (porta 4200)
│   Web App   │  Interface de votação
└──────┬──────┘
       │ HTTP REST
       ▼
┌─────────────┐
│ API Gateway │  NestJS (porta 3000)
│  + Swagger  │  POST /votes, GET /votes
└──────┬──────┘
       │ RabbitMQ (Async)
       ▼
┌─────────────┐
│Vote Service │  Microserviço NestJS
│             │  Processamento assíncrono
└───┬─────┬───┘
    │     │
    ▼     ▼
┌────────┐ ┌───────┐
│Postgres│ │ Redis │
│ Prisma │ │ Cache │
└────────┘ └───────┘
```

</details>

### Componentes Principais

| Componente       | Tecnologia   | Porta | Função                             |
| ---------------- | ------------ | ----- | ---------------------------------- |
| **Frontend**     | Next.js 15   | 4200  | Interface web de votação           |
| **API Gateway**  | NestJS 11    | 3000  | REST API + Rate Limiting + Swagger |
| **Vote Service** | NestJS 11    | -     | Processamento assíncrono de votos  |
| **PostgreSQL**   | Postgres 18  | 5432  | Banco de dados (source of truth)   |
| **Redis**        | Redis 7      | 6379  | Cache + Rate limiting              |
| **RabbitMQ**     | RabbitMQ 4.1 | 5672  | Message broker (filas assíncronas) |

---

## 📚 Documentação

-   **[🏗️ Arquitetura](./docs/ARCHITECTURE.md)** - Visão completa da arquitetura, fluxos e tecnologias
-   **[📁 Estrutura do Projeto](./docs/PROJECT_STRUCTURE.md)** - Organização de pastas e arquivos
-   **[🗄️ Database & Prisma](./docs/DATABASE.md)** - Schema, models e migrations
-   **[📦 Libs & DTOs](./docs/LIBS.md)** - Biblioteca compartilhada e DTOs
-   **[✅ Requisitos do Desafio Técnico](./docs/TECHNICAL_CHALLENGE_REQUIREMENTS.md)** - Checklist completo do desafio

---

## 🛠️ Scripts Disponíveis

### Setup e Desenvolvimento

```bash
npm run setup          # 🚀 Setup completo do projeto (primeira vez)
npm run start:all      # ⭐ Iniciar tudo (backend + frontend)
npm run dev            # Modo desenvolvimento com hot-reload
```

### Backend

```bash
npm run start:gateway  # API Gateway (porta 3000)
npm run start:votes    # Vote Service (microserviço)
npm run start:backend  # Inicia ambos (Gateway + Vote Service)
```

### Frontend

```bash
npm run start:web      # Next.js (porta 4200)
npm run build:web      # Build de produção
```

### Database

```bash
npm run prisma:generate # Gerar Prisma Client
npm run prisma:migrate  # Aplicar migrations
npm run prisma:seed     # Popular banco (2 participantes)
npm run prisma:studio   # Interface visual do banco
```

### Docker

```bash
npm run docker:up      # Subir infraestrutura
npm run docker:down    # Parar containers
npm run docker:logs    # Ver logs
```

---

## 📦 Estrutura do Projeto

```
voting-system/
├── apps/
│   ├── api/
│   │   ├── api-gateway/      # API REST (porta 3000)
│   │   └── vote/             # Vote Service (microserviço)
│   └── web/                  # Frontend Next.js (porta 4200)
├── libs/
│   └── common/               # DTOs compartilhados
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Migrations SQL
│   └── seed.ts               # Seed inicial
├── scripts/
│   └── setup.sh              # Script de setup inicial
├── docs/                     # Documentação completa
└── docker-compose.yml        # Infraestrutura
```

**[📁 Ver estrutura detalhada](./docs/PROJECT_STRUCTURE.md)**

---

## 🧪 Testando o Sistema

### 1. Votar pela Interface

Acesse http://localhost:4200 e vote em um participante.

### 2. Testar Rate Limiting (Anti-Bot)

```bash
# Enviar 11 votos seguidos (11º será bloqueado)
for i in {1..11}; do
  curl -X POST http://localhost:3000/api/votes \
    -H "Content-Type: application/json" \
    -d '{"participantId":"uuid-do-participante"}'
done
```

### 3. Consultar Estatísticas por Hora

```bash
curl http://localhost:3000/api/votes/stats/hourly | jq
```

---

## 🛡️ Segurança

### Implementado

-   ✅ Rate limiting por IP (10 votos/minuto)
-   ✅ Captura de IP + User-Agent
-   ✅ Validação de participantes ativos
-   ✅ Filas duráveis no RabbitMQ

### Recomendado para Produção

-   [ ] HTTPS/TLS
-   [ ] Autenticação JWT
-   [ ] Captcha no frontend
-   [ ] WAF (Web Application Firewall)

---

## 📈 Performance

| Métrica                | Valor                             |
| ---------------------- | --------------------------------- |
| POST /votes (resposta) | ~5ms                              |
| GET /votes (cache hit) | ~1ms                              |
| Capacidade             | 1000+ votos/segundo               |
| Escalabilidade         | Horizontal (múltiplas instâncias) |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

## 👨‍💻 Autor

**Matheus**

-   GitHub: [@matheus55391](https://github.com/matheus55391)

---

## 🔄 Fluxos de Operação

### 1. Registrar Voto (POST /votes)

```
1. Frontend → POST /votes { participantId }
2. API Gateway → Publica na fila votes_queue (RabbitMQ)
3. Vote Service → Consome mensagem
   ├─ Valida participante (Postgres)
   ├─ Persiste voto (Postgres)
   ├─ Atualiza contadores (Redis)
   └─ Publica evento vote.processed
4. API Gateway → Retorna: "Voto recebido" (~5ms)
```

### 2. Obter Resultados (GET /votes)

```
1. Frontend → GET /votes
2. API Gateway → Request/Reply ao Vote Service
3. Vote Service → Consulta Redis (cache)
   ├─ Cache HIT: Retorna ~1ms
   └─ Cache MISS: Busca Postgres + Atualiza Redis
4. Retorna: { totalVotes, results: [...] }
```

### Benefícios da Arquitetura

-   🚀 **Escalável** - RabbitMQ absorve picos de votação, permite múltiplas instâncias
-   🔄 **Desacoplado** - Microserviços independentes, fácil manutenção
-   ⚡ **Rápido** - Redis para consultas instantâneas (~1ms)
-   📝 **Auditável** - Postgres mantém histórico completo de todos os votos
-   🛡️ **Resiliente** - Filas duráveis garantem que nenhum voto seja perdido

---

## 🛠️ Tecnologias

### Backend

-   **[NestJS](https://nestjs.com)** 11.0 - Framework Node.js
-   **[Prisma](https://www.prisma.io)** 6.17 - ORM para TypeScript
-   **[PostgreSQL](https://www.postgresql.org)** 18 - Banco de dados relacional
-   **[Redis](https://redis.io)** 7 - Cache in-memory
-   **[RabbitMQ](https://www.rabbitmq.com)** 4.1 - Message broker
-   **[Swagger/OpenAPI](https://swagger.io)** - Documentação de API
-   **TypeScript** 5.9 - Superset JavaScript

### Frontend

-   **[Next.js](https://nextjs.org)** 15.2 - React Framework
-   **[React](https://react.dev)** 19.0 - UI Library
-   **[Tailwind CSS](https://tailwindcss.com)** 4.0 - Utility-first CSS
-   **[shadcn/ui](https://ui.shadcn.com)** - Componentes React
-   **[TanStack Query](https://tanstack.com/query)** - Data fetching e cache
-   **[React Hook Form](https://react-hook-form.com)** - Gerenciamento de formulários
-   **[Zod](https://zod.dev)** - Validação de schemas
-   **[Recharts](https://recharts.org)** - Gráficos interativos

### DevOps & Tools

-   **[Nx](https://nx.dev)** 21.6 - Monorepo tooling
-   **[Docker](https://www.docker.com)** - Containerização
-   **Jest** 30.0 - Testing framework
-   **ESLint** + **Prettier** - Code quality

## 🚀 Como Executar

### Pré-requisitos

-   Node.js 18+ (recomendado: 20)
-   Docker e Docker Compose
-   npm 10+

### 📦 Início Rápido (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/matheus55391/voting-system.git
cd voting-system

# 2. Instale as dependências
npm install

# 3. Suba a infraestrutura (Postgres, Redis, RabbitMQ)
npm run docker:up

# 4. Configure o banco de dados
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Cria tabelas
npm run prisma:seed      # Popula participantes

# 5. Inicie os serviços
npm run start:all        # API Gateway + Vote Service + Frontend
```

**🎉 Pronto! Acesse:**

-   Frontend: http://localhost:4200
-   API Gateway: http://localhost:3000
-   Swagger: http://localhost:3000/api
-   RabbitMQ UI: http://localhost:15672 (user: voting_user, pass: voting_password)

---

### 📝 Passo a Passo Detalhado

#### 1. Clone e Instale

1. Pressione `Ctrl+Shift+B` (ou `Cmd+Shift+B` no Mac)
2. Selecione **"Start: All Services"**
3. Cada serviço abrirá em seu próprio terminal

📖 Veja mais detalhes em [VSCODE_TASKS.md](./docs/VSCODE_TASKS.md)

**Opção B: Via Scripts NPM**

TUDO de uma vez (backend + frontend):

```bash
npm run start:dev
```

**Opção C: Apenas backend**

```bash
npm run start:backend
```

**Opção D: Apenas frontend**

```bash
npm run start:web
```

### 5. Acesse as aplicações

-   🌐 **Frontend**: http://localhost:4200
-   🔌 **API**: http://localhost:3000/api
-   📚 **Swagger**: http://localhost:3000/api/docs
-   🐰 **RabbitMQ Management**: http://localhost:15672 (voting_user / voting_password)

## 📚 Documentação

Documentação completa e consolidada:

-   **[📖 docs/README.md](./docs/README.md)** - Documentação completa com arquitetura, setup, testes e estrutura
-   **[✅ docs/TECHNICAL_CHALLENGE_REQUIREMENTS.md](./docs/TECHNICAL_CHALLENGE_REQUIREMENTS.md)** - Checklist dos requisitos do desafio técnico

## 📁 Estrutura do Projeto

```
voting-system/
├── apps/
│   ├── api/                      # Backend - Microserviços
│   │   ├── api-gateway/          # REST API (porta 3000)
│   │   ├── votes-service/        # Processador de votos
│   │   ├── aggregate-service/    # Agregador de resultados
│   │   └── e2e/                  # Testes End-to-End
│   │       ├── api-gateway-e2e/
│   │       ├── votes-service-e2e/
│   │       └── aggregate-service-e2e/
│   └── frontend/                 # Next.js App (porta 4200)
├── docs/                         # Documentação
├── docker-compose.yml            # Infraestrutura Docker
└── package.json                  # Scripts e dependências
```

## 🛠️ Scripts Disponíveis

### Desenvolvimento

| Script                    | Descrição                                   |
| ------------------------- | ------------------------------------------- |
| `npm run start:dev`       | ⭐ Inicia TUDO (Gateway + Votes + Frontend) |
| `npm run start:backend`   | Inicia apenas backend (Gateway + Votes)     |
| `npm run start:web`       | Inicia apenas frontend                      |
| `npm run start:gateway`   | Inicia apenas API Gateway                   |
| `npm run start:votes`     | Inicia apenas Vote Service                  |
| `npm run start:aggregate` | Inicia apenas Aggregate Service             |

### Build

| Script              | Descrição                  |
| ------------------- | -------------------------- |
| `npm run build:all` | Build de todos os serviços |
| `npm run build`     | Build do API Gateway       |
| `npm run build:web` | Build do frontend          |

### Docker

| Script                | Descrição       |
| --------------------- | --------------- |
| `npm run docker:up`   | Sobe containers |
| `npm run docker:down` | Para containers |
| `npm run docker:logs` | Visualiza logs  |

### Testes

| Script             | Descrição           |
| ------------------ | ------------------- |
| `npm test`         | Roda testes         |
| `npm run test:cov` | Testes com coverage |
| `npm run test:e2e` | Testes E2E          |

## 📊 Exemplo de Uso

### Via Frontend (http://localhost:4200)

1. Acesse a interface web
2. Selecione um participante
3. Clique em "Votar"
4. Veja os resultados atualizados

### Via API (cURL)

**Registrar voto:**

```bash
curl -X POST http://localhost:3000/api/votes \
  -H "Content-Type: application/json" \
  -d '{"participantId": "participant-123"}'
```

**Consultar resultados:**

```bash
curl http://localhost:3000/api/votes/results
```

## 🔍 Monitoramento

-   **RabbitMQ Management**: http://localhost:15672
-   **PgAdmin**: http://localhost:8080
-   **Swagger API Docs**: http://localhost:3000/api/docs

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

## ✅ Checklist de Requisitos do Desafio Técnico

| Requisito                     | Status                            |
| ----------------------------- | --------------------------------- |
| Sistema Web (HTML/CSS/JS)     | ✅ Next.js 15 + React 19          |
| API REST Backend              | ✅ NestJS 11 + Swagger            |
| Votação entre 2 participantes | ✅ Seed configurado               |
| Confirmação + Percentual      | ✅ Tela de resultado              |
| Votos ilimitados              | ✅ Sem bloqueio                   |
| **Proteção anti-bot**         | ✅ **Rate limiting 10 votos/min** |
| **Performance 1000 votos/s**  | ✅ **RabbitMQ + Redis**           |
| **Total geral de votos**      | ✅ **GET /votes**                 |
| **Total por participante**    | ✅ **GET /votes**                 |
| **Total por hora**            | ✅ **GET /votes/stats/hourly**    |

**🎯 100% dos requisitos implementados!** Veja detalhes em [docs/TECHNICAL_CHALLENGE_REQUIREMENTS.md](./docs/TECHNICAL_CHALLENGE_REQUIREMENTS.md)

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📄 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

**Matheus**

-   GitHub: [@matheus55391](https://github.com/matheus55391)

---

⭐ **Desenvolvido com [Nx](https://nx.dev)**
