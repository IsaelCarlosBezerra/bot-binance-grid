import { PrecoCompra } from "../core/utils/PrecoCompra.js"

describe("PrecoCompra - Cobertura 100%", () => {
	const mockPosicao = { buyPrice: 100 } as any

	describe("Constructor e Validações", () => {
		it("deve falhar se precoAtual <= 0", () => {
			expect(() => new PrecoCompra(undefined, 0, 0.01)).toThrow()
		})

		it("deve falhar se percentual <= 0", () => {
			expect(() => new PrecoCompra(undefined, 100, 0)).toThrow()
		})

		it("deve falhar se percentual >= 1", () => {
			expect(() => new PrecoCompra(undefined, 100, 1)).toThrow()
		})
	})

	describe("Lógica de Cálculo", () => {
		it("deve calcular usando apenas precoAtual se não houver posição aberta", () => {
			const instancia = new PrecoCompra(undefined, 100, 0.1)
			expect(instancia.valor()).toBe(90)
		})

		it("deve manter precoBaseadoNoAtual se precoBaseadoNoAberto for maior", () => {
			// precoAtual (50) com 10% desc = 45
			// precoAberto (100) com 10% desc = 90
			// 90 não é menor que 45, então usa 45
			const instancia = new PrecoCompra(mockPosicao, 50, 0.1)
			expect(instancia.valor()).toBe(45)
		})

		it("deve usar precoBaseadoNoAberto se ele for menor (DCA)", () => {
			// precoAtual (200) com 10% desc = 180
			// precoAberto (100) com 10% desc = 90
			// 90 é menor que 180, então usa 90
			const instancia = new PrecoCompra(mockPosicao, 200, 0.1)
			expect(instancia.valor()).toBe(90)
		})
	})

	describe("Métodos Auxiliares e Estáticos", () => {
		it("deve validar a função comprar", () => {
			const instancia = new PrecoCompra(undefined, 100, 0.1) // alvo 90
			expect(instancia.comprar(90)).toBe(true)
			expect(instancia.comprar(91)).toBe(false)
		})

		it("deve criar via método estático criar()", () => {
			const instancia = PrecoCompra.criar(undefined, 100, 0.1)
			expect(instancia).toBeInstanceOf(PrecoCompra)
		})

		// Este teste força o uso dos métodos que talvez estejam sobrando (linhas 54-64)
		it("deve garantir que métodos de cálculo individuais funcionem", () => {
			const instancia = new PrecoCompra(mockPosicao, 100, 0.1)
			// @ts-ignore - Acessando privados para forçar cobertura
			expect(instancia.ultimoPrecoComprado()).toBe(100)
			// @ts-ignore
			expect(instancia.calculaPeloPrecoAtual()).toBe(90)
			// @ts-ignore
			expect(instancia.calculaPeloUltimoPrecoComprado()).toBe(90)
		})
	})
})
