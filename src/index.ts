import dotenv from "dotenv"
import { BotConfig } from "./config/bot.config.js"
import { startCycle } from "./core/cycle-runner.js"
import { priceBuffer } from "./core/price-buffer.js"
import { handleSmartRestart } from "./core/restart-handler.js"
import { startPriceWebSocket } from "./binance/websocket.js"
import { startApi } from "./api/server.js"

dotenv.config()

let restartHandled = false

// Inicia WebSocket
startPriceWebSocket()

// Aguarda primeiro preço para reinício inteligente
const waitForPrice = setInterval(async () => {
	if (!priceBuffer.isReady()) return

	clearInterval(waitForPrice)

	await handleSmartRestart()

	if (BotConfig.enabled) {
		startCycle()
	}

	console.log("🤖 Bot totalmente operacional")
}, 1000)

startApi(3000)
