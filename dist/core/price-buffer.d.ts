declare class PriceBuffer {
    private price;
    private lastUpdate;
    update(price: number): void;
    getPrice(): number | null;
    getLastUpdate(): number | null;
    isReady(): boolean;
}
export declare const priceBuffer: PriceBuffer;
export {};
//# sourceMappingURL=price-buffer.d.ts.map