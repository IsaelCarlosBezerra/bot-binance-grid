import { PrismaClient } from "@prisma/client"
import Binance from "node-binance-api"
import { BotRuntime, type BotConfig } from "./bot-runtime.js"
import { decrypt } from "../auth/crypto.service.js"
import { getUltimaPositionOpen, closePosition, getOpenPositions } from "../positions/position.store.js"

const prisma = new PrismaClient()

class BotManager {
	private instances: Map<string, BotRuntime> = new Map()
	private symbolClients: Map<string, ReturnType<typeof Binance.prototype.options>> = new Map()

	async loadAndStart(userId: string): Promise<BotRuntime> {
		const existing = this.instances.get(userId)
		if (existing?.isRunning) return existing

		const dbInstance = await prisma.botInstance.findUnique({
			where: { userId },
			include: { user: { select: { plan: true } } },
		})

		if (!dbInstance) throw new Error("Instância de bot não configurada")

		const apiKey = decrypt(dbInstance.binanceApiKey)
		const apiSecret = decrypt(dbInstance.binanceApiSecret)

		const config: BotConfig = {
			cycleIntervalMs: dbInstance.cycleIntervalMs,
			buyPercentageOfBalance: dbInstance.buyPercentageOfBalance,
			targetNetProfit: dbInstance.targetNetProfit,
			grossTargetPercentage: dbInstance.grossTargetPercentage,
			dropPercentage: dbInstance.dropPercentage,
			symbol: dbInstance.symbol,
			buyReferenceMode: dbInstance.buyReferenceMode as "ANCHOR" | "LAST_BUY",
			enabled: dbInstance.enabled,
		}

		const runtime = new BotRuntime({
			instanceId: dbInstance.id,
			userId,
			plan: dbInstance.user.plan as "FREE" | "PRO",
			config,
			apiKey,
			apiSecret,
			testnet: dbInstance.testnet,
		})

		this.instances.set(userId, runtime)
		this.subscribeToPrice(runtime)

		await this.initializeState(runtime)
		return runtime
	}

	get(userId: string): BotRuntime | undefined {
		return this.instances.get(userId)
	}

	async startBot(userId: string): Promise<void> {
		const runtime = await this.loadAndStart(userId)
		await prisma.botInstance.update({ where: { userId }, data: { enabled: true } })
		runtime.start()
	}

	stopBot(userId: string): void {
		const runtime = this.instances.get(userId)
		if (runtime) {
			runtime.stop()
			prisma.botInstance.update({ where: { userId }, data: { enabled: false } }).catch(() => {})
		}
	}

	remove(userId: string): void {
		const runtime = this.instances.get(userId)
		runtime?.stop()
		this.instances.delete(userId)
	}

	private async initializeState(runtime: BotRuntime): Promise<void> {
		try {
			await this.liquidatePendingOnRestart(runtime)
			const { getAssetBalance } = await import("../binance/account.service.js")
			const balance = await getAssetBalance("USDT", runtime.client)
			const ultimaPosicaoAberta = await getUltimaPositionOpen(runtime.instanceId)
			const precoAtual = runtime.isPriceReady() ? runtime.getPrice() : 0
			const dropPct = runtime.config.dropPercentage
			runtime.state.balance = balance
			runtime.state.ultimaPosicaoAberta = ultimaPosicaoAberta
			if (ultimaPosicaoAberta) {
				runtime.state.nextBuyPrice = ultimaPosicaoAberta.buyPrice * (1 - dropPct)
				runtime.state.nextSellPrice = ultimaPosicaoAberta.sellPrice
			} else if (precoAtual > 0) {
				runtime.state.nextBuyPrice = precoAtual * (1 - dropPct)
			}
		} catch (error) {
			console.error(`⚠️ [${runtime.userId}] Erro ao inicializar estado:`, error)
		}
	}

	private async liquidatePendingOnRestart(runtime: BotRuntime): Promise<void> {
		if (!runtime.isPriceReady()) return

		const currentPrice = runtime.getPrice()
		const openPositions = await getOpenPositions(runtime.instanceId)
		if (openPositions.length === 0) return

		const sorted = [...openPositions].sort((a, b) => a.createdAt - b.createdAt)
		let totalQuantity = 0
		const toClose: string[] = []

		for (const pos of sorted) {
			if (currentPrice >= pos.sellPrice) {
				totalQuantity += pos.quantity
				toClose.push(pos.id)
			} else break
		}

		if (totalQuantity > 0) {
			await runtime.client.marketSell(runtime.config.symbol, totalQuantity)
			for (const id of toClose) await closePosition(runtime.instanceId, id)
			console.log(`🔄 [${runtime.userId}] Reinício | Vendido qty=${totalQuantity}`)
		}
	}

	private subscribeToPrice(runtime: BotRuntime): void {
		const symbol = runtime.config.symbol
		const symbolKey = `${symbol}:${runtime.instanceId}`

		if (this.symbolClients.has(symbolKey)) return

		const client = runtime.client
		this.symbolClients.set(symbolKey, client)

		client.websockets.miniTicker((ticker: Record<string, { close: string }>) => {
			if (ticker[symbol]) {
				const price = Number(ticker[symbol].close)
				if (!Number.isNaN(price)) {
					runtime.updatePrice(price)
				}
			}
		})

		console.log(`📡 [${runtime.userId}] WebSocket ${symbol} iniciado`)
	}
}

export const botManager = new BotManager()
