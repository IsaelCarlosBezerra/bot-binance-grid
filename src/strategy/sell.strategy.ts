// src/strategy/sell.strategy.ts
import { priceBuffer } from "../core/price-buffer.js"
import { closePosition } from "../positions/position.store.js"
import { binanceClient } from "../binance/client.js"
import { strategyState } from "../core/strategy-state.js"
import { verificaBuffer } from "../core/utils/verificaBuffer.js"
import { atualizaPrecoCompra } from "../core/utils/atualizaPrecoCompra.js"
import { atualizaPrecoVenda } from "../core/utils/atualizaPrecoVenda.js"

export async function trySell(): Promise<boolean> {
	if (!verificaBuffer()) return false

	const currentPrice = priceBuffer.getPrice()

	// Processa em ordem de criação (FIFO)
	if (strategyState.precoVenda?.vender(currentPrice)) {
		const position = strategyState.precoVenda!.ultimaPosicao()
		// Executa venda por quantidade
		await binanceClient.marketSell(position.symbol, position.quantity)

		closePosition(position.id)

		console.log(`✅ VENDA EXECUTADA | qty=${position.quantity} | price=${currentPrice}`)

		atualizaPrecoVenda()
		atualizaPrecoCompra()
		return true
	}

	return false
}
