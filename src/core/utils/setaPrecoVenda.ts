import type { Position } from "../../positions/position.model.js"
import { validaPrecoVenda } from "./validaPrecoVenda.js"

export function setaPrecoVenda(
	posicoesAbertas: Position[],
	precoAtual: number,
	percentualParaAcao: number,
	precoVendaAberto: number,
) {
	if (
		posicoesAbertas.length === 0 ||
		!validaPrecoVenda(precoAtual, precoVendaAberto, percentualParaAcao)
	) {
		return null
	} else {
		return precoVendaAberto
	}
}
