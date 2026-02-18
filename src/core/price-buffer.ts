import { strategyState } from "./strategy-state.js"
import { getOpenPositions } from "../positions/position.store.js"

// src/core/price-buffer.ts
class PriceBuffer {
	private price: number | null = null
	private lastUpdate: number | null = null

	update(price: number) {
		this.price = price
		this.lastUpdate = Date.now()

		strategyState.currentPrice = price

		const openPositions = getOpenPositions()
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
