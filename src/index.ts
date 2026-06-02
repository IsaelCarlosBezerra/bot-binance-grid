import dotenv from "dotenv"
import { startApi } from "./api/server.js"

dotenv.config()

// O servidor sobe e os bots dos usuários são iniciados sob demanda via POST /bot/start
startApi(3001)

console.log("🤖 Plataforma de bots iniciada")
