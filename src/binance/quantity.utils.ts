// src/binance/quantity.utils.ts
export function adjustQuantityToStep(quantity: number, stepSize: number): number {
	const precision = Math.round(Math.log10(1 / stepSize))
	return Number((Math.floor(quantity / stepSize) * stepSize).toFixed(precision))
}
