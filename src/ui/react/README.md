# Crypto Bot Dashboard - React

Versão React do dashboard do bot de criptomoedas.

## 🚀 Instalação

```bash
cd src/ui/react
npm install
```

## 💻 Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

O dashboard estará disponível em `http://localhost:3000`

## 🏗️ Build

Para criar a versão de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`

## 📋 Funcionalidades

- ✅ Visualização do status do bot (ligado/desligado)
- ✅ Controles para iniciar e parar o bot
- ✅ Resumo financeiro (compras, vendas, lucro líquido, taxas, IR)
- ✅ Estado do mercado (preço atual, próximas ações)
- ✅ Configuração do bot (percentual de compra, lucros alvo, intervalo)
- ✅ Tabela de posições abertas
- ✅ Atualização automática a cada 3 segundos
- ✅ Design dark theme responsivo

## 🛠️ Tecnologias

- React 18
- Vite
- CSS Vanilla

## 📁 Estrutura

```
src/
├── components/          # Componentes React
│   ├── Header.jsx
│   ├── StatusIndicator.jsx
│   ├── Controls.jsx
│   ├── FinancialSummary.jsx
│   ├── MarketState.jsx
│   ├── BotConfiguration.jsx
│   └── OpenPositions.jsx
├── services/           # Serviços de API
│   └── api.js
├── App.jsx            # Componente principal
├── main.jsx           # Entry point
└── index.css          # Estilos globais
```

## 🔌 API

O dashboard se conecta ao backend através das seguintes rotas:

- `POST /start` - Iniciar o bot
- `POST /stop` - Parar o bot
- `GET /status` - Obter status atual
- `POST /config` - Salvar configuração

A configuração do proxy está em `vite.config.js` e aponta para `http://localhost:8080`
