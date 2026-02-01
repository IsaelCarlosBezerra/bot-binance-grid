import { binanceClient } from "./client.js"

interface Balance {
	asset: string
	free: string
	locked: string
}

export async function getAccountBalances(): Promise<Balance[]> {
	await binanceClient.useServerTime()
	const account = await binanceClient.account()
	return account.balances
}

export async function getAssetBalance(asset: string) {
	const balances = await getAccountBalances()
	return balances.find((b) => b.asset === asset)
}
