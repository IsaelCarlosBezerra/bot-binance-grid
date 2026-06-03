import type { Express, Response } from "express"
import { authMiddleware, adminMiddleware, type AuthRequest } from "../auth/auth.middleware.js"
import { botManager } from "../bot/bot-manager.js"
import prisma from "../lib/prisma.js"

export function registerAdminRoutes(app: Express) {
	app.use("/admin", authMiddleware, adminMiddleware)

	// ── Listar todos os usuários ──────────────────────────────────────────
	app.get("/admin/users", async (_req: AuthRequest, res: Response) => {
		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				plan: true,
				role: true,
				createdAt: true,
				botInstance: {
					select: { id: true, symbol: true, enabled: true, testnet: true },
				},
			},
			orderBy: { createdAt: "desc" },
		})
		res.json({ users })
	})

	// ── Buscar usuário por ID ─────────────────────────────────────────────
	app.get("/admin/users/:id", async (req: AuthRequest, res: Response) => {
		const id = String(req.params.id)
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				email: true,
				name: true,
				plan: true,
				role: true,
				createdAt: true,
				botInstance: {
					select: {
						id: true, symbol: true, enabled: true, testnet: true,
						cycleIntervalMs: true, buyPercentageOfBalance: true,
						targetNetProfit: true, grossTargetPercentage: true,
						dropPercentage: true, buyReferenceMode: true,
						_count: { select: { tradeOrders: true } },
					},
				},
			},
		})

		if (!user) {
			res.status(404).json({ error: "Usuário não encontrado" })
			return
		}

		res.json({ user })
	})

	// ── Promover / rebaixar plano ─────────────────────────────────────────
	app.patch("/admin/users/:id/plan", async (req: AuthRequest, res: Response) => {
		const id = String(req.params.id)
		const { plan } = req.body

		if (!["FREE", "PRO"].includes(plan)) {
			res.status(400).json({ error: "Plano inválido. Use FREE ou PRO." })
			return
		}

		const user = await prisma.user.update({
			where: { id },
			data: { plan },
			select: { id: true, email: true, name: true, plan: true },
		})

		// Atualiza o plano na instância em memória se estiver rodando
		const runtime = botManager.get(user.id)
		if (runtime) {
			;(runtime as any).plan = plan
		}

		res.json({ ok: true, user })
	})

	// ── Alterar role (USER ↔ ADMIN) ───────────────────────────────────────
	app.patch("/admin/users/:id/role", async (req: AuthRequest, res: Response) => {
		const id = String(req.params.id)
		const { role } = req.body

		if (!["USER", "ADMIN"].includes(role)) {
			res.status(400).json({ error: "Role inválida. Use USER ou ADMIN." })
			return
		}

		const user = await prisma.user.update({
			where: { id },
			data: { role },
			select: { id: true, email: true, name: true, role: true },
		})

		res.json({ ok: true, user })
	})

	// ── Parar bot de um usuário forçadamente ──────────────────────────────
	app.post("/admin/users/:id/bot/stop", async (req: AuthRequest, res: Response) => {
		const userId = String(req.params.id)
		botManager.stopBot(userId)
		await prisma.botInstance.updateMany({
			where: { userId },
			data: { enabled: false },
		})
		res.json({ ok: true, message: "Bot do usuário pausado" })
	})

	// ── Estatísticas gerais ───────────────────────────────────────────────
	app.get("/admin/stats", async (_req: AuthRequest, res: Response) => {
		const [totalUsers, freePlan, proPlan, totalOrders, openOrders] = await Promise.all([
			prisma.user.count(),
			prisma.user.count({ where: { plan: "FREE" } }),
			prisma.user.count({ where: { plan: "PRO" } }),
			prisma.tradeOrder.count(),
			prisma.tradeOrder.count({ where: { status: "OPEN" } }),
		])

		res.json({
			users: { total: totalUsers, free: freePlan, pro: proPlan },
			orders: { total: totalOrders, open: openOrders, closed: totalOrders - openOrders },
		})
	})
}
