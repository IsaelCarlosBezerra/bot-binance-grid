// src/binance/order.validator.ts
import type { SymbolFilters } from "./filters.js"
import { adjustQuantityToStep } from "./quantity.utils.js"

interface ValidateOrderParams {
	quantity: number
	price: number
	filters: SymbolFilters
}

export function validateAndAdjustOrder({ quantity, price, filters }: ValidateOrderParams): {
	valid: boolean
	quantity?: number
	reason?: string
} {
	const adjustedQty = adjustQuantityToStep(quantity, filters.stepSize)
	const notional = adjustedQty * price

	if (adjustedQty < filters.minQty) {
		return { valid: false, reason: "Quantidade menor que minQty" }
	}

	if (notional < filters.minNotional) {
		return { valid: false, reason: "Valor menor que MIN_NOTIONAL" }
	}

	return { valid: true, quantity: adjustedQty }
}
