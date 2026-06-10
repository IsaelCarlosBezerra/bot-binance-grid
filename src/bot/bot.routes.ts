import type { Express, Response } from "express"
import { authMiddleware, type AuthRequest } from "../auth/auth.middleware.js"
import { botManager } from "./bot-manager.js"
import { dashboardEvents } from "./dashboard-events.js"
import { encrypt } from "../auth/crypto.service.js"
import {
	getOpenPositions,
	getClosedPositions,
} from "../positions/position.store.js"
import prisma from "../lib/prisma.js"

export function registerBotRoutes(app: Express) {
	// Todas as rotas de bot requerem autenticação
	app.use("/bot", authMiddleware)

	function sendSse(res: Response, event: string, payload: unknown) {
		res.write(`event: ${event}\n`)
		res.write(`data: ${JSON.stringify(payload)}\n\n`)
	}

	// ── Configurar instância (API Keys + config) ──────────────────────────
	app.post("/bot/setup", async (req: AuthRequest, res: Response) => {
		const { binanceApiKey, binanceApiSecret, testnet = false, symbol, ...configFields } = req.body
		const userId = req.user!.userId

		if (!binanceApiKey || !binanceApiSecret) {
			res.status(400).json({ error: "binanceApiKey e binanceApiSecret são obrigatórios" })
			return
		}

		const data = {
			binanceApiKey: encrypt(binanceApiKey),
			binanceApiSecret: encrypt(binanceApiSecret),
			testnet,
			symbol: symbol ?? "BTCUSDT",
			...configFields,
		}

		const instance = await prisma.botInstance.upsert({
			where: { userId },
			create: { userId, ...data },
			update: data,
			select: {
				id: true, symbol: true, testnet: true, enabled: true,
				cycleIntervalMs: true, buyPercentageOfBalance: true,
				targetNetProfit: true, grossTargetPercentage: true,
				dropPercentage: true, buyReferenceMode: true,
			},
		})

		// Recarrega instância se já estava em memória
		botManager.remove(userId)

		res.json({ ok: true, instance })
	})

	app.get("/bot/stream", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId

		const snapshot = await botManager.getDashboardSnapshot(userId)
		if (!snapshot) {
			res.status(404).json({ error: "Bot não configurado. Use POST /bot/setup primeiro." })
			return
		}

		const summary = await botManager.getDashboardSummary(userId)

		res.status(200)
		res.setHeader("Content-Type", "text/event-stream; charset=utf-8")
		res.setHeader("Cache-Control", "no-cache, no-transform")
		res.setHeader("Connection", "keep-alive")
		res.flushHeaders?.()

		sendSse(res, "snapshot", {
			status: snapshot,
			summary: summary?.summary ?? null,
			summaryOpen: summary?.summaryOpen ?? null,
		})

		const unsubscribe = dashboardEvents.subscribe(userId, (event) => {
			sendSse(res, event.type, event.payload)
		})

		req.on("close", () => {
			unsubscribe()
			res.end()
		})
	})

	// ── Status do bot ─────────────────────────────────────────────────────
	app.get("/bot/status", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const snapshot = await botManager.getDashboardSnapshot(userId)

		if (!snapshot) {
			res.status(404).json({ error: "Bot não configurado. Use POST /bot/setup primeiro." })
			return
		}

		res.json(snapshot)
	})

	// ── Iniciar bot ───────────────────────────────────────────────────────
	app.post("/bot/start", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		try {
			await botManager.startBot(userId)
			res.json({ ok: true, message: "Bot iniciado" })
		} catch (error: any) {
			res.status(400).json({ error: error.message })
		}
	})

	// ── Parar bot ─────────────────────────────────────────────────────────
	app.post("/bot/stop", (req: AuthRequest, res: Response) => {
		botManager.stopBot(req.user!.userId)
		res.json({ ok: true, message: "Bot pausado" })
	})

	// ── Atualizar config (sem API keys) ───────────────────────────────────
	app.patch("/bot/config", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const allowed = [
			"symbol", "cycleIntervalMs", "buyPercentageOfBalance",
			"targetNetProfit", "grossTargetPercentage", "dropPercentage", "buyReferenceMode",
		]
		const data: Record<string, unknown> = {}
		for (const key of allowed) {
			if (req.body[key] !== undefined) data[key] = req.body[key]
		}

		const instance = await prisma.botInstance.update({
			where: { userId },
			data,
		})

		// Atualiza config em memória se instância estiver rodando
		const runtime = botManager.get(userId)
		if (runtime) Object.assign(runtime.config, data)

		const snapshot = await botManager.getDashboardSnapshot(userId)
		const summary = await botManager.getDashboardSummary(userId)
		if (snapshot) {
			dashboardEvents.emitForUser(userId, {
				type: "snapshot",
				payload: {
					status: snapshot,
					summary: summary?.summary ?? null,
					summaryOpen: summary?.summaryOpen ?? null,
				},
			})
		}

		res.json({ ok: true, instance })
	})

	// ── Posições ──────────────────────────────────────────────────────────
	app.get("/bot/positions", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const runtime = botManager.get(userId)

		if (!runtime) {
			const dbInstance = await prisma.botInstance.findUnique({ where: { userId } })
			if (!dbInstance) {
				res.status(404).json({ error: "Bot não configurado" })
				return
			}
			const [open, closed] = await Promise.all([
				getOpenPositions(dbInstance.id),
				getClosedPositions(dbInstance.id),
			])
			res.json({ open, closed })
			return
		}

		const [open, closed] = await Promise.all([
			getOpenPositions(runtime.instanceId),
			getClosedPositions(runtime.instanceId),
		])
		res.json({ open, closed })
	})

	// ── Resumo financeiro ─────────────────────────────────────────────────
	app.get("/bot/summary", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const summary = await botManager.getDashboardSummary(userId)

		if (!summary) {
			res.status(404).json({ error: "Bot não configurado" })
			return
		}

		res.json(summary)
	})

	// ── Saldo ─────────────────────────────────────────────────────────────
	app.get("/bot/balance", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		let balance: number
		try {
			balance = await botManager.syncBalance(userId)
		} catch {
			res.status(404).json({ error: "Bot não configurado" })
			return
		}
		res.json({ balance })
	})

	// ── Preço atual ───────────────────────────────────────────────────────
	app.get("/bot/price", (req: AuthRequest, res: Response) => {
		const runtime = botManager.get(req.user!.userId)
		if (!runtime || !runtime.isPriceReady()) {
			res.status(400).json({ error: "Preço não disponível. Bot não está ativo." })
			return
		}
		res.json({ price: runtime.getPrice(), symbol: runtime.config.symbol })
	})

	// ── Compra manual ─────────────────────────────────────────────────────
	app.post("/bot/buy", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const runtime = botManager.get(userId)

		if (!runtime || !runtime.isPriceReady()) {
			res.status(400).json({ error: "Bot não está ativo." })
			return
		}

		const { symbol, qtd } = req.body
		if (!symbol || !qtd) {
			res.status(400).json({ error: "symbol e qtd são obrigatórios" })
			return
		}

		const { getAssetBalance } = await import("../binance/account.service.js")
		const { getSymbolFilters } = await import("../binance/filters.js")
		const { validateAndAdjustOrder } = await import("../binance/order.validator.js")
		const { addPosition } = await import("../positions/position.store.js")

		const currentPrice = runtime.getPrice()
		const filters = await getSymbolFilters(symbol, runtime.client)
		const validation = validateAndAdjustOrder({ quantity: Number(qtd), price: currentPrice, filters })

		if (!validation.valid || !validation.quantity) {
			res.status(400).json({ error: validation.reason })
			return
		}

		const freeBalance = await getAssetBalance("USDT", runtime.client)
		if (freeBalance < validation.quantity * currentPrice) {
			res.status(400).json({ error: "Saldo insuficiente" })
			return
		}

		await runtime.client.marketBuy(symbol, validation.quantity)

		const sellPrice = currentPrice / (1 - runtime.config.grossTargetPercentage)
		await addPosition(runtime.instanceId, runtime.plan, {
			symbol,
			buyPrice: currentPrice,
			quantity: validation.quantity,
			sellPrice,
			expectedNetProfit: runtime.config.targetNetProfit,
		})

		res.json({ ok: true, qty: validation.quantity, price: currentPrice })
	})
}
