// src/binance/websocket.ts
import { binanceClient } from "./client.js"
import { priceBuffer } from "../core/price-buffer.js"
import { BotConfig } from "../config/bot.config.js"

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
			console.log(msg)
			throw new Error(msg)
		}
	})

	console.log("📡 WebSocket miniTicker iniciado")
}
