import type { Express, Response } from "express"
import { PrismaClient } from "@prisma/client"
import { authMiddleware, type AuthRequest } from "../auth/auth.middleware.js"
import { botManager } from "./bot-manager.js"
import { encrypt } from "../auth/crypto.service.js"
import {
	getOpenPositions,
	getClosedPositions,
} from "../positions/position.store.js"

const prisma = new PrismaClient()

export function registerBotRoutes(app: Express) {
	// Todas as rotas de bot requerem autenticação
	app.use("/bot", authMiddleware)

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

	// ── Status do bot ─────────────────────────────────────────────────────
	app.get("/bot/status", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const runtime = botManager.get(userId)

		const dbInstance = await prisma.botInstance.findUnique({
			where: { userId },
			select: {
				id: true, symbol: true, testnet: true, enabled: true,
				cycleIntervalMs: true, buyPercentageOfBalance: true,
				targetNetProfit: true, grossTargetPercentage: true,
				dropPercentage: true, buyReferenceMode: true,
			},
		})

		if (!dbInstance) {
			res.status(404).json({ error: "Bot não configurado. Use POST /bot/setup primeiro." })
			return
		}

		const openPositions = runtime
			? await getOpenPositions(runtime.instanceId)
			: []

		res.json({
			configured: true,
			running: runtime?.isRunning ?? false,
			plan: req.user!.plan,
			config: dbInstance,
			state: runtime?.state ?? null,
			openPositions,
		})
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
		const runtime = botManager.get(userId)

		const dbInstance = runtime
			? { id: runtime.instanceId }
			: await prisma.botInstance.findUnique({ where: { userId }, select: { id: true } })

		if (!dbInstance) {
			res.status(404).json({ error: "Bot não configurado" })
			return
		}

		const { generateTradeSummary, generateTradeSummaryOpen } = await import(
			"../reports/trade-report.js"
		)
		const [summary, summaryOpen] = await Promise.all([
			generateTradeSummary(dbInstance.id),
			generateTradeSummaryOpen(dbInstance.id),
		])

		res.json({ summary, summaryOpen })
	})

	// ── Saldo ─────────────────────────────────────────────────────────────
	app.get("/bot/balance", async (req: AuthRequest, res: Response) => {
		const userId = req.user!.userId
		const runtime = botManager.get(userId)

		if (!runtime) {
			res.status(400).json({ error: "Bot não está carregado. Inicie o bot primeiro." })
			return
		}

		const { getAssetBalance } = await import("../binance/account.service.js")
		const balance = await getAssetBalance("USDT", runtime.client)
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
}
