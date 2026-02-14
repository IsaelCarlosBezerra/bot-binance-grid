// src/infrastructure/BinanceFilterService.ts
import type { IFilterService } from "../core/interfaces/IFilterService.js"
import { getSymbolFilters } from "../binance/filters.js"

export class BinanceFilterService implements IFilterService {
	async getSymbolFilters(symbol: string): Promise<any> {
		return await getSymbolFilters(symbol)
	}
}
