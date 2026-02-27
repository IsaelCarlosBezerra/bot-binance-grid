import dotenv from "dotenv";
dotenv.config();
export const BinanceConfig = {
    testnet: true,
    apiKey: process.env.BINANCE_API_KEY || "",
    apiSecret: process.env.BINANCE_API_SECRET || "",
    baseUrl: "https://testnet.binance.vision",
    wsBaseUrl: "wss://testnet.binance.vision/ws",
};
//# sourceMappingURL=binance.config.js.map