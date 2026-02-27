import { getOpenPositions } from "../positions/position.store.js"
import { strategyState } from "./strategy-state.js"

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

	getPrice(): number | null {
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
