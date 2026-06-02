import { jest } from "@jest/globals"

const mockCreate = jest.fn()
const mockUpdateMany = jest.fn()
const mockFindMany = jest.fn()
const mockCount = jest.fn()

await jest.unstable_mockModule("@prisma/client", () => ({
	PrismaClient: jest.fn(() => ({
		tradeOrder: {
			create: mockCreate,
			updateMany: mockUpdateMany,
			findMany: mockFindMany,
			count: mockCount,
		},
	})),
}))

const {
	addPosition,
	closePosition,
	getOpenPositions,
	getClosedPositions,
	getUltimaPositionOpen,
} = await import("../positions/position.store.js")

const mockRow = {
	id: "pos-uuid",
	symbol: "BTCUSDT",
	buyPrice: { toNumber: () => 100000 },
	quantity: { toNumber: () => 0.001 },
	sellPrice: { toNumber: () => 100800 },
	expectedNetProfit: { toNumber: () => 0.005 },
	createdAt: BigInt(Date.now()),
	status: "OPEN",
}

describe("position.store", () => {
	beforeEach(() => jest.clearAllMocks())

	describe("addPosition", () => {
		it("cria posição quando dentro do limite do plano FREE", async () => {
			mockCount.mockResolvedValue(2)
			mockCreate.mockResolvedValue(mockRow)

			const result = await addPosition("bot-id", "FREE", {
				symbol: "BTCUSDT", buyPrice: 100000, quantity: 0.001,
				sellPrice: 100800, expectedNetProfit: 0.005,
			})

			expect(result).not.toBeNull()
			expect(result?.buyPrice).toBe(100000)
			expect(mockCreate).toHaveBeenCalledTimes(1)
		})

		it("bloqueia quando plano FREE atingiu limite de 3 posições", async () => {
			mockCount.mockResolvedValue(3)

			const result = await addPosition("bot-id", "FREE", {
				symbol: "BTCUSDT", buyPrice: 100000, quantity: 0.001,
				sellPrice: 100800, expectedNetProfit: 0.005,
			})

			expect(result).toBeNull()
			expect(mockCreate).not.toHaveBeenCalled()
		})

		it("não verifica limite para plano PRO", async () => {
			mockCreate.mockResolvedValue(mockRow)

			await addPosition("bot-id", "PRO", {
				symbol: "BTCUSDT", buyPrice: 100000, quantity: 0.001,
				sellPrice: 100800, expectedNetProfit: 0.005,
			})

			expect(mockCount).not.toHaveBeenCalled()
			expect(mockCreate).toHaveBeenCalledTimes(1)
		})
	})

	describe("closePosition", () => {
		it("atualiza status para CLOSED filtrando por botInstanceId", async () => {
			mockUpdateMany.mockResolvedValue({ count: 1 })

			await closePosition("bot-id", "pos-uuid")

			expect(mockUpdateMany).toHaveBeenCalledWith({
				where: { id: "pos-uuid", botInstanceId: "bot-id" },
				data: { status: "CLOSED" },
			})
		})
	})

	describe("getOpenPositions", () => {
		it("busca posições abertas ordenadas por buyPrice desc", async () => {
			mockFindMany.mockResolvedValue([mockRow])

			const result = await getOpenPositions("bot-id")

			expect(mockFindMany).toHaveBeenCalledWith({
				where: { botInstanceId: "bot-id", status: "OPEN" },
				orderBy: { buyPrice: "desc" },
			})
			expect(result).toHaveLength(1)
			expect(result[0].buyPrice).toBe(100000)
		})

		it("retorna array vazio quando não há posições abertas", async () => {
			mockFindMany.mockResolvedValue([])
			expect(await getOpenPositions("bot-id")).toEqual([])
		})
	})

	describe("getClosedPositions", () => {
		it("busca posições fechadas ordenadas por createdAt asc", async () => {
			mockFindMany.mockResolvedValue([])

			await getClosedPositions("bot-id")

			expect(mockFindMany).toHaveBeenCalledWith({
				where: { botInstanceId: "bot-id", status: "CLOSED" },
				orderBy: { createdAt: "asc" },
			})
		})
	})

	describe("getUltimaPositionOpen", () => {
		it("retorna a última posição do array ordenado desc (menor buyPrice)", async () => {
			const row2 = { ...mockRow, id: "pos-2", buyPrice: { toNumber: () => 99000 } }
			mockFindMany.mockResolvedValue([mockRow, row2])

			const result = await getUltimaPositionOpen("bot-id")
			expect(result?.buyPrice).toBe(99000)
		})

		it("retorna undefined quando não há posições", async () => {
			mockFindMany.mockResolvedValue([])
			expect(await getUltimaPositionOpen("bot-id")).toBeUndefined()
		})
	})
})
