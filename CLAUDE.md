# Bot Binance Grid - Fonte da Verdade

Documento de referência do projeto. Se houver divergência entre este arquivo e outros textos antigos, vale o comportamento do código atual.

## O que é

Plataforma SaaS de bot de grid trading para Binance. Cada usuário cadastrado opera uma instância própria do bot, usando as suas próprias chaves da Binance.

## Stack atual

- Backend: Node.js + TypeScript em ESM
- API: Express 5
- Banco: PostgreSQL com Prisma 6
- Autenticação: JWT (`jsonwebtoken`) e `bcryptjs`
- Criptografia: AES-256-GCM com `crypto` nativo do Node
- Integração com Binance: `node-binance-api`
- Frontend: React 18 + Vite em `src/ui/react`

## Portas e execução local

- Backend: `3001`
- Frontend em desenvolvimento: `3005`
- Healthcheck: `GET /healthz`

O backend também serve arquivos estáticos de `src/ui` quando existe build pronto.

## Modelo de negócio

- Produto SaaS com planos `FREE` e `PRO`
- Cada usuário usa sua própria conta Binance
- Não existe integração automática de cobrança neste momento
- A administração de planos e acesso é feita por rotas administrativas

### Limite de posições abertas por plano

- `FREE`: no máximo 3 posições abertas ao mesmo tempo
- `PRO`: sem limite aplicado pelo sistema

## Variáveis de ambiente

Arquivo base: `.env.example`

```env
DATABASE_URL=postgresql://usuario:senha@host:5432/banco?schema=public
JWT_SECRET=segredo-longo-e-aleatorio
ENCRYPTION_SECRET=outro-segredo-longo-e-aleatorio
CORS_ORIGIN=https://seu-app.vercel.app
PORT=3001
```

### Papel de cada variável

- `DATABASE_URL`: conexão com o PostgreSQL
- `JWT_SECRET`: assina e valida todos os JWTs
- `ENCRYPTION_SECRET`: chave mestra para criptografar as credenciais Binance
- `CORS_ORIGIN`: lista de origens permitidas, separadas por vírgula
- `PORT`: porta da API

### Observações importantes

- `JWT_SECRET` e `ENCRYPTION_SECRET` são segredos do servidor, não por usuário
- As chaves da Binance são sempre armazenadas criptografadas no banco
- O fallback interno do código existe para desenvolvimento, mas não deve ser usado em produção

## Modelo de dados

### `User`

- `id`
- `email`
- `passwordHash`
- `name`
- `plan`: `FREE` | `PRO`
- `role`: `USER` | `ADMIN`
- `createdAt`
- `updatedAt`

### `BotInstance`

- `id`
- `userId` único
- `binanceApiKey` criptografada
- `binanceApiSecret` criptografada
- `testnet`
- `symbol`
- `enabled`
- `cycleIntervalMs`
- `buyPercentageOfBalance`
- `targetNetProfit`
- `grossTargetPercentage`
- `dropPercentage`
- `buyReferenceMode`
- `createdAt`
- `updatedAt`

### `TradeOrder`

- `id`
- `botInstanceId`
- `symbol`
- `buyPrice`
- `quantity`
- `sellPrice`
- `expectedNetProfit`
- `status`: `OPEN` | `CLOSED`
- `createdAt` em `BigInt`

## Relação entre entidades

```text
User 1 ── 1 BotInstance 1 ── N TradeOrder
```

Cada usuário possui no máximo uma instância de bot. A instância guarda a configuração e as credenciais criptografadas. As ordens de trade ficam vinculadas a essa instância.

## Autenticação e autorização

- Login e cadastro retornam JWT com validade de `7d`
- O middleware de autenticação exige `Authorization: Bearer <token>`
- O middleware de admin exige `role = ADMIN`

### Payload do JWT

- `userId`
- `email`
- `plan`
- `role`

## Rotas da API

