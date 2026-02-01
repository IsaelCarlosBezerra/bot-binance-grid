// src/strategy/buy.strategy.ts

import { BotConfig } from "../config/bot.config.js"
import { priceBuffer } from "../core/price-buffer.js"
import { binanceClient } from "../binance/client.js"
import { getAssetBalance } from "../binance/account.service.js"
import { getSymbolFilters } from "../binance/filters.js"
import { validateAndAdjustOrder } from "../binance/order.validator.js"
import { addPosition, getOpenPositions } from "../positions/position.store.js"
import { strategyState } from "../core/strategy-state.js"
import { calculateNextBuyPrice } from "./buy-price.helper.js"
import { stopCycle } from "../core/cycle-runner.js"

export async function tryBuy(): Promise<boolean> {
	// =====================================================
	// PREÇO AINDA NÃO DISPONÍVEL
	// =====================================================
	if (!priceBuffer.isReady()) return false

	const currentPrice = priceBuffer.getPrice()
	const openPositions = getOpenPositions()

	const buyPrice = calculateNextBuyPrice(currentPrice, openPositions)

	// =====================================================
	// GARANTIR QUE A UI SEMPRE TENHA UM VALOR
	// =====================================================
	if (strategyState.nextBuyPrice === null) {
		strategyState.nextBuyPrice = buyPrice
	}

	// =====================================================
	// CONGELAMENTO DE COMPRA (APENAS NO MODO ÂNCORA)
	// =====================================================
	if (BotConfig.buyReferenceMode === "ANCHOR" && openPositions.length > 0) {
		return false
	}

	// =====================================================
	// ATUALIZA PREÇO DE COMPRA QUANDO PERMITIDO
	// =====================================================
	strategyState.nextBuyPrice = buyPrice

	// =====================================================
	// CONDIÇÃO DE COMPRA
	// =====================================================
	if (currentPrice > buyPrice) {
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

	// =====================================================
	// ATUALIZA ÂNCORA APÓS COMPRA (MODO ÂNCORA)
	// =====================================================
	if (BotConfig.buyReferenceMode === "ANCHOR") {
		strategyState.anchorPrice = currentPrice
	}

	return true
}
