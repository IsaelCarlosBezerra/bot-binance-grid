import { jest } from "@jest/globals"
import {
	classifyBuyPrecheck,
	isRetryableExecutionError,
	retryOperation,
} from "../bot/trade-safety.js"

describe("trade-safety", () => {
	describe("classifyBuyPrecheck", () => {
		it("marca saldo insuficiente como skip seguro", () => {
			const result = classifyBuyPrecheck(0, { valid: true, quantity: 1 })

			expect(result).toEqual({
				reason: "INSUFFICIENT_BALANCE",
				message: "Saldo insuficiente para executar a compra",
			})
		})

		it("marca validação inválida como skip seguro", () => {
			const result = classifyBuyPrecheck(100, { valid: false, reason: "MIN_NOTIONAL" })

			expect(result).toEqual({
				reason: "INVALID_ORDER",
				message: "MIN_NOTIONAL",
			})
		})

		it("retorna null quando pode comprar", () => {
			const result = classifyBuyPrecheck(100, { valid: true, quantity: 0.001 })

			expect(result).toBeNull()
		})
	})

	describe("isRetryableExecutionError", () => {
		it("identifica erro transitório de rede", () => {
			expect(isRetryableExecutionError(new Error("ECONNRESET while calling Binance"))).toBe(true)
		})

		it("não marca erro de negócio como retryable", () => {
			expect(isRetryableExecutionError(new Error("MIN_NOTIONAL"))).toBe(false)
		})
	})

	describe("retryOperation", () => {
		it("tenta novamente quando o erro é transitório e depois resolve", async () => {
			const operation = jest
				.fn()
				.mockRejectedValueOnce(new Error("ECONNRESET"))
				.mockRejectedValueOnce(new Error("timeout"))
				.mockResolvedValue("ok")

			const result = await retryOperation(operation, { attempts: 3, delayMs: 0 })

			expect(result).toBe("ok")
			expect(operation).toHaveBeenCalledTimes(3)
		})

		it("não tenta novamente quando o erro não é retryable", async () => {
			const operation = jest.fn().mockRejectedValue(new Error("MIN_NOTIONAL"))

			await expect(retryOperation(operation, { attempts: 3, delayMs: 0 })).rejects.toThrow("MIN_NOTIONAL")
			expect(operation).toHaveBeenCalledTimes(1)
		})
	})
})
