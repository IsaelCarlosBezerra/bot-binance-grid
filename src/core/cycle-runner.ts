// src/core/cycle-runner.ts
import { BotConfig } from "../config/bot.config.js"
import { runDecisionCycle } from "./decision-engine.js"

let intervalId: NodeJS.Timeout | null = null

export function startCycle() {
	if (intervalId) return

	console.log("▶️ Ciclo do bot iniciado")

	intervalId = setInterval(async () => {
		try {
			await runDecisionCycle()
		} catch (error) {
			console.error("Erro no ciclo:", error)
		}
	}, BotConfig.cycleIntervalMs)
}

export function stopCycle() {
	if (!intervalId) return

	clearInterval(intervalId)
	intervalId = null

	console.log("⏸️ Ciclo do bot pausado")
}
