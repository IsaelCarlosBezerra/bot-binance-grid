import type { Position } from "../positions/position.model.js";
export interface StrategyState {
    currentPrice: number;
    nextBuyPrice: number;
    nextSellPrice: number;
    isProcessing: boolean;
    ultimaPosicaoAberta: Position | undefined;
    balance: number;
}
export declare const strategyState: StrategyState;
//# sourceMappingURL=strategy-state.d.ts.map