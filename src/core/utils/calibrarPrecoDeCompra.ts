import { BotConfig } from "../../config/bot.config.js"
import { priceBuffer } from "../price-buffer.js"
import { strategyState } from "../strategy-state.js"

export function calibrarPrecoCompra() {
	const precoAtual = priceBuffer.getPrice()
	if (!precoAtual) return
	const precoCompraAtual = strategyState.nextBuyPrice
	const diferenca = ((precoAtual - precoCompraAtual) / precoAtual) * 100

	if (diferenca > 1) {
		const newPrecoCompra = precoAtual * (1 - BotConfig.dropPercentage)
		strategyState.nextBuyPrice = newPrecoCompra
	}
}
