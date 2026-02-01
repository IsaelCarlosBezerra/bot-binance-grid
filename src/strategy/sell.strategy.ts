// src/strategy/sell.strategy.ts
import { priceBuffer } from "../core/price-buffer.js"
import { getOpenPositions, closePosition } from "../positions/position.store.js"
import { binanceClient } from "../binance/client.js"
import { strategyState } from "../core/strategy-state.js"

export async function trySell(): Promise<boolean> {
	if (!priceBuffer.isReady()) return false

	const currentPrice = priceBuffer.getPrice()
	const openPositions = getOpenPositions()

	/* if (openPositions.length === 0) {
		strategyState.nextSellPrice = null
		return false
	}

	if (openPositions.length > 0)
		strategyState.nextSellPrice = openPositions.length > 0 ? openPositions[0].sellPrice : null */

	if (openPositions.length > 0) {
		strategyState.nextSellPrice = openPositions.at(-1)!.sellPrice
	} else {
		strategyState.nextSellPrice = null
		return false
	}

	// Processa em ordem de criação (FIFO)
	for (const position of openPositions) {
		if (currentPrice >= position.sellPrice) {
			// Executa venda por quantidade
			await binanceClient.marketSell(position.symbol, position.quantity)

			closePosition(position.id)

			console.log(`✅ VENDA EXECUTADA | qty=${position.quantity} | price=${currentPrice}`)

			// VENDEU → encerra o ciclo
			return true
		}
	}

	return false
}
