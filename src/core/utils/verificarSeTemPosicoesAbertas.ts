import type { Position } from "../../positions/position.model.js"
import { getOpenPositions } from "../../positions/position.store.js"

export function verificarSeTemPosicoesAbertas(): { result: boolean; posicoesAbertas: Position[] } {
	const openPositions = getOpenPositions()

	if (openPositions.length === 0) {
		return { result: false, posicoesAbertas: [] as Position[] }
	} else {
		return {
			result: true,
			posicoesAbertas: openPositions,
		}
	}
}
