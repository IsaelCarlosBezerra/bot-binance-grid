import { BotConfig } from "../../config/bot.config.js"
import type { Position } from "../../positions/position.model.js"

export function calcularNovoPrecoCompra(
	ultimaOrdemAberta: Position | undefined,
	precoAtual: number,
) {
	const peloPrecoAtual = precoAtual * (1 - BotConfig.dropPercentage)

	const pelaUltimaCompra = ultimaOrdemAberta
		? ultimaOrdemAberta?.buyPrice * (1 - BotConfig.dropPercentage)
		: 0
	return { newPrecoCompra: peloPrecoAtual > pelaUltimaCompra ? pelaUltimaCompra : peloPrecoAtual }
}
