import type { Position } from "../../positions/position.model.js"

export function calcularNovoPrecoVenda(ultimaOrdemAberta: Position | undefined) {
	return {
		newPrecoVenda:
			ultimaOrdemAberta && ultimaOrdemAberta?.sellPrice > 0
				? ultimaOrdemAberta?.sellPrice
				: 0,
	}
}
