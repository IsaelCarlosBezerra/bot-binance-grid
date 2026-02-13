import { PrecoVenda } from "../core/utils/PrecoVenda.js" // Ajuste o caminho conforme necessário
import type { Position } from "../positions/position.model.js"

describe("PrecoVenda - Cobertura Total", () => {
	const percentual = 0.01 // 1%
	const criarMockPosicao = (sellPrice: number): Position => ({ sellPrice }) as any

	describe("Constructor e Validações", () => {
		it("deve lançar erro se o preço atual for <= 0", () => {
			expect(() => new PrecoVenda(undefined, 0, 0.01)).toThrow(
				"O preço atual deve ser maior que zero.",
			)
		})

		it("deve lançar erro se o percentual for <= 0", () => {
			expect(() => new PrecoVenda(undefined, 100, 0)).toThrow(
				"O percentual deve ser maior que zero.",
			)
		})
	})

	describe("Lógica de Cálculo (calcular)", () => {
		it("deve retornar 0 se não houver posição aberta (precoVendaAberto === 0)", () => {
			const instancia = new PrecoVenda(undefined, 100, percentual)
			expect(instancia.valor()).toBe(0)
		})

		it("deve retornar o precoCalculado se ele for MENOR que o precoAberto", () => {
			// precoAberto = 110
			// precoCalculado = 100 / (1 - 0.01) = 101.01...
			// 101.01 < 110? Sim.
			const posicao = criarMockPosicao(110)
			const instancia = new PrecoVenda(posicao, 100, percentual)
			expect(instancia.valor()).toBeCloseTo(101.01, 2)
		})

		it("deve retornar precoAberto se o precoCalculado for MAIOR que o precoAberto", () => {
			// precoAberto = 105
			// precoCalculado = 110 / 0.99 = 111.11...
			// 111.11 > 105? Sim -> retorna 105
			const posicao = criarMockPosicao(105)
			const instancia = new PrecoVenda(posicao, 110, percentual)
			expect(instancia.valor()).toBe(105)
		})
	})

	describe("Métodos de Ação", () => {
		it("deve validar a função vender corretamente", () => {
			const posicao = criarMockPosicao(110)
			const instancia = new PrecoVenda(posicao, 100, 0.05) // valor alvo aprox 105.26

			const alvo = instancia.valor()
			expect(instancia.vender(alvo)).toBe(true)
			expect(instancia.vender(alvo + 1)).toBe(true)
			expect(instancia.vender(alvo - 1)).toBe(false)
		})

		it("deve retornar false na função vender se o valor for 0", () => {
			const instancia = new PrecoVenda(undefined, 100, 0.01)
			expect(instancia.valor()).toBe(0)
			expect(instancia.vender(200)).toBe(false) // Mesmo preço alto, valor 0 impede venda
		})

		it("deve retornar a última posição através de ultimaPosicao()", () => {
			const posicao = criarMockPosicao(100)
			const instancia = new PrecoVenda(posicao, 90, 0.01)
			expect(instancia.ultimaPosicao()).toBe(posicao)
		})

		it("deve calcularProximoPrecoVenda independente do estado da instância", () => {
			const instancia = new PrecoVenda(undefined, 100, 0.1)
			// 100 / 0.9 = 111.11...
			expect(instancia.calcularProximoPrecoVenda(100)).toBeCloseTo(111.11, 2)
		})
	})

	describe("Método Estático", () => {
		it("deve criar uma instância via PrecoVenda.criar()", () => {
			const instancia = PrecoVenda.criar(undefined, 100, 0.01)
			expect(instancia).toBeInstanceOf(PrecoVenda)
		})
	})
})
