import dotenv from "dotenv"
import { startApi } from "./api/server.js"

dotenv.config()

const PORT = parseInt(process.env["PORT"] ?? "3001")
startApi(PORT)

console.log("🤖 Plataforma de bots iniciada")
