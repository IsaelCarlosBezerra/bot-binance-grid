import { BotConfig } from "../../config/bot.config.js"

export function calcularPrecoVenda(currentPrice: number) {
	return currentPrice / (1 - BotConfig.grossTargetPercentage)
}
