import Binance from "node-binance-api"
import { BinanceConfig } from "../config/binance.config.js"

export const binanceClient = new Binance().options({
	APIKEY: BinanceConfig.apiKey,
	APISECRET: BinanceConfig.apiSecret,
	useServerTime: true,
	recvWindow: 60000,
	test: BinanceConfig.testnet,
	urls: {
		base: BinanceConfig.baseUrl,
		stream: BinanceConfig.wsBaseUrl,
	},
})
