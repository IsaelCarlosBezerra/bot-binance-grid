import dotenv from "dotenv";
import { startApi } from "./api/server.js";
dotenv.config();
const PORT = Number(process.env.PORT);
// Inicia WebSocket
//startPriceWebSocket()
// Aguarda primeiro preço para reinício inteligente
/* const waitForPrice = setInterval(async () => {
    if (!verificaBuffer()) return

    clearInterval(waitForPrice)

    await executarLiquidacoesPendentesNoReinicio()

    const freeBalance = await getAssetBalance("USDT")
    atualizarState(freeBalance)

    if (BotConfig.enabled) {
        startCycle()
    }

    console.log("🤖 Bot totalmente operacional")
}, 2000)

if (!PORT) {
    throw new Error("PORT não definida pelo ambiente")
} */
startApi(PORT);
//# sourceMappingURL=main.js.map