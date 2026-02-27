import { strategyState } from "./strategy-state.js";
import { getOpenPositions } from "../positions/position.store.js";
// src/core/price-buffer.ts
class PriceBuffer {
    price = null;
    lastUpdate = null;
    update(price) {
        this.price = price;
        this.lastUpdate = Date.now();
        strategyState.currentPrice = price;
        const openPositions = getOpenPositions();
    }
    getPrice() {
        if (this.price === null) {
            throw new Error("Preço ainda não disponível no buffer");
        }
        return this.price;
    }
    getLastUpdate() {
        return this.lastUpdate;
    }
    isReady() {
        return this.price !== null;
    }
}
export const priceBuffer = new PriceBuffer();
//# sourceMappingURL=price-buffer.js.map