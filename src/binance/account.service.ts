interface Balance {
	asset: string
	free: string
	locked: string
}

export async function getAccountBalances(client: any): Promise<Balance[]> {
	await client.useServerTime()
	const account = await client.account()
	return account.balances
}

export async function getAssetBalance(asset: string, client: any): Promise<number> {
	const balances = await getAccountBalances(client)
	const balance = balances.find((b: Balance) => b.asset === asset)
	return !balance ? 0 : Number(balance.free)
}
