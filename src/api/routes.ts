import type { Express } from "express"
import { BotConfig } from "../config/bot.config.js"
import { startCycle, stopCycle } from "../core/cycle-runner.js"
import { getOpenPositions } from "../positions/position.store.js"
import { strategyState } from "../core/strategy-state.js"
import { loadPositions } from "../positions/position.store.js"
import { generateTradeSummary } from "../reports/trade-report.js"

export function registerRoutes(app: Express) {
	app.get("/status", (_req, res) => {
		const positions = loadPositions()
		const summary = generateTradeSummary(positions)

		res.json({
			enabled: BotConfig.enabled,
			config: BotConfig,
			openPositions: positions.filter((p) => p.status === "OPEN"),
			strategy: strategyState, // 🔴 NÃO REMOVER
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
