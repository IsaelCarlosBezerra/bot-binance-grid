import { priceBuffer } from "../price-buffer.js"
import { strategyState } from "../strategy-state.js"
import { verificarSeTemPosicoesAbertas } from "./verificarSeTemPosicoesAbertas.js"
import { BotConfig } from "../../config/bot.config.js"
import { verificaBuffer } from "./verificaBuffer.js"

export function calcularAncora(): void {
	if (!verificaBuffer()) return

	const currentPrice = priceBuffer.getPrice()
	const { result, posicoesAbertas } = verificarSeTemPosicoesAbertas()

	// ==============================
	// CASO 1 — SEM POSIÇÕES
	// ==============================
	if (!result) {
		strategyState.anchorPrice = currentPrice
		console.log("⚓ Âncora definida (início zerado):", currentPrice)
		return
	}

	// ==============================
	// CASO 2 — COM POSIÇÕES
	// ==============================
	const sorted = [...posicoesAbertas].sort((a, b) => a.createdAt - b.createdAt)
	const lastPosition = sorted.at(-1)!

	// último preço esperado de compra
	const lastExpectedBuyPrice = lastPosition.buyPrice * (1 - BotConfig.dropPercentage)

	// Se ancora ainda não existe
	if (!strategyState.anchorPrice) {
		strategyState.anchorPrice = lastExpectedBuyPrice
		console.log("⚓ Âncora inicializada com base na última posição:", lastExpectedBuyPrice)
		return
	}

	// Regra de sincronização anti-loop
	if (strategyState.anchorPrice > lastExpectedBuyPrice) {
		strategyState.anchorPrice = lastExpectedBuyPrice
		console.log("⚓ Âncora ajustada para sincronização:", lastExpectedBuyPrice)
	}
}
