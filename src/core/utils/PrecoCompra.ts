import type { Position } from "../../positions/position.model.js"

export class PrecoCompra {
	readonly ultimaPosicaoAberta: Position | undefined
	readonly precoAtualReal: number
	readonly percentualParaAcao: number
	public precoCompraAtual: number

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
		this.precoCompraAtual = this.calcular()
	}

	private ultimoPrecoComprado() {
		return this.ultimaPosicaoAberta?.buyPrice ?? 0
	}

	private calculaPeloPrecoAtual() {
		return this.precoAtualReal * (1 - this.percentualParaAcao)
	}

	private calculaPeloUltimoPrecoComprado() {
		const ultimoPrecoComprado = this.ultimoPrecoComprado()

		return ultimoPrecoComprado > 0
			? ultimoPrecoComprado * (1 - this.percentualParaAcao)
			: ultimoPrecoComprado
	}

	private diferencaEntreUltimoPrecoEPrecoCalculado() {
		if (this.verificaSeTemPosicaoAberta()) {
			const calculadoPeloUltimoPrecoAberto = this.calculaPeloUltimoPrecoComprado()
			const calculadoPeloPrecoAtual = this.calculaPeloPrecoAtual()

			const diferenca =
				(calculadoPeloUltimoPrecoAberto - calculadoPeloPrecoAtual) /
				calculadoPeloUltimoPrecoAberto

			return diferenca
		} else return 0
	}

	private verificaSeTemPosicaoAberta(): boolean {
		return this.ultimaPosicaoAberta && this.ultimaPosicaoAberta.buyPrice > 0 ? true : false
	}

	private calcular() {
		const diferenca = this.diferencaEntreUltimoPrecoEPrecoCalculado()
		if (diferenca > 0) {
			return diferenca > this.percentualParaAcao
				? this.calculaPeloPrecoAtual()
				: this.calculaPeloUltimoPrecoComprado()
		}
		return this.calculaPeloPrecoAtual()
	}

	valor() {
		return this.precoCompraAtual
	}

	comprar(precoAtual: number) {
		return precoAtual <= this.valor()
	}

	static criar(
		ultimaPosicaoAberta: Position | undefined,
		precoAtualReal: number,
		percentualParaAcao: number,
	): PrecoCompra {
		return new PrecoCompra(ultimaPosicaoAberta, precoAtualReal, percentualParaAcao)
	}
}
