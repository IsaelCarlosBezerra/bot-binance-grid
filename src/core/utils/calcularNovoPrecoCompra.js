import { BotConfig } from "../../config/bot.config.js";
export function calcularNovoPrecoCompra(ultimaOrdemAberta, precoAtual) {
    const peloPrecoAtual = precoAtual * (1 - BotConfig.dropPercentage);
    const pelaUltimaCompra = ultimaOrdemAberta
        ? ultimaOrdemAberta?.buyPrice * (1 - BotConfig.dropPercentage)
        : 0;
    return { newPrecoCompra: peloPrecoAtual > pelaUltimaCompra ? pelaUltimaCompra : peloPrecoAtual };
}
//# sourceMappingURL=calcularNovoPrecoCompra.js.map