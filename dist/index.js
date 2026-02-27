import dotenv from "dotenv";
import { startApi } from "./api/server.js";
import { getAssetBalance } from "./binance/account.service.js";
import { startPriceWebSocket } from "./binance/websocket.js";
import { BotConfig } from "./config/bot.config.js";
import { startCycle } from "./core/cycle-runner.js";
import { executarLiquidacoesPendentesNoReinicio } from "./core/executarLiquidacoesPendentesNoReinicio.js";
import { atualizarState } from "./core/utils/atualizarState.js";
import { verificaBuffer } from "./core/utils/verificaBuffer.js";
dotenv.config();
const PORT = process.env.PORT;
// Inicia WebSocket
startPriceWebSocket();
// Aguarda primeiro preço para reinício inteligente
const waitForPrice = setInterval(async () => {
    if (!verificaBuffer())
        return;
    clearInterval(waitForPrice);
    await executarLiquidacoesPendentesNoReinicio();
    const freeBalance = await getAssetBalance("USDT");
    atualizarState(freeBalance);
    if (BotConfig.enabled) {
        startCycle();
    }
    console.log("🤖 Bot totalmente operacional");
}, 2000);
startApi(PORT || 3000);
//# sourceMappingURL=index.js.map