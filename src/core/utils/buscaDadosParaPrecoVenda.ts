import { BotConfig } from "../../config/bot.config.js"
import { getUltimaPositionOpen } from "../../positions/position.store.js"
import { priceBuffer } from "../price-buffer.js"

export function buscaDadosParaPrecoVenda() {
	const ultimaPosicaoAberta = getUltimaPositionOpen()
	const precoAtualReal = priceBuffer.getPrice()
	const percentualParaAcao = BotConfig.grossTargetPercentage

	return { ultimaPosicaoAberta, precoAtualReal, percentualParaAcao }
}
