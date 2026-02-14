// src/strategy/BuyStrategy.ts
import type { IBinanceClient } from "../core/interfaces/IBinanceClient.js"
import type { IPositionStore } from "../core/interfaces/IPositionStore.js"
import type { IAccountService } from "../core/interfaces/IAccountService.js"
import type { IFilterService } from "../core/interfaces/IFilterService.js"
import { validateAndAdjustOrder } from "../binance/order.validator.js"

export class BuyStrategy {
	constructor(
		private binanceClient: IBinanceClient,
		private store: IPositionStore,
		private accountService: IAccountService,
		private filterService: IFilterService,
		private config: any,
	) {}

	async execute(currentPrice: number, strategyState: any): Promise<boolean> {
		// 1. Regra de Negócio Pura
		if (!strategyState.precoCompra?.comprar(currentPrice)) {
			return false
		}

		// 2. Verificação de Saldo via Interface
		const freeBalance = await this.accountService.getFreeBalance("USDT")
		if (freeBalance <= 0) {
			console.log("❌ Falha na estratégia: Saldo insuficiente.")
			return false
		}

		// 3. Cálculo de Volume
		const buyValue = freeBalance * this.config.buyPercentageOfBalance
		const rawQuantity = buyValue / currentPrice

		// 4. Filtros via Interface
		const filters = await this.filterService.getSymbolFilters(this.config.symbol)
		const validation = validateAndAdjustOrder({
			quantity: rawQuantity,
			price: currentPrice,
			filters,
		})

		if (!validation.valid || !validation.quantity) {
			console.log("❌ Falha na validação da ordem:", validation.reason)
			return false
		}

		// 5. Execução
		await this.binanceClient.marketBuy(this.config.symbol, validation.quantity)

		// 6. Persistência
		const sellPrice = strategyState.precoVenda!.calcularProximoPrecoVenda(currentPrice)

		this.store.addPosition({
			symbol: this.config.symbol,
			buyPrice: currentPrice,
			quantity: validation.quantity,
			sellPrice,
			expectedNetProfit: this.config.targetNetProfit,
		})

		return true
	}
}
