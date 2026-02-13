import type { Position } from "../../positions/position.model.js"

export class PrecoVenda {
	readonly ultimaPosicaoAberta: Position | undefined
	readonly precoAtual: number
	readonly percentualParaAcao: number
	public precoVendaAtual: number

	constructor(
		ultimaPosicaoAberta: Position | undefined,
		precoAtual: number,
		percentualParaAcao: number,
	) {
		if (precoAtual <= 0) {
			throw new Error("O preço atual deve ser maior que zero.")
		}

		if (percentualParaAcao <= 0) {
			throw new Error("O percentual deve ser maior que zero.")
		}

		this.ultimaPosicaoAberta = ultimaPosicaoAberta
		this.precoAtual = precoAtual
		this.percentualParaAcao = percentualParaAcao
		this.precoVendaAtual = this.calcular()
	}

	private precoVendaAberto() {
		return this.ultimaPosicaoAberta?.sellPrice ?? 0
	}

	calcularProximoPrecoVenda(precoAtual: number) {
		return precoAtual / (1 - this.percentualParaAcao)
	}

	private calcular() {
		const precoAberto = this.precoVendaAberto()
		if (precoAberto === 0) return 0
		const precoCalculado = this.precoAtual / (1 - this.percentualParaAcao)
		return precoCalculado > precoAberto ? precoAberto : precoCalculado
	}

	valor() {
		return this.precoVendaAtual
	}

	vender(precoAtual: number) {
		return this.valor() > 0 && precoAtual >= this.valor()
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
