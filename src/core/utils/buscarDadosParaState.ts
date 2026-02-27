import type { Position } from "../../positions/position.model.js"
import { getUltimaPositionOpen } from "../../positions/position.store.js"
import { priceBuffer } from "../price-buffer.js"

export function buscarDadosParaState() {
	const ultimaPosicaoAberta = getUltimaPositionOpen()
	const precoAtual = priceBuffer.getPrice()
	if (!precoAtual) return

	const positionOpen: Position = ultimaPosicaoAberta!
	const currentyPrice: number = precoAtual

	return { positionOpen, currentyPrice }
}
