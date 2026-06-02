import type { BotRuntime } from "./bot-runtime.js"
import {
	addPosition,
	closePosition,
	getOpenPositions,
	getUltimaPositionOpen,
} from "../positions/position.store.js"

// ─── Helpers de cálculo ────────────────────────────────────────────────────

export function calcularPrecoVenda(currentPrice: number, grossTargetPercentage: number): number {
	return currentPrice / (1 - grossTargetPercentage)
}

export function calcularNovoPrecoCompra(
	ultimaOrdem: { buyPrice: number } | undefined,
	precoAtual: number,
	dropPercentage: number,
): number {
	const peloPrecoAtual = precoAtual * (1 - dropPercentage)
	const pelaUltimaCompra = ultimaOrdem ? ultimaOrdem.buyPrice * (1 - dropPercentage) : 0
	return peloPrecoAtual > pelaUltimaCompra ? pelaUltimaCompra : peloPrecoAtual
}

async function atualizarState(bot: BotRuntime, balance: number): Promise<void> {
	const ultimaPosicaoAberta = await getUltimaPositionOpen(bot.instanceId)
	const precoAtual = bot.getPrice()

	const newPrecoCompra = calcularNovoPrecoCompra(
		ultimaPosicaoAberta,
		precoAtual,
		bot.config.dropPercentage,
	)
	const newPrecoVenda = ultimaPosicaoAberta?.sellPrice ?? 0

	bot.state.currentPrice = precoAtual
	bot.state.nextBuyPrice = newPrecoCompra
	bot.state.nextSellPrice = newPrecoVenda
	bot.state.ultimaPosicaoAberta = ultimaPosicaoAberta
	bot.state.balance = balance
}

// ─── Calibrar preço de compra ─────────────────────────────────────────────

function calibrarPrecoCompra(bot: BotRuntime): void {
	const precoAtual = bot.getPrice()
	const precoCompraAtual = bot.state.nextBuyPrice
	const diferenca = ((precoAtual - precoCompraAtual) / precoAtual) * 100
	if (diferenca > 1) {
		bot.state.nextBuyPrice = precoAtual * (1 - bot.config.dropPercentage)
	}
}

// ─── Estratégia de venda ──────────────────────────────────────────────────

async function trySell(bot: BotRuntime): Promise<boolean> {
	if (!bot.isPriceReady()) return false

	const currentPrice = bot.getPrice()
	const { ultimaPosicaoAberta, nextSellPrice } = bot.state

	if (ultimaPosicaoAberta && nextSellPrice <= currentPrice) {
		const position = ultimaPosicaoAberta
		await bot.client.marketSell(position.symbol, position.quantity)
		await closePosition(bot.instanceId, position.id)

		const newBalance = bot.state.balance + currentPrice * position.quantity
		await atualizarState(bot, newBalance)

		console.log(`✅ [${bot.userId}] VENDA | qty=${position.quantity} | price=${currentPrice}`)
		return true
	}

	return false
}

// ─── Estratégia de compra ─────────────────────────────────────────────────

async function tryBuy(bot: BotRuntime): Promise<boolean> {
	if (!bot.isPriceReady()) return false

	const currentPrice = bot.getPrice()
	if (bot.state.nextBuyPrice <= currentPrice) return false

	const { getAssetBalance } = await import("../binance/account.service.js")
	const { getSymbolFilters } = await import("../binance/filters.js")
	const { validateAndAdjustOrder } = await import("../binance/order.validator.js")

	const freeBalance = await getAssetBalance("USDT", bot.client)
	if (freeBalance <= 0) {
		bot.stop()
		return false
	}

	const buyValue = freeBalance * bot.config.buyPercentageOfBalance
	const rawQuantity = buyValue / currentPrice
	const filters = await getSymbolFilters(bot.config.symbol, bot.client)
	const validation = validateAndAdjustOrder({ quantity: rawQuantity, price: currentPrice, filters })

	if (!validation.valid || !validation.quantity) {
		console.log(`❌ [${bot.userId}] Compra inválida: ${validation.reason}`)
		bot.stop()
		return false
	}

	const quantity = validation.quantity
	await bot.client.marketBuy(bot.config.symbol, quantity)

	const sellPrice = calcularPrecoVenda(currentPrice, bot.config.grossTargetPercentage)
	const added = await addPosition(bot.instanceId, bot.plan, {
		symbol: bot.config.symbol,
		buyPrice: currentPrice,
		quantity,
		sellPrice,
		expectedNetProfit: bot.config.targetNetProfit,
	})

	if (added) {
		const newBalance = freeBalance - currentPrice * quantity
		await atualizarState(bot, newBalance)
		console.log(`🟢 [${bot.userId}] COMPRA | qty=${quantity} | price=${currentPrice} | sell=${sellPrice}`)
	}

	return !!added
}

// ─── Ciclo principal ──────────────────────────────────────────────────────

export async function runDecisionCycleForInstance(bot: BotRuntime): Promise<void> {
	if (!bot.isPriceReady()) return

	calibrarPrecoCompra(bot)

	const sold = await trySell(bot)
	if (sold) return

	await tryBuy(bot)
}
