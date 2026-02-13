import dotenv from "dotenv"
import { BotConfig } from "./config/bot.config.js"
import { startCycle } from "./core/cycle-runner.js"
import { executarLiquidacoesPendentesNoReinicio } from "./core/executarLiquidacoesPendentesNoReinicio.js"
import { startPriceWebSocket } from "./binance/websocket.js"
import { startApi } from "./api/server.js"
import { verificaBuffer } from "./core/utils/verificaBuffer.js"
import { atualizaPrecoCompra } from "./core/utils/atualizaPrecoCompra.js"
import { atualizaPrecoVenda } from "./core/utils/atualizaPrecoVenda.js"

dotenv.config()

// Inicia WebSocket
startPriceWebSocket()

// Aguarda primeiro preço para reinício inteligente
const waitForPrice = setInterval(async () => {
	if (!verificaBuffer()) return

	clearInterval(waitForPrice)

	await executarLiquidacoesPendentesNoReinicio()

	atualizaPrecoVenda()
	atualizaPrecoCompra()

	if (BotConfig.enabled) {
		startCycle()
	}

	console.log("🤖 Bot totalmente operacional")
}, 1000)

startApi(3001)
