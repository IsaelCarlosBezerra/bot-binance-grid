// src/positions/position.store.ts
import fs from "fs"
import path from "path"
import type { Position, PositionStatus } from "./position.model.js"
import { randomUUID } from "crypto"

const DATA_DIR = path.resolve(process.cwd(), "data")
const FILE_PATH = path.join(DATA_DIR, "positions.json")

function ensureDataDir() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR)
	}
}

export function loadPositions(): Position[] {
	ensureDataDir()

	if (!fs.existsSync(FILE_PATH)) {
		return []
	}

	const raw = fs.readFileSync(FILE_PATH, "utf-8")
	return JSON.parse(raw) as Position[]
}

export function savePositions(positions: Position[]) {
	ensureDataDir()
	fs.writeFileSync(FILE_PATH, JSON.stringify(positions, null, 2))
}

export function addPosition(position: Omit<Position, "id" | "createdAt" | "status">) {
	const positions = loadPositions()

	const newPosition: Position = {
		...position,
		id: randomUUID(),
		createdAt: Date.now(),
		status: "OPEN",
	}

	positions.push(newPosition)
	savePositions(positions)

	return newPosition
}

export function closePosition(id: string) {
	const positions = loadPositions()
	const status: PositionStatus = "CLOSED"

	const updated = positions.map((p) => (p.id === id ? { ...p, status } : p))

	savePositions(updated)
}

export function getOpenPositions(): Position[] {
	return loadPositions().filter((p) => p.status === "OPEN")
}

export function getUltimaPositionOpen() {
	const positions = getOpenPositions()
	const ordenadas = positions.sort((a, b) => a.createdAt - b.createdAt)
	return ordenadas.at(-1)
}
