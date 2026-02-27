import { getUltimaPositionOpen } from "../../positions/position.store.js";
import { priceBuffer } from "../price-buffer.js";
export function buscarDadosParaState() {
    const ultimaPosicaoAberta = getUltimaPositionOpen();
    const precoAtual = priceBuffer.getPrice();
    if (!precoAtual)
        return;
    const positionOpen = ultimaPosicaoAberta;
    const currentyPrice = precoAtual;
    return { positionOpen, currentyPrice };
}
//# sourceMappingURL=buscarDadosParaState.js.map