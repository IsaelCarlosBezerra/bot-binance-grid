// src/strategy/buy.strategy.ts

import { BotConfig } from "../config/bot.config.js"
import { priceBuffer } from "../core/price-buffer.js"
import { binanceClient } from "../binance/client.js"
import { getAssetBalance } from "../binance/account.service.js"
import { getSymbolFilters } from "../binance/filters.js"
import { validateAndAdjustOrder } from "../binance/order.validator.js"
import { addPosition, getOpenPositions } from "../positions/position.store.js"
import { criarPrecoCompra, strategyState } from "../core/strategy-state.js"
import { calculateNextBuyPrice } from "./buy-price.helper.js"
import { stopCycle } from "../core/cycle-runner.js"
import { verificaBuffer } from "../core/utils/verificaBuffer.js"
import { PrecoCompra } from "../core/utils/PrecoCompra.js"
import { buscaDadosParaPrecoCompra } from "../core/utils/buscaDadosParaPrecoCompra.js"
import { atualizaPrecoCompra } from "../core/utils/atualizaPrecoCompra.js"

export async function tryBuy(): Promise<boolean> {
	if (!verificaBuffer()) return false

	const currentPrice = priceBuffer.getPrice()

	if (currentPrice > strategyState.precoCompra!.valor()) {
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
	const sellPrice = currentPrice * (1 + BotConfig.grossTargetPercentage)

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

	atualizaPrecoCompra()

	return true
}
