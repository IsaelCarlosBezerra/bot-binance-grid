import type { Express, Request, Response } from "express"
import bcrypt from "bcryptjs"
import { signToken } from "./jwt.service.js"
import { authMiddleware, type AuthRequest } from "./auth.middleware.js"
import prisma from "../lib/prisma.js"

export function registerAuthRoutes(app: Express) {
	app.post("/auth/register", async (req: Request, res: Response) => {
		const { email, password, name } = req.body

		if (!email || !password || !name) {
			res.status(400).json({ error: "email, password e name são obrigatórios" })
			return
		}

		if (password.length < 8) {
			res.status(400).json({ error: "Senha deve ter no mínimo 8 caracteres" })
			return
		}

		const existing = await prisma.user.findUnique({ where: { email } })
		if (existing) {
			res.status(409).json({ error: "E-mail já cadastrado" })
			return
		}

		const passwordHash = await bcrypt.hash(password, 12)
		const user = await prisma.user.create({
			data: { email, passwordHash, name },
			select: { id: true, email: true, name: true, plan: true, role: true, createdAt: true },
		})

		const token = signToken({ userId: user.id, email: user.email, plan: user.plan, role: user.role })
		res.status(201).json({ user, token })
	})

	app.post("/auth/login", async (req: Request, res: Response) => {
		const { email, password } = req.body

		if (!email || !password) {
			res.status(400).json({ error: "email e password são obrigatórios" })
			return
		}

		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) {
			res.status(401).json({ error: "Credenciais inválidas" })
			return
		}

		const valid = await bcrypt.compare(password, user.passwordHash)
		if (!valid) {
			res.status(401).json({ error: "Credenciais inválidas" })
			return
		}

		const token = signToken({ userId: user.id, email: user.email, plan: user.plan, role: user.role })
		res.json({
			user: { id: user.id, email: user.email, name: user.name, plan: user.plan, role: user.role },
			token,
		})
	})

	app.get("/auth/me", authMiddleware, async (req: AuthRequest, res: Response) => {
		const user = await prisma.user.findUnique({
			where: { id: req.user!.userId },
			select: { id: true, email: true, name: true, plan: true, role: true, createdAt: true, botInstance: { select: { id: true, symbol: true, enabled: true, testnet: true } } },
		})
		res.json({ user })
	})
}
