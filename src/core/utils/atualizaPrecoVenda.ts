import { criarPrecoVenda } from "../strategy-state.js"
import { buscaDadosParaPrecoVenda } from "./buscaDadosParaPrecoVenda.js"
import { PrecoVenda } from "./PrecoVenda.js"

export function atualizaPrecoVenda() {
	const { ultimaPosicaoAberta, precoAtualReal, percentualParaAcao } = buscaDadosParaPrecoVenda()
	criarPrecoVenda(PrecoVenda.criar(ultimaPosicaoAberta, precoAtualReal, percentualParaAcao))
}