### Públicas

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` com JWT

### Bot, com JWT

- `POST /bot/setup`
- `GET /bot/status`
- `POST /bot/start`
- `POST /bot/stop`
- `PATCH /bot/config`
- `GET /bot/positions`
- `GET /bot/summary`
- `GET /bot/balance`
- `GET /bot/price`
- `POST /bot/buy`

### Admin, com JWT e role `ADMIN`

- `GET /admin/users`
- `GET /admin/users/:id`
- `PATCH /admin/users/:id/plan`
- `PATCH /admin/users/:id/role`
- `POST /admin/users/:id/bot/stop`
- `GET /admin/stats`

## Fluxo de autenticação

### Cadastro

1. Valida `email`, `password` e `name`
2. Exige senha com no mínimo 8 caracteres
3. Bloqueia e-mail já cadastrado
4. Cria o usuário com `plan = FREE` e `role = USER`
5. Gera JWT e retorna o usuário público

### Login

1. Busca usuário por e-mail
2. Valida a senha com `bcrypt`
3. Gera JWT e retorna o usuário público

### `/auth/me`

Retorna o usuário logado e um resumo da `botInstance`, se existir.

## Configuração do bot

### `POST /bot/setup`

- Cria ou atualiza a `BotInstance` do usuário
- Exige `binanceApiKey` e `binanceApiSecret`
- Criptografa as credenciais com `ENCRYPTION_SECRET`
- Salva os parâmetros de operação
- Remove a instância em memória para forçar recarga do runtime com a nova configuração

### `PATCH /bot/config`

- Atualiza apenas campos permitidos de configuração
- Não altera as chaves da Binance
- Se o runtime estiver em memória, atualiza também a configuração ativa

## Ciclo do bot

### Como o runtime funciona

Cada usuário tem um `BotRuntime` isolado com:

- cliente Binance próprio
- estado próprio
- configuração própria
- loop de decisão independente

### Inicialização

Quando o bot é carregado:

1. As chaves são descriptografadas
2. O cliente Binance é criado
3. O preço é assinado por WebSocket
4. O estado é reconstruído a partir do banco
5. Posições pendentes que já atingiram o preço de venda podem ser liquidadas no restart

### WebSocket de preço

- O bot usa stream de preço por símbolo
- Se o preço parar de atualizar por mais de 15 segundos, o WebSocket é reconectado
- Se o runtime estiver parado e for reativado, o preço volta a ser assinado

### Loop principal

O ciclo executa a cada `cycleIntervalMs` milissegundos:

1. Calibra o próximo preço de compra quando não há posição aberta
2. Tenta vender primeiro
3. Se não vendeu, tenta comprar

## Estratégia de trading

### Venda

O bot vende quando:

- existe uma posição aberta
- `precoAtual >= nextSellPrice`

Depois da venda:

- a posição é marcada como `CLOSED`
- o estado é recalculado
- o saldo em memória é ajustado

### Compra

O bot compra quando:

- não há venda pendente
- `precoAtual` está abaixo do `nextBuyPrice`

Regras da compra:

- usa `buyPercentageOfBalance` do saldo livre em USDT
- ajusta a quantidade aos filtros da Binance
- valida `minQty` e `minNotional`
- faz `marketBuy`
- cria a posição com preço de venda calculado por `grossTargetPercentage`

### Recalibração de compra

Se não houver posição aberta e o mercado tiver se afastado mais de 1% do `nextBuyPrice`, o bot recalibra o preço de compra para não ficar preso a um nível antigo.

## Fórmulas principais

- Preço de venda bruto:

```text
sellPrice = currentPrice / (1 - grossTargetPercentage)
```

- Próximo preço de compra:

```text
nextBuyPrice = currentPrice * (1 - dropPercentage)
```

- Lucro líquido estimado:

```text
lucroLiquido = vendasValor - comprasValor - taxas - IR
```

## Cálculo financeiro

- Taxa Binance considerada: `0,1%` por operação
- IR considerado: `15%` sobre lucro bruto positivo
- Os relatórios de resumo calculam:
  - compras
  - vendas
  - lucro líquido
  - taxas totais
  - IR total

## Posições

- `addPosition` respeita o limite do plano
- `closePosition` marca a ordem como fechada
- `getOpenPositions` retorna abertas ordenadas por `buyPrice` desc
- `getClosedPositions` retorna fechadas por `createdAt` asc
- `getUltimaPositionOpen` pega a última posição aberta da lista aberta

## Compra manual

`POST /bot/buy`:

1. Exige bot ativo e preço disponível
2. Recebe `symbol` e `qtd`
3. Valida os filtros da Binance
4. Verifica saldo livre em USDT
5. Executa `marketBuy`
6. Registra a posição com preço de venda calculado

## Tratamento de falhas do ciclo

Esta parte foi implementada para evitar que o bot pare por motivos que podem ser tratados localmente e para manter o comportamento seguro em produção.

### O que foi implementado

- `src/bot/trade-safety.ts`
  - `classifyBuyPrecheck(freeBalance, validation)` identifica antes da ordem se a compra deve ser ignorada.
  - `isRetryableExecutionError(error)` classifica erros transitórios de execução.
  - `retryOperation(operation, options)` executa novamente operações que falharam por erro temporário.
- `src/bot/bot-cycle.ts`
  - compra com saldo insuficiente passa a ser apenas ignorada com log de aviso, sem parar o bot.
  - ordem inválida pelos filtros da Binance passa a ser ignorada com log de aviso.
  - `marketBuy` e `marketSell` agora usam retry com backoff simples para falhas transitórias.
  - se a compra for executada com sucesso, mas a persistência da posição falhar, o bot para para evitar inconsistência entre mercado e banco.
  - o ciclo continua broadcastando estado após execuções bem-sucedidas ou ciclos sem ação.

### Regras aplicadas

- saldo insuficiente: não executa compra e não derruba o bot.
- validação de ordem inválida: não executa compra e não derruba o bot.
- erro transitório de rede/execução: tenta novamente antes de falhar.
- falha ao registrar no banco após compra executada: interrompe o bot para evitar divergência entre saldo, posições e histórico.

### O que foi testado

- `src/__tests__/trade-safety.test.ts`
  - saldo insuficiente retorna `INSUFFICIENT_BALANCE`
  - validação inválida retorna `INVALID_ORDER`
  - erros temporários são reconhecidos como retryable
  - operação com falha transitória é reexecutada com sucesso
  - erros não retryable não são reexecutados
- `src/__tests__/bot-cycle.test.ts`
  - o ciclo principal continua passando com as novas regras de segurança
- Validação local executada
  - `npm run build`
  - `node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand`
  - a suite completa ficou verde com 8 suites e 48 testes

## Administração

### Funções disponíveis

- listar usuários
- ver detalhes de um usuário
- promover ou rebaixar plano
- alterar role entre `USER` e `ADMIN`
- parar bot de um usuário forçadamente
- ver estatísticas gerais

### Efeito das ações admin

- Alterar plano atualiza também o runtime em memória, se ele existir
- Parar bot força `enabled = false` no banco

## Comandos úteis

```bash
npm run dev:all
npm run dev
cd src/ui/react && npm run dev
npm run build
npm run test
npm run admin:create <email> <senha> [nome]
npx prisma migrate dev
npx prisma generate
```

## Deploy

- `npm run start` executa `prisma migrate deploy` antes de subir a aplicação compilada
- O build espera que o TypeScript gere saída em `dist`
- O CORS precisa incluir a origem do frontend publicado

## Invariantes importantes

- Cada usuário tem uma única `BotInstance`
- Credenciais Binance nunca são salvas em texto puro
- O runtime usa o plano do usuário para respeitar limites de posição
- `FREE` nunca deve abrir mais de 3 posições simultâneas
- O bot sempre tenta vender antes de comprar no ciclo
- Mudança de configuração deve reidratar o runtime para evitar estado antigo

## O que ainda não existe

- Cobrança automática
- Integração de pagamento
- Múltiplas instâncias de bot por usuário
- Estratégias além do grid atual

## Nota final

Se for mexer em estratégia, persistência ou autenticação, este arquivo deve ser atualizado junto com o código. Ele existe para evitar documentação “quase certa” e manter a operação do projeto alinhada com o que realmente roda.
