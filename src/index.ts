import dotenv from "dotenv"
import { startApi } from "./api/server.js"

dotenv.config()

process.on("unhandledRejection", (reason) => {
	console.error("⚠️ unhandledRejection:", reason)
})

process.on("uncaughtException", (err) => {
	console.error("⚠️ uncaughtException:", err)
})

const PORT = parseInt(process.env["PORT"] ?? "3001")
startApi(PORT)

console.log("🤖 Plataforma de bots iniciada")
