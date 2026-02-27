// src/binance/quantity.utils.ts
export function adjustQuantityToStep(quantity, stepSize) {
    const precision = Math.round(Math.log10(1 / stepSize));
    return Number((Math.floor(quantity / stepSize) * stepSize).toFixed(precision));
}
//# sourceMappingURL=quantity.utils.js.map