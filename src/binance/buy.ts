import { BotConfig } from "../config/bot.config.js"
import { priceBuffer } from "../core/price-buffer.js"
import { atualizarState } from "../core/utils/atualizarState.js"
import { calcularPrecoVenda } from "../core/utils/calcularPrecoVenda.js"
import { addPosition } from "../positions/position.store.js"
import { getAssetBalance } from "./account.service.js"
import { binanceClient } from "./client.js"
import { getSymbolFilters } from "./filters.js"
import { validateAndAdjustOrder } from "./order.validator.js"

export async function buy(symbol: string, qtd: number) {
	//Pega valor atual do ativo
	const currentPrice = priceBuffer.getPrice()
	if (!currentPrice) return

	const filters = await getSymbolFilters(symbol)

	const validation = validateAndAdjustOrder({
		quantity: qtd,
		price: currentPrice,
		filters,
	})

	if (!validation.valid || !validation.quantity) {
		console.log("❌ Compra inválida:", validation.reason)
		return false
	}

	const quantity = validation.quantity

	//Calcula valor da compra
	const valorDaCompra = quantity * currentPrice

	//Veifica se tem saldo livre para comprar
	const freeBalance = await getAssetBalance("USDT")
	if (freeBalance < valorDaCompra) {
		console.log("❌ Saldo insuficiente: R$", freeBalance.toFixed(2))
		return false
	}

	//Executar compra
	await binanceClient.marketBuy(symbol, quantity)

	//Calcular Preço Venda
	const sellPrice = calcularPrecoVenda(currentPrice)

	//Registrar Posição
	addPosition({
		symbol: symbol,
		buyPrice: currentPrice,
		quantity,
		sellPrice,
		expectedNetProfit: BotConfig.targetNetProfit,
	})

	//Atualiza balance no state
	const newBalance = freeBalance - currentPrice * quantity
	atualizarState(newBalance)

	console.log(`🟢 COMPRA EXECUTADA | qty=${quantity} | price=${currentPrice} | sell=${sellPrice}`)
	return true
}
