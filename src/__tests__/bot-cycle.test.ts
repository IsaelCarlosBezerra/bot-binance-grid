import { calcularPrecoVenda, calcularNovoPrecoCompra } from "../bot/bot-cycle.js"

describe("calcularPrecoVenda", () => {
	it("calcula preço de venda com margem bruta de 0.8%", () => {
		// 100000 / (1 - 0.008) = 100000 / 0.992 = 100806.45
		const result = calcularPrecoVenda(100000, 0.008)
		expect(result).toBeCloseTo(100806.45, 1)
	})

	it("preço de venda é sempre maior que o de compra", () => {
		expect(calcularPrecoVenda(50000, 0.005)).toBeGreaterThan(50000)
		expect(calcularPrecoVenda(10000, 0.01)).toBeGreaterThan(10000)
	})

	it("margem zero retorna o mesmo preço", () => {
		expect(calcularPrecoVenda(100000, 0)).toBe(100000)
	})
})

describe("calcularNovoPrecoCompra", () => {
	const drop = 0.008 // 0.8%

	it("sem posição aberta retorna 0 (calibrarPrecoCompra fará a calibração inicial)", () => {
		// Sem posição: peloPrecoAtual=99200, pelaUltimaCompra=0
		// 99200 > 0 → retorna pelaUltimaCompra = 0
		const result = calcularNovoPrecoCompra(undefined, 100000, drop)
		expect(result).toBe(0)
	})

	it("com posição aberta retorna o menor entre preço atual e última compra com drop", () => {
		const ultimaOrdem = { buyPrice: 98000 }
		const precoAtual = 100000

		// peloPrecoAtual = 99200
		// pelaUltimaCompra = 98000 * 0.992 = 97216
		// 99200 > 97216 → retorna pelaUltimaCompra = 97216
		const result = calcularNovoPrecoCompra(ultimaOrdem, precoAtual, drop)
		expect(result).toBeCloseTo(97216, 0)
	})

	it("quando preço atual caiu muito, usa preço da última compra como referência", () => {
		const ultimaOrdem = { buyPrice: 105000 }
		const precoAtual = 100000

		// peloPrecoAtual = 99200
		// pelaUltimaCompra = 105000 * 0.992 = 104160
		// 99200 > 104160 → false → retorna peloPrecoAtual = 99200
		const result = calcularNovoPrecoCompra(ultimaOrdem, precoAtual, drop)
		expect(result).toBeCloseTo(99200, 0)
	})

	it("com posição e drop zero retorna preço da última compra", () => {
		const ultimaOrdem = { buyPrice: 98000 }
		const result = calcularNovoPrecoCompra(ultimaOrdem, 100000, 0)
		expect(result).toBe(98000)
	})
})
