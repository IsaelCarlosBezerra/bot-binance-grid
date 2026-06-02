import Binance from "node-binance-api"
import type { Position } from "../positions/position.model.js"

export interface BotConfig {
	cycleIntervalMs: number
	buyPercentageOfBalance: number
	targetNetProfit: number
	grossTargetPercentage: number
	dropPercentage: number
	symbol: string
	buyReferenceMode: "ANCHOR" | "LAST_BUY"
	enabled: boolean
}

export interface BotState {
	currentPrice: number
	nextBuyPrice: number
	nextSellPrice: number
	isProcessing: boolean
	ultimaPosicaoAberta: Position | undefined
	balance: number
}

export class BotRuntime {
	readonly instanceId: string
	readonly userId: string
	readonly plan: "FREE" | "PRO"
	config: BotConfig
	state: BotState
	client: ReturnType<typeof Binance.prototype.options>
	private _price: number | null = null
	private _isRunning = false
	private _timeoutId: NodeJS.Timeout | null = null

	constructor(params: {
		instanceId: string
		userId: string
		plan: "FREE" | "PRO"
		config: BotConfig
		apiKey: string
		apiSecret: string
		testnet: boolean
	}) {
		this.instanceId = params.instanceId
		this.userId = params.userId
		this.plan = params.plan
		this.config = params.config
		this.state = {
			currentPrice: 0,
			nextBuyPrice: 0,
			nextSellPrice: 0,
			isProcessing: false,
			ultimaPosicaoAberta: undefined,
			balance: 0,
		}

		const options: Record<string, unknown> = {
			APIKEY: params.apiKey,
			APISECRET: params.apiSecret,
			useServerTime: true,
			recvWindow: 60000,
			test: params.testnet,
		}

		if (params.testnet) {
			options.urls = {
				base: "https://testnet.binance.vision",
				stream: "wss://testnet.binance.vision/ws",
			}
		}

		this.client = new Binance().options(options)
	}

	updatePrice(price: number): void {
		this._price = price
		this.state.currentPrice = price
	}

	getPrice(): number {
		if (this._price === null) throw new Error("Preço não disponível no buffer")
		return this._price
	}

	isPriceReady(): boolean {
		return this._price !== null
	}

	get isRunning(): boolean {
		return this._isRunning
	}

	async start(): Promise<void> {
		if (this._isRunning) return
		this._isRunning = true
		console.log(`▶️ [${this.userId}] Bot iniciado (${this.config.symbol})`)
		await this._loop()
	}

	stop(): void {
		this._isRunning = false
		if (this._timeoutId) {
			clearTimeout(this._timeoutId)
			this._timeoutId = null
		}
		console.log(`⏹️ [${this.userId}] Bot pausado`)
	}

	private async _loop(): Promise<void> {
		if (!this._isRunning) return
		try {
			await this._runCycle()
		} catch (error) {
			console.error(`❌ [${this.userId}] Erro no ciclo:`, error)
		}
		if (this._isRunning) {
			this._timeoutId = setTimeout(() => this._loop(), this.config.cycleIntervalMs)
		}
	}

	private async _runCycle(): Promise<void> {
		if (this.state.isProcessing) return
		this.state.isProcessing = true
		try {
			const { runDecisionCycleForInstance } = await import("./bot-cycle.js")
			await runDecisionCycleForInstance(this)
		} finally {
			this.state.isProcessing = false
		}
	}
}
