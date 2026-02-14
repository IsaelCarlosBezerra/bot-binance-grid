// src/core/cycle-runner.ts
import { BotConfig } from "../config/bot.config.js"
import { runDecisionCycle } from "./runDecisionCycle.js"

let isRunning = false
let timeoutId: NodeJS.Timeout | null = null

export async function startCycle() {
	if (isRunning) return

	isRunning = true
	console.log("▶️ Ciclo do bot iniciado")

	async function executeLoop() {
		if (!isRunning) return

		try {
			// Executa a lógica de decisão e espera ela terminar
			await runDecisionCycle()
		} catch (error) {
			console.error("❌ Erro no ciclo:", error)
		}

		// Agenda a PRÓXIMA execução para daqui a X milissegundos
		// O relógio só começa a contar DEPOIS que runDecisionCycle terminou
		if (isRunning) {
			timeoutId = setTimeout(executeLoop, BotConfig.cycleIntervalMs)
		}
	}

	// Inicia o primeiro disparo
	executeLoop()
}

export function stopCycle() {
	isRunning = false
	if (timeoutId) {
		clearTimeout(timeoutId)
		timeoutId = null
	}
	console.log("停 Ciclo do bot pausado")
}
