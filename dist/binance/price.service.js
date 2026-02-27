import { binanceClient } from "./client.js";
export async function getCurrentPrice(symbol) {
    await binanceClient.useServerTime();
    const prices = await binanceClient.prices(symbol);
    return Number(prices[symbol]);
}
//# sourceMappingURL=price.service.js.map