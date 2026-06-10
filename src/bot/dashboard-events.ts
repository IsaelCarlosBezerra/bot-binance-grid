import { EventEmitter } from "node:events"
import type { BotConfig, BotState } from "./bot-runtime.js"
import type { Position } from "../positions/position.model.js"

export interface DashboardConfig {
	id: string
	symbol: string
	testnet: boolean
	enabled: boolean
	cycleIntervalMs: number
	buyPercentageOfBalance: number
	targetNetProfit: number
	grossTargetPercentage: number
	dropPercentage: number
	buyReferenceMode: BotConfig["buyReferenceMode"]
}

export interface DashboardStatus {
	configured: true
	running: boolean
	plan: "FREE" | "PRO"
	config: DashboardConfig
	state: BotState | null
	openPositions: Position[]
}

export type DashboardEvent =
	| {
		type: "state"
		payload: {
			running?: boolean
			config?: Partial<DashboardConfig>
			state?: Partial<BotState>
			openPositions?: Position[]
		}
	}
	| {
		type: "summary"
		payload: {
			summary: unknown
			summaryOpen: unknown
		}
	}
	| {
		type: "snapshot"
		payload: {
			status: DashboardStatus
			summary: unknown
			summaryOpen: unknown
		}
	}

class DashboardEventBus extends EventEmitter {
	emitForUser(userId: string, event: DashboardEvent): boolean {
		return this.emit(userId, event)
	}

	subscribe(userId: string, listener: (event: DashboardEvent) => void): () => void {
		this.on(userId, listener)
		return () => this.off(userId, listener)
	}
}

export const dashboardEvents = new DashboardEventBus()
