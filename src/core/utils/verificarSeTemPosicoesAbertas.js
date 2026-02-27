import { getOpenPositions } from "../../positions/position.store.js";
export function verificarSeTemPosicoesAbertas() {
    const openPositions = getOpenPositions();
    if (openPositions.length === 0) {
        return { result: false, posicoesAbertas: [] };
    }
    else {
        return {
            result: true,
            posicoesAbertas: openPositions,
        };
    }
}
//# sourceMappingURL=verificarSeTemPosicoesAbertas.js.map