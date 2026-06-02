import express from "express"
import cors from "cors"
import path from "path"
import { registerAuthRoutes } from "../auth/auth.routes.js"
import { registerBotRoutes } from "../bot/bot.routes.js"
import { registerAdminRoutes } from "./admin.routes.js"

export function startApi(port = 3001) {
	const app = express()

	const allowedOrigins = process.env["CORS_ORIGIN"]
		? process.env["CORS_ORIGIN"].split(",").map((o) => o.trim().replace(/\/$/, ""))
		: ["http://localhost:3005", "http://localhost:3000"]

	app.use(
		cors({
			origin: (origin, callback) => {
				if (!origin || allowedOrigins.includes(origin)) callback(null, true)
				else callback(new Error(`CORS: origin '${origin}' not allowed`))
			},
			credentials: true,
		}),
	)
	app.use(express.json())

	const uiPath = path.resolve(process.cwd(), "src/ui")
	app.use(express.static(uiPath))

	registerAuthRoutes(app)
	registerBotRoutes(app)
	registerAdminRoutes(app)

	app.listen(port, () => console.log(`🌐 API rodando em http://localhost:${port}`))
}
