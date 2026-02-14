// src/core/interfaces/IAccountService.ts
export interface IAccountService {
	getFreeBalance(asset: string): Promise<number>
}

// src/core/interfaces/IFilterService.ts
export interface IFilterService {
	getSymbolFilters(symbol: string): Promise<any>
}
