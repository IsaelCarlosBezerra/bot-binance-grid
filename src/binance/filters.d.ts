export interface SymbolFilters {
    minQty: number;
    maxQty: number;
    stepSize: number;
    minNotional: number;
}
export interface BinanceSymbol {
    symbol: string;
    filters: any[];
}
export declare function getSymbolFilters(symbol: string): Promise<SymbolFilters>;
//# sourceMappingURL=filters.d.ts.map