// src/infrastructure/BinanceAccountService.ts
import type { IAccountService } from "../core/interfaces/IAccountService.js"
import { getAssetBalance } from "../binance/account.service.js"

export class BinanceAccountService implements IAccountService {
	async getFreeBalance(asset: string): Promise<number> {
		const balance = await getAssetBalance(asset)
		return balance ? Number(balance.free) : 0
	}
}
