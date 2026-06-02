import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

const prisma = new PrismaClient()

const email = process.argv[2]
const password = process.argv[3]
const name = process.argv[4] ?? "Admin"

if (!email || !password) {
	console.error("Uso: npx tsx scripts/create-admin.ts <email> <senha> [nome]")
	process.exit(1)
}

if (password.length < 8) {
	console.error("Senha deve ter no mínimo 8 caracteres")
	process.exit(1)
}

const existing = await prisma.user.findUnique({ where: { email } })

if (existing) {
	// Se já existe, apenas promove para ADMIN
	await prisma.user.update({
		where: { email },
		data: { role: "ADMIN" },
	})
	console.log(`✅ Usuário ${email} promovido para ADMIN`)
} else {
	const passwordHash = await bcrypt.hash(password, 12)
	const user = await prisma.user.create({
		data: { email, passwordHash, name, role: "ADMIN", plan: "PRO" },
	})
	console.log(`✅ Admin criado: ${user.email} (id: ${user.id})`)
}

await prisma.$disconnect()
