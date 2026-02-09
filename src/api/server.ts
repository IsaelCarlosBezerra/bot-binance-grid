import express from "express"
import cors from "cors"
import { registerRoutes } from "./routes.js"
import path from "path"

export function startApi(port = 3001) {
	const app = express()
	app.use(cors())
	app.use(express.json())

	// 🔹 Servir UI
	const uiPath = path.resolve(process.cwd(), "src/ui")
	app.use(express.static(uiPath))

	registerRoutes(app)

	app.listen(port, () => console.log(`🌐 API rodando em http://localhost:${port}`))
}
