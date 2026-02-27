import cors from "cors"
import dotenv from "dotenv"
import express from "express"
//import path from "path"
import { registerRoutes } from "./routes.js"
dotenv.config()

const PORT = process.env.PORT || 3000

export function startApi(port = PORT) {
	const app = express()
	app.use(cors())
	app.use(express.json())

	// 🔹 Servir UI
	//const uiPath = path.resolve(process.cwd(), "src/ui")
	//app.use(express.static(uiPath))

	registerRoutes(app)

	app.listen(port, () => console.log(`🌐 API rodando em PORT:${port}`))
}
