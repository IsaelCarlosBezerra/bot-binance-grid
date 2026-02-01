// src/core/decision-engine.ts
import { trySell } from "../strategy/sell.strategy.js"
import { tryBuy } from "../strategy/buy.strategy.js"

export async function runDecisionCycle(): Promise<void> {
	// 1️⃣ Tentativa de venda (prioridade absoluta)
	const sold = await trySell()
	if (sold) {
		return // vendeu → encerra ciclo
	}

	// 2️⃣ Tentativa de compra
	await tryBuy()
}
