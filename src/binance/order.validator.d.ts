import type { SymbolFilters } from "./filters.js";
interface ValidateOrderParams {
    quantity: number;
    price: number;
    filters: SymbolFilters;
}
export declare function validateAndAdjustOrder({ quantity, price, filters }: ValidateOrderParams): {
    valid: boolean;
    quantity?: number;
    reason?: string;
};
export {};
//# sourceMappingURL=order.validator.d.ts.map