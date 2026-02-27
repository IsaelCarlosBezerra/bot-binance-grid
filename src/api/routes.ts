import type { Express } from "express"
import { buy } from "../binance/buy.js"
import { BotConfig } from "../config/bot.config.js"
import { startCycle, stopCycle } from "../core/cycle-runner.js"
import { priceBuffer } from "../core/price-buffer.js"
import { strategyState } from "../core/strategy-state.js"
import { getOpenPositions } from "../positions/position.store.js"
import { generateTradeSummary, generateTradeSummaryOpen } from "../reports/trade-report.js"

export function registerRoutes(app: Express) {
	app.get("/", (req, res) => {
		res.send("API ONLINE")
	})

	app.get("/price", (_req, res) => {
		const newPrice = priceBuffer.getPrice()
		if (!newPrice) return
		res.json({
			price: newPrice,
		})
	})

	app.get("/status", (_req, res) => {
		const summary = generateTradeSummary()
		const openPositions = getOpenPositions()

		// Extraímos os valores das instâncias das classes
		const precoAtual = strategyState.currentPrice

		// Pegamos o alvo de compra e venda chamando os métodos das classes
		const alvoCompra = strategyState.nextBuyPrice
		const alvoVenda = strategyState.nextSellPrice

		res.json({
			enabled: BotConfig.enabled,
			config: BotConfig,
			openPositions: openPositions,
			strategy: {
				currentPrice: precoAtual,
				nextBuyPrice: alvoCompra,
				nextSellPrice: alvoVenda,
				isProcessing: strategyState.isProcessing,
			},
			summary,
		})
	})

	app.get("/sumaryprevisto", (_req, res) => {
		const summary = generateTradeSummaryOpen()

		res.json({
			summary,
		})
	})

	app.get("/alocado", (_req, res) => {
		const openPositions = getOpenPositions()

		const valorAlocado = openPositions.reduce(
			(acc, item) => acc + item.quantity * item.buyPrice,
			0,
		)

		const qtdAlocada = openPositions.reduce((acc, item) => acc + item.quantity, 0)

		res.json({
			valorAlocado,
			qtdAlocada,
		})
	})

	app.get("/balance", (_req, res) => {
		const balance = strategyState.balance
		res.json({
			balance,
		})
	})

	app.post("/start", (_req, res) => {
		BotConfig.enabled = true
		startCycle()
		res.json({ ok: true })
	})

	app.post("/stop", (_req, res) => {
		BotConfig.enabled = false
		stopCycle()
		res.json({ ok: true })
	})

	app.post("/config", (req, res) => {
		Object.assign(BotConfig, req.body)
		res.json({ ok: true, config: BotConfig })
	})

	app.post("/buy", (req, res) => {
		const { symbol, qtd } = req.body
		//const response = { symbol, qtd }
		const response = buy(symbol, qtd)
		return res.json({ response })
	})
}
