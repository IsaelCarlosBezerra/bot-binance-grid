import type { Position } from "../../positions/position.model.js"

export class PrecoCompra {
	readonly ultimaPosicaoAberta: Position | undefined
	readonly precoAtual: number
	readonly percentualParaAcao: number
	public precoEsperado: number

	/* constructor(
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
		this.precoEsperado = this.calcular()

		if (this.precoEsperado <= 0) {
			throw new Error("O preço de compra atual deve ser maior que zero.")
		}
	} */

	constructor(
		ultimaPosicaoAberta: Position | undefined,
		precoAtual: number,
		percentualParaAcao: number,
	) {
		// Validações de entrada (Fail Fast)
		if (precoAtual <= 0) throw new Error("O preço atual deve ser maior que zero.")

		// Se o percentual for >= 1 (100%), o preço final seria 0 ou negativo.
		if (percentualParaAcao <= 0 || percentualParaAcao >= 1) {
			throw new Error("O percentual deve estar entre 0 e 1 (ex: 0.01 para 1%).")
		}

		this.ultimaPosicaoAberta = ultimaPosicaoAberta
		this.precoAtual = precoAtual
		this.percentualParaAcao = percentualParaAcao

		// O cálculo agora é garantidamente > 0
		this.precoEsperado = this.calcular()
	}

	private ultimoPrecoComprado() {
		return this.ultimaPosicaoAberta?.buyPrice ?? 0
	}

	private calculaPeloPrecoAtual() {
		return this.precoAtual * (1 - this.percentualParaAcao)
	}

	private calculaPeloUltimoPrecoComprado() {
		const ultimoPrecoComprado = this.ultimoPrecoComprado()

		return ultimoPrecoComprado > 0
			? ultimoPrecoComprado * (1 - this.percentualParaAcao)
			: ultimoPrecoComprado
	}

	/* private calcular() {
		const precoBaseadoNoAtual = this.calculaPeloPrecoAtual()
		const precoBaseadoNoAberto = this.calculaPeloUltimoPrecoComprado()

		// Se não tem preço aberto, usa o atual.
		if (precoBaseadoNoAberto <= 0) {
			return precoBaseadoNoAtual
		}

		// Se tem os dois, usa o menor (estratégia conservadora de Grid/DCA)
		return precoBaseadoNoAtual < precoBaseadoNoAberto
			? precoBaseadoNoAtual
			: precoBaseadoNoAberto
	} */

	private calcular(): number {
		const precoBaseadoNoAtual = this.precoAtual * (1 - this.percentualParaAcao)
		const precoBaseadoNoAberto =
			(this.ultimaPosicaoAberta?.buyPrice ?? 0) * (1 - this.percentualParaAcao)

		// Se houver preço aberto e ele for menor que o cálculo do preço atual,
		// priorizamos ele (estratégia de DCA/Grid).
		if (precoBaseadoNoAberto > 0 && precoBaseadoNoAberto < precoBaseadoNoAtual) {
			return precoBaseadoNoAberto
		}

		return precoBaseadoNoAtual
	}
	valor() {
		return this.precoEsperado
	}

	comprar(precoAtual: number) {
		return precoAtual <= this.valor()
	}

	static criar(
		ultimaPosicaoAberta: Position | undefined,
		precoAtual: number,
		percentualParaAcao: number,
	): PrecoCompra {
		return new PrecoCompra(ultimaPosicaoAberta, precoAtual, percentualParaAcao)
	}
}
