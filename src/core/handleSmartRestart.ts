// src/core/restart-handler.ts
import { priceBuffer } from "./price-buffer.js"
import { getOpenPositions, closePosition } from "../positions/position.store.js"
import { binanceClient } from "../binance/client.js"
import { BotConfig } from "../config/bot.config.js"

export async function handleSmartRestart(): Promise<void> {
	if (!priceBuffer.isReady()) {
		console.log("⏳ Preço ainda não disponível para reinício")
		return
	}

	const currentPrice = priceBuffer.getPrice()
	const openPositions = getOpenPositions()

	if (openPositions.length === 0) {
		console.log("ℹ️ Nenhuma posição aberta no reinício")
		return
	}

	// FIFO: mais antigas primeiro
	const sorted = [...openPositions].sort((a, b) => a.createdAt - b.createdAt)

	let totalQuantity = 0
	const positionsToClose: string[] = []

	for (const position of sorted) {
		if (currentPrice >= position.sellPrice) {
			totalQuantity += position.quantity
			positionsToClose.push(position.id)
		} else {
			break // primeira inviável → para tudo
		}
	}

	if (totalQuantity <= 0) {
		console.log("ℹ️ Nenhuma posição elegível para liquidação")
		return
	}

	// Venda consolidada
	await binanceClient.marketSell(BotConfig.symbol, totalQuantity)

	// Fecha somente as posições vendidas
	for (const id of positionsToClose) {
		closePosition(id)
	}

	console.log(`🔄 REINÍCIO | Venda consolidada executada | qty=${totalQuantity}`)
}
