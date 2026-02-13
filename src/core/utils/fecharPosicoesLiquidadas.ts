import { closePosition } from "../../positions/position.store.js"

export function fecharPosicoesLiquidadas(positionsToClose: string[]) {
	for (const id of positionsToClose) {
		closePosition(id)
	}
}
