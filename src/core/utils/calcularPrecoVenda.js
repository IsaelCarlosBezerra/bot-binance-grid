import { BotConfig } from "../../config/bot.config.js";
export function calcularPrecoVenda(currentPrice) {
    return currentPrice / (1 - BotConfig.grossTargetPercentage);
}
//# sourceMappingURL=calcularPrecoVenda.js.map