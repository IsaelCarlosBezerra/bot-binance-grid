// src/core/runDecisionCycle.ts
import { strategyState } from "./strategy-state.js";
import { trySell } from "../strategy/sell.strategy.js";
import { tryBuy } from "../strategy/buy.strategy.js";
import { calibrarPrecoCompra } from "./utils/calibrarPrecoDeCompra.js";
export async function runDecisionCycle() {
    // 1️⃣ Verifica se já existe um processo em andamento
    if (strategyState.isProcessing) {
        console.log("⏳ Ciclo pulado: Ordem ainda em processamento...");
        return;
    }
    try {
        // 2️⃣ Ativa a trava
        strategyState.isProcessing = true;
        //verificarSePrecoCompraEstaCalibrado
        calibrarPrecoCompra();
        // Tentativa de venda
        const sold = await trySell();
        if (sold)
            return;
        // Tentativa de compra
        await tryBuy();
    }
    catch (error) {
        console.error("❌ Erro crítico no ciclo de decisão:", error);
    }
    finally {
        // 3️⃣ Libera a trava SEMPRE ao final, permitindo o próximo ciclo de 5s
        strategyState.isProcessing = false;
    }
}
//# sourceMappingURL=runDecisionCycle.js.map