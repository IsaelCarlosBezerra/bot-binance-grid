import { binanceClient } from "./client.js"

export async function getCurrentPrice(symbol: string): Promise<number> {
	await binanceClient.useServerTime()
	const prices = await binanceClient.prices(symbol)
	return Number(prices[symbol])
}
