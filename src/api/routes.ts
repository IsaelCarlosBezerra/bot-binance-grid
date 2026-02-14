import type { Express } from "express"
import { BotConfig } from "../config/bot.config.js"
import { startCycle, stopCycle } from "../core/cycle-runner.js"
import { getAllPositions } from "../positions/position.store.js"
import { strategyState } from "../core/strategy-state.js"
import { generateTradeSummary } from "../reports/trade-report.js"

export function registerRoutes(app: Express) {
	app.get("/status", (_req, res) => {
		const positions = getAllPositions()
		const summary = generateTradeSummary(positions)

		// Extraímos os valores das instâncias das classes
		const precoAtual = strategyState.precoCompra?.precoAtual

		// Pegamos o alvo de compra e venda chamando os métodos das classes
		const alvoCompra = strategyState.precoCompra ? strategyState.precoCompra.valor() : null
		const alvoVenda = strategyState.precoVenda ? strategyState.precoVenda.valor() : null

		res.json({
			enabled: BotConfig.enabled,
			config: BotConfig,
			openPositions: positions.filter((p) => p.status === "OPEN"),
			strategy: {
				currentPrice: precoAtual,
				nextBuyPrice: alvoCompra,
				nextSellPrice: alvoVenda,
				isProcessing: strategyState.isProcessing,
			},
			summary,
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
}
