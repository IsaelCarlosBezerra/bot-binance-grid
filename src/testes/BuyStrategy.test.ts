import { jest, describe, it, expect, beforeEach } from "@jest/globals"
import { BuyStrategy } from "../strategy/BuyStrategy.js"

describe("BuyStrategy (Clean Architecture Tests)", () => {
	let mockBinance: any
	let mockStore: any
	let mockAccount: any
	let mockFilter: any

	const mockConfig = {
		symbol: "BTCUSDT",
		buyPercentageOfBalance: 0.1,
		targetNetProfit: 0.01,
	}

	const stateMock: any = {
		precoCompra: { comprar: jest.fn() },
		precoVenda: { calcularProximoPrecoVenda: jest.fn() },
	}

	beforeEach(() => {
		// 1. IMPORTANTE: resetAllMocks limpa histórico E implementações (valores de retorno)
		jest.resetAllMocks()

		mockBinance = { marketBuy: jest.fn() }
		mockStore = { addPosition: jest.fn() }
		mockAccount = { getFreeBalance: jest.fn() }
		mockFilter = { getSymbolFilters: jest.fn() }

		// Configurações padrão para evitar undefined em testes que não as sobrescrevem
		mockBinance.marketBuy.mockResolvedValue(undefined)
		stateMock.precoCompra.comprar.mockReturnValue(true)
		stateMock.precoVenda.calcularProximoPrecoVenda.mockReturnValue(51000)
	})

	it("deve registrar posição após compra bem sucedida", async () => {
		// ARRANGE
		mockAccount.getFreeBalance.mockResolvedValue(1000)

		// MOCK HÍBRIDO: Garante que o validator encontre os filtros,
		// seja acessando via filters[] ou symbols[0].filters[]
		const filtersContent = [
			{ filterType: "LOT_SIZE", minQty: "0.00001", maxQty: "1000", stepSize: "0.00001" },
			{ filterType: "MIN_NOTIONAL", minNotional: "10.0" },
			{ filterType: "PRICE_FILTER", tickSize: "0.01", minPrice: "0.01", maxPrice: "100000" },
		]

		mockFilter.getSymbolFilters.mockResolvedValue({
			symbol: "BTCUSDT",
			filters: filtersContent,
			symbols: [{ symbol: "BTCUSDT", filters: filtersContent }], // Para compatibilidade com diferentes validadores
		} as any)

		const strategy = new BuyStrategy(
			mockBinance,
			mockStore,
			mockAccount,
			mockFilter,
			mockConfig,
		)

		// ACT
		const result = await strategy.execute(50000, stateMock)

		// ASSERT
		expect(result).toBe(true)
		expect(mockBinance.marketBuy).toHaveBeenCalledWith("BTCUSDT", expect.any(Number))
		expect(mockStore.addPosition).toHaveBeenCalled()
	})

	it("deve abortar a compra se o saldo for zero", async () => {
		// ARRANGE
		mockAccount.getFreeBalance.mockResolvedValue(0)

		const strategy = new BuyStrategy(
			mockBinance,
			mockStore,
			mockAccount,
			mockFilter,
			mockConfig,
		)

		// ACT
		const result = await strategy.execute(50000, stateMock)

		// ASSERT
		expect(result).toBe(false)
		expect(mockBinance.marketBuy).not.toHaveBeenCalled()
	})

	it("deve lançar erro se o serviço de filtros falhar (Erro de Rede)", async () => {
		// ARRANGE
		mockFilter.getSymbolFilters.mockRejectedValue(new Error("Network Error"))

		const strategy = new BuyStrategy(
			mockBinance,
			mockStore,
			mockAccount,
			mockFilter,
			mockConfig,
		)

		// ACT & ASSERT
		await expect(strategy.execute(50000, stateMock)).rejects.toThrow("Network Error")
	})
})
