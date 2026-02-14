export interface IBinanceClient {
	marketSell(symbol: string, quantity: number): Promise<void>
	marketBuy(symbol: string, quantity: number): Promise<void>
}
