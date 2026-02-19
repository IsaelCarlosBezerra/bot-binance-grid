// src/strategy/buy.strategy.ts
import { BotConfig } from "../config/bot.config.js"
import { priceBuffer } from "../core/price-buffer.js"
import { binanceClient } from "../binance/client.js"
import { getAssetBalance } from "../binance/account.service.js"
import { getSymbolFilters } from "../binance/filters.js"
import { validateAndAdjustOrder } from "../binance/order.validator.js"
import { addPosition, closePosition } from "../positions/position.store.js"
import { strategyState } from "../core/strategy-state.js"
import { stopCycle } from "../core/cycle-runner.js"
import { verificaBuffer } from "../core/utils/verificaBuffer.js"
import { calcularPrecoVenda } from "../core/utils/calcularPrecoVenda.js"
import { atualizarState } from "../core/utils/atualizarState.js"

export async function tryBuy(): Promise<boolean> {
	if (!verificaBuffer()) return false

	const currentPrice = priceBuffer.getPrice()

	if (strategyState.nextBuyPrice > currentPrice) {
		// =====================================================
		// SALDO DISPONÍVEL (USDT)
		// =====================================================
		const freeBalance = await getAssetBalance("USDT")
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
		const sellPrice = calcularPrecoVenda(currentPrice)

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

		//Atualiza balance no state
		const newBalance = freeBalance - currentPrice * quantity
		atualizarState(newBalance)

		console.log(
			`🟢 COMPRA EXECUTADA | qty=${quantity} | price=${currentPrice} | sell=${sellPrice}`,
		)
		return true
	} else return false
}
