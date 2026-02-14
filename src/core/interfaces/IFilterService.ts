// src/core/interfaces/IFilterService.ts

export interface IFilterService {
	/**
	 * Busca as regras de negociação (min/max qty, casas decimais)
	 * para um par específico (ex: BTCUSDT).
	 */
	getSymbolFilters(symbol: string): Promise<any>
}
