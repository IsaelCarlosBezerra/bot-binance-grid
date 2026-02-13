import type { Position } from "../../positions/position.model.js"

export class PrecoVenda {
	readonly ultimaPosicaoAberta: Position | undefined
	readonly precoAtualReal: number
	readonly percentualParaAcao: number
	public precoVendaAtual: number
	public proximoPrecoVenda: number

	constructor(
		ultimaPosicaoAberta: Position | undefined,
		precoAtualReal: number,
		percentualParaAcao: number,
	) {
		if (precoAtualReal <= 0) {
			throw new Error("O preço atual deve ser maior que zero.")
		}

		if (percentualParaAcao <= 0) {
			throw new Error("O percentual deve ser maior que zero.")
		}

		this.ultimaPosicaoAberta = ultimaPosicaoAberta
		this.precoAtualReal = precoAtualReal
		this.percentualParaAcao = percentualParaAcao
		this.precoVendaAtual = this.calcular()
		this.proximoPrecoVenda = this.calcularProximoPreco()
	}

	private precoVendaAberto() {
		return this.ultimaPosicaoAberta?.sellPrice ?? 0
	}

	private calcularProximoPreco() {
		return this.precoVendaAtual / (1 - this.percentualParaAcao)
	}

	private calcular() {
		const precoAberto = this.precoVendaAberto()
		const precoCalculado = this.precoAtualReal / (1 - this.percentualParaAcao)
		return precoCalculado > precoAberto ? precoAberto : precoCalculado
	}

	valor() {
		return this.precoVendaAtual
	}

	vender(precoAtual: number) {
		return precoAtual >= this.valor()
	}

	ultimaPosicao() {
		return this.ultimaPosicaoAberta!
	}

	static criar(
		ultimaPosicaoAberta: Position | undefined,
		precoAtualReal: number,
		percentualParaAcao: number,
	): PrecoVenda {
		return new PrecoVenda(ultimaPosicaoAberta, precoAtualReal, percentualParaAcao)
	}
}
