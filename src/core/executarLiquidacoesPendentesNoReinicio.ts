// src/core/restart-handler.ts
import { priceBuffer } from "./price-buffer.js"
import { getOpenPositions, closePosition } from "../positions/position.store.js"
import { binanceClient } from "../binance/client.js"
import { BotConfig } from "../config/bot.config.js"
import { verificarSeTemPosicoesAbertas } from "./utils/verificarSeTemPosicoesAbertas.js"
import { fecharPosicoesLiquidadas } from "./utils/fecharPosicoesLiquidadas.js"
import { verificaBuffer } from "./utils/verificaBuffer.js"

export async function executarLiquidacoesPendentesNoReinicio(): Promise<void> {
	if (!verificaBuffer()) return

	const currentPrice = priceBuffer.getPrice()
	const { result, posicoesAbertas } = verificarSeTemPosicoesAbertas()

	if (!result) {
		console.log("ℹ️ Nenhuma posição aberta no reinício")
		return
	}

	// FIFO: mais antigas primeiro
	const sorted = [...posicoesAbertas].sort((a, b) => a.createdAt - b.createdAt)

	let totalQuantity = 0
	const positionsToClose: string[] = []

	for (const position of sorted) {
		if (currentPrice >= position.sellPrice) {
			totalQuantity += position.quantity
			positionsToClose.push(position.id)
		} else {
			break // primeira inviável → para tudo
		}
	}

	if (totalQuantity <= 0) {
		console.log("ℹ️ Nenhuma posição elegível para liquidação")
		return
	}

	//Liquida venda
	await binanceClient.marketSell(BotConfig.symbol, totalQuantity)

	//Fecha vendas liquidadas
	fecharPosicoesLiquidadas(positionsToClose)

	console.log(`🔄 REINÍCIO | Venda consolidada executada | qty=${totalQuantity}`)
}
