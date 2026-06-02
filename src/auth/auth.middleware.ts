import type { Request, Response, NextFunction } from "express"
import { verifyToken, type JwtPayload } from "./jwt.service.js"

export interface AuthRequest extends Request {
	user?: JwtPayload
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
	const header = req.headers.authorization
	if (!header?.startsWith("Bearer ")) {
		res.status(401).json({ error: "Token não fornecido" })
		return
	}

	const token = header.slice(7)
	try {
		req.user = verifyToken(token)
		next()
	} catch {
		res.status(401).json({ error: "Token inválido ou expirado" })
	}
}

export function adminMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
	if (req.user?.role !== "ADMIN") {
		res.status(403).json({ error: "Acesso restrito a administradores" })
		return
	}
	next()
}
