import { getClosedPositions, getOpenPositions } from "../positions/position.store.js"

const BINANCE_FEE_RATE = 0.001
const IR_RATE = 0.15

export interface TradeSummary {
	compras: { quantidade: number; valorTotal: number }
	vendas: { quantidade: number; valorTotal: number }
	lucroLiquido: number
	totalTaxas: number
	totalIR: number
}

export interface TradeSummaryAbertos {
	comprasAbertas: { quantidade: number; valorTotal: number }
	vendasAbertas: { quantidade: number; valorTotal: number }
	lucroLiquidoAberto: number
	totalTaxasAberto: number
	totalIRAberto: number
}

export async function generateTradeSummary(botInstanceId: string): Promise<TradeSummary> {
	const closed = await getClosedPositions(botInstanceId)

	let comprasQtd = 0, comprasValor = 0, vendasQtd = 0, vendasValor = 0, totalTaxas = 0, totalIR = 0

	for (const p of closed) {
		const buyValue = p.buyPrice * p.quantity
		const sellValue = p.sellPrice * p.quantity
		comprasQtd++; comprasValor += buyValue
		vendasQtd++; vendasValor += sellValue
		totalTaxas += buyValue * BINANCE_FEE_RATE + sellValue * BINANCE_FEE_RATE
		const lucroBruto = sellValue - buyValue
		totalIR += lucroBruto > 0 ? lucroBruto * IR_RATE : 0
	}

	return {
		compras: { quantidade: comprasQtd, valorTotal: comprasValor },
		vendas: { quantidade: vendasQtd, valorTotal: vendasValor },
		lucroLiquido: vendasValor - comprasValor - totalTaxas - totalIR,
		totalTaxas,
		totalIR,
	}
}

export async function generateTradeSummaryOpen(botInstanceId: string): Promise<TradeSummaryAbertos> {
	const open = await getOpenPositions(botInstanceId)

	let comprasQtd = 0, comprasValor = 0, vendasQtd = 0, vendasValor = 0, totalTaxas = 0, totalIR = 0

	for (const p of open) {
		const buyValue = p.buyPrice * p.quantity
		const sellValue = p.sellPrice * p.quantity
		comprasQtd++; comprasValor += buyValue
		vendasQtd++; vendasValor += sellValue
		totalTaxas += buyValue * BINANCE_FEE_RATE + sellValue * BINANCE_FEE_RATE
		const lucroBruto = sellValue - buyValue
		totalIR += lucroBruto > 0 ? lucroBruto * IR_RATE : 0
	}

	return {
		comprasAbertas: { quantidade: comprasQtd, valorTotal: comprasValor },
		vendasAbertas: { quantidade: vendasQtd, valorTotal: vendasValor },
		lucroLiquidoAberto: vendasValor - comprasValor - totalTaxas - totalIR,
		totalTaxasAberto: totalTaxas,
		totalIRAberto: totalIR,
	}
}
