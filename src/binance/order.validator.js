import { adjustQuantityToStep } from "./quantity.utils.js";
export function validateAndAdjustOrder({ quantity, price, filters }) {
    const adjustedQty = adjustQuantityToStep(quantity, filters.stepSize);
    const notional = adjustedQty * price;
    if (adjustedQty < filters.minQty) {
        return { valid: false, reason: "Quantidade menor que minQty" };
    }
    if (notional < filters.minNotional) {
        return { valid: false, reason: "Valor menor que MIN_NOTIONAL" };
    }
    return { valid: true, quantity: adjustedQty };
}
//# sourceMappingURL=order.validator.js.map