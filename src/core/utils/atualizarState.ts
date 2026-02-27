import { strategyState } from "../strategy-state.js"
import { buscarDadosParaState } from "./buscarDadosParaState.js"
import { calcularNovoPrecoCompra } from "./calcularNovoPrecoCompra.js"
import { calcularNovoPrecoVenda } from "./calcularNovoPrecoVenda.js"

export function atualizarState(balance: number) {
	const retorno = buscarDadosParaState()
	if (retorno) {
		const { currentyPrice, positionOpen } = retorno
		const { newPrecoCompra } = calcularNovoPrecoCompra(positionOpen, currentyPrice)
		const { newPrecoVenda } = calcularNovoPrecoVenda(positionOpen)

		strategyState.currentPrice = currentyPrice
		strategyState.nextBuyPrice = newPrecoCompra
		strategyState.nextSellPrice = newPrecoVenda
		strategyState.ultimaPosicaoAberta = positionOpen
		strategyState.balance = balance
	}
}
