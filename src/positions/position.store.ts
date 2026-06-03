import type { Position, PositionStatus } from "./position.model.js"
import prisma from "../lib/prisma.js"

const PLAN_LIMITS = {
	FREE: 3,
	PRO: Infinity,
}

function toPosition(row: {
	id: string
	symbol: string
	buyPrice: { toNumber: () => number }
	quantity: { toNumber: () => number }
	sellPrice: { toNumber: () => number } | null
	expectedNetProfit: { toNumber: () => number }
	createdAt: bigint
	status: string
}): Position {
	return {
		id: row.id,
		symbol: row.symbol,
		buyPrice: row.buyPrice.toNumber(),
		quantity: row.quantity.toNumber(),
		sellPrice: row.sellPrice?.toNumber() ?? 0,
		expectedNetProfit: row.expectedNetProfit.toNumber(),
		createdAt: Number(row.createdAt),
		status: row.status as PositionStatus,
	}
}

export async function addPosition(
	botInstanceId: string,
	plan: "FREE" | "PRO",
	position: Omit<Position, "id" | "createdAt" | "status">,
): Promise<Position | null> {
	const limit = PLAN_LIMITS[plan]
	if (limit !== Infinity) {
		const openCount = await prisma.tradeOrder.count({
			where: { botInstanceId, status: "OPEN" },
		})
		if (openCount >= limit) {
			console.log(`⚠️ Limite do plano ${plan} atingido (${limit} posições)`)
			return null
		}
	}

	const row = await prisma.tradeOrder.create({
		data: {
			botInstanceId,
			symbol: position.symbol,
			buyPrice: position.buyPrice,
			quantity: position.quantity,
			sellPrice: position.sellPrice,
			expectedNetProfit: position.expectedNetProfit,
			createdAt: BigInt(Date.now()),
			status: "OPEN",
		},
	})
	return toPosition(row)
}

export async function closePosition(botInstanceId: string, id: string): Promise<void> {
	await prisma.tradeOrder.updateMany({
		where: { id, botInstanceId },
		data: { status: "CLOSED" },
	})
}

export async function atualizaPriceVendaPosition(
	botInstanceId: string,
	id: string,
	newPrice: number,
): Promise<void> {
	await prisma.tradeOrder.updateMany({
		where: { id, botInstanceId },
		data: { sellPrice: newPrice },
	})
}

export async function getOpenPositions(botInstanceId: string): Promise<Position[]> {
	const rows = await prisma.tradeOrder.findMany({
		where: { botInstanceId, status: "OPEN" },
		orderBy: { buyPrice: "desc" },
	})
	return rows.map(toPosition)
}

export async function getClosedPositions(botInstanceId: string): Promise<Position[]> {
	const rows = await prisma.tradeOrder.findMany({
		where: { botInstanceId, status: "CLOSED" },
		orderBy: { createdAt: "asc" },
	})
	return rows.map(toPosition)
}

export async function getAllPositions(botInstanceId: string): Promise<Position[]> {
	const rows = await prisma.tradeOrder.findMany({ where: { botInstanceId } })
	return rows.map(toPosition)
}

export async function getUltimaPositionOpen(botInstanceId: string): Promise<Position | undefined> {
	const positions = await getOpenPositions(botInstanceId)
	return positions.at(-1)
}
