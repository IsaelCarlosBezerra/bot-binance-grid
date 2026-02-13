import { BotConfig } from "../../config/bot.config.js"
import { getUltimaPositionOpen } from "../../positions/position.store.js"
import { priceBuffer } from "../price-buffer.js"

export function buscaDadosParaPrecoCompra() {
	const ultimaPosicaoAberta = getUltimaPositionOpen()
	const precoAtual = priceBuffer.getPrice()
	const percentualParaAcao = BotConfig.dropPercentage

	return { ultimaPosicaoAberta, precoAtual: precoAtual, percentualParaAcao }
}
