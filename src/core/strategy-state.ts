export interface StrategyState {
	currentPrice: number | null
	nextBuyPrice: number | null
	nextSellPrice: number | null
	anchorPrice: number | null
}

export const strategyState: StrategyState = {
	currentPrice: null,
	nextBuyPrice: null,
	nextSellPrice: null,
	anchorPrice: null,
}
