import { jest } from "@jest/globals"
import { SellStrategy } from "../strategy/SellStrategy.js"
import type { IBinanceClient } from "../core/interfaces/IBinanceClient.js"
import type { IPositionStore } from "../core/interfaces/IPositionStore.js"

describe("SellStrategy (Arquitetura Limpa)", () => {
	// Definimos os Mocks
	let mockBinance: jest.Mocked<IBinanceClient>
	let mockStore: jest.Mocked<IPositionStore>
	let sellStrategy: SellStrategy

	beforeEach(() => {
		// 1. Criamos os Mocks das interfaces
		mockBinance = {
			marketSell: jest.fn(),
			marketBuy: jest.fn(),
		}

		mockStore = {
			getOpenPositions: jest.fn(),
			getUltimaPositionOpen: jest.fn(),
			addPosition: jest.fn(),
			closePosition: jest.fn(),
		}

		// 2. Injetamos as dependências na classe (Injeção de Dependência)
		sellStrategy = new SellStrategy(mockBinance, mockStore)
	})

	it("deve executar a venda e atualizar a store quando o critério de lucro for atingido", async () => {
		// ARRANGE (Preparação)
		const currentPrice = 52000
		const mockPosition = { id: "uuid-123", symbol: "BTCUSDT", quantity: 0.005, buyPrice: 50000 }

		const strategyState = {
			precoVenda: {
				vender: jest.fn().mockReturnValue(true), // Simula que o lucro foi atingido
				ultimaPosicao: jest.fn().mockReturnValue(mockPosition),
			},
		}

		// ACT (Ação)
		const result = await sellStrategy.trySell(currentPrice, strategyState)

		// ASSERT (Verificação)
		expect(result).toBe(true)
		expect(mockBinance.marketSell).toHaveBeenCalledWith("BTCUSDT", 0.005)
		expect(mockStore.closePosition).toHaveBeenCalledWith("uuid-123")
	})

	it("NÃO deve vender se o critério de lucro não for atingido", async () => {
		const strategyState = {
			precoVenda: {
				vender: jest.fn().mockReturnValue(false), // Preço ainda não chegou lá
			},
		}

		const result = await sellStrategy.trySell(49000, strategyState)

		expect(result).toBe(false)
		expect(mockBinance.marketSell).not.toHaveBeenCalled()
		expect(mockStore.closePosition).not.toHaveBeenCalled()
	})
})
