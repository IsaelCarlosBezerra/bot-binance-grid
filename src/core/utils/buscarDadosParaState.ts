import { getUltimaPositionOpen } from "../../positions/position.store.js"
import { priceBuffer } from "../price-buffer.js"

export function buscarDadosParaState() {
	const ultimaPosicaoAberta = getUltimaPositionOpen()
	const precoAtual = priceBuffer.getPrice()

	return { ultimaPosicaoAberta, precoAtual }
}
