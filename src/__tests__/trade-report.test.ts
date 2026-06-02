import { jest } from "@jest/globals"

const mockGetClosed = jest.fn()
const mockGetOpen = jest.fn()

await jest.unstable_mockModule("../positions/position.store.js", () => ({
	getClosedPositions: mockGetClosed,
	getOpenPositions: mockGetOpen,
}))

const { generateTradeSummary, generateTradeSummaryOpen } = await import("../reports/trade-report.js")

const makePosition = (buyPrice: number, sellPrice: number, quantity: number, status = "CLOSED") => ({
	id: "pos-1",
	symbol: "BTCUSDT",
	buyPrice,
	sellPrice,
	quantity,
	expectedNetProfit: 0.005,
	createdAt: Date.now(),
	status,
})

describe("generateTradeSummary", () => {
	beforeEach(() => jest.clearAllMocks())

	it("retorna zeros quando não há posições fechadas", async () => {
		mockGetClosed.mockResolvedValue([])
		const result = await generateTradeSummary("bot-id")
		expect(result.compras.quantidade).toBe(0)
		expect(result.vendas.quantidade).toBe(0)
		expect(result.lucroLiquido).toBe(0)
		expect(result.totalTaxas).toBe(0)
		expect(result.totalIR).toBe(0)
	})

	it("calcula lucro líquido descontando taxas Binance (0.1%) e IR (15%)", async () => {
		const position = makePosition(100000, 100800, 0.001)
		mockGetClosed.mockResolvedValue([position])

		const result = await generateTradeSummary("bot-id")

		const buyValue = 100000 * 0.001    // 100 USDT
		const sellValue = 100800 * 0.001   // 100.8 USDT
		const taxas = (buyValue + sellValue) * 0.001
		const lucroBruto = sellValue - buyValue
		const ir = lucroBruto * 0.15
		const esperado = lucroBruto - taxas - ir

		expect(result.compras.quantidade).toBe(1)
		expect(result.vendas.quantidade).toBe(1)
		expect(result.lucroLiquido).toBeCloseTo(esperado, 6)
		expect(result.totalTaxas).toBeCloseTo(taxas, 6)
		expect(result.totalIR).toBeCloseTo(ir, 6)
	})

	it("não aplica IR quando operação dá prejuízo", async () => {
		mockGetClosed.mockResolvedValue([makePosition(100000, 99000, 0.001)])
		const result = await generateTradeSummary("bot-id")
		expect(result.totalIR).toBe(0)
		expect(result.lucroLiquido).toBeLessThan(0)
	})

	it("acumula corretamente múltiplas posições", async () => {
		mockGetClosed.mockResolvedValue([
			makePosition(100000, 100800, 0.001),
			makePosition(99000, 99792, 0.001),
		])
		const result = await generateTradeSummary("bot-id")
		expect(result.compras.quantidade).toBe(2)
		expect(result.vendas.quantidade).toBe(2)
		expect(result.lucroLiquido).toBeGreaterThan(0)
	})
})

describe("generateTradeSummaryOpen", () => {
	beforeEach(() => jest.clearAllMocks())

	it("retorna zeros quando não há posições abertas", async () => {
		mockGetOpen.mockResolvedValue([])
		const result = await generateTradeSummaryOpen("bot-id")
		expect(result.comprasAbertas.quantidade).toBe(0)
		expect(result.lucroLiquidoAberto).toBe(0)
	})

	it("calcula lucro estimado das posições abertas", async () => {
		mockGetOpen.mockResolvedValue([makePosition(100000, 100800, 0.001, "OPEN")])
		const result = await generateTradeSummaryOpen("bot-id")
		expect(result.comprasAbertas.quantidade).toBe(1)
		expect(result.lucroLiquidoAberto).toBeGreaterThan(0)
	})
})
