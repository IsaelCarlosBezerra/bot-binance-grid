import fs from "fs"
import path from "path"
import type { IPositionStore } from "../core/interfaces/IPositionStore.js"
import type { Position, PositionStatus } from "./position.model.js"
import { randomUUID } from "crypto"

export class FilePositionStore implements IPositionStore {
	private positionsCache: Position[] = []
	private readonly filePath: string

	constructor(dataDir: string = "data") {
		this.filePath = path.resolve(process.cwd(), dataDir, "positions.json")
		this.loadFromDisk()
	}

	private loadFromDisk() {
		if (fs.existsSync(this.filePath)) {
			const raw = fs.readFileSync(this.filePath, "utf-8")
			this.positionsCache = JSON.parse(raw)
		}
	}

	private persist() {
		const dir = path.dirname(this.filePath)
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
		fs.writeFileSync(this.filePath, JSON.stringify(this.positionsCache, null, 2))
	}

	addPosition(position: Omit<Position, "id" | "createdAt" | "status">): void {
		const newPosition: Position = {
			...position,
			id: randomUUID(),
			createdAt: Date.now(),
			status: "OPEN",
		}
		this.positionsCache.push(newPosition)
		this.persist()
	}

	closePosition(id: string): void {
		this.positionsCache = this.positionsCache.map((p) =>
			p.id === id ? { ...p, status: "CLOSED" as PositionStatus } : p,
		)
		this.persist()
	}

	getOpenPositions(): Position[] {
		return this.positionsCache.filter((p) => p.status === "OPEN")
	}

	getUltimaPositionOpen(): Position | undefined {
		return this.getOpenPositions()
			.sort((a, b) => a.createdAt - b.createdAt)
			.at(-1)
	}
}
