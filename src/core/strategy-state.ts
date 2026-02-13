import { PrecoCompra } from "./utils/PrecoCompra.js"
import type { PrecoVenda } from "./utils/PrecoVenda.js"

export interface StrategyState {
	currentPrice: number | null
	nextBuyPrice: number | null
	nextSellPrice: number | null
	anchorPrice: number | null
	precoCompra: PrecoCompra | null
	precoVenda: PrecoVenda | null
}

export const strategyState: StrategyState = {
	currentPrice: null,
	nextBuyPrice: null,
	nextSellPrice: null,
	anchorPrice: null,
	precoCompra: null,
	precoVenda: null,
}

export function criarPrecoCompra(precoCompra: PrecoCompra) {
	strategyState.precoCompra = precoCompra
}

export function criarPrecoVenda(precoVenda: PrecoVenda) {
	strategyState.precoVenda = precoVenda
}
