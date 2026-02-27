import { binanceClient } from "./client.js";
export async function getAccountBalances() {
    await binanceClient.useServerTime();
    const account = await binanceClient.account();
    return account.balances;
}
export async function getAssetBalance(asset) {
    const balances = await getAccountBalances();
    const balance = balances.find((b) => b.asset === asset);
    const freeBalance = !balance ? 0 : Number(balance?.free);
    return freeBalance;
}
//# sourceMappingURL=account.service.js.map