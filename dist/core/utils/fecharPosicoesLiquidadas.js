import { closePosition } from "../../positions/position.store.js";
export function fecharPosicoesLiquidadas(positionsToClose) {
    for (const id of positionsToClose) {
        closePosition(id);
    }
}
//# sourceMappingURL=fecharPosicoesLiquidadas.js.map