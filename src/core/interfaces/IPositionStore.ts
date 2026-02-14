import type { Position } from "../../positions/position.model.js"

export interface IPositionStore {
	getOpenPositions(): Position[]
	getUltimaPositionOpen(): Position | undefined
	addPosition(position: any): void
	closePosition(id: string): void
}
