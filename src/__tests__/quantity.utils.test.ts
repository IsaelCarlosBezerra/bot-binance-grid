import { adjustQuantityToStep } from "../binance/quantity.utils.js"

describe("adjustQuantityToStep", () => {
	it("arredonda para baixo no stepSize de 0.001", () => {
		expect(adjustQuantityToStep(0.123456, 0.001)).toBe(0.123)
	})

	it("arredonda para baixo no stepSize de 0.01", () => {
		expect(adjustQuantityToStep(1.999, 0.01)).toBe(1.99)
	})

	it("arredonda para baixo no stepSize de 1", () => {
		expect(adjustQuantityToStep(5.9, 1)).toBe(5)
	})

	it("retorna 0 quando quantidade menor que stepSize", () => {
		expect(adjustQuantityToStep(0.0001, 0.001)).toBe(0)
	})

	it("mantém valor exato quando já alinhado ao step", () => {
		expect(adjustQuantityToStep(0.5, 0.1)).toBe(0.5)
	})

	it("funciona com stepSize de 0.00001 (5 casas decimais)", () => {
		expect(adjustQuantityToStep(0.123456789, 0.00001)).toBe(0.12345)
	})
})
