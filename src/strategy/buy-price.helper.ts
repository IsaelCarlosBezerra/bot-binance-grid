import { BotConfig } from "../config/bot.config.js"
import { strategyState } from "../core/strategy-state.js"
import type { Position } from "../positions/position.model.js"
import { getOpenPositions } from "../positions/position.store.js"

export function calculateNextBuyPrice(currentPrice: number, openPositions: Position[]): number {
	// 🔹 MODO PADRÃO (ÂNCORA)
	if (BotConfig.buyReferenceMode === "ANCHOR") {
		const anchor = strategyState.anchorPrice ?? currentPrice
		return anchor * (1 - BotConfig.dropPercentage)
	}

	// 🔹 MODO NOVO (ÚLTIMA COMPRA)
	if (BotConfig.buyReferenceMode === "LAST_BUY" && openPositions.length > 0) {
		const lastPosition = openPositions.at(-1)!
		return lastPosition.buyPrice * (1 - BotConfig.dropPercentage)
	}

	// fallback seguro
	const anchor = strategyState.anchorPrice ?? currentPrice
	return anchor * (1 - BotConfig.dropPercentage)
}
