// src/strategy/sell.strategy.ts
import { binanceClient } from "../binance/client.js";
import { priceBuffer } from "../core/price-buffer.js";
import { strategyState } from "../core/strategy-state.js";
import { atualizarState } from "../core/utils/atualizarState.js";
import { verificaBuffer } from "../core/utils/verificaBuffer.js";
import { closePosition } from "../positions/position.store.js";
export async function trySell() {
    if (!verificaBuffer())
        return false;
    const currentPrice = priceBuffer.getPrice();
    if (!currentPrice)
        return false;
    // Processa em ordem de criação (FIFO)
    if (strategyState.ultimaPosicaoAberta && strategyState.nextSellPrice <= currentPrice) {
        const position = strategyState.ultimaPosicaoAberta;
        // Executa venda por quantidade
        await binanceClient.marketSell(position.symbol, position.quantity);
        closePosition(position.id);
        console.log(`✅ VENDA EXECUTADA | qty=${position.quantity} | price=${currentPrice}`);
        //Atualiza balance no state
        const newBalance = strategyState.balance + currentPrice * position.quantity;
        atualizarState(newBalance);
        return true;
    }
    return false;
}
//# sourceMappingURL=sell.strategy.js.map