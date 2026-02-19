import { BotConfig } from "../../config/bot.config.js"
import { strategyState } from "../strategy-state.js"

export function calibrarPrecoCompra() {
	const precoAtual = 0
	const precoCompraAtual = 0
	const diferenca = (precoAtual - precoCompraAtual / precoAtual) * 100
	if (diferenca > 1) {
		const newPrecoCompra = precoAtual * (1 - BotConfig.dropPercentage)
		strategyState.nextBuyPrice = newPrecoCompra
	}
}
