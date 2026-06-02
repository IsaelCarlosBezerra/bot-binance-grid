import { binanceClient as defaultClient } from "./client.js"

interface Balance {
	asset: string
	free: string
	locked: string
}

export async function getAccountBalances(client = defaultClient): Promise<Balance[]> {
	await client.useServerTime()
	const account = await client.account()
	return account.balances
}

export async function getAssetBalance(asset: string, client = defaultClient): Promise<number> {
	const balances = await getAccountBalances(client)
	const balance = balances.find((b) => b.asset === asset)
	return !balance ? 0 : Number(balance.free)
}
