import type { Position } from "../positions/position.model.js"

export interface StrategyState {
	currentPrice: number
	nextBuyPrice: number
	nextSellPrice: number
	isProcessing: boolean
	ultimaPosicaoAberta: Position | undefined
	balance: number
}

export const strategyState: StrategyState = {
	currentPrice: 0,
	nextBuyPrice: 0,
	nextSellPrice: 0,
	isProcessing: false,
	ultimaPosicaoAberta: undefined,
	balance: 0,
}
