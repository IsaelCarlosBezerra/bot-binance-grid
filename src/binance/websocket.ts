// src/binance/websocket.ts
import { BotConfig } from "../config/bot.config.js"
import { priceBuffer } from "../core/price-buffer.js"
import { binanceClient } from "./client.js"

export function startPriceWebSocket() {
	const symbol = BotConfig.symbol

	binanceClient.websockets.miniTicker(async (ticker) => {
		try {
			if (ticker[symbol]) {
				const price = Number(ticker[symbol].close)
				if (!Number.isNaN(price)) {
					priceBuffer.update(price)
				}
			}
		} catch (error) {
			const msg = `Erro no monitoramento do miniTicker ${symbol}`
			console.error(msg, error)
		}
	})

	console.log("📡 WebSocket miniTicker iniciado")
}
