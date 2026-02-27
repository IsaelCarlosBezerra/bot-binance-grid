interface Balance {
    asset: string;
    free: string;
    locked: string;
}
export declare function getAccountBalances(): Promise<Balance[]>;
export declare function getAssetBalance(asset: string): Promise<number>;
export {};
//# sourceMappingURL=account.service.d.ts.map