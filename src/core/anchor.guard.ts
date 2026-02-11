import { getOpenPositions } from "../positions/position.store.js"
import { strategyState } from "./strategy-state.js"

export function enforceAnchorInvariant(): void {
	const openPositions = getOpenPositions()

	if (openPositions.length === 0) return
	if (!strategyState.anchorPrice) return

	// Última posição aberta (mais recente)
	const lastPosition = openPositions.at(-1)!

	const lastBuyPrice = lastPosition.buyPrice

	// 🔴 REGRA INVARIÁVEL
	if (strategyState.anchorPrice > lastBuyPrice) {
		strategyState.anchorPrice = lastBuyPrice
	}
}
