// src/positions/position.store.ts
import fs from "fs"
import path from "path"
import type { Position, PositionStatus } from "./position.model.js"
import { randomUUID } from "crypto"

const DATA_DIR = path.resolve(process.cwd(), "data")
const FILE_PATH = path.join(DATA_DIR, "positions.json")

// 🟢 O CACHE: A variável que o bot consultará em tempo real
let positionsCache: Position[] = []

function ensureDataDir() {
	if (!fs.existsSync(DATA_DIR)) {
		fs.mkdirSync(DATA_DIR)
	}
}

// 🔵 Carrega do disco para o Cache (roda apenas uma vez no início)
function loadFromDisk() {
	ensureDataDir()
	if (!fs.existsSync(FILE_PATH)) {
		positionsCache = []
		return
	}
	const raw = fs.readFileSync(FILE_PATH, "utf-8")
	positionsCache = JSON.parse(raw) as Position[]
}

// 🔵 Salva o Cache no disco (Persistência)
function persist() {
	ensureDataDir()
	fs.writeFileSync(FILE_PATH, JSON.stringify(positionsCache, null, 2))
}

// Inicializa o cache imediatamente ao carregar o módulo
loadFromDisk()

export function addPosition(position: Omit<Position, "id" | "createdAt" | "status">) {
	const newPosition: Position = {
		...position,
		id: randomUUID(),
		createdAt: Date.now(),
		status: "OPEN",
	}

	// Atualiza a RAM e depois o Disco
	positionsCache.push(newPosition)
	persist()

	return newPosition
}

export function closePosition(id: string) {
	const status: PositionStatus = "CLOSED"

	// Atualiza na RAM instantaneamente
	positionsCache = positionsCache.map((p) => (p.id === id ? { ...p, status } : p))

	// Salva no disco
	persist()
}

export function atualizaPriceVendaPosition(id: string, newPrice: number) {
	// Atualiza na RAM instantaneamente
	positionsCache = positionsCache.map((p) => (p.id === id ? { ...p, sellPrice: newPrice } : p))

	// Salva no disco
	persist()
}

export function getOpenPositions(): Position[] {
	// Busca na RAM (muito rápido)
	const openPositions = positionsCache.filter((p) => p.status === "OPEN")
	return openPositions.sort((a, b) => b.buyPrice - a.buyPrice)
}

export function getClosedPositions(): Position[] {
	// Busca na RAM (muito rápido)
	const openPositions = positionsCache.filter((p) => p.status === "CLOSED")
	return openPositions.sort((a, b) => a.createdAt - b.createdAt)
}

export function getAllPositions(): Position[] {
	// Busca na RAM (muito rápido)
	return positionsCache
}

export function getUltimaPositionOpen() {
	// Trabalha apenas com os dados da RAM
	const positions = getOpenPositions()
	//const ordenadas = positions.sort((a, b) => a.createdAt - b.createdAt)
	return positions.at(-1)
}
