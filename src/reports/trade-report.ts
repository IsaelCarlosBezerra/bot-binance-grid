import type { Position } from "../positions/position.model.js"

const BINANCE_FEE_RATE = 0.001 // 0,1%
const IR_RATE = 0.15 // 15%

export interface TradeSummary {
	compras: {
		quantidade: number
		valorTotal: number
	}
	vendas: {
		quantidade: number
		valorTotal: number
	}
	lucroLiquido: number
	totalTaxas: number
	totalIR: number
}

export function generateTradeSummary(positions: Position[]): TradeSummary {
	const closed = positions.filter((p) => p.status === "CLOSED")

	let comprasQtd = 0
	let comprasValor = 0

	let vendasQtd = 0
	let vendasValor = 0

	let totalTaxas = 0
	let totalIR = 0

	for (const p of closed) {
		const buyValue = p.buyPrice * p.quantity
		const sellValue = p.sellPrice * p.quantity

		// Compras
		comprasQtd += 1
		comprasValor += buyValue

		// Vendas
		vendasQtd += 1
		vendasValor += sellValue

		// Taxas Binance (compra + venda)
		totalTaxas += buyValue * BINANCE_FEE_RATE
		totalTaxas += sellValue * BINANCE_FEE_RATE

		// Lucro bruto da operação
		const lucroBruto = sellValue - buyValue

		// IR sobre lucro
		totalIR += lucroBruto > 0 ? lucroBruto * IR_RATE : 0
	}

	const lucroLiquido = vendasValor - comprasValor - totalTaxas - totalIR

	return {
		compras: {
			quantidade: comprasQtd,
			valorTotal: comprasValor,
		},
		vendas: {
			quantidade: vendasQtd,
			valorTotal: vendasValor,
		},
		lucroLiquido,
		totalTaxas,
		totalIR,
	}
}
