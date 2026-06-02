# Bot Binance Grid — Documentação do Projeto

## O que é

Plataforma SaaS de bot de grid trading para Binance. Cada usuário cadastrado opera seu próprio bot de forma independente, usando sua própria conta Binance.

---

## Stack

- **Backend:** Node.js + TypeScript (ESM strict) + Express 5
- **Banco:** PostgreSQL + Prisma 6
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Criptografia:** AES-256-GCM (crypto nativo do Node)
- **Binance:** node-binance-api (WebSocket + REST)
- **Frontend:** React 18 + Vite (porta 3005)
- **Backend porta:** 3001

---

## Modelo de negócio

- SaaS com planos **FREE** e **PRO**
- Cada usuário usa sua **própria conta Binance** (chaves dele, não da plataforma)
- Pagamento: sem integração por enquanto (gerenciado manualmente via rotas admin)

### Limites por plano
| Plano | Posições abertas simultâneas |
|-------|------------------------------|
| FREE  | máx 3                        |
| PRO   | ilimitado                    |

---

## Variáveis de ambiente (`.env`)

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/bot-binance-grid?schema=public
JWT_SECRET=<segredo longo e aleatório — assina todos os tokens JWT da plataforma>
ENCRYPTION_SECRET=<segredo longo e aleatório — chave-mestra para criptografar API Keys dos usuários>
```

### O que cada variável faz

| Variável | Escopo | Função |
|----------|--------|--------|
| `JWT_SECRET` | Servidor (global) | Assina e verifica tokens JWT de todos os usuários |
| `ENCRYPTION_SECRET` | Servidor (global) | Chave-mestra AES-256-GCM para criptografar/descriptografar as API Keys da Binance de cada usuário |

**Essas variáveis NÃO são por usuário.** São segredos do servidor configurados uma vez no deploy.

### O que É por usuário

Cada usuário tem na tabela `bot_instances`:
- `binanceApiKey` — chave da Binance **criptografada** com `ENCRYPTION_SECRET`
- `binanceApiSecret` — secret da Binance **criptografado** com `ENCRYPTION_SECRET`

Fluxo: usuário informa as chaves → `encrypt(apiKey, ENCRYPTION_SECRET)` → salvo no banco → ao iniciar o bot, `decrypt(apiKey, ENCRYPTION_SECRET)` → usado na Binance.

---

## Modelos de dados (Prisma)

```
User (1) ──── (1) BotInstance (1) ──── (N) TradeOrder
```

### User
- `id`, `email`, `passwordHash`, `name`
- `plan`: `FREE` | `PRO`
- `role`: `USER` | `ADMIN`

### BotInstance
- `userId` (FK → User)
- `binanceApiKey` / `binanceApiSecret` — **criptografados**
- `testnet: boolean`
- `symbol`, `enabled`, `cycleIntervalMs`
- `buyPercentageOfBalance`, `targetNetProfit`, `grossTargetPercentage`
- `dropPercentage`, `buyReferenceMode`

### TradeOrder
- `botInstanceId` (FK → BotInstance)
- `symbol`, `buyPrice`, `quantity`, `sellPrice`
- `expectedNetProfit`, `status` (`OPEN` | `CLOSED`)
- `createdAt: BigInt`

---

## Arquitetura multi-tenant

```
BotManager (singleton)
  └── Map<userId, BotRuntime>
        ├── BotRuntime.client     — instância Binance com as chaves do usuário
        ├── BotRuntime.state      — strategyState isolado por usuário
        ├── BotRuntime.config     — config do bot por usuário
        └── BotRuntime._loop()   — ciclo de decisão independente
```

- Cada usuário tem um `BotRuntime` completamente isolado
- WebSocket de preço por instância (via `client.websockets.miniTicker`)
- Ciclo de decisão a cada `cycleIntervalMs` ms (padrão: 5000ms)

---

## Rotas da API

### Auth (públicas)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro (plano FREE por padrão) |
| POST | `/auth/login` | Login → retorna JWT |
| GET | `/auth/me` | Dados do usuário logado |

### Bot (requer JWT)
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/bot/setup` | Configura API Keys Binance + parâmetros do bot |
| GET | `/bot/status` | Status completo (config, posições, estado) |
| POST | `/bot/start` | Inicia o ciclo de trading |
| POST | `/bot/stop` | Para o ciclo |
| PATCH | `/bot/config` | Atualiza parâmetros (sem mexer nas API Keys) |
| GET | `/bot/positions` | Posições abertas e fechadas |
| GET | `/bot/summary` | Resumo financeiro (lucro, IR, taxas) |
| GET | `/bot/price` | Preço atual do symbol (só com bot ativo) |
| POST | `/bot/buy` | Compra manual |

### Admin (requer JWT + role ADMIN)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/users` | Lista todos os usuários |
| GET | `/admin/users/:id` | Detalhe de um usuário |
| PATCH | `/admin/users/:id/plan` | Promove FREE → PRO ou rebaixa |
| PATCH | `/admin/users/:id/role` | Altera USER ↔ ADMIN |
| POST | `/admin/users/:id/bot/stop` | Para o bot de um usuário forçadamente |
| GET | `/admin/stats` | Totais: usuários, planos, ordens |

---

## Comandos

```bash
# Desenvolvimento (backend + frontend juntos)
npm run dev:all

# Só backend
npm run dev

# Só frontend
cd src/ui/react && npm run dev

# Criar primeiro admin
npm run admin:create <email> <senha> [nome]

# Migrations
npx prisma migrate dev
npx prisma generate
```

## SSL local (problema de certificado no Windows)
```bash
# Para instalar pacotes npm
npm install <pacote> --strict-ssl=false

# Para prisma generate/migrate
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"; npx prisma generate
```

---

## Estratégia de trading (grid)

1. Bot inicia WebSocket e aguarda primeiro preço
2. A cada `cycleIntervalMs`:
   - Se `precoAtual >= nextSellPrice` → vende a posição mais antiga (FIFO)
   - Se `precoAtual <= nextBuyPrice` → compra usando `buyPercentageOfBalance` do saldo livre
3. `nextBuyPrice` = preço atual × (1 - `dropPercentage`)
4. `nextSellPrice` = preço de compra / (1 - `grossTargetPercentage`)
5. Se preço subiu >1% sem compra, recalibra `nextBuyPrice`

---

## Cálculo financeiro

- Taxa Binance: 0,1% por operação (compra + venda)
- IR: 15% sobre lucro bruto por operação
- `lucroLiquido = vendasValor - comprasValor - taxas - IR`
