import { validateAndAdjustOrder } from "../binance/order.validator.js"
import type { SymbolFilters } from "../binance/filters.js"

const filters: SymbolFilters = {
	minQty: 0.00001,
	maxQty: 9000,
	stepSize: 0.00001,
	minNotional: 5,
}

describe("validateAndAdjustOrder", () => {
	it("aprova ordem válida e ajusta quantidade ao stepSize", () => {
		const result = validateAndAdjustOrder({ quantity: 0.001234567, price: 100000, filters })
		expect(result.valid).toBe(true)
		expect(result.quantity).toBe(0.00123)
	})

	it("rejeita quando quantidade ajustada é menor que minQty", () => {
		const result = validateAndAdjustOrder({ quantity: 0.000001, price: 100000, filters })
		expect(result.valid).toBe(false)
		expect(result.reason).toMatch(/minQty/)
	})

	it("rejeita quando valor total é menor que minNotional", () => {
		// qty=0.00001 * price=1 = 0.00001 USDT < 5 USDT
		const result = validateAndAdjustOrder({ quantity: 0.00001, price: 1, filters })
		expect(result.valid).toBe(false)
		expect(result.reason).toMatch(/MIN_NOTIONAL/)
	})

	it("aprova quando valor total é exatamente o minNotional", () => {
		// qty=0.00005 * price=100000 = 5 USDT = minNotional
		const result = validateAndAdjustOrder({ quantity: 0.00005, price: 100000, filters })
		expect(result.valid).toBe(true)
	})
})
