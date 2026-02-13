export function validaPrecoVenda(
	precoAtualReal: number,
	precoVendaAberto: number,
	percentualParaAcao: number,
) {
	const precoAtualCalculado = precoVendaAberto * (1 - percentualParaAcao)
	return precoAtualCalculado <= precoAtualReal
}
