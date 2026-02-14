// src/strategy/SellStrategy.ts
import type { IBinanceClient } from "../core/interfaces/IBinanceClient.js"
import type { IPositionStore } from "../core/interfaces/IPositionStore.js"

export class SellStrategy {
	constructor(
		private binanceClient: IBinanceClient,
		private store: IPositionStore,
	) {}

	async trySell(currentPrice: number, strategyState: any): Promise<boolean> {
		if (!strategyState.precoVenda?.vender(currentPrice)) return false

		const position = strategyState.precoVenda.ultimaPosicao()

		// Aqui usamos a dependência injetada
		await this.binanceClient.marketSell(position.symbol, position.quantity)
		this.store.closePosition(position.id)

		return true
	}
}
