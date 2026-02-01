import { strategyState } from "./strategy-state.js"
import { getOpenPositions } from "../positions/position.store.js"
import { BotConfig } from "../config/bot.config.js"

// src/core/price-buffer.ts
class PriceBuffer {
	private price: number | null = null
	private lastUpdate: number | null = null

	update(price: number) {
		this.price = price
		this.lastUpdate = Date.now()

		strategyState.currentPrice = price

		const openPositions = getOpenPositions()

		// 🔴 Atualização inteligente da âncora
		if (openPositions.length === 0) {
			if (strategyState.anchorPrice === null) {
				strategyState.anchorPrice = price
				return
			}

			const thresholdPrice = strategyState.anchorPrice * (1 + BotConfig.targetNetProfit)

			if (price >= thresholdPrice) {
				strategyState.anchorPrice = price
			}
		}
	}

	getPrice(): number {
		if (this.price === null) {
			throw new Error("Preço ainda não disponível no buffer")
		}
		return this.price
	}

	getLastUpdate(): number | null {
		return this.lastUpdate
	}

	isReady(): boolean {
		return this.price !== null
	}
}

export const priceBuffer = new PriceBuffer()
