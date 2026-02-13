// src/strategy/buy.strategy.ts

import { BotConfig } from "../config/bot.config.js"
import { priceBuffer } from "../core/price-buffer.js"
import { binanceClient } from "../binance/client.js"
import { getAssetBalance } from "../binance/account.service.js"
import { getSymbolFilters } from "../binance/filters.js"
import { validateAndAdjustOrder } from "../binance/order.validator.js"
import { addPosition } from "../positions/position.store.js"
import { strategyState } from "../core/strategy-state.js"
import { stopCycle } from "../core/cycle-runner.js"
import { verificaBuffer } from "../core/utils/verificaBuffer.js"
import { atualizaPrecoCompra } from "../core/utils/atualizaPrecoCompra.js"
import { atualizaPrecoVenda } from "../core/utils/atualizaPrecoVenda.js"

export async function tryBuy(): Promise<boolean> {
	if (!verificaBuffer()) return false

	const currentPrice = priceBuffer.getPrice()

	if (!strategyState.precoCompra!.comprar(currentPrice)) {
		return false
	}

	// =====================================================
	// SALDO DISPONÍVEL (USDT)
	// =====================================================
	const balance = await getAssetBalance("USDT")
	if (!balance) {
		stopCycle()
		return false
	}

	const freeBalance = Number(balance.free)
	if (freeBalance <= 0) {
		stopCycle()
		return false
	}

	// =====================================================
	// VALOR DA COMPRA (% DO SALDO)
	// =====================================================
	const buyValue = freeBalance * BotConfig.buyPercentageOfBalance

	// =====================================================
	// CONVERTER PARA QUANTIDADE
	// =====================================================
	const rawQuantity = buyValue / currentPrice

	// =====================================================
	// VALIDAR LIMITES BINANCE
	// =====================================================
	const filters = await getSymbolFilters(BotConfig.symbol)

	const validation = validateAndAdjustOrder({
		quantity: rawQuantity,
		price: currentPrice,
		filters,
	})

	if (!validation.valid || !validation.quantity) {
		console.log("❌ Compra inválida:", validation.reason)
		stopCycle()
		return false
	}

	const quantity = validation.quantity

	// =====================================================
	// EXECUTAR COMPRA (MARKET)
	// =====================================================
	await binanceClient.marketBuy(BotConfig.symbol, quantity)

	// =====================================================
	// CALCULAR PREÇO DE VENDA
	// =====================================================
	const sellPrice = strategyState.precoVenda!.calcularProximoPrecoVenda(currentPrice)

	// =====================================================
	// REGISTRAR POSIÇÃO
	// =====================================================
	addPosition({
		symbol: BotConfig.symbol,
		buyPrice: currentPrice,
		quantity,
		sellPrice,
		expectedNetProfit: BotConfig.targetNetProfit,
	})

	console.log(`🟢 COMPRA EXECUTADA | qty=${quantity} | price=${currentPrice} | sell=${sellPrice}`)

	atualizaPrecoVenda()
	atualizaPrecoCompra()

	return true
}
