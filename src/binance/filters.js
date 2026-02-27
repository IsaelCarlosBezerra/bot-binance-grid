// src/binance/filters.ts
import { binanceClient } from "./client.js";
export async function getSymbolFilters(symbol) {
    const exchangeInfo = await binanceClient.exchangeInfo();
    const symbolInfo = exchangeInfo.symbols.find((s) => s.symbol === symbol);
    if (!symbolInfo) {
        throw new Error(`Símbolo não encontrado: ${symbol}`);
    }
    const lotSize = symbolInfo.filters.find((f) => f.filterType === "LOT_SIZE");
    const minNotional = symbolInfo.filters.find((f) => f.filterType === "NOTIONAL");
    if (!lotSize || !minNotional) {
        throw new Error(`Filtros obrigatórios não encontrados para ${symbol}`);
    }
    return {
        minQty: Number(lotSize.minQty),
        maxQty: Number(lotSize.maxQty),
        stepSize: Number(lotSize.stepSize),
        minNotional: Number(minNotional.minNotional),
    };
}
//# sourceMappingURL=filters.js.map