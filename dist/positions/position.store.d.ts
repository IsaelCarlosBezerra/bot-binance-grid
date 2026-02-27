import type { Position } from "./position.model.js";
export declare function addPosition(position: Omit<Position, "id" | "createdAt" | "status">): Position;
export declare function closePosition(id: string): void;
export declare function atualizaPriceVendaPosition(id: string, newPrice: number): void;
export declare function getOpenPositions(): Position[];
export declare function getClosedPositions(): Position[];
export declare function getAllPositions(): Position[];
export declare function getUltimaPositionOpen(): Position | undefined;
//# sourceMappingURL=position.store.d.ts.map