import { criarPrecoCompra } from "../strategy-state.js"
import { buscaDadosParaPrecoCompra } from "./buscaDadosParaPrecoCompra.js"
import { PrecoCompra } from "./PrecoCompra.js"

export function atualizaPrecoCompra() {
	const { ultimaPosicaoAberta, precoAtualReal, percentualParaAcao } = buscaDadosParaPrecoCompra()
	criarPrecoCompra(PrecoCompra.criar(ultimaPosicaoAberta, precoAtualReal, percentualParaAcao))
}
