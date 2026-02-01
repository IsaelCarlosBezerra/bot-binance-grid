// src/positions/position.model.ts
export type PositionStatus = "OPEN" | "CLOSED"

export interface Position {
	id: string
	symbol: string

	buyPrice: number
	quantity: number

	sellPrice: number

	expectedNetProfit: number

	createdAt: number
	status: PositionStatus
}
